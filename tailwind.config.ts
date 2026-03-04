import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        noc: {
          bg: '#0a0e1a',
          bgSecondary: '#111827',
          panel: '#1a1f2e',
          border: '#2a3042',
          text: '#e5e7eb',
          textMuted: '#9ca3af',
          textDim: '#6b7280',
          green: '#00ff88',
          greenDim: '#00cc6a',
          orange: '#ff6b35',
          blue: '#3b82f6',
          blueLight: '#60a5fa',
          purple: '#a855f7',
          red: '#ef4444',
          yellow: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Pretendard', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'noc-gradient': 'linear-gradient(135deg, #0a0e1a 0%, #111827 100%)',
        'panel-gradient': 'linear-gradient(135deg, rgba(26,31,46,0.9) 0%, rgba(17,24,39,0.8) 100%)',
        'header-gradient': 'linear-gradient(90deg, #0a0e1a 0%, #1a1f2e 50%, #0a0e1a 100%)',
      },
    },
  },
  plugins: [],
}

export default config
