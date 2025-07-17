import React, { useState } from 'react';
import Navbar from '../Navbar';
import { FaFileUpload, FaArrowLeft, FaGoogleDrive } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import GoogleDriveButton from '../../Google_drive.jsx';

function Main() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  const recentProjects = ['Project 1', 'Project 2', 'Project 3']; // Example data

  const globalWork = [
    {
      title: 'Work 1',
      description: 'Description of global work 1, including its key details.',
    },
    {
      title: 'Work 2',
      description: 'Description of global work 2, including its objectives and progress.',
    },
    {
      title: 'Work 3',
      description: 'Description of global work 3, explaining its goals and current status.',
    },
  ];

  const followerLinks = [
    {
      title: 'Project A',
      description: 'This is a detailed description of Project A, explaining what the person is working on.',
      status: 'In Progress',
      deadline: '2024-12-31',
    },
    {
      title: 'Project B',
      description: 'A brief overview of Project B, outlining its scope and current progress.',
      status: 'Completed',
      deadline: '2024-11-15',
    },
  ];

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleDone = () => {
    if (file) {
      // Pass file data to the home page
      navigate("/tools", { state: { uploadedFile: file } });
    } else {
      alert("Please upload a file before proceeding.");
    }
  };

  return (
    <div className="bg-gray-900 text-white">
      <Navbar />
      <div className="h-screen grid grid-cols-5 gap-4 p-4 bg-gray-900">
        {/* Left Section */}
        <div className="col-span-1 bg-gray-800 shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Recent Projects</h2>
          <ul>
            {recentProjects.map((project, index) => (
              <li key={index} className="mb-2 text-gray-300">
                {project}
              </li>
            ))}
          </ul>
        </div>

        {/* Center Section */}
        <div className="col-span-3 bg-gray-800 shadow-md rounded-lg p-4 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Followers' Work</h2>
            <button
              onClick={handleOpenPopup}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="space-y-4">
            {followerLinks.map((project, index) => (
              <div key={index} className=" p-4 rounded-lg shadow-sm bg-gray-700">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-2">{project.description}</p>
                <p className="text-sm text-gray-500">Status: {project.status}</p>
                <p className="text-sm text-gray-500">Deadline: {project.deadline}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="col-span-1 bg-gray-800 shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Global Work</h2>
          <div className="space-y-4">
            {globalWork.map((work, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">{work.title}</h3>
                <p className="text-gray-400 text-sm">{work.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popup */}
      {isPopupOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur flex items-center justify-center z-50">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-[500px]">
          
        <div className="flex items-center justify-between mb-6">
            {/* Backward Arrow */}
            <button
              type="button"
              onClick={()=>{ setIsPopupOpen(false); }}
              className="p-2 rounded-full hover:bg-gray-700"
              aria-label="Go Back"
            >
              <FaArrowLeft className="w-6 h-6 text-gray-300" />
            </button>

            {/* Title */}
            <h3 className="text-lg font-bold text-center flex-grow">Add File</h3>
          </div>

          <form>
            {/* Upload from Device */}
            <label className="block mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
              <FaFileUpload className="text-gray-300 w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-gray-300">Upload from Device</span>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                className="block w-full mt-2 text-white bg-gray-800 border border-gray-600 rounded-md shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-white file:bg-gray-700 file:hover:bg-gray-600"
              />
              {file && (
                <p className="mt-2 text-sm text-green-400">
                  Uploaded: {file.name}
                </p>
              )}
            </div>
          </label>

            {/* Upload from Google Drive */}
          <label className="block mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
              <FaGoogleDrive  className="text-gray-300 w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-gray-300">Upload from Google Drive</span>
              <GoogleDriveButton/>
            </div>
          </label>

            {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleDone}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Done
            </button>
          </div>
          </form>
        </div>
      </div>
    )}

    </div>
  );
}

export default Main;
