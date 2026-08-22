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
          50: "#FBF7EE",
          100: "#F5EBD1",
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
          DEFAULT: "#0A0A0A",
          soft: "#1A1A1A",
        },
        cream: "#FAF7F2",
        neutral: {
          50: "#FAFAFA",
          100: "#F4F4F4",
          200: "#E3E6E8",
          300: "#C7CCD1",
          400: "#9099A2",
          500: "#74808B",
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
