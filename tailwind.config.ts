import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./design-system/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sb: {
          bg: "#030712",
          surface: "#081228",
          purple: "#5B4CF7",
          glow: "#7B61FF",
          success: "#22E584",
          gold: "#F6C453",
          muted: "#94A3B8",
          secondary: "#D4D7E5",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "sb-glow": "0 4px 32px rgba(91, 76, 247, 0.35)",
        "sb-glow-lg": "0 8px 48px rgba(91, 76, 247, 0.4)",
        "sb-card": "0 4px 24px rgba(0, 0, 0, 0.35)",
        "sb-card-hover": "0 12px 40px rgba(91, 76, 247, 0.15)",
      },
      backgroundImage: {
        "sb-gradient-purple":
          "linear-gradient(135deg, #5B4CF7 0%, #7B61FF 100%)",
        "sb-gradient-card":
          "linear-gradient(180deg, rgba(8, 18, 40, 0.95) 0%, rgba(3, 7, 18, 0.98) 100%)",
        "sb-gradient-hero":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91, 76, 247, 0.35), transparent 60%)",
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
