/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F6F1E7",
          card: "#FFFDF9",
          line: "#E4DBC8",
        },
        ink: {
          DEFAULT: "#1B2A41",
          soft: "#3C4A5E",
          faint: "#7C8797",
        },
        brand: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#60a5fa",
        },
        brass: {
          DEFAULT: "#B08D57",
          dark: "#8A6B3D",
          light: "#E4C98F",
        },
        ledger: {
          green: "#2F6F4E",
          greenSoft: "#E4EEE7",
          rust: "#8C3331",
          rustSoft: "#F3E4E1",
          amber: "#C08A28",
          amberSoft: "#F6EBD4",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,42,65,0.06), 0 8px 24px -12px rgba(27,42,65,0.12)",
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, #E4DBC8 28px)",
      },
    },
  },
  plugins: [],
};
