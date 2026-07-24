/**
 * Test-Hilfen: Golden-Fälle als JSON laden (ohne Codeänderung erweiterbar).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Laedt eine Golden-JSON-Datei aus __tests__/golden/. */
export function loadGolden<T>(datei: string): T {
  const pfad = join(HERE, "golden", datei);
  return JSON.parse(readFileSync(pfad, "utf-8")) as T;
}
