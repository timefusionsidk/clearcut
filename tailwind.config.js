/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FBFAF9',
        surface: '#FFFFFF',
        line: '#E6E4E1',
        ink: { DEFAULT: '#1B1A19', soft: '#57534E', faint: '#8B8781' },
        accent: { DEFAULT: '#4A22E0', dark: '#3714B8', tint: '#EFEBFE' },
        danger: '#B4231C',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(27,26,25,.04), 0 12px 32px -12px rgba(27,26,25,.14)',
        lift: '0 2px 4px rgba(27,26,25,.05), 0 24px 48px -20px rgba(27,26,25,.22)',
        key: '0 1px 0 rgba(27,26,25,.08)',
      },
      borderRadius: { xl2: '18px' },
      keyframes: {
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(2%,-3%,0) scale(1.08)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(320%)' },
        },
        pop: {
          from: { opacity: '0', transform: 'scale(.97)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        drift: 'drift 18s ease-in-out infinite',
        rise: 'rise .7s cubic-bezier(.2,.7,.3,1) both',
        sheen: 'sheen 1.6s ease-in-out infinite',
        pop: 'pop .18s ease-out both',
      },
    },
  },
  plugins: [],
}
