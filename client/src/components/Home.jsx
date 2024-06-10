import React, { useState, useRef } from 'react';
import { FaFileWord, FaFilePdf } from "react-icons/fa";
import axios from "axios";
import { useParams } from 'react-router-dom';

const Home = () => {
    const { id } = useParams();
    const [selectedFile, setSelectedFile] = useState(null);
    const [convertMessage, setConvertMessage] = useState("");
    const [downloadError, setDownloadError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setConvertMessage("Please select a file");
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("id", id);

        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        try {
            const response = await axios.post('https://file-format-conveter-1.onrender.com/convertfile', formData, {
                responseType: "blob",
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            const fileExtension = id === "docx-to-pdf" ? ".pdf" : ".docx";
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", selectedFile.name.replace(/\.[^/.]+$/, "") + fileExtension);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSelectedFile(null);
            setDownloadError("");
            setConvertMessage("File converted and downloaded successfully");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            console.error(error);
            setDownloadError("An error occurred while converting the file");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-screen-full mx-auto container px-6 py-3 md:px-40 flex items-center justify-center w-full">
            <div className="border-2 border-dashed px-4 py-2 md:px-8 md:py-6 border-green-400 rounded-lg shadow-lg flex flex-col items-center space-y-4 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-4">Convert Files Online</h1>
                <div className="flex items-center justify-center mb-4">
                    {id === "docx-to-pdf" ? <FaFileWord size={48} className="text-blue-500 mr-4" /> : <FaFilePdf size={48} className="text-red-500 mr-4" />}
                    <p className="text-sm text-center">Easily convert your files between
                        {id === 'docx-to-pdf' ? <span> DOCX to PDF</span> : <span> PDF to DOCX</span>} format for free
                    </p>
                </div>
                <input
                    type="file"
                    accept={id === "docx-to-pdf" ? ".doc, .docx" : ".pdf"}
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />
                <label
                    htmlFor="fileInput"
                    className="w-full flex items-center justify-center px-4 py-6 bg-gray-100 text-gray-700 rounded-lg shadow-lg border-blue-300 cursor-pointer hover:bg-green-700 hover:text-white duration-300"
                >
                    {id === "docx-to-pdf" ? <FaFileWord className="mr-2" /> : <FaFilePdf className="mr-2" />}
                    <span className="text-xl">{selectedFile ? selectedFile.name : "Choose File"}</span>
                </label>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-700 duration-300 disabled:bg-gray-400 disabled:pointer-events-none"
                >
                    Convert File
                </button>
                {isLoading && (
                    <div className="w-full mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-center text-sm">Upload Progress: {uploadProgress}%</p>
                    </div>
                )}
                {convertMessage && <p className="text-green-500 mt-4">{convertMessage}</p>}
                {downloadError && <p className="text-red-500 mt-4">{downloadError}</p>}
            </div>
        </div>
    );
};

export default Home;
