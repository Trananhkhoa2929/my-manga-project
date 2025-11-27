import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#121212",
          surface1: "#1E1E1E",
          surface2: "#2D2D2D",
        },
        accent: {
          brand: "#00DC64",
          utility: "#FF9800",
          hot: "#EF4444",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#B0B3B8",
          muted: "#6B7280",
        },
        border: {
          DEFAULT: "#3E4042",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;