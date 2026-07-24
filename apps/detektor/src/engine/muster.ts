/**
 * muster.ts — Mustererkennung M1–M6 (Engine-Funktion 6).
 *
 * Reine Signalwortsuche gegen die "signale"-Listen in muster.json,
 * case-insensitive und umlaut-tolerant. Kein Machine Learning. Reine
 * Funktion (G1).
 *
 * Das Ergebnis ist immer eine Vermutung mit Bestätigungspflicht: Die Engine
 * liefert den Vorschlag samt Bestätigungstext, entscheidet aber nichts. Bei
 * mehreren Treffern werden alle zurückgegeben, nach Trefferzahl absteigend
 * sortiert. Bei null Treffern: generisch.
 */

import type {
  BegruendungsZeile,
  Muster,
  MusterContent,
  MusterInput,
  MusterResult,
  MusterTreffer,
} from "./types.js";

/**
 * Normalisiert Text für den Vergleich: Kleinschreibung und Umlaut-Expansion
 * (ä→ae, ö→oe, ü→ue, ß→ss). Dadurch matchen "aufgerüstet" und "aufgeruestet"
 * gleichermaßen.
 */
function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Trifft ein Signal an Wortgrenzen, damit es nicht als Teil eines längeren
 * Worts anschlägt (verhindert „bot" in „Roboter/Voicebot", „rag" in „Fragen").
 * Bindestriche und Leerzeichen im Signal bleiben literal. Beide Seiten sind
 * bereits normalisiert (Umlaut-Faltung, Kleinschreibung).
 */
function enthaeltSignal(textNorm: string, signalNorm: string): boolean {
  const re = new RegExp(`(?<![a-z0-9])${escapeRegExp(signalNorm)}(?![a-z0-9])`);
  return re.test(textNorm);
}

function bestaetigungstext(vorlage: string, name: string): string {
  return vorlage.replace("{muster_name}", name);
}

function toTreffer(
  muster: Muster,
  trefferwoerter: string[],
  vorlage: string,
): MusterTreffer {
  return {
    musterId: muster.id,
    name: muster.name,
    trefferwoerter,
    trefferzahl: trefferwoerter.length,
    achsenFokus: muster.achsen_fokus,
    trackStatus: muster.track_status,
    bestaetigungstext: bestaetigungstext(vorlage, muster.name),
  };
}

/**
 * Erkennt Muster aus Freitext oder direkter Klassifikationsantwort.
 *
 * @param input freitext (Signalwortsuche) und/oder klassifikation ("M1".."M6"|"generisch").
 * @param musterContent Inhalt aus muster.json.
 */
export function detectMuster(
  input: MusterInput,
  musterContent: MusterContent,
): MusterResult {
  const vorlage = musterContent.bestaetigungstext;

  // 1) Direkte Klassifikationsantwort hat Vorrang (Sitzungsmodus/Direktwahl).
  if (input.klassifikation) {
    if (input.klassifikation === "generisch") {
      return {
        treffer: [],
        generisch: true,
        quelle: "klassifikation",
        begruendung: [
          { regelId: "M0", hinweis: "Direktwahl: generischer Pfad." },
        ],
      };
    }
    const muster = musterContent.muster.find(
      (m) => m.id === input.klassifikation,
    );
    if (!muster) {
      throw new Error(
        `AWD-Muster: Unbekannte Klassifikation "${input.klassifikation}".`,
      );
    }
    const treffer = toTreffer(muster, [], vorlage);
    return {
      treffer: [treffer],
      generisch: false,
      quelle: "klassifikation",
      begruendung: [
        {
          regelId: muster.id,
          eingabe: "Direktwahl",
          hinweis: treffer.bestaetigungstext,
        },
      ],
    };
  }

  // 2) Signalwortsuche im Freitext.
  const text = normalisiere(input.freitext ?? "");

  const treffer: MusterTreffer[] = [];
  for (const muster of musterContent.muster) {
    const gefunden = muster.signale.filter((sig) =>
      enthaeltSignal(text, normalisiere(sig)),
    );
    if (gefunden.length > 0) {
      treffer.push(toTreffer(muster, gefunden, vorlage));
    }
  }

  if (treffer.length === 0) {
    return {
      treffer: [],
      generisch: true,
      quelle: "signalwort",
      begruendung: [
        {
          regelId: "M0",
          hinweis: "Keine Signalwörter erkannt → generischer Pfad.",
        },
      ],
    };
  }

  // Sortierung: nach Trefferzahl absteigend, bei Gleichstand nach Muster-ID
  // aufsteigend (deterministisch, G1).
  treffer.sort((a, b) => {
    if (b.trefferzahl !== a.trefferzahl) return b.trefferzahl - a.trefferzahl;
    return a.musterId.localeCompare(b.musterId);
  });

  const begruendung: BegruendungsZeile[] = treffer.map((t) => ({
    regelId: t.musterId,
    eingabe: t.trefferwoerter.join(", "),
    punkte: t.trefferzahl,
    hinweis: t.bestaetigungstext,
  }));

  return { treffer, generisch: false, quelle: "signalwort", begruendung };
}
