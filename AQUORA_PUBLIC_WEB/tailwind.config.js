/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aquora: {
          navy: '#050B14',
          dark: '#0A111E',
          card: '#0F1A2D',
          border: '#1E2C44',
          cyan: '#00D2FF',
          blue: '#0072FF',
        }
      }
    },
  },
  plugins: [],
}
