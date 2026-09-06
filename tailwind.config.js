/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#F8F1E5",
          100: "#F1E4C8",
          200: "#EAD8A3",
          300: "#DEC275",
          400: "#D4AF37",
          500: "#C9A961",
          600: "#B08C3D",
          700: "#8C6E2E",
          800: "#6B5322",
          900: "#4A3A18",
        },
        ink: {
          DEFAULT: "#171411",
          soft: "#241F1A",
        },
        cream: "#F3EEE5",
        neutral: {
          50: "#EEE8DE",
          100: "#E5DED3",
          200: "#D5CCC0",
          300: "#B8ADA0",
          400: "#8E8377",
          500: "#6E645A",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      boxShadow: {
        gold: "0 4px 24px 0 rgba(201, 169, 97, 0.25)",
      },
    },
  },
  plugins: [],
};
