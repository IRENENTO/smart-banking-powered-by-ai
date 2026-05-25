/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#13131A',
          light: '#1A1A26',
          lighter: '#222233',
        },
        primary: {
          DEFAULT: '#00F5FF',
          dark: '#00C4CC',
          light: '#66F8FF',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          dark: '#5B21B6',
          light: '#A78BFA',
        },
        accent: {
          DEFAULT: '#FF3366',
          dark: '#CC2952',
          light: '#FF6B8A',
        },
        success: {
          DEFAULT: '#00E676',
          dark: '#00B85E',
        },
        warning: {
          DEFAULT: '#FFB300',
          dark: '#CC8F00',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          light: 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'Inter_700Bold'],
        mono: ['JetBrainsMono_400Regular'],
      },
    },
  },
  plugins: [],
};
