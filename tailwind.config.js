// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // ← must include jsx
  ],
  theme: {
    extend: {
      fontFamily: {
        dm: ['DM Sans', 'sans-serif'],   // ← needed for font-dm class
        sora: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
}