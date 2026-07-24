/**
 * bedarf.ts — Bedarfsklasse Tür C (Engine-Funktion 3).
 *
 * Ordnet die Antworten F1–F7 einer Bedarfsklasse N0–N5 zu. Die Regeln R01–R09
 * stehen in bedarf.json und werden strikt in Reihenfolge ausgewertet — die erste
 * zutreffende gewinnt (First-Match, G1). Der Code interpretiert die Regeln nur,
 * er kodiert keine Schwellen oder Klassen.
 *
 *   wenn      → alle genannten Bedingungen müssen zutreffen (UND)
 *   wenn_oder → eine der Bedingungen genügt (ODER)
 *   fallback  → greift, wenn keine Regel davor zutraf
 */

import type {
  BedarfBedingung,
  BedarfContent,
  BedarfFrageId,
  BedarfGrund,
  BedarfInput,
  BedarfKlasse,
  BedarfRegel,
  BedarfResult,
  BegruendungsZeile,
} from "./types.js";

/** Prüft eine einzelne Bedingungsgruppe: jede genannte Frage muss passen (UND). */
function bedingungTrifft(
  bedingung: BedarfBedingung,
  input: BedarfInput,
): boolean {
  for (const [frageId, erlaubteWerte] of Object.entries(bedingung)) {
    const antwort = input[frageId as BedarfFrageId];
    if (typeof antwort !== "string") return false;
    if (!erlaubteWerte!.includes(antwort)) return false;
  }
  return true;
}

/** Wertet aus, ob eine Regel für die Eingabe greift. */
function regelTrifft(regel: BedarfRegel, input: BedarfInput): boolean {
  if (regel.fallback === true) return true;
  if (regel.wenn) return bedingungTrifft(regel.wenn, input);
  if (regel.wenn_oder) {
    return regel.wenn_oder.some((b) => bedingungTrifft(b, input));
  }
  return false;
}

/** Baut die Begründungszeilen aus den tatsächlich geprüften Antworten. */
function begruendungFuerRegel(
  regel: BedarfRegel,
  input: BedarfInput,
): BegruendungsZeile[] {
  if (regel.fallback === true) {
    return [
      {
        regelId: regel.id,
        hinweis:
          regel.hinweis ??
          "Fallback — keine vorherige Regel traf zu.",
      },
    ];
  }

  const gruppen: BedarfBedingung[] = regel.wenn
    ? [regel.wenn]
    : (regel.wenn_oder ?? []);

  const zeilen: BegruendungsZeile[] = [];
  for (const gruppe of gruppen) {
    for (const [frageId, erlaubte] of Object.entries(gruppe)) {
      const antwort = input[frageId as BedarfFrageId];
      if (typeof antwort === "string" && erlaubte!.includes(antwort)) {
        zeilen.push({
          regelId: regel.id,
          eingabe: `${frageId} = ${antwort}`,
          hinweis: regel.grund ? `Grund: ${regel.grund}` : undefined,
        });
      }
    }
  }
  return zeilen;
}

/**
 * Klassifiziert den Bedarf aus den Prozessfragen F1–F7.
 *
 * @param input Antworten F1–F6 (Auswahl) und optional F7 (Monatsvolumen).
 * @param bedarf Inhalt aus bedarf.json.
 */
export function classifyBedarf(
  input: BedarfInput,
  bedarf: BedarfContent,
): BedarfResult {
  const { regeln, vorlaeufig_bei_weiss_nicht_in, zusatzbefunde } =
    bedarf.entscheidungsregeln;

  // First-Match: erste zutreffende Regel gewinnt.
  const treffer = regeln.find((r) => regelTrifft(r, input));
  if (!treffer) {
    throw new Error(
      "AWD-Bedarf: Keine Regel traf zu und es ist kein Fallback (fallback: true) definiert. " +
        "bedarf.json muss eine Fallback-Regel enthalten (G1).",
    );
  }

  const klasse = bedarf.klassen.find((k) => k.id === treffer.dann);
  if (!klasse) {
    throw new Error(
      `AWD-Bedarf: Regel ${treffer.id} verweist auf unbekannte Klasse ${treffer.dann}.`,
    );
  }

  const grund = (treffer.grund as BedarfGrund | undefined) ?? null;
  const grundText =
    grund && klasse.gruende ? (klasse.gruende[grund] ?? null) : null;

  // Vorläufig, wenn eine der markierten Fragen mit "weiss_nicht" beantwortet wurde.
  const vorlaeufig = vorlaeufig_bei_weiss_nicht_in.some(
    (frageId) => input[frageId] === "weiss_nicht",
  );

  // Zusatzbefunde: alle passenden werden gesammelt (additiv, keine Klassenänderung).
  const ausgeloesteBefunde = zusatzbefunde
    .filter((z) => bedingungTrifft(z.wenn, input))
    .map((z) => z.befund);

  return {
    klasse: klasse.id,
    name: klasse.name,
    kostenklasse: klasse.kostenklasse,
    grund,
    grundText,
    regelId: treffer.id,
    vorlaeufig,
    zusatzbefunde: ausgeloesteBefunde,
    begruendung: begruendungFuerRegel(treffer, input),
  };
}

/** Hilfszugriff für Tests/Berichte: eine Klasse per ID. */
export function findeKlasse(
  bedarf: BedarfContent,
  id: string,
): BedarfKlasse | undefined {
  return bedarf.klassen.find((k) => k.id === id);
}
