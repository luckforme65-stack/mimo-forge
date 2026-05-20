/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bb: {
          bg: '#0b0e14',
          surface: '#11151c',
          border: '#1f2630',
          accent: '#ff6b35', // Xiaomi orange
          accent2: '#34d399',
          ink: '#f3f4f6',
          mute: '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
