export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#7c3aed',
          700: '#5b21b6',
        },
      },
      boxShadow: {
        glass: '0 20px 50px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
