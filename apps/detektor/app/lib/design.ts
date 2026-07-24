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

/**
 * Erlaubt nur unverfängliche CSS-Werte (Farben, Längen, Font-Stacks). Verhindert
 * einen Ausbruch aus der Deklaration bzw. eine CSS-Injektion, falls branding.json
 * später über Directus gepflegt und dabei manipuliert würde (Defense-in-Depth).
 * Zeichen wie ; { } < > @ \ sind nicht zugelassen; url()/expression() ebenfalls
 * nicht. Ein unsicherer Wert wird verworfen (CSS fällt auf die Vorgabe zurück).
 */
const SICHERER_CSS_WERT = /^[A-Za-z0-9#%.,()'"\s-]+$/;
function istSichererWert(val: string): boolean {
  if (typeof val !== "string" || !SICHERER_CSS_WERT.test(val)) return false;
  const low = val.toLowerCase();
  return !low.includes("url") && !low.includes("expression");
}

function toVars(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .filter(([, val]) => istSichererWert(val))
    .map(([key, val]) => `--${key.replace(/_/g, "-")}:${val};`)
    .join("");
}

/** Baut den <style>-Inhalt für Light/Dark inkl. data-theme-Overrides. */
export function themeStyle(): string {
  const d = designSystem();
  const schrift = toVars({ "font-sans": d.schrift.sans, "font-mono": d.schrift.mono });
  const radius = Object.entries(d.radius)
    .filter(([, v]) => istSichererWert(v))
    .map(([k, v]) => `--radius-${k.replace(/_/g, "-")}:${v};`)
    .join("");
  const base = schrift + radius;
  const light = toVars({ ...d.themes.light, ...d.ampel.light });
  const dark = toVars({ ...d.themes.dark, ...d.ampel.dark });

  return [
    `:root{${base}${light}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}}}`,
    `:root[data-theme="dark"]{${dark}}`,
    `:root[data-theme="light"]{${light}}`,
  ].join("");
}
