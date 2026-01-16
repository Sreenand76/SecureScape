/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'insecure-red': '#dc2626',
        'insecure-red-light': '#fee2e2',
        'secure-green': '#16a34a',
        'secure-green-light': '#dcfce7',
      },
    },
  },
  plugins: [],
}
