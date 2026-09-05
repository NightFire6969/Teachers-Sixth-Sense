/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#161B2E",
          50: "#F3F4F7",
          100: "#E4E6EC",
          200: "#C3C7D6",
          300: "#9298B0",
          400: "#5C6280",
          500: "#363C5C",
          600: "#262B47",
          700: "#1D2138",
          800: "#161B2E",
          900: "#0E1120",
        },
        paper: {
          DEFAULT: "#F6F4EF",
          dim: "#EDEAE1",
        },
        signal: {
          high: "#B8402F",
          "high-soft": "#F4E1DC",
          medium: "#BD7C1E",
          "medium-soft": "#F3E7D2",
          low: "#3E7361",
          "low-soft": "#DEE9E3",
        },
        scan: {
          DEFAULT: "#3E7DA6",
          soft: "#DCE7EE",
        },
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(22, 27, 46, 0.06)",
      },
      borderRadius: {
        sm: "3px",
        md: "5px",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        sweep: "sweep 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
