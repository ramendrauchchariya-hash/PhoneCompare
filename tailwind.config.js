/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PhoneCompare design tokens
        pc: {
          // Primary — Tech Blue
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Primary
          700: '#1D4ED8', // Primary dark
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
          // Accent — Sky
          accent: '#38BDF8',
          accentDark: '#7DD3FC',
        },
        // Titanium / Carbon neutral ramp
        titanium: {
          50: '#F8FAFC', // Background
          100: '#F1F5F9',
          200: '#E2E8F0', // Border
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', // Secondary text
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A', // Text
          950: '#020617',
        },
        // Midnight Pro dark mode
        midnight: {
          50: '#1E293B',
          100: '#1E293B',
          200: '#1E293B',
          300: '#1E293B',
          400: '#1E293B',
          500: '#111827', // Card
          600: '#111827',
          700: '#0F172A',
          800: '#0B1120',
          900: '#080B12', // Background
          950: '#050810',
        },
        // Semantic
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#059669',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#DC2626',
          600: '#DC2626',
          700: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'pc-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'pc-md': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'pc-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
        'pc-xl': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
        'pc-glow': '0 0 0 1px rgba(37, 99, 235, 0.1), 0 4px 12px -2px rgba(37, 99, 235, 0.15)',
        'pc-glow-dark': '0 0 0 1px rgba(96, 165, 250, 0.1), 0 4px 12px -2px rgba(96, 165, 250, 0.15)',
      },
      borderRadius: {
        'pc': '1rem',
        'pc-lg': '1.25rem',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pc-pulse': 'pcPulse 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pcPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
