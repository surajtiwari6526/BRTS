import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0A0D14',
          card: 'rgba(22, 28, 45, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          elevation: '#111622'
        },
        transit: {
          cyan: '#00F2FE',
          cyanBrand: '#4FACFE',
          rushRed: '#FF3366',
          flowGreen: '#00E676',
          amberPulse: '#FFB300',
          violet: '#7C4DFF'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 16px rgba(0, 242, 254, 0.35)',
        'glow-red': '0 0 16px rgba(255, 51, 102, 0.35)',
        'glow-green': '0 0 16px rgba(0, 230, 118, 0.35)',
        'glow-amber': '0 0 16px rgba(255, 179, 0, 0.35)'
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' }
        }
      }
    },
  },
  plugins: [],
};

export default config;
