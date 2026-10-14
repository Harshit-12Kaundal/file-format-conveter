import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import { renderAsync } from "docx-preview";
import Navbar from "../Navbar";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const API = "http://localhost:3001";

function getFileKind(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "docx";
  return "unsupported";
}

export default function DocumentViewer() {
  const location = useLocation();
  const [blob, setBlob] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);

  const pdfContainerRef = useRef(null);
  const docxContainerRef = useRef(null);

  const kind = getFileKind(fileName);

  // Load the file - either a raw File passed directly, or fetch by
  // fileId, same pattern used across the rest of the app.
  useEffect(() => {
    const { file, fileId, fileName: incomingName } = location.state || {};
    if (incomingName) setFileName(incomingName);

    if (file) {
      setBlob(file);
      return;
    }

    if (fileId) {
      setLoading(true);
      setError("");
      fetch(`${API}/files/${fileId}`)
        .then((res) => {
          if (!res.ok) throw new Error("File not found");
          return res.blob();
        })
        .then((b) => setBlob(b))
        .catch((err) => {
          console.error("Failed to load file:", err);
          setError("Could not load that file.");
        })
        .finally(() => setLoading(false));
    }
  }, [location.state]);

  // Render every page of the PDF, stacked vertically, read-only -
  // no editing, no import into anything else.
  useEffect(() => {
    if (kind !== "pdf" || !blob || !pdfContainerRef.current) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const container = pdfContainerRef.current;
        container.innerHTML = ""; // clear previous render if any

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: zoom * 1.5 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mb-4 rounded-lg shadow-md bg-white";

          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;

          if (!cancelled) container.appendChild(canvas);
        }
      } catch (err) {
        console.error("Failed to render PDF:", err);
        if (!cancelled) setError("Could not render this PDF.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, blob, zoom]);

  // Render DOCX to styled HTML, read-only (docx-preview injects
  // directly into the given container).
  useEffect(() => {
    if (kind !== "docx" || !blob || !docxContainerRef.current) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        docxContainerRef.current.innerHTML = "";
        await renderAsync(arrayBuffer, docxContainerRef.current, null, {
          className: "docx-render",
          inWrapper: true,
        });
      } catch (err) {
        console.error("Failed to render DOCX:", err);
        if (!cancelled) setError("Could not render this document.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, blob]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-950 mt-16">
        <p className="truncate text-sm font-medium">{fileName || "Document viewer"}</p>

        {kind === "pdf" && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
              className="rounded-lg border border-gray-200 px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              −
            </button>
            <span className="w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))}
              className="rounded-lg border border-gray-200 px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              +
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        {loading && (
          <p className="text-center text-sm text-blue-500">Loading document...</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {kind === "pdf" && (
          <div ref={pdfContainerRef} className="mx-auto flex max-w-4xl flex-col items-center" />
        )}

        {kind === "docx" && (
          <div
            ref={docxContainerRef}
            className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md dark:bg-gray-100"
          />
        )}

        {kind === "unsupported" && !loading && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            This file type isn't supported for direct viewing yet.
          </p>
        )}
      </main>
    </div>
  );
}