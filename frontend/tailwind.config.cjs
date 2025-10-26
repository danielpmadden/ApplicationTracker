/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        tracker: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      animation: {
        tracker: 'tracker 1s ease-out forwards'
      }
    }
  },
  plugins: []
};
