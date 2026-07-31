/**
 * content-loader.ts — Laden und Versionspruefung (Engine-Funktion 1).
 *
 * Dies ist die einzige Stelle der Engine mit Seiteneffekten (Dateizugriff).
 * Alle Bewertungsfunktionen sind rein und erhalten den geladenen Content als
 * Argument (G1). Der Content wird zur Laufzeit gelesen, damit die JSONs spaeter
 * ohne Deployment ueber Directus gepflegt werden koennen (CLAUDE.md §4.3).
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  AchsenContent,
  BedarfContent,
  BerichtstexteContent,
  Content,
  MusterContent,
  NutzenContent,
  PreislogikContent,
  RawContentFile,
  SchnelltestContent,
  StandardVersion,
  TcoContent,
} from "./types.js";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Vorgabe-Pfad: apps/detektor/content (relativ zu src/engine/). */
export const DEFAULT_CONTENT_DIR = resolve(HERE, "..", "..", "content");

/** Ein geladener Rohdatensatz mit seinem Basisnamen. */
interface GeladeneDatei {
  name: string;
  data: RawContentFile;
}

/**
 * Prueft, dass jede Datei einen meta.standard_version traegt und alle
 * identisch sind. Reine Funktion; wirft bei Abweichung eine klare deutsche
 * Fehlermeldung, die die betroffenen Dateien benennt (Übergabe §2.2 / DoD).
 */
export function assertSameStandardVersion(
  dateien: GeladeneDatei[],
): StandardVersion {
  if (dateien.length === 0) {
    throw new Error(
      "AWD-Content: Es wurden keine Content-Dateien gefunden. Prüfen Sie den Content-Pfad.",
    );
  }

  const ohneVersion = dateien.filter(
    (d) =>
      d.data?.meta?.standard_version === undefined ||
      d.data.meta.standard_version === null,
  );
  if (ohneVersion.length > 0) {
    const namen = ohneVersion.map((d) => d.name).join(", ");
    throw new Error(
      `AWD-Content: Folgende Dateien tragen keine meta.standard_version: ${namen}. ` +
        "Jede Content-Datei muss eine Standard-Version angeben (G4).",
    );
  }

  // Die Version der ersten Datei ist die Referenz.
  const referenz = dateien[0]!;
  const erwartet = referenz.data.meta.standard_version;
  const abweichend = dateien.filter(
    (d) => d.data.meta.standard_version !== erwartet,
  );

  if (abweichend.length > 0) {
    const details = abweichend
      .map((d) => `${d.name} = "${d.data.meta.standard_version}"`)
      .join(", ");
    throw new Error(
      `AWD-Content: Uneinheitliche Standard-Version. Erwartet "${erwartet}" ` +
        `(aus ${referenz.name}), abweichend: ${details}. ` +
        "Alle Content-Dateien müssen dieselbe Standard-Version tragen (G4).",
    );
  }

  return erwartet;
}

/** Liest alle *.json aus einem Verzeichnis (nicht rekursiv). */
function leseJsonVerzeichnis(dir: string, prefix = ""): GeladeneDatei[] {
  const eintraege = readdirSync(dir, { withFileTypes: true });
  const dateien: GeladeneDatei[] = [];
  for (const eintrag of eintraege) {
    if (eintrag.isFile() && eintrag.name.endsWith(".json")) {
      const pfad = join(dir, eintrag.name);
      const roh = readFileSync(pfad, "utf-8");
      let data: RawContentFile;
      try {
        data = JSON.parse(roh) as RawContentFile;
      } catch (fehler) {
        const grund = fehler instanceof Error ? fehler.message : String(fehler);
        throw new Error(
          `AWD-Content: Datei ${prefix}${eintrag.name} ist kein gültiges JSON: ${grund}`,
        );
      }
      dateien.push({ name: `${prefix}${eintrag.name}`, data });
    }
  }
  // Deterministische Reihenfolge (unabhaengig vom Dateisystem).
  dateien.sort((a, b) => a.name.localeCompare(b.name));
  return dateien;
}

/** Sucht eine geladene Datei nach Basisname oder wirft eine klare Fehlermeldung. */
function pflicht<T extends RawContentFile>(
  index: Record<string, RawContentFile>,
  name: string,
): T {
  const treffer = index[name];
  if (!treffer) {
    throw new Error(
      `AWD-Content: Pflichtdatei ${name} fehlt im Content-Verzeichnis.`,
    );
  }
  return treffer as T;
}

/**
 * Laedt alle Content-JSONs (Wurzel + minis/), prueft die Standard-Version und
 * gibt ein typisiertes Content-Objekt zurueck. Bei Abweichung: Abbruch.
 *
 * @param contentDir Optionaler Pfad zum Content-Verzeichnis (Vorgabe: DEFAULT_CONTENT_DIR).
 */
export function loadContent(contentDir: string = DEFAULT_CONTENT_DIR): Content {
  const wurzel = leseJsonVerzeichnis(contentDir);

  let minis: GeladeneDatei[] = [];
  try {
    minis = leseJsonVerzeichnis(join(contentDir, "minis"), "minis/");
  } catch (fehler) {
    // Der minis-Ordner ist optional: NUR ein fehlendes Verzeichnis (ENOENT)
    // wird verschluckt. Andere Fehler (Rechte, defektes JSON) müssen sichtbar
    // bleiben und dürfen nicht stillschweigend zu leerem Content führen.
    const code = (fehler as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw fehler;
    minis = [];
  }

  const alle = [...wurzel, ...minis];
  const standardVersion = assertSameStandardVersion(alle);

  const index: Record<string, RawContentFile> = {};
  for (const d of alle) {
    index[d.name] = d.data;
  }

  return {
    standardVersion,
    achsen: pflicht<AchsenContent>(index, "achsen.json"),
    bedarf: pflicht<BedarfContent>(index, "bedarf.json"),
    preislogik: pflicht<PreislogikContent>(index, "preislogik.json"),
    tco: pflicht<TcoContent>(index, "tco-faktoren.json"),
    schnelltest: pflicht<SchnelltestContent>(index, "schnelltest.json"),
    muster: pflicht<MusterContent>(index, "muster.json"),
    berichtstexte: pflicht<BerichtstexteContent>(index, "berichtstexte.json"),
    nutzen: pflicht<NutzenContent>(index, "nutzen.json"),
    raw: index,
  };
}
