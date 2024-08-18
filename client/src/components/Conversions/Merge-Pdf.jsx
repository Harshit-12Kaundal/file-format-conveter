import React, { useState } from 'react';
import axios from 'axios';
import { FaFilePdf, FaPlusCircle } from 'react-icons/fa';
import Navbar from '../Navbar';

const MergePdf = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [mergeMessage, setMergeMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFiles([...selectedFiles, ...e.target.files]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setSelectedFiles([...selectedFiles, ...e.dataTransfer.files]);
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

        if (selectedFiles.length < 2) {
            setMergeMessage('Please select at least two PDF files');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
            formData.append(`file${index + 1}`, file);
        });

        try {
            const response = await axios.post('http://localhost:3001/convertfile/pdf/to-merge', formData, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'merged.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setMergeMessage('Files merged and downloaded successfully');
            setSelectedFiles([]);
        } catch (error) {
            console.error(error);
            setMergeMessage('An error occurred while merging the files');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
        <Navbar/>
        <div className="max-w-screen-lg mx-auto container px-6 py-3 md:px-40 flex items-center justify-center w-full">
            <div
                className={`border-2 border-dashed px-4 py-2 md:px-8 md:py-6 border-violet-400 rounded-lg shadow-lg flex flex-col items-center space-y-4 w-full max-w-2xl ${
                    isDragging ? 'bg-violet-100' : 'bg-white'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                >
                <h1 className="text-3xl font-bold text-center mb-4">Merge PDF</h1>
                <div className="flex items-center justify-center mb-4">
                    <FaFilePdf size={48} className="text-violet-500 mr-4" />
                    <p className="text-sm text-center">Combine your PDF files into one document easily</p>
                </div>

                {/* Main File Input */}
                {selectedFiles.length === 0 && (
                    <label
                    htmlFor="fileInput"
                    className="w-full flex items-center justify-center px-4 py-6 bg-violet-100 text-violet-700 rounded-lg shadow-lg border-violet-300 cursor-pointer hover:bg-violet-700 hover:text-white duration-300"
                    >
                        <FaPlusCircle size={24} className="mr-2" />
                        <span className="text-xl">Choose Files or Drag & Drop Here</span>
                    </label>
                )}
                <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="fileInput"
                    multiple
                    onChange={handleFileChange}
                />

                {/* If only one file is selected, show the "+" button to add more */}
                {selectedFiles.length === 1 && (
                    <label
                    htmlFor="fileInput"
                    className="flex items-center justify-center mt-4 cursor-pointer text-violet-500 hover:text-violet-700 duration-300"
                    >
                        <FaPlusCircle size={24} className="mr-2" />
                        <span>Add another file</span>
                    </label>
                )}

                {/* Display the selected files in a box with hover effect */}
                {selectedFiles.length > 0 && (
                    <div className="mt-4 w-full">
                        <p className="text-center text-lg mb-2">File(s) selected</p>
                        <div className="border border-gray-300 rounded-lg p-4 hover:border-violet-400 hover:bg-violet-500 transition duration-300">
                            {selectedFiles.map((file, index) => (
                                <p key={index} className="text-center text-lg font-medium text-gray-800">
                                    {file.name}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={selectedFiles.length < 2 || isLoading}
                    className="px-4 py-2 bg-violet-500 text-white rounded-lg shadow-lg hover:bg-violet-700 duration-300 disabled:bg-gray-400 disabled:pointer-events-none mt-4"
                    >
                    Merge Files
                </button>
                {isLoading && (
                    <div className="w-full mt-4">
                        <p className="text-center text-sm">Merging files...</p>
                    </div>
                )}
                {mergeMessage && (
                    <p className={`mt-4 ${mergeMessage.includes('error') ? 'text-red-500' : 'text-green-500'}`}>
                        {mergeMessage}
                    </p>
                )}
            </div>
        </div>
        </div>
    );
};

export default MergePdf;
