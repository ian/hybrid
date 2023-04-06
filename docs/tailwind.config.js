/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./layouts/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./examples/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
		extend: {
			colors: {
				transparent: "transparent",
				white: "#FFF",
				black: "#06050A",
				gray: {
					DEFAULT: "#81929E",
					50: "#E9ECEE",
					100: "#DDE2E5",
					200: "#C6CED3",
					300: "#AFBAC1",
					400: "#98A6B0",
					500: "#81929E",
					600: "#647682",
					700: "#4C5963",
					800: "#343D43",
					900: "#1B2023"
				},
				blue: {
					DEFAULT: "#1590FF",
					50: "#CDE7FF",
					100: "#B8DDFF",
					200: "#8FCAFF",
					300: "#67B7FF",
					400: "#3EA3FF",
					500: "#1590FF",
					600: "#0074DC",
					700: "#0056A4",
					800: "#00396C",
					900: "#001B34"
				},
				green: {
					DEFAULT: "#53DDB4",
					50: "#ECFBF7",
					100: "#DBF8EF",
					200: "#B9F1E1",
					300: "#97EAD2",
					400: "#75E4C3",
					500: "#53DDB4",
					600: "#29CF9E",
					700: "#20A07A",
					800: "#167156",
					900: "#0D4233"
				},
				purple: {
					DEFAULT: "#8348E6",
					50: "#F0EAFC",
					100: "#E4D8FA",
					200: "#CCB4F5",
					300: "#B490F0",
					400: "#9B6CEB",
					500: "#8348E6",
					600: "#631ED8",
					700: "#4D17A7",
					800: "#361076",
					900: "#1F0944"
				},
				yellow: {
					DEFAULT: "#FEBC09",
					50: "#FFEEC0",
					100: "#FFE8AC",
					200: "#FEDD83",
					300: "#FED25A",
					400: "#FEC732",
					500: "#FEBC09",
					600: "#CE9701",
					700: "#966E01",
					800: "#5E4500",
					900: "#261C00"
				},
				cream: {
					DEFAULT: "#FFFAF2",
					50: "#FFFFFF",
					100: "#FFFFFF",
					200: "#FFFFFF",
					300: "#FFFFFF",
					400: "#FFFFFF",
					500: "#FFFAF2",
					600: "#FFE4BA",
					700: "#FFCF82",
					800: "#FFB94A",
					900: "#FFA412"
				},
				red: {
					DEFAULT: "#F02146",
					50: "#FCD3DA",
					100: "#FAB5C1",
					200: "#F890A3",
					300: "#F56B84",
					400: "#F34665",
					500: "#F02146",
					600: "#C81C3A",
					700: "#A0162F",
					800: "#781123",
					900: "#500B17"
				}
			}
		},
		fontFamily: {
			sans: ["Work Sans", "sans-serif"],
			serif: ["Space Mono", "serif"],
			mono: ["Fira Code", "monospace"]
		},
		fontSize: {
			xs: "0.7rem",
			sm: "0.8rem",
			base: "1.05rem",
			lg: "1.15rem",
			xl: "1.25rem",
			"2xl": "1.563rem",
			"3xl": "1.953rem",
			"4xl": "2.441rem",
			"5xl": "3.052rem"
		},
		letterSpacing: {
			tight: "-.05em",
			normal: "-.025em",
			wide: "0.0em"
		}
	},
	plugins: []
}
