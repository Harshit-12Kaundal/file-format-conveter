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
import VerifyOtp from './components/UserVerification/Verify-otp.jsx';
import Designer from './components/userrelatedpagesofreg/DesignerPages/Designer.jsx';
import ImageEditor from './components/tools/ImageEditor.jsx';
import DocumentViewer from './components/tools/DocumentViewer.jsx';
import UserProfile from './components/userrelatedpagesofreg/otheruserdata/UserProfile.jsx';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpVerified, setOtpVerified] = useState(
    localStorage.getItem("otpVerified") === "true"
  );

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

  // A Firebase user existing just means they're logged in - it does NOT
  // mean they've passed OTP for this session. Without this check, /login
  // and /signup below would redirect straight to /main and skip OTP
  // entirely whenever Firebase still has a persisted session (e.g. after
  // a page refresh mid-flow, or a stale session from before logout).
  // Adjust "otpVerifiedUid" to whatever key your VerifyOtp page actually
  // sets on success if it's named differently.
  const isFullyVerified = user && otpVerified;

  return (
    <Router>
      <Routes>
        <Route path="/" element={isFullyVerified ? <Navigate to="/main" /> : <LandingPage />} />
        <Route path="/convert/docx-to-pdf" element={<DocxToPdf />} />
        <Route path="/convert/pdf-to-docx" element={<PdfToDocx />} />
        <Route path="/convert/merge-pdfs" element={<MergePdfs />} />
        <Route path="/convert/pdf-description" element={<PdfDescription />} />
        <Route path="/convert/pdf-compress" element={<PdfCompress />} />
        <Route path="/login" element={isFullyVerified ? <Navigate to="/main" /> : <Login setOtpVerified={setOtpVerified} />} />
        <Route path="/signup" element={isFullyVerified ? <Navigate to="/main" /> : <SignUp />} />
        {/* Only accessible if a Firebase user exists (mid sign-in/sign-up).
            If there's no user at all, sending them to /login instead of
            rendering VerifyOtp is what was producing the blank screen. */}
        <Route path="/verify-otp" element={user ? <VerifyOtp setOtpVerified={setOtpVerified} /> : <Navigate to="/login" />} />
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
        <Route path="/main/designer" element={
            <ProtectedRoute>
              <Designer />
            </ProtectedRoute>
          }
        /> 
        {/* Catch-all: any unmatched path (typos, stale bookmarks, etc.)
            goes home instead of rendering a blank page. */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/convert/image-editor" element={<ImageEditor />} />
        <Route path="/convert/document-viewer" element={<DocumentViewer />} />
        <Route path="/user/:uid" element={<UserProfile />} />
      </Routes>
    </Router>
  );
};

export default App;