/**
 * bedarf.ts — Bedarfsklasse Tür C (Engine-Funktion 3).
 *
 * Ordnet die Antworten F1–F7 einer Bedarfsklasse N0–N5 zu. Die Regeln R01–R09
 * stehen in bedarf.json und werden interpretiert, nicht kodiert (G1).
 *
 * Auswertungslogik (Audit-Entscheidungen 2026-07-24):
 * - N1–N5: First-Match — die erste zutreffende Nicht-N0-Regel gewinnt.
 * - N0 (Stopp): ALLE zugleich zutreffenden Stopp-Gründe werden gesammelt und
 *   ausgewiesen (B2) — kein Grund wird von einem anderen maskiert.
 * - „Weiß nicht" auf einer klassenbestimmenden Frage (F2/F3/F4) erzeugt statt
 *   einer festen Höherklassifizierung eine Klassen-Spanne (B3, G5).
 * - Datengetriebene Widerspruchs-Hinweise (B4) werden additiv ausgewiesen.
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
  BedarfGrundDetail,
  BedarfInput,
  BedarfKlasse,
  BedarfRegel,
  BedarfResult,
  BedarfSpanne,
  BegruendungsZeile,
} from "./types.js";

interface BedarfFrageRaw {
  id: string;
  kurz?: string;
  frage?: string;
  optionen?: { wert: string; text?: string }[];
}

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

/**
 * Kern-Zuordnung: sammelt alle zutreffenden N0-Regeln; greift eine, ist das
 * Ergebnis N0 (mit allen Gründen). Sonst First-Match über die Nicht-N0-Regeln.
 */
function matchKlasse(
  regeln: BedarfRegel[],
  input: BedarfInput,
): { klasseId: string; regelId: string; n0Regeln: BedarfRegel[] } {
  const n0Regeln = regeln.filter(
    (r) => r.dann === "N0" && regelTrifft(r, input),
  );
  if (n0Regeln.length > 0) {
    return { klasseId: "N0", regelId: n0Regeln[0]!.id, n0Regeln };
  }
  const treffer = regeln.find((r) => r.dann !== "N0" && regelTrifft(r, input));
  if (!treffer) {
    throw new Error(
      "AWD-Bedarf: Keine Regel traf zu und es ist kein Fallback (fallback: true) definiert. " +
        "bedarf.json muss eine Fallback-Regel enthalten (G1).",
    );
  }
  return { klasseId: treffer.dann, regelId: treffer.id, n0Regeln: [] };
}

/** Kartesisches Produkt der möglichen Werte je unbekanntem Feld. */
function kombinationen(listen: string[][]): string[][] {
  return listen.reduce<string[][]>(
    (acc, liste) => acc.flatMap((prefix) => liste.map((w) => [...prefix, w])),
    [[]],
  );
}

/**
 * Löst die bestätigte Antwort in ihren Wortlaut auf (G2): statt „F4 = nein"
 * die Frage-Kurzbezeichnung und den Optionstext aus bedarf.json.
 */
function wortlaut(
  frageId: string,
  antwort: string,
  fragen: BedarfFrageRaw[],
): string {
  const frage = fragen.find((q) => q.id === frageId);
  const text = frage?.optionen?.find((o) => o.wert === antwort)?.text ?? antwort;
  return frage?.kurz ? `${frage.kurz}: ${text}` : text;
}

