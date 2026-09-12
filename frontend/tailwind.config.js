/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFAF8',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#181817',
          light: '#2D2D2A',
        },
        muted: {
          DEFAULT: '#6D6A63',
          light: '#9E9B93',
        },
        border: {
          DEFAULT: '#E8E5E0',
          dark: '#D5D1CB',
        },
        bronze: {
          DEFAULT: '#9A6B3F',
          hover: '#805632',
          light: '#F8F4EE',
          dark: '#634324',
          50: '#FBF9F5',
          100: '#F5EFEB',
          200: '#EBDCCE',
          300: '#DCBF9F',
          400: '#BD8C5E',
          500: '#9A6B3F',
          600: '#805632',
          700: '#634324',
        },
        status: {
          success: '#2F7D5B',
          'success-bg': '#EBF5F0',
          danger: '#C84A4A',
          'danger-bg': '#FBECEC',
          warning: '#D9822B',
          'warning-bg': '#FEF6EE',
          info: '#2C6ECB',
          'info-bg': '#EDF4FC',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(24, 24, 23, 0.05), 0 1px 4px -1px rgba(24, 24, 23, 0.03)',
        'card-hover': '0 12px 24px -6px rgba(24, 24, 23, 0.08), 0 4px 10px -2px rgba(24, 24, 23, 0.04)',
        'dropdown': '0 10px 30px -5px rgba(24, 24, 23, 0.12), 0 4px 12px -2px rgba(24, 24, 23, 0.06)',
      },
      transitionDuration: {
        fast: '150ms',
        ui: '200ms',
        form: '240ms',
        drawer: '280ms',
        section: '400ms',
        hero: '800ms',
      },
      transitionTimingFunction: {
        'spring-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'hero-ambient-zoom': {
          '0%': { transform: 'scale(1.00)' },
          '100%': { transform: 'scale(1.04)' },
        },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'hero-zoom': 'hero-ambient-zoom 5000ms ease-out forwards',
        'fade-slide-up': 'fade-slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
