import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DocxToPdf from './components/Conversions/Docx-to-Pdf.jsx';
import PdfToDocx from './components/Conversions/Pdf-to-Docx.jsx';
import MergePdfs from './components/Conversions/Merge-Pdf.jsx';
import LandingPage from './components/LandingPage.jsx';
import Login from './components/UserVerification/Login.jsx';
import SignUp from './components/UserVerification/SIgnUp.jsx';  // Ensure correct casing
import PdfCompress from './components/filecompress/pdfcompress.jsx';
import Home from './components/Home.jsx'; 

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/convert/docx-to-pdf" element={<DocxToPdf />} />
          <Route path="/convert/pdf-to-docx" element={<PdfToDocx />} />
          <Route path="/convert/merge-pdfs" element={<MergePdfs />} />
          <Route path="/convert/pdf-compress" element={<PdfCompress />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />  {/* Use hyphen for route names */}
          <Route path="/tools" element={<Home />} />
        </Routes>
    </Router>
  );
};

export default App;
