import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileWord, FaFilePdf } from "react-icons/fa";

const conversions = [
  { id: 'docx-to-pdf', title: 'DOCX to PDF', icon: <FaFileWord className="text-blue-500" size={48} /> },
  { id: 'pdf-to-docx', title: 'PDF to DOCX', icon: <FaFilePdf className="text-red-500" size={48} /> },
  // Add more conversion types as needed with appropriate icons
];

const Main = () => {
  return (
    <div className="p-4 mt-4 flex justify-center">
      <div className="flex flex-wrap gap-4">
        {conversions.map(conversion => (
          <Link to={`/convert/${conversion.id}`} key={conversion.id} className="block">
            <div className="w-52 p-12 bg-white shadow-md rounded-lg hover:shadow-xl transition-shadow h-64 flex flex-col items-center justify-center hover:bg-green-500">
              {conversion.icon}
              <h3 className="text-lg font-semibold mt-4">{conversion.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Main;
