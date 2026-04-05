/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "primary-glow": "var(--primary-glow)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        background: "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        surface: "var(--card-bg)",
        "portal-text": "var(--text-primary)",
        "portal-muted": "var(--text-secondary)",
        "portal-success": "var(--success)",
        "portal-error": "var(--danger)",
        "portal-warning": "var(--warning)",
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

