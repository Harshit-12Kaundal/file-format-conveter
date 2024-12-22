// src/components/Navbar.js
import React, { useState,useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { auth } from "../components/firebaseConfig";
import pdfsimpLogo from '../Images/pdfsimp.png';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaUserCircle } from "react-icons/fa"; // User profile icon
import { HiMenu, HiX } from "react-icons/hi"; // Hamburger menu icons
import { FaSun, FaMoon } from "react-icons/fa"; // Sun and Moon icons

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false); // Close dropdown on sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="max-w-screen-full px-6 py-3 md:px-40 shadow-lg h-16 flex items-center justify-between relative font-sans bg-white dark:bg-black">
      {/* Left side logo */}
      <div className="flex items-center space-x-8">
        <Link to="/">
          <img
            src={pdfsimpLogo}
            className="w-14"
            alt="PDF Simp Logo"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Hamburger menu for small screens */}
      <div className="md:hidden">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl text-gray-800 dark:text-white">
          {sidebarOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Sidebar for small screens */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex justify-end">
          <div className="w-64 h-[70%] bg-white dark:bg-gray-800 rounded-l-2xl shadow-lg flex flex-col p-3">
            {/* Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end text-2xl text-gray-600 dark:text-gray-200 hover:text-gray-800"
            >
              <HiX />
            </button>

            {/* Sidebar Content */}
            <nav className="mt-3 space-y-6 text-center">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="text-l font-sans text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-md text-lg block"
              >
                Home
              </Link>
              <Link
                to="/tools"
                onClick={() => setSidebarOpen(false)}
                className="text-l font-sans text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-md text-lg block"
              >
                Tools
              </Link>
              {user ? (
                <div className="flex flex-col mt-4 w-full">
                  <Link
                    to="/profile"
                    className="text-l font-sans text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-md text-lg block"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-l font-sans text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 mt-3 rounded-md text-lg block"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setSidebarOpen(false)}
                  className="text-l font-sans text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-md text-lg block"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Regular Navbar content for larger screens */}
      <div className="hidden md:flex items-center space-x-8 relative">
        <Link
          to="/"
          className="text-l font-sans text-gray-800 dark:text-white font-bold hover:opacity-70 duration-300"
        >
          Home
        </Link>
        <Link
          to="/tools"
          className="text-l font-sans text-gray-800 dark:text-white font-bold hover:opacity-70 duration-300"
        >
          Tools
        </Link>
        {user ? (
          <div className="relative">
            {/* Profile Icon */}
            <FaUserCircle
              size={30}
              className="cursor-pointer text-gray-600 dark:text-gray-200"
              onClick={() => setDropdownOpen((prev) => !prev)}
            />
            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-l font-sans text-gray-800 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="text-l font-sans text-gray-800 dark:text-white font-bold hover:opacity-70 duration-300"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
