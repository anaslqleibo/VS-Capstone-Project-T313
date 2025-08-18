/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",      // Deep blue
        unaccepted: "#F97316",   // Orange
        open: "#60A5FA",         // Light blue
        leave: "#6B7280",        // Grey
      },
      fontFamily: {
        sans: ['"Inter"', "sans-serif"],
      },
    },
  },
  plugins: [],
}
