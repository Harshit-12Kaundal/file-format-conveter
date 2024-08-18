import React from 'react';
import pdfsimp from "../Images/pdfsimp.png";
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <>
      <div className="max-w-screen-full mx px-6 py-3 md:px-40 shadow-lg h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/">
            <img src={pdfsimp} className='w-28' alt="PDF Simp Logo" loading="lazy"/>
          </Link>
          <h1 className="text-xl cursor-pointer font-semibold hover:opacity-50 duration-300">Tools</h1>
        </div>
        <h1 className="text-xl cursor-pointer font-semibold hover:opacity-50 duration-300">Home</h1>
      </div>
    </>
  )
}

export default Navbar;
