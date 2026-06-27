/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0a0f0a",
        surface: "#0d1f1a",
        primary: "#00e5a0",
        secondary: "#00b4d8",
        muted: "#7ab8a0",
        border: "#1a3d2e",
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        typing: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { borderColor: '#00e5a0' },
          '50%': { borderColor: 'transparent' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fillBar: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--target-width)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0, 229, 160, 0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 229, 160, 0.6)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        typing: 'typing 2s steps(20) forwards',
        blink: 'blink 0.75s step-end infinite',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        fillBar: 'fillBar 1s ease-out forwards',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        gradientShift: 'gradientShift 8s ease infinite',
      },
    },
  },
  plugins: [],
}
