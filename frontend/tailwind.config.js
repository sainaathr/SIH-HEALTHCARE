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
        stable: {
          light: '#ecfdf5',
          DEFAULT: '#10b981',
          dark: '#047857'
        },
        moderate: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309'
        },
        high: {
          light: '#ffedd5',
          DEFAULT: '#f97316',
          dark: '#c2410c'
        },
        critical: {
          light: '#fef2f2',
          DEFAULT: '#ef4444',
          dark: '#b91c1c'
        },
        info: {
          light: '#eff6ff',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8'
        },
        slate: {
          850: '#152033',
          950: '#0b1324'
        }
      }
    },
  },
  plugins: [],
}
