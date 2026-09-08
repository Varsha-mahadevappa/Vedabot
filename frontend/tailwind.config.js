/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#fff8f0",
          100: "#feecd3",
          200: "#fdd5a5",
          300: "#fbb66c",
          400: "#f99030",
          500: "#f77010",
          600: "#e85507",
          700: "#c13d08",
          800: "#9a310e",
          900: "#7c2a0f",
        },
        vedic: {
          dark: "#1a0a00",
          brown: "#3d1a00",
          gold: "#c9a227",
        },
      },
      fontFamily: {
        devanagari: ["Noto Sans Devanagari", "sans-serif"],
      },
    },
  },
  plugins: [],
};
