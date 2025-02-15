import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				comic: ["var(--font-comic)", "Comic Neue", "cursive"],
				quicksand: ["var(--font-quicksand)", "Quicksand", "sans-serif"],
			},
			keyframes: {
				"pulse": {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: ".5" },
				},
				"scalePulse": {
					"0%, 100%": { transform: "scale(1)" },
					"50%": { transform: "scale(1.2)" },
				},
				"bounce-slow": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-5px)" },
				},
				"spin-slow": {
					from: { transform: "rotate(0deg)" },
					to: { transform: "rotate(360deg)" },
				},
				"shimmer": {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(100%)" },
				},
				"fadeIn": {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				"slideUp": {
					from: {
						opacity: "0",
						transform: "translateY(20px)",
					},
					to: {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				"slideDown": {
					from: {
						opacity: "0",
						transform: "translateY(-20px)",
					},
					to: {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				"shake": {
					"0%, 100%": { transform: "translateX(0)" },
					"25%": { transform: "translateX(-5px)" },
					"75%": { transform: "translateX(5px)" },
				},
			},
			animation: {
				"pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				"scalePulse": "scalePulse 1s ease-in-out infinite",
				"bounce-slow": "bounce-slow 2s infinite",
				"spin-slow": "spin-slow 8s linear infinite",
				"shimmer": "shimmer 2s infinite",
				"fadeIn": "fadeIn 0.5s ease-out",
				"slideUp": "slideUp 0.5s ease-out",
				"slideDown": "slideDown 0.5s ease-out",
				"shake": "shake 0.2s ease-in-out",
			},
			colors: {
				"primary": "#4DB2EC",
				"secondary": "#FFD800",
				"accent-pink": "#FF69B4",
			},
		},
	},
	plugins: [],
};

export default config;
