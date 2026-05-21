import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', ...defaultTheme.fontFamily.sans],
			},
			colors: {
				// Primary gradient
				primary: {
					50: '#fef5f0',
					100: '#fde8df',
					200: '#fbd5c5',
					300: '#f9b8a0',
					400: '#ff8a4c',
					500: '#ff6b1a',
					600: '#e55c10',
					700: '#c74910',
					800: '#a43811',
					900: '#852e10',
				},
				// Neutral palette for clean design
				slate: {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#6b7280',
					600: '#4b5563',
					700: '#374151',
					800: '#1f2937',
					900: '#111827',
				},
				// Semantic colors
				success: '#10b981',
				warning: '#f59e0b',
				error: '#ef4444',
				info: '#3b82f6',
			},
			animation: {
				'fade-in': 'fadeIn 0.3s ease-out',
				'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-down': 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-light': 'bounceLight 2s ease-in-out infinite',
				'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'shimmer': 'shimmer 2s infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				slideDown: {
					'0%': { opacity: '0', transform: 'translateY(-8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				scaleIn: {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				bounceLight: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' },
				},
				pulseSoft: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-400px 0' },
					'100%': { backgroundPosition: '400px 0' },
				},
			},
			boxShadow: {
				// Soft shadows for modern look
				'sm-soft': '0 1px 2px rgba(0, 0, 0, 0.04)',
				'soft': '0 4px 12px rgba(0, 0, 0, 0.08)',
				'md-soft': '0 8px 16px rgba(0, 0, 0, 0.1)',
				'lg-soft': '0 12px 32px rgba(0, 0, 0, 0.12)',
				'xl-soft': '0 16px 48px rgba(0, 0, 0, 0.15)',
				// Elevated shadows for cards
				'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)',
				'elevation-2': '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
				'elevation-3': '0 8px 24px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04)',
				// Neumorphic effect
				'neu': '8px 8px 16px rgba(0, 0, 0, 0.06), -8px -8px 16px rgba(255, 255, 255, 0.8)',
				'neu-md': '12px 12px 24px rgba(0, 0, 0, 0.08), -12px -12px 24px rgba(255, 255, 255, 0.85)',
				'neu-lg': '16px 16px 32px rgba(0, 0, 0, 0.1), -16px -16px 32px rgba(255, 255, 255, 0.9)',
			},
			transitionTimingFunction: {
				smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
				'ease-in-out-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			},
			backdropBlur: {
				'glass': '12px',
				'glass-lg': '20px',
			},
		},
	},
	plugins: [],
};

export default config;
