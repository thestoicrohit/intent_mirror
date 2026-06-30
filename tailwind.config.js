/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // All colors are managed via src/theme.js (DARK/LIGHT tokens)
      // and applied as inline styles — no Tailwind color classes needed
    },
  },
  plugins: [],
}
