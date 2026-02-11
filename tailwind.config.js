/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ✅ UNGA ANIMATION CODE INGA ADD PANNIRUKEN
      keyframes: {
        'fade-in-down': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(-10px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.2s ease-out'
      },fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  
  plugins: [typography],
}
