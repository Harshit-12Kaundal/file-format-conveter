// src/components/tools/CompressPdf.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaFilePdf, FaUpload, FaCompress } from 'react-icons/fa';
import Navbar from '../Navbar';
import gradient from 'random-gradient';
import { useLocation } from 'react-router-dom';
import { clearUploadedFile, setUploadedFile } from '../../features/uploadSlice';
import { useSelector, useDispatch } from "react-redux";
import { auth } from '../firebaseConfig';

const API = "http://localhost:3001";

const CompressPdf = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const mainFile = useSelector(state => state.upload.file);
  const mainFileName = useSelector(state => state.upload.fileName);

  const [secondFile, setSecondFile] = useState(null);
  const [reopenLoading, setReopenLoading] = useState(false);

  const [compressMessage, setCompressMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [gradientStyle, setGradientStyle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const g = gradient('unique-seed-' + Math.random());
    setGradientStyle(g);
  }, []);

  const shortName = (name) =>
    name && name.length > 25 ? name.slice(0, 22) + "..." : name;

  // NEW: if opened from "My Work" sidebar, fetch that file and preload
  // it via the same Redux slice the normal flow uses.
  useEffect(() => {
    const { fileId, fileName } = location.state || {};
    if (!fileId) return;

    setReopenLoading(true);
    (async () => {
      try {
        const response = await fetch(`${API}/files/${fileId}`);
        if (!response.ok) {
          setCompressMessage("Could not load that file — it may no longer exist on the server.");
          return;
        }
        const blob = await response.blob();
        const file = new File([blob], fileName || "reopened-file.pdf", { type: "application/pdf" });
        dispatch(setUploadedFile(file));
      } catch (err) {
        console.error("Failed to reopen file:", err);
        setCompressMessage("Failed to load that file.");
      } finally {
        setReopenLoading(false);
      }
    })();
  }, [location.state, dispatch]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file?.type === "application/pdf") {
      setSecondFile(file);
      dispatch(setUploadedFile(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setSecondFile(file);
      dispatch(setUploadedFile(file));
    } else {
      setCompressMessage("Only PDF allowed");
    }
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleCompress = async () => {
    const fileToCompress = secondFile || mainFile;

    if (!fileToCompress) {
      setCompressMessage("Upload a PDF in Main OR here.");
      return;
    }

    setCompressMessage('');
    setUploadProgress(0);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", fileToCompress);

    // NEW: send uid/email so the backend can log this conversion
    const user = auth.currentUser;
    if (user) {
      formData.append("uid", user.uid);
      formData.append("email", user.email);
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/convertfile/pdf/to-compress",
        formData,
        {
          withCredentials: true,
          responseType: 'blob',
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      const baseName = (secondFile?.name || mainFileName).replace(".pdf", "");
      link.href = url;
      link.setAttribute("download", `${baseName}_compressed.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setCompressMessage("Compression complete! File downloaded.");
      setSecondFile(null);
      dispatch(clearUploadedFile());

    } catch (err) {
      console.error(err);
      setCompressMessage("Compression failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-gray-50 text-black       
        dark:bg-gray-900 dark:text-white
        transition-colors duration-300
      "
    >
      <Navbar />

      <main className="pt-24 pb-10 flex flex-col items-center">

        <h1 className="text-3xl font-bold mb-8">Compress PDF</h1>

        {reopenLoading && (
          <p className="mb-4 text-sm text-blue-500">Loading your file...</p>
        )}

        <div
          className={`
            w-[450px] h-[260px] rounded-xl flex flex-col justify-center items-center
            cursor-pointer border-2 transition-all
            border-gray-400 dark:border-gray-600
            bg-gray-100 dark:bg-gray-800
            hover:border-blue-500
            ${isDragging ? "ring-4 ring-blue-400 dark:ring-blue-300" : ""}
          `}
          style={{ background: (mainFile || secondFile) ? gradientStyle : undefined }}
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FaFilePdf className="text-6xl mb-3" />

          <p className="text-lg">
            1️⃣ Using: {shortName(mainFileName) || "Upload in Main Page"}
          </p>

          <p className="text-lg mt-2">
            2️⃣ Replace: {shortName(secondFile?.name) ||
              (isDragging ? "Drop PDF here..." : "Click or Drag to replace")}
          </p>

          <FaUpload className="text-2xl mt-4" />

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileSelect}
          />
        </div>

        {uploadProgress > 0 && (
          <div className="w-[450px] mt-4">
            <div className="bg-gray-300 dark:bg-gray-700 rounded-full h-3 transition-colors">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center mt-1">{uploadProgress}%</p>
          </div>
        )}

        <button
          onClick={handleCompress}
          disabled={isLoading}
          className="
            mt-6 px-7 py-2 rounded-lg
            bg-blue-600 hover:bg-blue-700
            text-white font-semibold
            transition-all
          "
        >
          <FaCompress className="inline-block mr-2" />
          {isLoading ? "Compressing..." : "Compress File"}
        </button>

        {compressMessage && (
          <p className="mt-4 text-lg">
            {compressMessage}
          </p>
        )}
      </main>
    </div>
  );
};

export default CompressPdf;