import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home.jsx';
import DocxToPdf from './components/Conversions/Docx-to-Pdf.jsx';
import PdfToDocx from './components/Conversions/Pdf-to-Docx.jsx';
import MergePdfs from './components/Conversions/Merge-Pdf.jsx';
import Navbar from './components/Navbar.jsx';

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/convert/docx-to-pdf" element={<DocxToPdf/>} />
          <Route path="/convert/pdf-to-docx" element={<PdfToDocx/>} />
          <Route path="/convert/merge-pdfs" element={<MergePdfs/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
