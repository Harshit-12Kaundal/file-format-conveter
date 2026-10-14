// import React, { useEffect, useRef, useState } from "react";
// import { FiSun, FiMoon, FiUser, FiDownload } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import jsPDF from "jspdf";

// export default function Desnav() {
//   const navigate = useNavigate();
//   const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
//   const [showExport, setShowExport] = useState(false);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark");
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

//   const getCanvas = () => document.querySelector("canvas");

//   const exportPNG = () => {
//     const canvas = getCanvas();
//     if (!canvas) return;
//     const link = document.createElement("a");
//     link.download = "design.png";
//     link.href = canvas.toDataURL("image/png");
//     link.click();
//     setShowExport(false);
//   };

//   const exportJPG = () => {
//     const canvas = getCanvas();
//     if (!canvas) return;
//     const link = document.createElement("a");
//     link.download = "design.jpg";
//     link.href = canvas.toDataURL("image/jpeg", 0.95);
//     link.click();
//     setShowExport(false);
//   };

//   const exportPDF = () => {
//     const canvas = getCanvas();
//     if (!canvas) return;
//     const imgData = canvas.toDataURL("image/png");

//     const pdf = new jsPDF({
//       orientation: "landscape",
//       unit: "px",
//       format: [canvas.width, canvas.height],
//     });

//     pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
//     pdf.save("design.pdf");
//     setShowExport(false);
//   };

//   return (
//     <div className="relative h-12 flex items-center px-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
//       <h2 className="font-bold text-lg flex-1">Designer</h2>

//       {/* Profile */}
//       <button
//         onClick={() => navigate("/profile")}
//         className="mr-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//         title="Profile"
//       >
//         <FiUser size={18} />
//       </button>

//       {/* Theme */}
//       <button
//         onClick={toggleTheme}
//         className="mr-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
//         title="Toggle theme"
//       >
//         {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
//       </button>

//       {/* Export Dropdown */}
//       <div className="relative">
//         <button
//           onClick={() => setShowExport((s) => !s)}
//           className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-2"
//         >
//           <FiDownload />
//           Export
//         </button>

//         {showExport && (
//           <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
//             <button
//               onClick={exportPNG}
//               className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//               PNG
//             </button>
//             <button
//               onClick={exportJPG}
//               className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//               JPG
//             </button>
//             <button
//               onClick={exportPDF}
//               className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//               PDF
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useRef, useState } from "react";
import { FiSun, FiMoon, FiUser, FiDownload, FiRotateCcw, FiRotateCw, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const fire = (type, detail) => window.dispatchEvent(new CustomEvent(type, { detail }));

export default function Desnav() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const importRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [showExport, setShowExport] = useState(false);
  const [title, setTitle] = useState("Untitled design");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const close = (e) => !menuRef.current?.contains(e.target) && setShowExport(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const doExport = (format) => {
    fire("EXPORT_CANVAS", { format });
    setShowExport(false);
  };

  const importJSON = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        fire("LOAD_DESIGN", JSON.parse(r.result));
      } catch {
        alert("That file isn't a valid design JSON.");
      }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  const iconBtn =
    "p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition";

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center gap-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur">
      <div className="flex items-center gap-2 mr-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500" />
        <span className="font-semibold text-sm hidden sm:block">Designer</span>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-sm bg-transparent px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 outline-none w-48"
      />

      <div className="flex-1" />

      <button className={iconBtn} title="Undo (⌘Z)" onClick={() => fire("UNDO")}><FiRotateCcw size={17} /></button>
      <button className={iconBtn} title="Redo (⇧⌘Z)" onClick={() => fire("REDO")}><FiRotateCw size={17} /></button>

      <button className={iconBtn} title="Import design JSON" onClick={() => importRef.current?.click()}>
        <FiUpload size={17} />
      </button>
      <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={importJSON} />

      <button className={iconBtn} title="Toggle theme" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
        {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
      </button>

      <button className={iconBtn} title="Profile" onClick={() => navigate("/profile")}>
        <FiUser size={17} />
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowExport((s) => !s)}
          className="ml-1 bg-blue-600 text-white text-sm px-3.5 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <FiDownload size={15} /> Export
        </button>

        {showExport && (
          <div className="absolute right-0 mt-2 w-44 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
            {[
              ["png", "PNG", "Transparent, 2x"],
              ["jpg", "JPG", "Smaller file"],
              ["webp", "WebP", "Modern web"],
              ["pdf", "PDF", "Print ready"],
              ["json", "Design file", "Re-editable"],
            ].map(([fmt, label, hint]) => (
              <button
                key={fmt}
                onClick={() => doExport(fmt)}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="text-sm">{label}</span>
                <span className="block text-[11px] text-gray-400">{hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
