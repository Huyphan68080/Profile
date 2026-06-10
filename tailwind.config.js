/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        baseDark: '#050505',
        baseLight: '#f5f5f7',
        neonPurple: '#71717a',
        neonBlue: '#52525b',
        neonPink: '#a1a1aa',
        cyanSoft: '#d4d4d8',
        accent: '#e4e4e7',
        zinc: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#1e293b', // Mapped to very dark slate-800 for maximum readability
          500: '#0f172a', // Mapped to slate-900 for high contrast
          600: '#020617', // Mapped to slate-950
          700: '#000000', // Pure black
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
      },
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 16px rgba(113, 113, 122, 0.15), 0 0 32px rgba(161, 161, 170, 0.08)',
        neonBlue: '0 0 20px rgba(161, 161, 170, 0.15)',
        glass: '0 4px 16px rgba(0, 0, 0, 0.12)',
        depth: '0 12px 40px -8px rgba(0, 0, 0, 0.4)',
        'glow-sm': '0 0 10px rgba(161, 161, 170, 0.12)',
        'glow-md': '0 0 24px rgba(161, 161, 170, 0.15)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'border-rotate': {
          '0%': { '--border-angle': '0deg' },
          '100%': { '--border-angle': '360deg' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'border-rotate': 'border-rotate 4s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
