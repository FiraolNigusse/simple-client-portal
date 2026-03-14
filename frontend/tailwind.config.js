/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5B5FF6",
        accent: "#22D3EE",
        secondary: "#E879F9",
        background: "#0F1021",
        surface: "#1A1C36",
        sidebar: "#14162B",
        "portal-text": "#E6E8F2",
        "portal-muted": "#9AA3B2",
        "portal-success": "#34D399",
        "portal-error": "#F87171",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "ui-sans-serif", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

