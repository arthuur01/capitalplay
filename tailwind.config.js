// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {fontFamily: {
        audiowide: ['var(--font-audiowide)'],
        poiret_one: ['var(--font-poiret-one)'],
        outfit: ['var(--font-outfit)']
      },},
  },
  darkMode: "class",
  plugins: [],
};
