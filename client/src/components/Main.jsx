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
      <div className="flex flex-wrap gap-4">  {/* Added flex and flex-wrap classes */}
        {conversions.map(conversion => (
          <Link to={`/convert/${conversion.id}`} key={conversion.id} className="block">
            <div className="w-52 p-12 bg-white shadow-md rounded-lg hover:shadow-xl transition-shadow h-64 hover:bg-green-500">
              <h3 className="text-lg font-semibold">{conversion.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Main;
