/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{ts,tsx}"], // Critical for Plasmo
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#13ecec",
        "background-light": "#f6f8f8",
        "background-dark": "#102222",
        "surface-dark": "#162a2a",
        "surface-highlight": "#1f3a3a"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      boxShadow: {
        "halo": "0 0 40px -10px rgba(19, 236, 236, 0.15)"
      }
    },
  },
  plugins: [],
}