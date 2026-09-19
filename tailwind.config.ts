import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#12100D",
        bg2: "#1B1815",
        panel: "#201C17",
        line: "#332D24",
        cream: "#EFE7D8",
        creamdim: "#B8AD98",
        amber: "#C1893F",
        amberdim: "#8A6330",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-work-sans)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
