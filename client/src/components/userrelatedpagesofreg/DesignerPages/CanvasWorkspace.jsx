import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Text, Circle, Line, Image as KImage, Transformer } from "react-konva";
import jsPDF from "jspdf";
import { useLocation } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const API = "http://localhost:3001";
const uid = () => Math.random().toString(36).slice(2, 10);

/* image node that loads its own src */
function UrlImage({ shapeProps, onSelect, onChange, refCb }) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    const i = new window.Image();
    i.crossOrigin = "anonymous";
    i.src = shapeProps.src;
    i.onload = () => setImg(i);
  }, [shapeProps.src]);
  const { src, type, ...rest } = shapeProps;
  return (
    <KImage
      {...rest}
      image={img}
      ref={refCb}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const n = e.target;
        onChange({
          x: n.x(),
          y: n.y(),
          rotation: n.rotation(),
          width: Math.max(10, n.width() * n.scaleX()),
          height: Math.max(10, n.height() * n.scaleY()),
        });
        n.scaleX(1);
        n.scaleY(1);
      }}
    />
  );
}

export default function CanvasWorkspace() {
  const location = useLocation();
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const nodeRefs = useRef({});
  const containerRef = useRef(null);

  const [size, setSize] = useState({ width: 900, height: 600 });
  const [bg, setBg] = useState("#ffffff");
  const [zoom, setZoom] = useState(1);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState({ past: [], future: [] });
  const [pdfImporting, setPdfImporting] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const selected = elements.find((e) => e.id === selectedId) || null;

  /* ---------- history ---------- */
  const commit = useCallback((updater) => {
    setElements((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setHistory((h) => ({ past: [...h.past, prev].slice(-50), future: [] }));
      return next;
    });
  }, []);

  const undo = () =>
    setHistory((h) => {
      if (!h.past.length) return h;
      const prev = h.past[h.past.length - 1];
      setElements((cur) => {
        setTimeout(() => {}, 0);
        h.future = [cur, ...h.future];
        return prev;
      });
      return { past: h.past.slice(0, -1), future: h.future };
    });

  const redo = () =>
    setHistory((h) => {
      if (!h.future.length) return h;
      const next = h.future[0];
      setElements((cur) => {
        h.past = [...h.past, cur];
        return next;
      });
      return { past: h.past, future: h.future.slice(1) };
    });

  /* ---------- publish selection to right panel ---------- */
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("SELECTION_CHANGED", {
        detail: { element: selected, canvas: { ...size, bg, zoom, count: elements.length } },
      })
    );
  }, [selected, size, bg, zoom, elements.length]);

  /* ---------- transformer attach ---------- */
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId ? nodeRefs.current[selectedId] : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, elements]);

  /* ---------- factories ---------- */
  const center = () => ({ x: size.width / 2 - 60, y: size.height / 2 - 40 });

  const makeDefault = (type, detail = {}) => {
    const c = center();
    const base = { id: uid(), rotation: 0, opacity: 1, ...c };
    if (type === "rect")
      return { ...base, type, width: 180, height: 120, fill: "#3b82f6", cornerRadius: 8, stroke: "", strokeWidth: 0, ...detail };
    if (type === "circle")
      return { ...base, type, radius: 70, fill: "#f59e0b", stroke: "", strokeWidth: 0, ...detail };
    if (type === "line")
      return { ...base, type, points: [0, 0, 200, 0], stroke: "#111827", strokeWidth: 4, ...detail };
    if (type === "image")
      return { ...base, type, width: 320, height: 220, src: detail.src, ...detail };
    return {
      ...base,
      type: "text",
      text: detail.text || "Double click to edit",
      fontSize: 32,
      fontFamily: "Inter, sans-serif",
      fontStyle: "normal",
      align: "left",
      fill: "#111827",
      ...detail,
    };
  };

  /* ---------- PDF import: render a page to an image, add it as a
     normal draggable/resizable image element via the SAME pipeline
     used for dropped images (makeDefault("image", ...)). ---------- */
  const importPdfPage = useCallback(async (source, pageNum = 1) => {
    setPdfImporting(true);
    setPdfError("");
    try {
      const arrayBuffer = source instanceof Blob ? await source.arrayBuffer() : source;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(pageNum);

      // Render at 2x for crisp quality when resized on the canvas
      const viewport = page.getViewport({ scale: 2 });
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;
      const ctx = tempCanvas.getContext("2d");

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = tempCanvas.toDataURL("image/png");

      // Scale it down to fit reasonably within the design canvas
      const maxW = size.width * 0.7;
      const scale = Math.min(1, maxW / viewport.width);
      const el = makeDefault("image", {
        src: dataUrl,
        width: viewport.width * scale,
        height: viewport.height * scale,
        x: (size.width - viewport.width * scale) / 2,
        y: (size.height - viewport.height * scale) / 2,
      });

      commit((els) => [...els, el]);
      setSelectedId(el.id);

      return pdf.numPages;
    } catch (err) {
      console.error("Failed to import PDF page:", err);
      setPdfError("Could not load that PDF.");
      return 0;
    } finally {
      setPdfImporting(false);
    }
  }, [size, commit]);

  // Auto-import if Designer was opened with EITHER:
  // - a raw `file` object (e.g. from Main.jsx's "Open document" button,
  //   for a file that hasn't been uploaded to the backend at all yet)
  // - a `fileId` (e.g. from clicking a history item, fetched from the backend)
  useEffect(() => {
    const { file, fileId } = location.state || {};

    if (file) {
      importPdfPage(file, 1);
      return;
    }

    if (!fileId) return;

    fetch(`${API}/files/${fileId}`)
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.blob();
      })
      .then((blob) => importPdfPage(blob, 1))
      .catch((err) => {
        console.error("Failed to fetch PDF for import:", err);
        setPdfError("Could not load that file.");
      });
    // Only run once per navigation - importPdfPage is stable enough
    // via useCallback deps, but we intentionally don't want this
    // re-triggering as size/commit identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Manual "Import PDF" button handler
  const handlePdfFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      importPdfPage(file, 1);
    } else {
      setPdfError("Please select a PDF file.");
    }
    e.target.value = ""; // allow re-selecting the same file later
  };

  /* ---------- export ---------- */
  const exportAs = useCallback(
    (format = "png", quality = 0.95) => {
      const stage = stageRef.current;
      if (!stage) return;
      const prev = selectedId;
      setSelectedId(null);
      setTimeout(() => {
        const mime = format === "jpg" || format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
        const uri = stage.toDataURL({ pixelRatio: 2, mimeType: mime, quality });
        if (format === "pdf") {
          const pdf = new jsPDF({
            orientation: size.width >= size.height ? "landscape" : "portrait",
            unit: "px",
            format: [size.width, size.height],
          });
          pdf.addImage(uri, "PNG", 0, 0, size.width, size.height);
          pdf.save("design.pdf");
        } else if (format === "json") {
          const blob = new Blob([JSON.stringify({ size, bg, elements }, null, 2)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "design.json";
          a.click();
          URL.revokeObjectURL(a.href);
        } else {
          const a = document.createElement("a");
          a.href = uri;
          a.download = `design.${format}`;
          a.click();
        }
        setSelectedId(prev);
      }, 60);
    },
    [selectedId, size, bg, elements]
  );

  /* ---------- global event bus ---------- */
  useEffect(() => {
    const add = (type) => (e) => {
      const el = makeDefault(type, e.detail || {});
      commit((els) => [...els, el]);
      setSelectedId(el.id);
    };

    const handlers = {
      ADD_TEXT: add("text"),
      ADD_RECT: add("rect"),
      ADD_CIRCLE: add("circle"),
      ADD_LINE: add("line"),
      ADD_IMAGE: add("image"),
      IMPORT_PDF: (e) => {
        // NEW: dispatch this from Leftsidebar or anywhere else, e.g.
        // window.dispatchEvent(new CustomEvent("IMPORT_PDF", { detail: { file } }))
        if (e.detail?.file) importPdfPage(e.detail.file, e.detail.page || 1);
      },
      DELETE_SELECTED: () => {
        if (!selectedId) return;
        commit((els) => els.filter((e) => e.id !== selectedId));
        setSelectedId(null);
      },
      DUPLICATE_SELECTED: () => {
        if (!selected) return;
        const copy = { ...selected, id: uid(), x: selected.x + 24, y: selected.y + 24 };
        commit((els) => [...els, copy]);
        setSelectedId(copy.id);
      },
      BRING_FORWARD: () =>
        commit((els) => {
          const i = els.findIndex((e) => e.id === selectedId);
          if (i < 0 || i === els.length - 1) return els;
          const n = [...els];
          [n[i], n[i + 1]] = [n[i + 1], n[i]];
          return n;
        }),
      SEND_BACKWARD: () =>
        commit((els) => {
          const i = els.findIndex((e) => e.id === selectedId);
          if (i <= 0) return els;
          const n = [...els];
          [n[i], n[i - 1]] = [n[i - 1], n[i]];
          return n;
        }),
      UPDATE_SELECTED: (e) =>
        commit((els) => els.map((el) => (el.id === selectedId ? { ...el, ...e.detail } : el))),
      SET_CANVAS: (e) => {
        if (e.detail.bg !== undefined) setBg(e.detail.bg);
        if (e.detail.width || e.detail.height)
          setSize((s) => ({ width: e.detail.width || s.width, height: e.detail.height || s.height }));
        if (e.detail.zoom !== undefined) setZoom(e.detail.zoom);
      },
      CLEAR_CANVAS: () => {
        commit([]);
        setSelectedId(null);
      },
      UNDO: undo,
      REDO: redo,
      EXPORT_CANVAS: (e) => exportAs(e.detail?.format || "png"),
      EXPORT_PNG: () => exportAs("png"),
      LOAD_DESIGN: (e) => {
        const d = e.detail || {};
        if (d.size) setSize(d.size);
        if (d.bg) setBg(d.bg);
        commit(d.elements || []);
      },
    };

    Object.entries(handlers).forEach(([k, fn]) => window.addEventListener(k, fn));
    return () => Object.entries(handlers).forEach(([k, fn]) => window.removeEventListener(k, fn));
  }, [selectedId, selected, commit, exportAs, importPdfPage]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("DUPLICATE_SELECTED"));
      } else if (e.key === "Delete" || e.key === "Backspace") {
        window.dispatchEvent(new CustomEvent("DELETE_SELECTED"));
      } else if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- drop images AND pdfs onto canvas ---------- */
  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      importPdfPage(file, 1);
      return;
    }

    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => window.dispatchEvent(new CustomEvent("ADD_IMAGE", { detail: { src: reader.result } }));
    reader.readAsDataURL(file);
  };

  const patch = (id) => (props) => commit((els) => els.map((el) => (el.id === id ? { ...el, ...props } : el)));

  const common = (el) => ({
    ref: (n) => (nodeRefs.current[el.id] = n),
    draggable: true,
    onClick: () => setSelectedId(el.id),
    onTap: () => setSelectedId(el.id),
    onDragEnd: (e) => patch(el.id)({ x: e.target.x(), y: e.target.y() }),
  });

  return (
    <div
      ref={containerRef}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-3 p-6"
    >
      {/* zoom bar */}
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        <button className="px-2 py-1 rounded bg-white dark:bg-gray-700 shadow" onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.1).toFixed(2)))}>−</button>
        <span className="w-14 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
        <button className="px-2 py-1 rounded bg-white dark:bg-gray-700 shadow" onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}>+</button>
        <button className="px-2 py-1 rounded bg-white dark:bg-gray-700 shadow" onClick={() => setZoom(1)}>Fit</button>
        <span className="ml-3 opacity-60">{size.width} × {size.height}</span>

        {/* NEW: manual PDF import button */}
        <label className="ml-3 cursor-pointer px-2 py-1 rounded bg-white dark:bg-gray-700 shadow">
          {pdfImporting ? "Importing…" : "Import PDF"}
          <input type="file" accept=".pdf" className="hidden" onChange={handlePdfFileSelect} disabled={pdfImporting} />
        </label>
      </div>

      {pdfError && <p className="text-xs text-red-500">{pdfError}</p>}

      <div
        className="shadow-2xl rounded-sm ring-1 ring-black/10"
        style={{ width: size.width * zoom, height: size.height * zoom }}
      >
        <Stage
          width={size.width}
          height={size.height}
          scaleX={zoom}
          scaleY={zoom}
          style={{ width: size.width * zoom, height: size.height * zoom }}
          ref={stageRef}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage() || e.target.attrs.id === "__bg") setSelectedId(null);
          }}
        >
          <Layer>
            <Rect id="__bg" x={0} y={0} width={size.width} height={size.height} fill={bg} listening />
            {elements.map((el) => {
              if (el.type === "rect") return <Rect key={el.id} {...el} {...common(el)} onTransformEnd={(e) => {
                const n = e.target;
                patch(el.id)({ x: n.x(), y: n.y(), rotation: n.rotation(), width: Math.max(5, n.width() * n.scaleX()), height: Math.max(5, n.height() * n.scaleY()) });
                n.scaleX(1); n.scaleY(1);
              }} />;
              if (el.type === "circle") return <Circle key={el.id} {...el} {...common(el)} onTransformEnd={(e) => {
                const n = e.target;
                patch(el.id)({ x: n.x(), y: n.y(), radius: Math.max(5, el.radius * n.scaleX()) });
                n.scaleX(1); n.scaleY(1);
              }} />;
              if (el.type === "line") return <Line key={el.id} {...el} {...common(el)} />;
              if (el.type === "image")
                return (
                  <UrlImage
                    key={el.id}
                    shapeProps={el}
                    refCb={(n) => (nodeRefs.current[el.id] = n)}
                    onSelect={() => setSelectedId(el.id)}
                    onChange={patch(el.id)}
                  />
                );
              return (
                <Text
                  key={el.id}
                  {...el}
                  {...common(el)}
                  onDblClick={() => {
                    const v = window.prompt("Edit text", el.text);
                    if (v !== null) patch(el.id)({ text: v });
                  }}
                  onTransformEnd={(e) => {
                    const n = e.target;
                    patch(el.id)({ x: n.x(), y: n.y(), rotation: n.rotation(), fontSize: Math.max(8, el.fontSize * n.scaleY()) });
                    n.scaleX(1); n.scaleY(1);
                  }}
                />
              );
            })}
            <Transformer ref={trRef} rotateEnabled anchorSize={8} borderStroke="#3b82f6" anchorStroke="#3b82f6" />
          </Layer>
        </Stage>
      </div>

      {!elements.length && (
        <p className="text-xs text-gray-400">Add a shape from the left, drag & drop an image or PDF, or click "Import PDF".</p>
      )}
    </div>
  );
}