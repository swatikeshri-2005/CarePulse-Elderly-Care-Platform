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
        elderly: {
          blue: '#1e40af',
          sky: '#0284c7',
          teal: '#0d9488',
          amber: '#d97706',
          rose: '#e11d48',
          green: '#15803d'
        }
      },
      fontSize: {
        'senior-sm': ['1.125rem', { lineHeight: '1.75rem' }],
        'senior-base': ['1.25rem', { lineHeight: '1.85rem' }],
        'senior-lg': ['1.5rem', { lineHeight: '2rem' }],
        'senior-xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'senior-2xl': ['2.25rem', { lineHeight: '2.5rem' }],
      }
    },
  },
  plugins: [],
}
