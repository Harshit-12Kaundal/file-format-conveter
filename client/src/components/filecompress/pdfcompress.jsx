import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaFilePdf, FaCompress } from 'react-icons/fa';
import Navbar from '../Navbar';
import './style.css'; // Ensure this path is correct
import gradient from 'random-gradient'

const CompressPdf = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [compressionLevel, setCompressionLevel] = useState(50); // Default to 50%
    const [compressMessage, setCompressMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const sliderRef = useRef(null);
    const [gradientStyle, setGradientStyle] = useState('');

    useEffect(() => {
      // Generate a random gradient when the component mounts
      const generatedGradient = gradient('unique-seed-' + Math.random());
      setGradientStyle(generatedGradient);
    }, []); // Empty dependency array ensures this runs only once on reload    
    
    useEffect(() => {
        const slider = sliderRef.current;
        if (slider) {
            const percentage = (compressionLevel - slider.min) / (slider.max - slider.min) * 100;
            slider.style.background = `linear-gradient(to right, #4caf50 ${percentage}%, #d3d3d3 ${percentage}%)`;
        }
    }, [compressionLevel]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        if (files.length === 0) {
            setCompressMessage('Only PDF files are allowed.');
            return;
        }
        setSelectedFiles(files);
        setCompressMessage('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        if (files.length === 0) {
            setCompressMessage('Only PDF files are allowed.');
            return;
        }
        setSelectedFiles(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleCompressionChange = (e) => {
        setCompressionLevel(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (selectedFiles.length === 0) {
            setCompressMessage('Please select a PDF file to compress.');
            return;
        }
    
        setIsLoading(true);
    
        const formData = new FormData();
        formData.append('file', selectedFiles[0]);
        formData.append('compressionLevel', compressionLevel); // Ensure this is handled in the backend
    
        try {
            const response = await axios.post('http://localhost:3001/convertfile/pdf/to-compress', formData, {
                responseType: 'blob', // Ensure the response is a blob
            });
    
            // Create a blob URL for the compressed PDF file
            const url = window.URL.createObjectURL(new Blob([response.data]));
    
            // Dynamically get the filename from the original file or set default
            const originalFileName = selectedFiles[0].name;
            const compressedFileName = originalFileName.replace(/\.pdf$/i, '_compressed.pdf'); // Adding "_compressed" to the original filename
    
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', compressedFileName); // Set the filename for download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            // Revoke the blob URL after downloading
            window.URL.revokeObjectURL(url);
    
            setCompressMessage('File compressed and downloaded successfully.');
            setSelectedFiles([]); // Clear selected files after download
        } catch (error) {
            if (error.response) {
                // Log and display error message from the server
                const errorData = await error.response.data.text();
                console.error('Server error during file upload:', errorData);
                setCompressMessage('An error occurred while compressing the file: ' + errorData);
            } else {
                // Handle network or unexpected errors
                console.error('Error during file upload:', error);
                setCompressMessage('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-gray-900 text-white h-screen">
            <Navbar />
            <div className="max-w-screen-lg mx-auto container my-10 px-6 py-3 md:px-40 flex items-center justify-center w-full">
                <div
                    className={`border-2 border-dashed px-4 py-2 md:px-8 md:py-6 border-green-400 rounded-lg shadow-lg flex flex-col items-center space-y-4 w-full max-w-2xl
                    }`}
                    style={{
                        background:isDragging || selectedFiles.length!=0? gradientStyle : '#2d3748', // Default gradient
                        transition: 'background-image 0.3s ease',
                      }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <h1 className="text-3xl font-bold text-center mb-4">Compress PDF</h1>
                    <div className="flex items-center justify-center mb-4">
                        <FaFilePdf size={48} className="text-green-500 mr-4" />
                        <p className="text-sm text-center text-gray-300">Reduce the size of your PDF files easily.</p>
                    </div>

                    {selectedFiles.length === 0 && (
                        <label
                            htmlFor="fileInput"
                            className="w-full flex items-center justify-center px-4 py-6 bg-gray-700 text-gray-300 rounded-lg shadow-lg border-violet-300 cursor-pointer hover:bg-green-700 hover:text-white duration-300"
                        >
                            <FaCompress size={24} className="mr-2" />
                            <span className="text-xl">Choose Files or Drag & Drop Here</span>
                        </label>
                    )}
                    <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        id="fileInput"
                        onChange={handleFileChange}
                    />

                    {selectedFiles.length > 0 && (
                        <div className="mt-4 w-full">
                            <p className="text-center text-lg mb-2">File(s) selected:</p>
                            <div className="shadow-lg rounded-lg p-4 hover:border-violet-400 hover:bg-green-500 transition duration-300">
                                {selectedFiles.map((file, index) => (
                                    <p key={index} className="text-center text-lg font-medium text-gray-300 truncate max-w-xl">
                                        {file.name}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Compression Level Slider */}
                    {/* <div className="w-full mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="compression-range">
                            Select Compression Level:
                        </label>
                        <input
                            id="compression-range"
                            type="range"
                            min="1"
                            max="100"
                            value={compressionLevel}
                            onChange={handleCompressionChange}
                            className="ml-36 custom-slider"
                            ref={sliderRef}
                            aria-label="Select Compression Level"
                        />
                        <p className="text-center text-sm mt-2">Compression Level: {compressionLevel}%</p>
                    </div> */}

                    <button
                        onClick={handleSubmit}
                        disabled={selectedFiles.length === 0 || isLoading}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-700 duration-300 disabled:bg-gray-400 disabled:pointer-events-none mt-4"
                        aria-label="Compress File"
                    >
                        {isLoading ? 'Compressing...' : 'Compress File'}
                    </button>
                    {compressMessage && (
                        <p className={`mt-4 ${compressMessage.includes('error') ? 'text-red-500' : 'text-green-500'}`}>
                            {compressMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompressPdf;
