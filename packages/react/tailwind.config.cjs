/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "light-green": "#E0EEEA",
        // // green: "#53DDB4",
        // "dark-green": "#269B83",
        // cream: "#F9F4ED",
        paragraph: "#81929E",
        white: "#FFF",
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
          DEFAULT: "#1D50FA",
          50: "#D1DBFE",
          100: "#BDCCFE",
          200: "#95ADFD",
          300: "#6D8EFC",
          400: "#456FFB",
          500: "#1D50FA",
          600: "#0536DA",
          700: "#0428A3",
          800: "#021B6C",
          900: "#010D35"
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
        },
        black: {
          DEFAULT: "#131222",
          50: "#56529A",
          100: "#4F4A8D",
          200: "#403C72",
          300: "#312E57",
          400: "#22203D",
          500: "#131222",
          600: "#0A0A1D",
          700: "#0A0A1D",
          800: "#0A0A1D",
          900: "#0A0A1D"
        },
        "dark-blue": "#18182D"
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif"],
        serif: ["Space Grotesk", "ui-serif"],
        mono: ["Space Mono", "monospace"]
      },
      borderRadius: {
        none: "0",
        DEFAULT: "10px",
        full: "9999px"
      },
      boxShadow: {
        glow: "0 0 50px -12px #53DDB422"
        // glow: "0 0 100px -12px #456FFB55"
      }
    }
  },
  plugins: []
}
