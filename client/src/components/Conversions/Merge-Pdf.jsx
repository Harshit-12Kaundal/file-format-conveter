// src/components/tools/MergePdf.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaFilePdf, FaUpload } from 'react-icons/fa';
import Navbar from '../Navbar';
import gradient from 'random-gradient';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { clearUploadedFile } from "../../features/uploadSlice";
import { auth } from '../firebaseConfig';

const API = "http://localhost:3001";

const MergePdf = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const reduxFirstFile = useSelector(state => state.upload.file);
  const reduxFirstFileName = useSelector(state => state.upload.fileName);

  const [firstFileLocal, setFirstFileLocal] = useState(null);
  const [firstFileLocalName, setFirstFileLocalName] = useState('');
  const [secondFile, setSecondFile] = useState(null);
  const [reopenLoading, setReopenLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [gradientStyle, setGradientStyle] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const gen = gradient('unique-seed-' + Math.random());
    setGradientStyle(gen);
  }, []);

  const shortName = (name) =>
    name && name.length > 25 ? name.slice(0, 22) + "..." : name;

  const firstFile = firstFileLocal || reduxFirstFile;
  const firstFileName = firstFileLocalName || reduxFirstFileName;

  // NEW: if opened from "My Work" sidebar, preload the first slot with
  // that stored file. Merge genuinely needs a SECOND file chosen fresh
  // each time (the past merge only recorded one originalName), so this
  // gets you halfway there instead of nothing.
  useEffect(() => {
    const { fileId, fileName } = location.state || {};
    if (!fileId) return;

    setReopenLoading(true);
    (async () => {
      try {
        const response = await fetch(`${API}/files/${fileId}`);
        if (!response.ok) {
          setMessage("Could not load that file — it may no longer exist on the server.");
          return;
        }
        const blob = await response.blob();
        const file = new File([blob], fileName || "reopened-file.pdf", { type: "application/pdf" });
        setFirstFileLocal(file);
        setFirstFileLocalName(file.name);
      } catch (err) {
        console.error("Failed to reopen file:", err);
        setMessage("Failed to load that file.");
      } finally {
        setReopenLoading(false);
      }
    })();
  }, [location.state]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!firstFileLocal) {
      setFirstFileLocal(file);
      setFirstFileLocalName(file.name);
    } else {
      setSecondFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!firstFileLocal) {
      setFirstFileLocal(file);
      setFirstFileLocalName(file.name);
    } else {
      setSecondFile(file);
    }
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleMerge = async () => {
    if (!firstFile) return setMessage("Upload first PDF");
    if (!secondFile) return setMessage("Upload second PDF");

    if (firstFile.type !== "application/pdf" || secondFile.type !== "application/pdf") {
      return setMessage("Both files must be PDFs");
    }

    setMessage('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file1", firstFile);
    formData.append("file2", secondFile);

    // NEW: send uid/email so the backend can log this conversion
    const user = auth.currentUser;
    if (user) {
      formData.append("uid", user.uid);
      formData.append("email", user.email);
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/convertfile/pdf/to-merge",
        formData,
        {
          withCredentials: true,
          responseType: "blob",
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "merged.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("File downloaded.");
      setSecondFile(null);
      dispatch(clearUploadedFile());

    } catch (err) {
      console.error(err);
      setMessage("Try again.");
    }
  };

  return (
    <div className="
      min-h-screen flex flex-col
      bg-gray-50 text-black
      dark:bg-gray-900 dark:text-white
      transition-colors duration-300
    ">
      <Navbar />

      <main className="pt-24 pb-10 flex flex-col items-center">

        <h1 className="text-3xl font-bold mb-8">
          Merge PDF Files
        </h1>

        {reopenLoading && (
          <p className="mb-4 text-sm text-blue-500">Loading your file...</p>
        )}

        <div
          className="
            w-[450px] h-[260px] rounded-xl flex flex-col items-center justify-center
            cursor-pointer border-2 transition-all
            border-gray-400 dark:border-gray-600
            bg-gray-100 dark:bg-gray-800
            hover:border-blue-500
          "
          style={{ background: firstFile ? gradientStyle : undefined }}
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FaFilePdf className="text-6xl mb-3" />

          <p className="text-lg">
             {shortName(firstFileName)}
          </p>

          <p className="text-lg mt-2">
           {shortName(firstFileName)&&shortName(secondFile?.name) ||
              (isDragging ? "Drop second PDF here" : "Click or Drag both PDF")}
          </p>

          <FaUpload className="text-2xl mt-4" />

          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            className="hidden"
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
          onClick={handleMerge}
          className="
            mt-6 px-7 py-2 rounded-lg
            bg-blue-500 hover:bg-blue-600
            text-white font-semibold
            transition-all
          "
        >
          Merge Files
        </button>

        <button
          onClick={() => {
            setFirstFileLocal(null);
            setFirstFileLocalName('');
            setSecondFile(null);
            setMessage('');
            setUploadProgress(0);
          }}
          className="mt-2 text-sm underline opacity-80 hover:opacity-100"
        >
          Reset files
        </button>

        {message && (
          <p className="mt-4 text-lg">
            {message}
          </p>
        )}
      </main>
    </div>
  );
};

export default MergePdf;