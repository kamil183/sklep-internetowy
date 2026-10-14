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
        bg: "#f7f4ee", // beżany tło
        bg2: "#efe9e0", // jasny beż
        panel: "rgba(244, 241, 238, 0.72)",
        line: "rgba(247, 244, 238, 0.16)",
        cream: "#f7f4ee",
        creamdim: "#a9a192",
        amber: "#c0a063", // złoto LAVIÉRA
        amberdim: "#8a7349",
        ink: "#1f1b16",
        inksoft: "#2a2621",
        gold: "#c0a063",
        gold300: "#caa073",
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
