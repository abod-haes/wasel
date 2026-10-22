import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        brand: {
          primary: '#142F7D',
          'primary-dark': '#102563',
          'primary-soft': '#E9EEFA',
          secondary: '#FAB12E',
          'secondary-dark': '#A86B00',
          'secondary-soft': '#FFF4DB',
          navy: '#142F7D',
          royal: '#213790',
          yellow: '#FAB12E',
          sand: '#EBD2A6',
          // Semantic states, not marketing accents.
          green: '#16803C',
          'green-dark': '#166534',
          'green-soft': '#EAF8EF',
          red: '#D92D20',
          'red-dark': '#B42318',
          'red-soft': '#FEEDEC',
          ink: '#172342',
          muted: '#68758B',
          surface: '#F7F8FC',
          border: '#E3E8F2',
        },
      },
      borderRadius: {
        rodo: '20px',
        wasel: '20px',
        'rodo-lg': '28px',
        'wasel-lg': '28px',
        pill: '999px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      boxShadow: {
        soft: '0 6px 30px -12px rgba(20, 47, 125, 0.15)',
        card: '0 4px 16px -8px rgba(20, 47, 125, 0.12)',
        floating: '0 16px 42px -18px rgba(20, 47, 125, 0.22)',
      },
      fontFamily: {
        sans: ['Cairo', 'Noto Sans Arabic', 'Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
