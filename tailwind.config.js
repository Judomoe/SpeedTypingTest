/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0c0c10', 2: '#131318', 3: '#1a1a22', 4: '#22222e' },
        accent: { DEFAULT: '#e8ff57', 2: '#57ffd8', 3: '#ff6b6b', 4: '#c084fc' },
        txt: { DEFAULT: '#f0f0f8', 2: '#9090a8', 3: '#55556a' },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderColor: { DEFAULT: 'rgba(255,255,255,0.06)' },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'blink': 'blink 1.1s step-end infinite',
        'float': 'float 5s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
