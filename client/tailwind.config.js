/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg0: '#0B1220',
        bg1: '#111A2E',
        bg2: '#16213A',
        bg3: '#1C2944',
        border0: '#233252',
        border1: '#2E4066',
        text0: '#F5F7FA',
        text1: '#AEB9CC',
        text2: '#7A879E',
        accent: '#4F8EF7',
        accentDim: '#2A4A8A',
        accent2: '#4FA89E',
        accent2Dim: '#254E49',
        good: '#4CAF7D',
        warn: '#DD8452',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        s: '6px',
        m: '10px',
        l: '16px',
      },
    },
  },
  plugins: [],
};