function begruendungFuerRegel(
  regel: BedarfRegel,
  input: BedarfInput,
  fragen: BedarfFrageRaw[],
): BegruendungsZeile[] {
  if (regel.fallback === true) {
    return [
      {
        regelId: regel.id,
        hinweis: regel.hinweis ?? "Fallback — keine vorherige Regel traf zu.",
      },
    ];
  }
  const gruppen: BedarfBedingung[] = regel.wenn
    ? [regel.wenn]
    : (regel.wenn_oder ?? []);
  const zeilen: BegruendungsZeile[] = [];
  const gesehen = new Set<string>();
  for (const gruppe of gruppen) {
    for (const [frageId, erlaubte] of Object.entries(gruppe)) {
      const antwort = input[frageId as BedarfFrageId];
      if (
        typeof antwort === "string" &&
        erlaubte!.includes(antwort) &&
        !gesehen.has(frageId)
      ) {
        gesehen.add(frageId);
        zeilen.push({
          regelId: regel.id,
          eingabe: wortlaut(frageId, antwort, fragen),
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
  const { regeln, vorlaeufig_bei_weiss_nicht_in, zusatzbefunde, widersprueche } =
    bedarf.entscheidungsregeln;
  const fragen = bedarf.fragen as unknown as BedarfFrageRaw[];

  const match = matchKlasse(regeln, input);
  const klasse = bedarf.klassen.find((k) => k.id === match.klasseId);
  if (!klasse) {
    throw new Error(
      `AWD-Bedarf: Regel ${match.regelId} verweist auf unbekannte Klasse ${match.klasseId}.`,
    );
  }

  // N0: alle zugleich zutreffenden Stopp-Gründe (B2).
  const gruende: BedarfGrundDetail[] = [];
  if (klasse.id === "N0" && klasse.gruende) {
    const gesehen = new Set<string>();
    for (const regel of match.n0Regeln) {
      const grund = regel.grund as BedarfGrund | undefined;
      if (grund && !gesehen.has(grund) && klasse.gruende[grund]) {
        gesehen.add(grund);
        gruende.push({ grund, ...klasse.gruende[grund] });
      }
    }
  }

  // Klassen-Spanne bei „weiß nicht" auf klassenbestimmenden Fragen (B3).
  const unbekannt = vorlaeufig_bei_weiss_nicht_in.filter(
    (f) => input[f] === "weiss_nicht",
  );
  let klasseSpanne: BedarfSpanne | null = null;
  if (unbekannt.length > 0) {
    const werteListen = unbekannt.map((f) =>
      (fragen.find((q) => q.id === f)?.optionen ?? [])
        .map((o) => o.wert)
        .filter((w) => w !== "weiss_nicht"),
    );
    const klassenIds = new Set<string>();
    for (const combo of kombinationen(werteListen)) {
      const probe: Record<string, string | number | undefined> = { ...input };
      unbekannt.forEach((f, i) => {
        probe[f] = combo[i]!;
      });
      klassenIds.add(matchKlasse(regeln, probe as unknown as BedarfInput).klasseId);
    }
    if (klassenIds.size > 1) {
      const idx = (id: string) => bedarf.klassen.findIndex((k) => k.id === id);
      const sortiert = [...klassenIds].sort((a, b) => idx(a) - idx(b));
      const von = sortiert[0]!;
      const bis = sortiert[sortiert.length - 1]!;
      const name = (id: string) =>
        bedarf.klassen.find((k) => k.id === id)?.name ?? id;
      klasseSpanne = { von, bis, vonName: name(von), bisName: name(bis) };
    }
  }

  const vorlaeufig = unbekannt.length > 0;

  // Zusatz- und Widerspruchs-Befunde (additiv, keine Klassenänderung).
  const befunde = [...zusatzbefunde, ...(widersprueche ?? [])]
    .filter((z) => bedingungTrifft(z.wenn, input))
    .map((z) => z.befund);

  const begruendung: BegruendungsZeile[] =
    match.n0Regeln.length > 0
      ? match.n0Regeln.flatMap((r) => begruendungFuerRegel(r, input, fragen))
      : begruendungFuerRegel(
          regeln.find((r) => r.id === match.regelId)!,
          input,
          fragen,
        );

  return {
    klasse: klasse.id,
    name: klasse.name,
    kostenklasse: klasse.kostenklasse,
    gruende,
    klasseSpanne,
    regelId: match.regelId,
    vorlaeufig,
    zusatzbefunde: befunde,
    begruendung,
  };
}

/** Hilfszugriff für Tests/Berichte: eine Klasse per ID. */
export function findeKlasse(
  bedarf: BedarfContent,
  id: string,
): BedarfKlasse | undefined {
  return bedarf.klassen.find((k) => k.id === id);
}
