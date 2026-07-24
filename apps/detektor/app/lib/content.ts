import "server-only";
import { join } from "node:path";

import { loadContent } from "@engine/content-loader";
import type { Content } from "@engine/types";

/**
 * Lädt den geprüften Content zur Laufzeit vom Server (fs). Einziger
 * I/O-Grenzfall; die Bewertungsfunktionen bleiben rein.
 */
export function getContent(): Content {
  return loadContent(join(process.cwd(), "content"));
}
