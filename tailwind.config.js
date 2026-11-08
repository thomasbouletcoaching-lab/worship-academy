/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nuit: '#0f1424',
        ivoire: '#f7f3ea',
        or: '#c9a24a',
        sauge: '#7c9a7e',
        bordeaux: '#7a2e3a',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
