import "server-only";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { loadContent } from "@engine/content-loader";
import type { Content } from "@engine/types";

/**
 * Lädt den geprüften Content zur Laufzeit vom Server (fs). Einziger
 * I/O-Grenzfall; die Bewertungsfunktionen bleiben rein.
 *
 * Damit die JSONs weiter ohne Deployment (später via Directus) editierbar
 * bleiben, wird nicht dauerhaft gecacht, sondern gegen die Änderungszeiten der
 * Dateien geprüft: ändert sich eine Datei, wird neu geladen — sonst kommt das
 * bereits geparste Ergebnis zurück (kein erneutes Lesen/Parsen je Request).
 */
let cache: { signatur: string; content: Content } | null = null;

/** Kompakte Signatur über Dateiliste + Änderungszeit + Größe (Wurzel + minis/). */
function signatur(dir: string): string {
  const teile: string[] = [];
  const sammle = (verzeichnis: string, prefix: string) => {
    let eintraege: string[];
    try {
      eintraege = readdirSync(verzeichnis)
        .filter((n) => n.endsWith(".json"))
        .sort();
    } catch {
      return; // Verzeichnis fehlt (z. B. minis/) — nichts beizutragen.
    }
    for (const name of eintraege) {
      const s = statSync(join(verzeichnis, name));
      teile.push(`${prefix}${name}:${s.mtimeMs}:${s.size}`);
    }
  };
  sammle(dir, "");
  sammle(join(dir, "minis"), "minis/");
  return teile.join("|");
}

export function getContent(): Content {
  const dir = join(process.cwd(), "content");
  const sig = signatur(dir);
  if (cache && cache.signatur === sig) return cache.content;
  const content = loadContent(dir);
  cache = { signatur: sig, content };
  return content;
}
