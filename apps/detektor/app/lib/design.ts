import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Erzeugt die Theme-CSS-Variablen aus branding.json (design_system) zur
 * Laufzeit — damit stehen keine Farbwerte im Code, und Änderungen an der
 * Marken-Datei greifen ohne Code-Änderung.
 */

interface DesignSystem {
  schrift: { sans: string; mono: string };
  radius: Record<string, string>;
  themes: { light: Record<string, string>; dark: Record<string, string> };
  ampel: { light: Record<string, string>; dark: Record<string, string> };
}

function designSystem(): DesignSystem {
  const raw = readFileSync(
    join(process.cwd(), "content", "branding.json"),
    "utf-8",
  );
  return JSON.parse(raw).default.design_system as DesignSystem;
}

function toVars(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([key, val]) => `--${key.replace(/_/g, "-")}:${val};`)
    .join("");
}

/** Baut den <style>-Inhalt für Light/Dark inkl. data-theme-Overrides. */
export function themeStyle(): string {
  const d = designSystem();
  const base =
    `--font-sans:${d.schrift.sans};--font-mono:${d.schrift.mono};` +
    Object.entries(d.radius)
      .map(([k, v]) => `--radius-${k}:${v};`)
      .join("");
  const light = toVars({ ...d.themes.light, ...d.ampel.light });
  const dark = toVars({ ...d.themes.dark, ...d.ampel.dark });

  return [
    `:root{${base}${light}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}}}`,
    `:root[data-theme="dark"]{${dark}}`,
    `:root[data-theme="light"]{${light}}`,
  ].join("");
}
