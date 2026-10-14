// import React from "react";

// export default function LeftSidebar() {
//   const dispatch = (type) => {
//     window.dispatchEvent(new CustomEvent(type));
//   };

//   return (
//     <div className="w-[260px] p-4 border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
//       <h2 className="font-bold text-lg mb-4">Konva Tools</h2>

//       <button className="btn" onClick={() => dispatch("DUPLICATE_SELECTED")}>
//         Duplicate
//       </button>

//       <button className="btn" onClick={() => dispatch("DELETE_SELECTED")}>
//         Delete
//       </button>

//       <button className="btn" onClick={() => dispatch("BRING_FORWARD")}>
//         Bring Forward
//       </button>

//       <button className="btn" onClick={() => dispatch("SEND_BACKWARD")}>
//         Send Backward
//       </button>

//       <button className="btn" onClick={() => dispatch("EXPORT_PNG")}>
//         Export PNG
//       </button>
//     </div>
//   );
// }
import React, { useRef, useState } from "react";

const fire = (type, detail) => window.dispatchEvent(new CustomEvent(type, { detail }));

const Btn = ({ children, onClick, tone = "ghost" }) => (
  <button
    onClick={onClick}
    className={
      "w-full text-left text-sm px-3 py-2 rounded-lg transition mb-1.5 " +
      (tone === "primary"
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700")
    }
  >
    {children}
  </button>
);

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{title}</h3>
    {children}
  </div>
);

export default function LeftSidebar() {
  const fileRef = useRef(null);
  const convRef = useRef(null);
  const [tab, setTab] = useState("design");
  const [convFile, setConvFile] = useState(null);
  const [target, setTarget] = useState("png");
  const [quality, setQuality] = useState(0.92);
  const [busy, setBusy] = useState(false);

  const onImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => fire("ADD_IMAGE", { src: r.result });
    r.readAsDataURL(f);
    e.target.value = "";
  };

  /* ---------- standalone converter: image -> png/jpg/webp/pdf ---------- */
  const convert = async () => {
    if (!convFile) return;
    setBusy(true);
    try {
      const dataUrl = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(convFile);
      });
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = dataUrl;
      });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (target !== "png" && target !== "webp") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
      }
      ctx.drawImage(img, 0, 0);

      const base = convFile.name.replace(/\.[^.]+$/, "");
      if (target === "pdf") {
        const { default: jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: c.width >= c.height ? "landscape" : "portrait",
          unit: "px",
          format: [c.width, c.height],
        });
        pdf.addImage(c.toDataURL("image/png"), "PNG", 0, 0, c.width, c.height);
        pdf.save(`${base}.pdf`);
      } else {
        const mime = target === "jpg" ? "image/jpeg" : `image/${target}`;
        const a = document.createElement("a");
        a.href = c.toDataURL(mime, quality);
        a.download = `${base}.${target}`;
        a.click();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-[260px] shrink-0 p-4 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="flex mb-4 rounded-lg bg-gray-200 dark:bg-gray-800 p-1 text-xs font-medium">
        {["design", "convert"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-md capitalize transition ${
              tab === t ? "bg-white dark:bg-gray-700 shadow" : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "design" ? (
        <>
          <Section title="Add">
            <Btn tone="primary" onClick={() => fire("ADD_TEXT")}>+ Text</Btn>
            <Btn onClick={() => fire("ADD_RECT")}>▭ Rectangle</Btn>
            <Btn onClick={() => fire("ADD_CIRCLE")}>● Circle</Btn>
            <Btn onClick={() => fire("ADD_LINE")}>／ Line</Btn>
            <Btn onClick={() => fileRef.current?.click()}>🖼 Image…</Btn>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
          </Section>

          <Section title="Arrange">
            <Btn onClick={() => fire("DUPLICATE_SELECTED")}>Duplicate <span className="float-right opacity-40">⌘D</span></Btn>
            <Btn onClick={() => fire("DELETE_SELECTED")}>Delete <span className="float-right opacity-40">⌫</span></Btn>
            <Btn onClick={() => fire("BRING_FORWARD")}>Bring forward</Btn>
            <Btn onClick={() => fire("SEND_BACKWARD")}>Send backward</Btn>
          </Section>

          <Section title="History">
            <Btn onClick={() => fire("UNDO")}>Undo</Btn>
            <Btn onClick={() => fire("REDO")}>Redo</Btn>
            <Btn onClick={() => window.confirm("Clear the canvas?") && fire("CLEAR_CANVAS")}>Clear canvas</Btn>
          </Section>
        </>
      ) : (
        <>
          <Section title="File converter">
            <label className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center text-xs cursor-pointer hover:border-blue-500">
              {convFile ? (
                <span className="font-medium break-all">{convFile.name}</span>
              ) : (
                <span className="text-gray-500">Click to choose an image</span>
              )}
              <input
                ref={convRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setConvFile(e.target.files?.[0] || null)}
              />
            </label>
          </Section>

          <Section title="Convert to">
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {["png", "jpg", "webp", "pdf"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTarget(f)}
                  className={`py-1.5 text-xs rounded-md border uppercase ${
                    target === f
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {(target === "jpg" || target === "webp") && (
              <label className="block text-xs text-gray-500 mb-3">
                Quality {Math.round(quality * 100)}%
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.01"
                  value={quality}
                  onChange={(e) => setQuality(+e.target.value)}
                  className="w-full accent-blue-600"
                />
              </label>
            )}

            <button
              disabled={!convFile || busy}
              onClick={convert}
              className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              {busy ? "Converting…" : "Convert & download"}
            </button>

            <button
              disabled={!convFile}
              onClick={() => {
                const r = new FileReader();
                r.onload = () => fire("ADD_IMAGE", { src: r.result });
                r.readAsDataURL(convFile);
              }}
              className="w-full mt-2 text-xs py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
            >
              Place on canvas instead
            </button>
          </Section>
        </>
      )}
    </div>
  );
}
