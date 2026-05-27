/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        crux: {
          primary: "#4A7C59",
          "primary-dark": "#3A6347",
          "primary-light": "#6B9A78",
          earth: "#8B6914",
          "earth-light": "#B89339",
          beige: "#F7F5F0",
          "beige-dark": "#E8E4DA",
          stone: "#6B6B6B",
          danger: "#C44545",
          warn: "#D9A441",
          success: "#4A7C59",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(74, 124, 89, 0.08)",
        "soft-lg": "0 4px 16px rgba(74, 124, 89, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
