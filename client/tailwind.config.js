/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Make sure Tailwind scans all relevant files
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'], // Custom font family
      },
      // Optionally, you can extend colors, spacing, etc. here
    },
  },
  plugins: [],
}
