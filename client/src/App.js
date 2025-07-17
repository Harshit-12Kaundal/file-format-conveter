import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './components/firebaseConfig.js';
import DocxToPdf from './components/Conversions/Docx-to-Pdf.jsx';
import PdfToDocx from './components/Conversions/Pdf-to-Docx.jsx';
import MergePdfs from './components/Conversions/Merge-Pdf.jsx';
import LandingPage from './components/LandingPage.jsx';
import Login from './components/UserVerification/Login.jsx';
import SignUp from './components/UserVerification/SIgnUp.jsx'; // Ensure correct casing
import PdfCompress from './components/filecompress/pdfcompress.jsx';
import Home from './components/Home.jsx';
import Main from './components/userrelatedpagesofreg/Main.jsx';
import ProtectedRoute from './components/protectedroute/ProtectedRoute.jsx';
import Bars from "react-spinners/ClipLoader";
import Profile from './components/userrelatedpagesofreg/Profile.jsx';
import PdfDescription from './components/Conversions/pdfdescription.jsx';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading once auth state is determined
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Bars color="#3498dg" height={100} width={80} />
      </div>
    );
  }
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/main" /> : <LandingPage />} />
        <Route path="/convert/docx-to-pdf" element={<DocxToPdf />} />
        <Route path="/convert/pdf-to-docx" element={<PdfToDocx />} />
        <Route path="/convert/merge-pdfs" element={<MergePdfs />} />
        <Route path="/convert/pdf-description" element={<PdfDescription />} />
        <Route path="/convert/pdf-compress" element={<PdfCompress />} />
        <Route path="/login" element={user ? <Navigate to="/main" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/main" /> : <SignUp />} />
        <Route path="/tools" element={<Home />} />
        <Route path="/main" element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          }
        />
        <Route path="/main/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
