/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT: '#0d1117', 2: '#161c2d', 3: '#1c2438' },
        accent:  { DEFAULT: '#4f6ef7', dim: '#3b58d8' },
        border:  { DEFAULT: 'rgba(255,255,255,0.07)', 2: 'rgba(255,255,255,0.13)' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        xs:    ['12px', '18px'],
        sm:    ['13px', '20px'],
        base:  ['14px', '22px'],
        lg:    ['16px', '24px'],
        xl:    ['18px', '28px'],
        '2xl': ['22px', '32px'],
        '3xl': ['28px', '36px'],
      },
      borderRadius: {
        sm: '5px', DEFAULT: '7px', md: '8px', lg: '10px', xl: '14px', '2xl': '18px',
      },
      boxShadow: {
        'glow-sm': '0 0 0 3px rgba(79,110,247,0.15)',
        'card':    '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'modal':   '0 20px 60px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease',
        'slide-up':   'slideUp 0.25s ease',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
