/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:     "#3b82f6",
        secondary:   "#10b981",
        background:  "#060b14",
        surface:     "#0d1a2d",
        "surface-2": "#0f2235",
        "surface-3": "#162840",
        text:        "#e2e8f0",
        "neon-blue":   "#00d4ff",
        "neon-green":  "#39ff14",
        "neon-purple": "#bf5fff",
        "neon-amber":  "#f59e0b",
        "neon-red":    "#ff3366",
        "neon-cyan":   "#00ffea",
        "neon-lime":   "#b4ff00",
        "neon-orange": "#ff6b2b",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      boxShadow: {
        "glow-blue":   "0 0 12px 2px rgba(0,212,255,0.5), 0 0 30px 6px rgba(0,212,255,0.15)",
        "glow-green":  "0 0 12px 2px rgba(57,255,20,0.5), 0 0 30px 6px rgba(57,255,20,0.15)",
        "glow-purple": "0 0 12px 2px rgba(191,95,255,0.5), 0 0 30px 6px rgba(191,95,255,0.15)",
        "glow-amber":  "0 0 12px 2px rgba(245,158,11,0.5), 0 0 30px 6px rgba(245,158,11,0.15)",
        "glow-red":    "0 0 12px 2px rgba(255,51,102,0.5), 0 0 30px 6px rgba(255,51,102,0.15)",
        "inner-dark":  "inset 0 2px 20px rgba(0,0,0,0.6)",
      },
      animation: {
        "pulse-glow":    "pulseGlow 2s ease-in-out infinite",
        "float":         "float 4s ease-in-out infinite",
        "slide-up":      "slideUp 0.4s ease-out",
        "slide-in-right":"slideInRight 0.3s ease-out",
        "xp-pop":        "xpPop 1.2s ease-out forwards",
        "neon-flicker":  "neonFlicker 3s linear infinite",
        "spin-slow":     "spin 8s linear infinite",
        "shimmer":       "shimmer 2s linear infinite",
        "scale-in":      "scaleIn 0.25s ease-out",
        "fade-in":       "fadeIn 0.3s ease-out",
        "bounce-in":     "bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        "confetti":      "confetti 1s ease-out forwards",
        "bar-fill":      "barFill 0.8s ease-out forwards",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        xpPop: {
          "0%":   { opacity: "1", transform: "translateY(0) scale(1)" },
          "60%":  { opacity: "1", transform: "translateY(-30px) scale(1.2)" },
          "100%": { opacity: "0", transform: "translateY(-60px) scale(0.8)" },
        },
        neonFlicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.6" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.7)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        bounceIn: {
          "0%":   { transform: "scale(0.3)", opacity: "0" },
          "50%":  { transform: "scale(1.05)", opacity: "1" },
          "70%":  { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        confetti: {
          "0%":   { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100px) rotate(720deg)", opacity: "0" },
        },
        barFill: {
          from: { width: "0%" },
        },
      },
    },
  },
  plugins: [],
}
