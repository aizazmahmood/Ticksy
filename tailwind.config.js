/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FFC107',
        'primary-dark': '#E0A800',
        background: '#FFFDF6',
        card: '#FFFFFF',
        'text-primary': '#1E1E1E',
        'text-secondary': '#5F5F5F',
        success: '#4CAF50',
        error: '#F44336',
        'pending-chip': '#FFE082',
        shadow: '#E8E8E8',
      },
    },
  },
  plugins: [],
};
