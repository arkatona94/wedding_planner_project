/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f6',
          100: '#f9ede8',
          200: '#f3d9d0',
          300: '#e9bfb0',
          400: '#dba08b',
          500: '#c97f66',
          600: '#b5644d',
          700: '#97503e',
          800: '#7d4336',
          900: '#683a30',
        },
        wedding: {
          blush: '#f8e1e4',
          champagne: '#f7e7ce',
          sage: '#9dc183',
          dustyrose: '#d4a5a5',
          gold: '#d4af37',
          ivory: '#fffff0',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
