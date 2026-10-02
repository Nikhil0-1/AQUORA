/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: '#FAF7F2',
          card: '#FFFFFF',
          dark: '#141414',
          muted: '#71717A',
          border: '#EAE6DF',
          accent: '#FF6B35', // Fresh Orange / Mango Citrus
          gold: '#D4AF37',
          mint: '#10B981',
          ruby: '#E11D48',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
        'luxury-lg': '0 30px 60px -20px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
