import React, { useState } from 'react';
import { FaFileWord } from "react-icons/fa";
import axios from "axios";

const Home = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [convert, setConvert] = useState("");
    const [downloadError, setDownloadError] = useState("");

    const handleFileChange = (e) => { 
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setConvert("Please select a file");
            return;
        }
        //  formData variable is written in the specific way in camelcase format
        const formData = new FormData();
        formData.append("file", selectedFile);

        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const response = await axios.post('http://localhost:3001/convertfile', formData, { responseType: "blob" });
            console.log(response.data);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            console.log(url);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", selectedFile.name.replace(/\.[^/.]+$/, "") + ".pdf");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSelectedFile(null);
            setDownloadError("");
            setConvert("File converted and downloaded successfully");
        } catch (error) {
            console.error(error);
            setDownloadError("An error occurred while converting the file");
        }
    };

    return (
        <>
            <div className="max-w-screen-full mx-auto container px-6 py-3 md:px-40 flex items-center justify-center w-full">
                <div className="border-2 border-dashed px-4 py-2 md:px-8 md:py-6 border-indigo-400 rounded-lg shadow-lg flex flex-col items-center space-y-4 w-full max-w-md">
                    <h1 className="text-3xl font-bold text-center mb-4">Convert Word to PDF Online</h1>
                    <p className="text-sm text-center mb-5">Easily convert your Word Document file to PDF format for free</p>
                    <input 
                        type="file" 
                        accept=".doc, .docx" 
                        className="hidden" 
                        id="fileInput" 
                        onChange={handleFileChange}
                    />
                    <label 
                        htmlFor="fileInput" 
                        className="w-full flex items-center justify-center px-4 py-6 bg-gray-100 text-gray-700 rounded-lg shadow-lg border-blue-300 cursor-pointer hover:bg-blue-700 hover:text-white duration-300">
                        <FaFileWord className="mr-2" />
                        <span className="text-xl">{selectedFile ? selectedFile.name : "Choose File"}</span>
                    </label>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!selectedFile} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-700 duration-300 disabled:bg-gray-400 disabled:pointer-events-none"
                    >
                        Convert File
                    </button>
                    {convert && <p className="text-green-500 mt-4">{convert}</p>}
                    {downloadError && <p className="text-red-500 mt-4">{downloadError}</p>}
                </div>
            </div>
        </>
    );
};

export default Home;
