import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaFileWord, FaUpload } from 'react-icons/fa';
import Navbar from '../Navbar';
import gradient from 'random-gradient';
import { useLocation } from 'react-router-dom';
// Redux integration
import { useSelector, useDispatch } from "react-redux";
import { setUploadedFile, clearUploadedFile } from '../../features/uploadSlice';
import { auth } from '../firebaseConfig';

const API = "http://localhost:3001";

const DocxToPdfUploader = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Redux stored file & name
  const selectedFile = useSelector(state => state.upload.file);
  const storedFileName = useSelector(state => state.upload.fileName);

  const fileInputRef = useRef(null);
  const [convertMessage, setConvertMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [gradientStyle, setGradientStyle] = useState('');
  const [reopenLoading, setReopenLoading] = useState(false);

  useEffect(() => {
    const generatedGradient = gradient('unique-seed-' + Math.random());
    setGradientStyle(generatedGradient);
  }, []);

  // NEW: if this page was opened by clicking a file in the "My Work"
  // sidebar (Main.jsx passes { fileId, fileName } via navigate state),
  // fetch that actual file from the backend and load it into Redux
  // the same way a normal upload would - so the box below shows it
  // as ready to convert, instead of empty.
  useEffect(() => {
    const { fileId, fileName } = location.state || {};
    if (!fileId) return; // opened normally via the sidebar's own upload flow

    setReopenLoading(true);
    (async () => {
      try {
        const response = await fetch(`${API}/files/${fileId}`);
        if (!response.ok) {
          setDownloadError("Could not load that file — it may no longer exist on the server.");
          return;
        }
        const blob = await response.blob();
        const file = new File(
          [blob],
          fileName || "reopened-file.docx",
          { type: blob.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
        );
        dispatch(setUploadedFile(file));
      } catch (err) {
        console.error("Failed to reopen file:", err);
        setDownloadError("Failed to load that file.");
      } finally {
        setReopenLoading(false);
      }
    })();
  }, [location.state, dispatch]);

  const shortName =
    storedFileName && storedFileName.length > 20
      ? storedFileName.slice(0, 17) + "..."
      : storedFileName;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) dispatch(setUploadedFile(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) dispatch(setUploadedFile(file));
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      alert("Upload a DOCX file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const user = auth.currentUser;
    if (user) {
      formData.append("uid", user.uid);
      formData.append("email", user.email);
    }

    setIsLoading(true);
    setConvertMessage('');
    setDownloadError('');
    setUploadProgress(0);

    try {
      const response = await axios.post(
        "http://localhost:3001/convertfile/docx/to-pdf",
        formData,
        {
          withCredentials: true,
          responseType: 'blob',
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentage);
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", storedFileName.replace(".docx", ".pdf"));
      document.body.appendChild(link);
      link.click();
      link.remove();

      setConvertMessage("Conversion successful! Downloading...");
      dispatch(clearUploadedFile());
    } catch (error) {
      console.error(error);
      setDownloadError("Conversion failed! Try again.");
    } finally {
      setIsLoading(false);
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
        <h1 className="text-3xl font-bold mb-6">DOCX ➝ PDF Converter</h1>

        {reopenLoading && (
          <p className="mb-4 text-sm text-blue-500">Loading your file...</p>
        )}

        <div
          className="
            w-[450px] h-[250px] rounded-xl flex flex-col justify-center items-center
            border-2 cursor-pointer transition-all
            border-gray-400 dark:border-gray-600
            text-gray-800 dark:text-white
            bg-gray-100 dark:bg-gray-800
            hover:border-blue-500
          "
          style={{ background: storedFileName ? gradientStyle : undefined }}
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FaFileWord className="text-6xl mb-3" />

          <span className="text-xl">
            {shortName ||
              (isDragging ? "Drop file here..." : "Drag & Drop or Click to Upload")}
          </span>

          <FaUpload className="text-2xl mt-3" />

          <input
            type="file"
            accept=".docx"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {isLoading && (
          <div className="w-[450px] mt-4">
            <div className="bg-gray-300 dark:bg-gray-700 rounded-full h-3 transition-colors">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center mt-1 text-sm">{uploadProgress}%</p>
          </div>
        )}

        {convertMessage && <p className="text-green-500 dark:text-green-400 mt-4">{convertMessage}</p>}
        {downloadError && <p className="text-red-500 dark:text-red-400 mt-4">{downloadError}</p>}

        <button
          onClick={handleConvert}
          className="
            mt-6 px-7 py-2 rounded-lg
            bg-blue-500 hover:bg-blue-600
            text-white font-semibold
            transition-all
          "
        >
          Convert to PDF
        </button>
      </main>
    </div>
  );
};

export default DocxToPdfUploader;