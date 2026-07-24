/**
 * protokoll.ts — Prüfprotokoll (Engine-Funktion 8).
 *
 * Baut ein maschinenlesbares Protokoll-Objekt aus allen Teilergebnissen eines
 * Assessments: Eingaben, angewandte Regel-IDs, Ergebnisse und Standard-Version.
 * Reine Funktion (G1).
 *
 * Das Protokoll enthält bewusst KEINE Zeitstempel — sonst wäre G1 verletzt.
 * Zeitstempel und der SHA-256-Hash werden außerhalb der Engine hinzugefügt.
 * Die Schlüsselreihenfolge ist fest, damit das Objekt stabil (hash-fähig) ist.
 */

import type {
  BegruendungsZeile,
  Protokoll,
  ProtokollTeilergebnisse,
  StandardVersion,
} from "./types.js";

/** Feste Reihenfolge der Assessment-Teile im Protokoll. */
const TEIL_REIHENFOLGE = [
  "score",
  "bedarf",
  "pricing",
  "tco",
  "muster",
  "schnelltest",
] as const;

/** Sammelt alle in einem Ergebnis angewandten Regel-IDs aus der Begründungsspur. */
function regelIdsAus(result: unknown): string[] {
  const ids: string[] = [];
  const r = result as {
    regelId?: string;
    band?: string | null;
    begruendung?: BegruendungsZeile[];
  };
  if (typeof r?.regelId === "string") ids.push(r.regelId);
  if (typeof r?.band === "string") ids.push(r.band);
  if (Array.isArray(r?.begruendung)) {
    for (const zeile of r.begruendung) {
      if (zeile && typeof zeile.regelId === "string") ids.push(zeile.regelId);
    }
  }
  return ids;
}

/**
 * Baut das Prüfprotokoll.
 *
 * @param teile Teilergebnisse (jeweils Eingabe + Ergebnis) eines Assessments.
 * @param standardVersion Die gemeinsame Standard-Version des geladenen Contents.
 */
export function buildProtokoll(
  teile: ProtokollTeilergebnisse,
  standardVersion: StandardVersion,
): Protokoll {
  const eingaben: Record<string, unknown> = {};
  const ergebnisse: Record<string, unknown> = {};
  const regelIds = new Set<string>();

  for (const key of TEIL_REIHENFOLGE) {
    const teil = teile[key];
    if (!teil) continue;
    eingaben[key] = teil.input;
    ergebnisse[key] = teil.result;
    for (const id of regelIdsAus(teil.result)) regelIds.add(id);
  }

  return {
    standardVersion,
    regelIds: [...regelIds].sort((a, b) => a.localeCompare(b)),
    eingaben,
    ergebnisse,
  };
}
