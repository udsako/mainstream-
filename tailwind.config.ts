import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        court: {
          black: "#0A0A0A",
          panel: "#1A1A1A",
          line: "#2A2A2A",
        },
        mainstream: {
          orange: "#F15A24",
          hot: "#FF7A3D",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "court-lines":
          "radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(241,90,36,0.08) 61%, transparent 62%)",
      },
      keyframes: {
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        tickerScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "spin-slow": "spinSlow 40s linear infinite",
        ticker: "tickerScroll 25s linear infinite",
        flicker: "flicker 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
