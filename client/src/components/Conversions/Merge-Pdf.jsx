import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaFilePdf } from 'react-icons/fa';

const PdfMerger = () => {
    const [selectedFile1, setSelectedFile1] = useState(null);
    const [selectedFile2, setSelectedFile2] = useState(null);
    const [mergeMessage, setMergeMessage] = useState('');
    const [downloadError, setDownloadError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);

    const handleFileChange1 = (e) => {
        setSelectedFile1(e.target.files[0]);
    };

    const handleFileChange2 = (e) => {
        setSelectedFile2(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile1 || !selectedFile2) {
            setMergeMessage('Please select two PDF files');
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file1', selectedFile1);
        formData.append('file2', selectedFile2);

        try {
            const response = await axios.post('http://localhost:3001/mergepdfs', formData, {
                responseType: 'blob',
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'merged.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSelectedFile1(null);
            setSelectedFile2(null);
            setDownloadError('');
            setMergeMessage('Files merged and downloaded successfully');
            if (fileInputRef1.current) {
                fileInputRef1.current.value = '';
            }
            if (fileInputRef2.current) {
                fileInputRef2.current.value = '';
            }
        } catch (error) {
            console.error(error);
            setDownloadError('An error occurred while merging the files');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-screen-full mx-auto container px-6 py-3 md:px-40 flex items-center justify-center w-full">
            <div className="border-2 border-dashed px-4 py-2 md:px-8 md:py-6 border-green-400 rounded-lg shadow-lg flex flex-col items-center space-y-4 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-4">Merge PDF Files</h1>
                <div className="flex items-center justify-center mb-4">
                    <FaFilePdf size={48} className="text-red-500 mr-4" />
                    <p className="text-sm text-center">Merge two PDF files into one</p>
                </div>
                <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="fileInput1"
                    onChange={handleFileChange1}
                    ref={fileInputRef1}
                />
                <label
                    htmlFor="fileInput1"
                    className="w-full flex items-center justify-center px-1 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-lg border-blue-300 cursor-pointer hover:bg-green-700 hover:text-white duration-300"
                >
                    <FaFilePdf size={48} className="text-red-500 mr-4" />
                    <span className="text-xl">{selectedFile1 ? selectedFile1.name : 'Choose First File'}</span>
                </label>
                <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="fileInput2"
                    onChange={handleFileChange2}
                    ref={fileInputRef2}
                />
                <label
                    htmlFor="fileInput2"
                    className="w-full flex items-center justify-center px-1 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-lg border-blue-300 cursor-pointer hover:bg-green-700 hover:text-white duration-300"
                >
                    <FaFilePdf size={48} className="text-red-500 mr-4" />
                    <span className="text-xl">{selectedFile2 ? selectedFile2.name : 'Choose Second File'}</span>
                </label>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedFile1 || !selectedFile2 || isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-700 duration-300 disabled:bg-gray-400 disabled:pointer-events-none"
                >
                    Merge Files
                </button>
                {isLoading && (
                    <div className="w-full mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-center text-sm">Upload Progress: {uploadProgress}%</p>
                    </div>
                )}
                {mergeMessage && <p className="text-green-500 mt-4">{mergeMessage}</p>}
                {downloadError && <p className="text-red-500 mt-4">{downloadError}</p>}
            </div>
        </div>
    );
};

export default PdfMerger;
