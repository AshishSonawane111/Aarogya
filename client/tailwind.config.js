/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Primary Teal
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        clinical: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5', // Clinical Indigo
          700: '#4338ca',
        },
        emergency: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e11d48', // Emergency Crimson
          700: '#be123c',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 118, 110, 0.08)',
        'glow': '0 0 20px rgba(13, 148, 136, 0.35)',
        'emergency-glow': '0 0 20px rgba(225, 29, 72, 0.4)'
      }
    },
  },
  plugins: [],
}
