import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "pastel-pink": "#FBEAEC",
        "pastel-beige": "#F6E7D8",
        "pastel-lavender": "#D8C4E8",
        "pastel-mint": "#DCEFE7",
        "gold-accent": "#E7C873",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Poppins", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in-out",
        "slide-up": "slideUp 1s ease-out",
        "petal-fall": "petalFall 15s linear infinite",
        "petal-fall-slow": "petalFall 20s linear infinite",
        "flame-flicker": "flameFlicker 0.5s ease-in-out infinite alternate",
        "confetti-fall": "confettiFall 8s linear infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        "heart-fly": "heartFly 1.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        petalFall: {
          "0%": { transform: "translateY(-100vh) rotate(0deg)", opacity: "0.7" },
          "100%": { transform: "translateY(100vh) rotate(360deg)", opacity: "0" },
        },
        flameFlicker: {
          "0%": { transform: "scaleY(1) scaleX(1)", opacity: "0.9" },
          "100%": { transform: "scaleY(1.1) scaleX(0.95)", opacity: "1" },
        },
        confettiFall: {
          "0%": { transform: "translateY(-100vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        heartFly: {
          "0%": { opacity: "1", transform: "translateY(0) rotate(0deg)" },
          "100%": { opacity: "0", transform: "translateY(-150px) rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

