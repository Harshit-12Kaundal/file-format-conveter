import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import axios from "axios";

const API = "http://localhost:3001";

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API}/users/search?q=${encodeURIComponent(query)}`
        );
        setResults(res.data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goToProfile = (uid) => {
    setQuery("");
    setOpen(false);
    navigate(`/user/${uid}`);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus-within:ring-2 ring-blue-500">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder="Search people..."
          className="bg-transparent outline-none text-sm w-full text-gray-800 dark:text-gray-100 placeholder-gray-400"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }}>
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
          {loading ? (
            <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">No users found</p>
          ) : (
            results.map((u) => (
              <button
                key={u.uid}
                onClick={() => goToProfile(u.uid)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
              >
                {u.photo_url ? (
                  <img src={u.photo_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-bold">
                    {u.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {u.name}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
