/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Design System Colors
        'glass': 'rgba(255, 255, 255, 0.05)',
        'glass-hover': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'glass-border-hover': 'rgba(255, 255, 255, 0.2)',
        
        // Accent Colors
        'accent-yellow': '#fbbf24',
        'accent-orange': '#f59e0b',
        'accent-pink': '#ec4899',
        'accent-purple': '#a855f7',
        'accent-green': '#10b981',
        'accent-blue': '#3b82f6',
        'accent-cyan': '#06b6d4',
        
        // Text Colors
        'text-primary': '#ffffff',
        'text-secondary': '#cbd5e1',
        'text-muted': '#64748b',
        'text-accent': '#fbbf24',
        
        // Background Colors
        'bg-primary': '#0f172a',
        'bg-secondary': '#1e293b',
        'bg-glass': 'rgba(255, 255, 255, 0.05)',
        'bg-glass-hover': 'rgba(255, 255, 255, 0.1)',
        
        // Border Colors
        'border-primary': 'rgba(255, 255, 255, 0.1)',
        'border-secondary': 'rgba(255, 255, 255, 0.2)',
        'border-accent': 'rgba(251, 191, 36, 0.3)',
        
        // Shadow Colors
        'shadow-primary': 'rgba(0, 0, 0, 0.3)',
        'shadow-accent': 'rgba(251, 191, 36, 0.25)',
        'shadow-purple': 'rgba(168, 85, 247, 0.25)',
        'shadow-green': 'rgba(16, 185, 129, 0.25)',
        'shadow-blue': 'rgba(59, 130, 246, 0.25)',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
