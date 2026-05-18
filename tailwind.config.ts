import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  			'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
  			float: {
  				'0%,100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' },
  			},
  			'float-sm': {
  				'0%,100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-5px)' },
  			},
  			'fade-in-up': {
  				from: { opacity: '0', transform: 'translateY(28px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			'fade-in-down': {
  				from: { opacity: '0', transform: 'translateY(-20px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			'fade-in-left': {
  				from: { opacity: '0', transform: 'translateX(-32px)' },
  				to: { opacity: '1', transform: 'translateX(0)' },
  			},
  			'fade-in-right': {
  				from: { opacity: '0', transform: 'translateX(32px)' },
  				to: { opacity: '1', transform: 'translateX(0)' },
  			},
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' },
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(0.88)' },
  				to: { opacity: '1', transform: 'scale(1)' },
  			},
  			shimmer: {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' },
  			},
  			'gradient-x': {
  				'0%,100%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' },
  			},
  			'spin-slow': {
  				from: { transform: 'rotate(0deg)' },
  				to: { transform: 'rotate(360deg)' },
  			},
  			'bounce-x': {
  				'0%,100%': { transform: 'translateX(0)' },
  				'50%': { transform: 'translateX(5px)' },
  			},
  			glow: {
  				'0%,100%': { opacity: '0.4', transform: 'scale(1)' },
  				'50%': { opacity: '0.8', transform: 'scale(1.08)' },
  			},
  			marquee: {
  				from: { transform: 'translateX(0)' },
  				to: { transform: 'translateX(-50%)' },
  			},
  			'pulse-ring': {
  				'0%': { transform: 'scale(1)', opacity: '1' },
  				'100%': { transform: 'scale(1.6)', opacity: '0' },
  			},
  			'slide-up': {
  				from: { transform: 'translateY(100%)', opacity: '0' },
  				to: { transform: 'translateY(0)', opacity: '1' },
  			},
  			'wipe-right': {
  				from: { transform: 'scaleX(0)', transformOrigin: 'left' },
  				to: { transform: 'scaleX(1)', transformOrigin: 'left' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'float': 'float 5s ease-in-out infinite',
  			'float-sm': 'float-sm 4s ease-in-out infinite',
  			'float-delayed': 'float 5s ease-in-out 1.5s infinite',
  			'float-slow': 'float 7s ease-in-out infinite',
  			'fade-in-up': 'fade-in-up 0.65s cubic-bezier(0.16,1,0.3,1) both',
  			'fade-in-down': 'fade-in-down 0.65s cubic-bezier(0.16,1,0.3,1) both',
  			'fade-in-left': 'fade-in-left 0.65s cubic-bezier(0.16,1,0.3,1) both',
  			'fade-in-right': 'fade-in-right 0.65s cubic-bezier(0.16,1,0.3,1) both',
  			'fade-in': 'fade-in 0.5s ease-out both',
  			'scale-in': 'scale-in 0.55s cubic-bezier(0.16,1,0.3,1) both',
  			'shimmer': 'shimmer 2.2s linear infinite',
  			'gradient-x': 'gradient-x 5s ease infinite',
  			'spin-slow': 'spin-slow 14s linear infinite',
  			'spin-slow-reverse': 'spin-slow 18s linear reverse infinite',
  			'bounce-x': 'bounce-x 1s ease-in-out infinite',
  			'glow': 'glow 3s ease-in-out infinite',
  			'marquee': 'marquee 28s linear infinite',
  			'marquee-fast': 'marquee 16s linear infinite',
  			'pulse-ring': 'pulse-ring 2s ease-out infinite',
  			'slide-up': 'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
  			'wipe-right': 'wipe-right 0.8s cubic-bezier(0.16,1,0.3,1) both',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
