/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f4fd',
          100: '#d0e9fb',
          200: '#a1d3f7',
          300: '#72bdf3',
          400: '#43a7ef',
          500: '#1a91eb',
          600: '#1a7fc1',
          700: '#0f5c8c',
          800: '#0f4c81',
          900: '#0a3257',
        },
        accent: {
          DEFAULT: '#00c9a7',
          dark: '#00a88c',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-right': 'slideRight 0.5s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideRight: { '0%': { opacity: 0, transform: 'translateX(-24px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a3257 0%, #0f4c81 40%, #1a7fc1 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)',
      },
      boxShadow: {
        card: '0 4px 24px rgba(15, 76, 129, 0.10)',
        'card-hover': '0 12px 40px rgba(15, 76, 129, 0.18)',
        glow: '0 0 40px rgba(26, 127, 193, 0.3)',
      },
    },
  },
  plugins: [],
};
