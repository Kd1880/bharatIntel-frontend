/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#030a0d',
        surface: '#071218',
        accent:  '#c8f025',
        teal:    '#084556',
        danger:  '#FF3131',
        warn:    '#FFB800',
        info:    '#00B4FF',
      },
      fontSize: {
        'xxs':  ['11px', { lineHeight: '1.4', letterSpacing: '0.1em' }],
        'xs':   ['12px', { lineHeight: '1.5', letterSpacing: '0.08em' }],
        'sm':   ['13px', { lineHeight: '1.6' }],
        'base': ['14px', { lineHeight: '1.7' }],
        'md':   ['16px', { lineHeight: '1.5' }],
        'lg':   ['18px', { lineHeight: '1.4' }],
        'xl':   ['22px', { lineHeight: '1.3' }],
        '2xl':  ['28px', { lineHeight: '1.2' }],
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}