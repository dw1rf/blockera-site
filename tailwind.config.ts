import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B5CF6",
          foreground: "#0F1026"
        },
        accent: "#14F195",
        midnight: "#0B0D1A",
        "midnight-light": "#10142A"
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      backgroundImage: {
        "grid-glow": "radial-gradient(circle at center, rgba(76, 29, 149, 0.5), rgba(12, 10, 24, 0.9))"
      },
      boxShadow: {
        neon: "0 0 30px rgba(139, 92, 246, 0.6)",
        card: "0 20px 50px rgba(15, 16, 38, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
