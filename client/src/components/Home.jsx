import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import conversions from './cardsdata/CardConversions';
import Navbar from './Navbar';
import Footer from './Footer';
import Card from './cardsdata/Cards';
import { clearUploadedFile } from '../features/uploadSlice';  // ⭐ clear action from redux

const Home = () => {
  const dispatch = useDispatch();

  // ⭐ get file & filename from redux
  const uploadedFile = useSelector(state => state.upload.file);
  const fileName = useSelector(state => state.upload.fileName);

  // 📌 File type icon
  const getFileIcon = (fileName) => {
    if (!fileName) return "📁";
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf": return "📕";
      case "doc":
      case "docx": return "📘";
      case "xls":
      case "xlsx": return "📊";
      case "txt": return "📝";
      default: return "📄";
    }
  };

  // ✂️ Remove file from popup
  const handleRemoveFile = () => {
    dispatch(clearUploadedFile());          // Redux
    localStorage.removeItem("uploadedFileName"); // localStorage
  };

  // ✂️ truncate filename
  const shortName =
    fileName && fileName.length > 18
      ? fileName.slice(0, 15) + "..."
      : fileName;

  return (
    <div className="
      flex flex-col min-h-screen
      bg-gray-50 text-black        /* 🌞 LIGHT MODE */
      dark:bg-gray-900 dark:text-white  /* 🌙 DARK MODE */
      transition-colors duration-300
    ">
      <Navbar />

      <main className="
        px-10 flex-grow pt-20 pb-20
        bg-gray-50 dark:bg-gray-900
        transition-colors duration-300
      ">
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-4 justify-center">
            {conversions.map(conversion => (
              <Card 
                key={conversion.id}
                conversion={conversion}
                uploadedFile={uploadedFile}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {/* ===== FLOATING POPUP WITH REMOVE BUTTON ===== */}
      {fileName && (
        <div className="
          fixed bottom-6 right-6 
          bg-white text-black             /* 🌞 LIGHT MODE */
          dark:bg-gray-800 dark:text-white /* 🌙 DARK MODE */

          rounded-lg shadow-lg border
          border-gray-300 dark:border-gray-700
          p-4 w-[260px] z-50
          transition-colors duration-300
        ">

          {/* 🔥 Header row with icon + filename + remove ❌ */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">{getFileIcon(fileName)}</span>
              <span className="text-sm">{shortName}</span>
            </div>

            {/* ❌ Remove Button */}
            <button
              onClick={handleRemoveFile}
              className="text-gray-500 dark:text-gray-300 hover:text-red-500 transition"
              title="Remove uploaded file"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
