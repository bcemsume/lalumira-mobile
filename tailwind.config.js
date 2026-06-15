/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#fcfaf8',
        foreground: '#231f20',
        primary: {
          DEFAULT: '#c5a880',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#d4b4b4',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f3efeb',
          foreground: '#78716c',
        },
        accent: {
          DEFAULT: '#f5efe6',
          foreground: '#231f20',
        },
        destructive: {
          DEFAULT: '#994d4d',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#231f20',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#231f20',
        },
        border: '#e8dfd3',
        input: '#ffffff',
        ring: '#c5a880',
      },
      fontFamily: {
        sans: ['Lato'],
        heading: ['Playfair Display'],
        serif: ['Playfair Display'],
        mono: ['JetBrains Mono'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
};
