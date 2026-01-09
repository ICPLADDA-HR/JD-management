/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f5f7',
          100: '#e8e8ed',
          200: '#d2d2d7',
          300: '#b4b4b9',
          400: '#86868b',
          500: '#515154',
          600: '#1d1d1f',
          700: '#000000',
        },
        accent: {
          50: '#e8f4fd',
          100: '#d1e9fb',
          200: '#a4d3f7',
          300: '#76bdf3',
          400: '#49a7ef',
          500: '#0071e3', // Apple blue
          600: '#005bb5',
          700: '#004587',
        },
      },
      fontFamily: {
        sans: ['Prompt', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['80px', { lineHeight: '84px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display': ['64px', { lineHeight: '68px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-sm': ['48px', { lineHeight: '52px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-1': ['40px', { lineHeight: '44px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-2': ['32px', { lineHeight: '40px', letterSpacing: '-0.005em', fontWeight: '600' }],
        'heading-3': ['24px', { lineHeight: '32px', letterSpacing: '0em', fontWeight: '600' }],
        'body-lg': ['21px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '400' }],
        'body': ['17px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', letterSpacing: '-0.005em', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', letterSpacing: '0em', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '18px',
        '2xl': '24px',
      },
      boxShadow: {
        'apple': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'gradient-apple': 'linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)',
      },
    },
  },
  plugins: [],
}
