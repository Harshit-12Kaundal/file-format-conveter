import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ conversion }) => {
  return (
    <Link to={`/convert/${conversion.id}`} className="block">
      <div className="w-52 p-12 bg-white shadow-md rounded-lg bg-slate-50 hover:shadow-xl transition-shadow h-64 flex flex-col items-center justify-center hover:bg-gray-300">
        {conversion.icon}
        <h3 className="text-lg font-semibold mt-4">{conversion.title}</h3>
      </div>
    </Link>
  );
};

export default Card;
