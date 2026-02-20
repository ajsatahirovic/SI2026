/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        clay: '#c4593a',
        slate: '#4a6580',
        cream: '#f5f0e8',
        'warm-white': '#faf8f4',
      },
    },
  },
  plugins: [],
};
