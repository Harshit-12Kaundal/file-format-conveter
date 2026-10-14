// export default function RightPanel() {
//   return (
//     <div className="w-[280px] p-4 pl-2 border-l border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
//       <h2 className="font-bold text-lg mb-2">Properties</h2>
//       <p className="text-sm text-gray-500 dark:text-gray-400">
//         Select an element to edit properties
//       </p>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";

const fire = (type, detail) => window.dispatchEvent(new CustomEvent(type, { detail }));

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2 mb-2.5">
    <span className="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">{label}</span>
    <div className="flex-1 flex justify-end">{children}</div>
  </div>
);

const num = "w-20 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";

export default function RightPanel() {
  const [el, setEl] = useState(null);
  const [canvas, setCanvas] = useState({ width: 900, height: 600, bg: "#ffffff", count: 0 });

  useEffect(() => {
    const on = (e) => {
      setEl(e.detail.element);
      setCanvas(e.detail.canvas);
    };
    window.addEventListener("SELECTION_CHANGED", on);
    return () => window.removeEventListener("SELECTION_CHANGED", on);
  }, []);

  const up = (patch) => fire("UPDATE_SELECTED", patch);

  return (
    <div className="w-[280px] shrink-0 p-4 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <h2 className="font-semibold text-sm mb-4">Properties</h2>

      {!el ? (
        <>
          <p className="text-xs text-gray-500 mb-5">Select an element to edit its properties.</p>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Canvas</h3>
          <Row label="Background">
            <input type="color" value={canvas.bg} onChange={(e) => fire("SET_CANVAS", { bg: e.target.value })} className="h-7 w-10 rounded" />
          </Row>
          <Row label="Width">
            <input type="number" className={num} value={canvas.width} onChange={(e) => fire("SET_CANVAS", { width: +e.target.value || 100 })} />
          </Row>
          <Row label="Height">
            <input type="number" className={num} value={canvas.height} onChange={(e) => fire("SET_CANVAS", { height: +e.target.value || 100 })} />
          </Row>
          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {[["1:1", 1080, 1080], ["16:9", 1280, 720], ["A4", 794, 1123]].map(([l, w, h]) => (
              <button key={l} onClick={() => fire("SET_CANVAS", { width: w, height: h })}
                className="text-xs py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {l}
              </button>
            ))}
          </div>
          <p className="mt-5 text-[11px] text-gray-400">{canvas.count} element(s) on canvas</p>
        </>
      ) : (
        <>
          <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-3">{el.type}</p>

          {el.type === "text" && (
            <>
              <textarea
                value={el.text}
                onChange={(e) => up({ text: e.target.value })}
                rows={3}
                className="w-full mb-3 px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
              <Row label="Size">
                <input type="number" className={num} value={el.fontSize} onChange={(e) => up({ fontSize: +e.target.value })} />
              </Row>
              <Row label="Font">
                <select className={num + " w-32"} value={el.fontFamily} onChange={(e) => up({ fontFamily: e.target.value })}>
                  {["Inter, sans-serif", "Georgia, serif", "Courier New, monospace", "Impact, sans-serif"].map((f) => (
                    <option key={f} value={f}>{f.split(",")[0]}</option>
                  ))}
                </select>
              </Row>
              <Row label="Style">
                <div className="flex gap-1">
                  {["normal", "bold", "italic"].map((s) => (
                    <button key={s} onClick={() => up({ fontStyle: s })}
                      className={`px-2 py-1 text-xs rounded border ${el.fontStyle === s ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 dark:border-gray-700"}`}>
                      {s[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label="Align">
                <div className="flex gap-1">
                  {["left", "center", "right"].map((a) => (
                    <button key={a} onClick={() => up({ align: a })}
                      className={`px-2 py-1 text-xs rounded border ${el.align === a ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 dark:border-gray-700"}`}>
                      {a[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </Row>
            </>
          )}

          {el.type !== "image" && (
            <Row label={el.type === "line" ? "Stroke" : "Fill"}>
              <input
                type="color"
                value={(el.type === "line" ? el.stroke : el.fill) || "#000000"}
                onChange={(e) => up(el.type === "line" ? { stroke: e.target.value } : { fill: e.target.value })}
                className="h-7 w-10 rounded"
              />
            </Row>
          )}

          {(el.type === "rect" || el.type === "circle") && (
            <>
              <Row label="Border">
                <input type="color" value={el.stroke || "#000000"} onChange={(e) => up({ stroke: e.target.value })} className="h-7 w-10 rounded" />
              </Row>
              <Row label="Border w.">
                <input type="number" className={num} value={el.strokeWidth || 0} onChange={(e) => up({ strokeWidth: +e.target.value })} />
              </Row>
            </>
          )}

          {el.type === "rect" && (
            <Row label="Radius">
              <input type="number" className={num} value={el.cornerRadius || 0} onChange={(e) => up({ cornerRadius: +e.target.value })} />
            </Row>
          )}

          <Row label="X">
            <input type="number" className={num} value={Math.round(el.x)} onChange={(e) => up({ x: +e.target.value })} />
          </Row>
          <Row label="Y">
            <input type="number" className={num} value={Math.round(el.y)} onChange={(e) => up({ y: +e.target.value })} />
          </Row>
          <Row label="Rotation">
            <input type="number" className={num} value={Math.round(el.rotation || 0)} onChange={(e) => up({ rotation: +e.target.value })} />
          </Row>
          <Row label="Opacity">
            <input type="range" min="0" max="1" step="0.01" value={el.opacity ?? 1} onChange={(e) => up({ opacity: +e.target.value })} className="w-28 accent-blue-600" />
          </Row>

          <div className="mt-4 flex gap-2">
            <button onClick={() => fire("DUPLICATE_SELECTED")} className="flex-1 text-xs py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">Duplicate</button>
            <button onClick={() => fire("DELETE_SELECTED")} className="flex-1 text-xs py-2 rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
          </div>
        </>
      )}
    </div>
  );
}
