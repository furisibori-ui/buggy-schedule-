import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          light: '#e8c547',
          dark: '#b8860b',
        },
        luxury: {
          dark: '#1a1a1a',
          card: '#ffffff',
          border: '#e5e7eb',
        },
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
      },
    },
  },
  plugins: [],
}
export default config
