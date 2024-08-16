// src/conversions.js

import { FaFileWord, FaFilePdf, FaPlusCircle } from "react-icons/fa";

const conversions = [
  { id: 'docx-to-pdf', title: 'DOCX to PDF', icon: <FaFileWord className="text-blue-500" size={48} /> },
  { id: 'pdf-to-docx', title: 'PDF to DOCX', icon: <FaFilePdf className="text-red-500" size={48} /> },
  { id: 'merge-pdfs', title: 'Merge PDFs', icon: <FaPlusCircle className="text-violet-500" size={48} /> },
  // Add more conversion types as needed with appropriate icons
];

export default conversions;
