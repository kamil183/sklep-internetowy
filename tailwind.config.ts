import type { Config } from "tailwindcss";

/**
 * MOTYW ZODARA PARFUMS / LAVIÉRA
 * Czerń, złamana biel, subtelne złoto.
 * Stare nazwy tokenów (bg, panel, amber...) zachowane dla kompatybilności —
 * mapują się na nową paletę, dzięki czemu cały projekt (w tym panel admina)
 * dostaje nowy wygląd bez zmian w komponentach.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0c", // ink
        bg2: "#131316", // ink-soft
        panel: "rgba(19, 19, 22, 0.72)",
        line: "rgba(244, 241, 234, 0.14)",
        cream: "#f4f1ea",
        creamdim: "#a6a199",
        amber: "#c9a96a", // dawne złoto sklepu → złoto LAVIÉRA
        amberdim: "#8a7349",
        ink: "#0b0b0c",
        inksoft: "#131316",
        gold: "#c9a96a",
        gold300: "#d8bd85",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0px",
      },
    },
  },
  plugins: [],
};
export default config;
