import type { Config } from "tailwindcss";

/**
 * Farben referenzieren CSS-Variablen, die zur Laufzeit aus branding.json
 * (design_system) erzeugt werden — keine Farbwerte hier im Code. Light/Dark
 * schaltet über die Variablen (data-theme), nicht über feste Klassen.
 */
export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          "2": "var(--surface-2)",
          "3": "var(--surface-3)",
        },
        line: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        ink: {
          DEFAULT: "var(--text)",
          "2": "var(--text-2)",
          "3": "var(--text-3)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          "2": "var(--accent-2)",
          weak: "var(--accent-weak)",
          on: "var(--on-accent)",
        },
        ok: { DEFAULT: "var(--gruen)", weak: "var(--gruen-weak)" },
        warn: { DEFAULT: "var(--gelb)", weak: "var(--gelb-weak)" },
        bad: { DEFAULT: "var(--rot)", weak: "var(--rot-weak)" },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
      },
      maxWidth: {
        wrap: "1080px",
      },
    },
  },
  plugins: [],
} satisfies Config;
