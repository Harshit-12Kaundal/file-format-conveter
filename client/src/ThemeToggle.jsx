import React, { useEffect, useState } from "react";

function ThemeToggle() {
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

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-4 right-6 z-50 bg-gray-800 dark:bg-gray-200 text-white dark:text-black p-2 rounded-full shadow-md hover:scale-110 transition"
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
}

export default ThemeToggle;
