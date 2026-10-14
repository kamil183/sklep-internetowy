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
        bg: "#f6f1e9", // cieply bez — tlo strony
        bg2: "#efe8dc", // ciemniejszy bez (hover)
        panel: "rgba(243, 234, 217, 0.85)", // bezowe, pprzezroczyste karty
        line: "rgba(74, 62, 48, 0.16)", // delikatna ciepla ramka na jasnym tle
        cream: "#2f2721", // tekst glowny — cieply ciemny braz
        creamdim: "#7b7062", // tekst drugorzedny — stonowany
        amber: "#a86f4c", // akcent — miedziano-rozowy (pasuje do zachodu)
        amberdim: "#8a5a3c",
        ink: "#2f2721",
        inksoft: "#3b322a",
        gold: "#a86f4c",
        gold300: "#c99272",
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
