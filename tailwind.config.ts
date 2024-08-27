import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
    },
  },
  safelist: [
    {
      pattern:
        /bg-(gray|red|yellow|green|blue|indigo|purple|pink)-(50|100|400|700|600\/10|400\/20)/,
      variants: ["dark", "flat"],
    },
    {
      pattern: /text-(gray|red|yellow|green|blue|indigo|purple|pink)-(400|700)/,
      variants: ["dark", "flat"],
    },
    {
      pattern:
        /ring-(gray|red|yellow|green|blue|indigo|purple|pink)-(600\/10|400\/20)/,
      variants: ["dark", "flat"],
    },
  ],
  plugins: [require("@tailwindcss/forms")],
} satisfies Config;
