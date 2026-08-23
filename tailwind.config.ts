import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#06070a",
          900: "#0a0c10",
          850: "#0d1015",
          800: "#12151b",
          700: "#191d25",
          600: "#242833",
        },
        fg: {
          DEFAULT: "#f4f3ef",
          muted: "#a6acb8",
          subtle: "#6b7280",
        },
        gold: {
          DEFAULT: "#d9a55c",
          soft: "#ecc98c",
          dim: "#8a6b3e",
        },
        signal: {
          DEFAULT: "#5fe3c6",
          dim: "#2e7566",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "Tahoma", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(217,165,92,0.15), 0 8px 40px -8px rgba(217,165,92,0.25)",
        panel: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 24px 60px -24px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(217,165,92,0.08), transparent 70%)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "dash-flow": {
          to: { strokeDashoffset: "-200" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        "dash-flow": "dash-flow 6s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
