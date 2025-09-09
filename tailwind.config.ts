import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'xs': '480px',    // Celular pequeno
				'sm': '576px',    // Celular grande
				'md': '768px',    // Tablet
				'lg': '992px',    // Desktop
				'xl': '1200px',   // Desktop grande
				'2xl': '1400px'   // Desktop extra grande
			}
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
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))',
					soft: 'hsl(var(--primary-soft))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					light: 'hsl(var(--secondary-light))',
					dark: 'hsl(var(--secondary-dark))',
					soft: 'hsl(var(--secondary-soft))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					soft: 'hsl(var(--success-soft))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					soft: 'hsl(var(--warning-soft))'
				},
				error: {
					DEFAULT: 'hsl(var(--error))',
					foreground: 'hsl(var(--error-foreground))',
					soft: 'hsl(var(--error-soft))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))',
					soft: 'hsl(var(--info-soft))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				surface: {
					primary: 'hsl(var(--surface-primary))',
					secondary: 'hsl(var(--surface-secondary))',
					neutral: 'hsl(var(--surface-neutral))',
					warm: 'hsl(var(--surface-warm))',
					cool: 'hsl(var(--surface-cool))'
				}
			},
			backgroundImage: {
				'kerigma-gradient': 'var(--kerigma-gradient)',
				'kerigma-gradient-soft': 'var(--kerigma-gradient-soft)',
				'kerigma-gradient-warm': 'var(--kerigma-gradient-warm)',
				'kerigma-gradient-vertical': 'var(--kerigma-gradient-vertical)'
			},
			boxShadow: {
				'kerigma': 'var(--kerigma-shadow)',
				'kerigma-md': 'var(--kerigma-shadow-md)',
				'kerigma-lg': 'var(--kerigma-shadow-lg)',
				'kerigma-xl': 'var(--kerigma-shadow-xl)',
				'kerigma-glow': 'var(--kerigma-glow)',
				'kerigma-glow-warm': 'var(--kerigma-glow-warm)'
			},
			fontSize: {
				'responsive-xs': 'var(--font-size-xs)',
				'responsive-sm': 'var(--font-size-sm)',
				'responsive-base': 'var(--font-size-base)',
				'responsive-lg': 'var(--font-size-lg)',
				'responsive-xl': 'var(--font-size-xl)',
				'responsive-2xl': 'var(--font-size-2xl)',
				'responsive-3xl': 'var(--font-size-3xl)',
				'responsive-4xl': 'var(--font-size-4xl)'
			},
			spacing: {
				'header': 'var(--header-height)',
				'sidebar': 'var(--sidebar-width)',
				'sidebar-collapsed': 'var(--sidebar-collapsed)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			minHeight: {
				'touch': '48px',
				'touch-lg': '56px',
			},
			minWidth: {
				'touch': '48px',
				'touch-lg': '56px',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				enter: 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				exit: 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
