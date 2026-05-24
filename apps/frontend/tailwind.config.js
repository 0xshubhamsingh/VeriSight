/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 520ms ease-out both",
      },
      colors: {
        matrix: {
          ink: "#020617",
          panel: "#07111f",
          mint: "#34d399",
          glow: "#10b981",
        },
      },
    },
  },
  plugins: [],
};
