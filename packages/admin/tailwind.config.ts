import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
      backdropBlur: {
        glass: '20px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 245, 255, 0.15)',
        'neon-lg': '0 0 40px rgba(0, 245, 255, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
