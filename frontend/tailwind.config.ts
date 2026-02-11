import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f3f8f8",
          100: "#e8f1f0",
          200: "#c5dcdc",
          300: "#8bb9b6",
          400: "#519592",
          500: "#17726d",
          600: "#156762",
          700: "#115652",
          800: "#0e4441",
          900: "#092e2c",
        },
        secondary: {
          50: "#fefdfd",
          100: "#fdfbf7",
          200: "#fbf6ee",
          300: "#f7f1e9",
          400: "#f3ebd5",
          500: "#eae4d2",
          600: "#d3cdbd",
          700: "#b0ab9e",
          800: "#8c897e",
          900: "#5e5b54",
        },
      },
    },
  },
};
