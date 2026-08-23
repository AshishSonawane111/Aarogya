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
          50: '#f0f9ff',
          100: '#e0f2fe', // Light Sky Blue
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Primary Sky Blue
          600: '#0284c7',
          700: '#0369a1', // Dark Sky Blue
          800: '#075985',
          900: '#0c4a6e',
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
        'glass': '0 8px 32px 0 rgba(3, 105, 161, 0.08)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.35)',
        'emergency-glow': '0 0 20px rgba(225, 29, 72, 0.4)'
      }
    },
  },
  plugins: [],
}
