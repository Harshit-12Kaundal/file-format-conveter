// src/components/Footer.js
import React from 'react';
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full border-t border-gray-300 dark:border-gray-700 
    bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-200 
    py-6 transition-colors duration-300">

      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6">

        {/* Logo + Copyright */}
        <p className="text-sm mb-3 md:mb-0">
          © {new Date().getFullYear()} PDF Simp — All Rights Reserved
        </p>

        {/* Quick Footer Menu */}
        <div className="flex space-x-5 text-sm">
          <Link to="/" className="hover:text-blue-500 transition">Home</Link>
          <Link to="/tools" className="hover:text-blue-500 transition">Tools</Link>
          <Link to="/main" className="hover:text-blue-500 transition">Dashboard</Link>
          <Link to="/contact" className="hover:text-blue-500 transition">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

