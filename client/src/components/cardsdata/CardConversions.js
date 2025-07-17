import { FaFileWord, FaFilePdf, FaPlusCircle, FaCompress } from "react-icons/fa";

const conversions = [
  { id: 'docx-to-pdf', title: 'DOCX to PDF', icon: <FaFileWord className="text-blue-500" size={48} /> },
  { id: 'pdf-to-docx', title: 'PDF to DOCX', icon: <FaFilePdf className="text-red-500" size={48} /> },
  { id: 'merge-pdfs', title: 'Merge PDFs', icon: <FaPlusCircle className="text-violet-500" size={48} /> },
  { id: 'pdf-compress', title: 'Compress PDF', icon: <FaCompress className="text-green-500" size={48} /> },
  { id: 'pdf-description', title: 'PDF description', icon: <FaFilePdf className="text-yellow-500" size={48} /> },
  // Add more conversion types as needed with appropriate icons
];

export default conversions;
