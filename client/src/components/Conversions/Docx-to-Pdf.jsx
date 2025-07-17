import React, { useState, useRef ,useEffect } from 'react';
import axios from 'axios';
import { FaFileWord } from 'react-icons/fa';
import Navbar from '../Navbar';
import { useParams, useLocation  } from "react-router-dom";
import gradient from 'random-gradient'


const DocxToPdfUploader = () => {
    const location = useLocation();
    const [selectedFile, setSelectedFile] = useState(
        location.state?.uploadedFile?.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        ? location.state?.uploadedFile 
        : ''
    );
    
    const fileInputRef = useRef(null);
    const [convertMessage, setConvertMessage] = useState('');
    const [downloadError, setDownloadError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [gradientStyle, setGradientStyle] = useState('');
    console.log(gradientStyle);
    console.log(isDragging);
    console.log(selectedFile)
    


    useEffect(() => {
      // Generate a random gradient when the component mounts
      const generatedGradient = gradient('unique-seed-' + Math.random());
      setGradientStyle(generatedGradient);

    }, []); 

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setSelectedFile(e.dataTransfer.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setConvertMessage('Please select a file');
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://localhost:3001/convertfile/docx/to-pdf', formData, {
                responseType: 'blob',
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', selectedFile.name.replace(/\.[^/.]+$/, '') + '.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSelectedFile('');
            setDownloadError('');
            setConvertMessage('File converted and downloaded successfully');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error(error);
            setDownloadError('An error occurred while converting the file');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='bg-gray-900 h-screen w-screen'>
        <Navbar/>
        <div className=" max-w-screen-lg mx-auto container my-10 px-6 py-3 md:px-40 flex items-center justify-center w-full ">
            <div className="border-2 border-dashed px-4 py-2 md:px-8 md:py-6 border-blue-400 rounded-lg shadow-lg flex flex-col items-center space-y-4 w-full max-w-2xl bg-gray-700 text-white"
                style={{
                    background:isDragging || selectedFile.length!=0? gradientStyle : '#2d3748', // Default gradient
                    transition: 'background-image 0.3s ease',
                  }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <h1 className="text-3xl font-bold text-center mb-4">Convert DOCX to PDF</h1>
                <div className="flex items-center justify-center mb-4">
                    <FaFileWord size={48} className="text-blue-500 mr-4" />
                    <p className="text-sm text-center">Easily convert your DOCX files to PDF format</p>
                </div>
                <input
                    type="file"
                    accept=".docx"
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileChange}
                />
                <label
                    htmlFor="fileInput"
                    className="w-full flex items-center px-4 py-5 bg-gray-700 text-gray-300 rounded-lg shadow-lg border-blue-300 cursor-pointer truncate max-w-xl hover:bg-blue-700 hover:text-white duration-300"
                    style={{ background : selectedFile.length!=0 ?'transparent':'#374151'
                        
                    }}
                    >
                    <FaFileWord size={48} className="text-blue-500 mr-4" />
                    <span className="text-xl flex ">{selectedFile ? selectedFile.name : 'Choose File to drag and drop'}</span>
                </label>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-700 duration-300 disabled:bg-gray-400 disabled:pointer-events-none"
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
    </div>
    );
};

export default DocxToPdfUploader;

