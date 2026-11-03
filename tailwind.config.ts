/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind classes
        ink: {
          100: 'var(--color-ink-100)',
          200: 'var(--color-ink-200)',
          300: 'var(--color-ink-300)',
          400: 'var(--color-ink-400)',
          500: 'var(--color-ink-500)',
          600: 'var(--color-ink-600)',
          700: 'var(--color-ink-700)',
          800: 'var(--color-ink-800)',
          900: 'var(--color-ink-900)',
          950: 'var(--color-ink-950)',
        },
        deal: {
          100: 'var(--color-deal-100)',
          200: 'var(--color-deal-200)',
          300: 'var(--color-deal-300)',
          400: 'var(--color-deal-400)',
          500: 'var(--color-deal-500)',
          600: 'var(--color-deal-600)',
          700: 'var(--color-deal-700)',
          800: 'var(--color-deal-800)',
          900: 'var(--color-deal-900)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lg: 'var(--shadow-lg)',
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