/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#080810',
          card: '#0f0f1a',
          surface: '#161625',
          hover: '#1e1e32',
        },
        accent: {
          DEFAULT: '#7c3aed',
          bright: '#8b5cf6',
          glow: 'rgba(124,58,237,0.15)',
        },
        text: {
          primary: '#f0f0ff',
          secondary: '#8b8ba8',
          accent: '#a78bfa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeSlideUp 0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'spin-slow': 'spin 1.5s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'bounce-dot': 'bounceDot 1.2s ease-in-out infinite',
        'count-up': 'countUp 1s ease forwards',
        'bar-fill': 'barFill 0.8s ease forwards',
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(124,58,237,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(124,58,237,0.7)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        bounceDot: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        barFill: {
          from: { width: '0%' },
          to: { width: 'var(--bar-width)' },
        },
      },
      boxShadow: {
        'glow-violet': '0 0 20px rgba(124,58,237,0.3)',
        'glow-green': '0 0 20px rgba(16,185,129,0.2)',
        'glow-red': '0 0 20px rgba(239,68,68,0.2)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.2)',
        'card': '0 0 60px rgba(124,58,237,0.08)',
      },
    },
  },
  plugins: [],
}
