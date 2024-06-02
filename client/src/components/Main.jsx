// src/components/Main.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const conversions = [
  { id: 'docx-to-pdf', title: 'DOCX to PDF' },
  { id: 'pdf-to-docx', title: 'PDF to DOCX' },
  // Add more conversion types as needed
];

const Main = () => {
  return (
    <div className="p-4 mt-4 flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversions.map(conversion => (
          <Link to={`/convert/${conversion.id}`} key={conversion.id} className="block">
            <div className="p-8 bg-white shadow-md rounded-lg hover:shadow-xl transition-shadow h-64 hover:bg-green-500">
              <h3 className="py-24 text-lg font-semibold">{conversion.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Main;

