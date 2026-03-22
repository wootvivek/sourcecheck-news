import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "bounce-slow": "bounceSlow 2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "sparkle-shine": "sparkleShine 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.8", filter: "brightness(1.4)" },
        },
        sparkleShine: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)", opacity: "1", filter: "drop-shadow(0 0 0px #a855f7)" },
          "25%": { transform: "scale(1.2) rotate(5deg)", opacity: "1", filter: "drop-shadow(0 0 6px #a855f7)" },
          "50%": { transform: "scale(1) rotate(-3deg)", opacity: "0.8", filter: "drop-shadow(0 0 10px #c084fc)" },
          "75%": { transform: "scale(1.15) rotate(3deg)", opacity: "1", filter: "drop-shadow(0 0 4px #a855f7)" },
        },
        wag: {
          "0%": { transform: "rotate(-8deg)" },
          "100%": { transform: "rotate(12deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
