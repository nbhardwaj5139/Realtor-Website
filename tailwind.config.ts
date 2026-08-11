import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1360px' },
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
        /* Brand tokens — Modern Luxury palette */
        slate: {
          ink: '#0F172A',
          deep: '#111c33',
        },
        sand: {
          DEFAULT: '#F8F6F0',
          dark: '#EFEBE1',
        },
        gold: {
          DEFAULT: '#C5A880',
          bright: '#D4AF37',
          soft: '#E3D2B8',
        },
        /* Third direction — "Editorial": image-led, near-black on warm white */
        ed: {
          paper: '#FAF9F7',
          paperWarm: '#F2EFE9',
          ink: '#111214',
          inkSoft: '#4A4A4E',
          muted: '#7C7872',
          line: '#E5E0D8',
          accent: '#A6461F',
          night: '#0C0C0D',
        },
        /* Second design direction — "Move Guide": warm paper, forest, clay */
        guide: {
          paper: '#FBFAF7',
          paperDark: '#F1EEE7',
          ink: '#141F1B',
          inkSoft: '#3D4B45',
          muted: '#6B7A72',
          line: '#E2DED4',
          forest: '#1F6F4A',
          forestDark: '#175538',
          clay: '#C4643B',
          mint: '#E8F2EC',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        luxe: '0 24px 60px -20px rgba(15, 23, 42, 0.28)',
        card: '0 2px 8px -2px rgba(15,23,42,0.08), 0 12px 32px -12px rgba(15,23,42,0.14)',
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
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.25s ease-out',
        'accordion-up': 'accordion-up 0.25s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
