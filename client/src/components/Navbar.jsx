import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { auth } from "../components/firebaseConfig";
import pdfsimpLogo from '../Images/pdfsimp.png';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaUserCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { FiSun, FiMoon, FiBell } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import UserSearch from "./userrelatedpagesofreg/otheruserdata/UserSearch.jsx";
import Notification from "./userrelatedpagesofreg/otheruserdata/Notification.jsx";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadNotificationCount = async () => {
      if (!user?.uid) {
        setNotificationCount(0);
        return;
      }

      try {
        const { data } = await axios.get(
          `http://localhost:3001/friends/requests/${encodeURIComponent(user.uid)}`
        );
        if (!ignore) setNotificationCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error("Failed to load notification count:", error);
        if (!ignore) setNotificationCount(0);
      }
    };

    loadNotificationCount();
    return () => {
      ignore = true;
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("otpVerified");
      setDropdownOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 
        bg-gray-200 dark:bg-gray-800 
        text-black dark:text-white
        border-b border-gray-300 dark:border-gray-700
        transition-colors duration-300">
        
        <div className="h-full w-full px-4 sm:px-6 lg:px-10 
          flex items-center justify-between">
          
          {/* LEFT: LOGO */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src={pdfsimpLogo}
                className="w-12 rounded-lg"
                alt="PDF Simp Logo"
                loading="lazy"
              />
            </Link>
          </div>
          <div className="hidden md:block flex-1 max-w-xs mx-4">
            <UserSearch />
          </div>

          {/* MOBILE TOGGLE + MENU */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-gray-300 dark:bg-gray-700 hover:scale-110 transition"
              title="Toggle theme"
            >
              {theme === "dark" ? <FiSun size={20}/> : <FiMoon size={20}/>}
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-2xl rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              {sidebarOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8 relative">
            <Link to="/" className="font-semibold hover:opacity-70 transition">Home</Link>
            <Link to="/tools" className="font-semibold hover:opacity-70 transition">Tools</Link>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-gray-300 dark:bg-gray-700 hover:scale-110 transition"
              title="Toggle theme"
            >
              {theme === "dark" ? <FiSun size={20}/> : <FiMoon size={20}/>}
            </button>

            {user ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationOpen((prev) => !prev);
                      setDropdownOpen(false);
                      if (!notificationOpen) {
                        setNotificationCount(0);
                      }
                    }}
                    className="relative p-2 rounded-full bg-gray-300 dark:bg-gray-700 hover:scale-110 transition"
                    title="Notifications"
                  >
                    <FiBell size={18} />
                    {notificationCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 top-full z-50 mt-3 w-[min(520px,calc(100vw-2rem))] rounded-2xl border border-gray-300 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                      <Notification viewerUid={user.uid} />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <FaUserCircle
                    size={30}
                    className="cursor-pointer hover:opacity-80 transition"
                    onClick={() => {
                      setDropdownOpen((prev) => !prev);
                      setNotificationOpen(false);
                    }}
                  />

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-3 w-44
                        rounded-lg shadow-xl z-50 overflow-hidden
                        bg-white text-black
                        dark:bg-gray-900 dark:text-white
                        border border-gray-300 dark:border-gray-700"
                    >
                      <button
                        onClick={() => { navigate('/main/profile'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 font-medium
                          hover:bg-gray-200 dark:hover:bg-gray-700 transition
                          border-b border-gray-300 dark:border-gray-700"
                      >
                        {user.displayName|| 'User'}
                      </button>

                      <button
                        onClick={() => { navigate('/main'); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 font-medium
                          hover:bg-gray-200 dark:hover:bg-gray-700 transition
                          border-b border-gray-300 dark:border-gray-700"
                      >
                        Dashboard
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 font-medium
                          hover:bg-red-100 dark:hover:bg-red-900 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="font-semibold hover:opacity-70 transition">Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-64
              shadow-2xl border-l border-gray-200 dark:border-gray-700
              flex flex-col p-5
              bg-white text-black
              dark:bg-gray-900 dark:text-white
              animate-[slideIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="self-end text-2xl hover:text-red-500 transition"
            >
              <HiX />
            </button>

            <nav className="mt-6 flex flex-col space-y-5 text-left font-semibold">
              {!user ? (
                <Link to="/login" onClick={() => setSidebarOpen(false)} className="hover:opacity-70">Login</Link>
              ) : (
                <>
                  <Link to="/main/profile" onClick={() => setSidebarOpen(false)} className="hover:opacity-70">{user.displayName|| 'User'}</Link>
                </>
              )}
              <Link to="/" onClick={() => setSidebarOpen(false)} className="hover:opacity-70">Home</Link>
              <Link to="/tools" onClick={() => setSidebarOpen(false)} className="hover:opacity-70">Tools</Link>
              <Link to="/main" onClick={() => setSidebarOpen(false)} className="hover:opacity-70">Dashboard</Link>
              {!user ? (
                <Link to="/login" onClick={() => setSidebarOpen(false)} className="hover:opacity-70">Login</Link>
              ) : (
                <>
                  <button onClick={handleSignOut} className="hover:opacity-70 text-left">Sign Out</button>
                </>
              )}

            </nav>
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
};

export default Navbar;
