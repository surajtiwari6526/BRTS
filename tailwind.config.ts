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
        brts: {
          navy: '#0F172A',
          navyDark: '#020617',
          navyLight: '#1E293B',
          navyMuted: '#334155',
          saffron: '#EA580C',
          saffronLight: '#F97316',
          amber: '#D97706',
          silver: '#F8FAFC',
          silverCard: '#FFFFFF',
          silverBorder: '#E2E8F0',
          silverMuted: '#94A3B8',
          green: '#16A34A',
          red: '#DC2626'
        },
        obsidian: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          elevation: '#F1F5F9'
        },
        transit: {
          navy: '#0F172A',
          saffron: '#EA580C',
          saffronAccent: '#F97316',
          rushRed: '#DC2626',
          flowGreen: '#16A34A',
          amberPulse: '#D97706',
          silver: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brts-card': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'brts-saffron': '0 4px 14px rgba(234, 88, 12, 0.22)',
        'brts-navy': '0 4px 14px rgba(15, 23, 42, 0.15)',
        'glow-saffron': '0 0 16px rgba(234, 88, 12, 0.3)',
        'glow-navy': '0 0 16px rgba(15, 23, 42, 0.2)',
        'glow-green': '0 0 16px rgba(22, 163, 74, 0.3)',
        'glow-amber': '0 0 16px rgba(217, 119, 6, 0.3)',
        'glow-cyan': '0 0 16px rgba(2, 132, 199, 0.25)',
        'glow-red': '0 0 16px rgba(220, 38, 38, 0.25)'
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' }
        }
      }
    },
  },
  plugins: [],
};

export default config;
