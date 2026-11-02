/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // benzin.jetzt-inspired dark palette
        ink: {
          950: '#0A0A0B',
          900: '#111113',
          850: '#16161A',
          800: '#1C1C21',
          700: '#26262D',
          600: '#33333C',
          500: '#4A4A55',
          400: '#6E6E7A',
          300: '#9A9AA6',
          200: '#C6C6CE',
          100: '#E8E8EC',
        },
        deal: {
          // hot orange-red accent (deals = urgency)
          50: '#FFF3EF',
          100: '#FFE4DB',
          400: '#FF6B45',
          500: '#FF4D2E',
          600: '#E63C1F',
          700: '#C22F15',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-bricolage)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
