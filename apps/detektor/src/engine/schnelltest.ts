/**
 * schnelltest.ts — Schnelltest S1–S5 (Engine-Funktion 7).
 *
 * Zählt die problematischen Antworten und leitet daraus eine Ampelstufe ab.
 * Reine Funktion (G1). Welche Antworten problematisch sind und wie die
 * Schwellen liegen, steht in schnelltest.json.
 */

import type {
  BegruendungsZeile,
  SchnelltestContent,
  SchnelltestErgebnis,
  SchnelltestFrage,
  SchnelltestFrageId,
  SchnelltestInput,
  SchnelltestProblem,
  SchnelltestResult,
} from "./types.js";

function findeErgebnis(
  ergebnisse: SchnelltestErgebnis[],
  anzahl: number,
): SchnelltestErgebnis {
  const treffer = ergebnisse.find((e) => anzahl >= e.von && anzahl <= e.bis);
  if (!treffer) {
    throw new Error(
      `AWD-Schnelltest: Für ${anzahl} problematische Antworten ist kein ` +
        "Ergebnisband in schnelltest.json definiert.",
    );
  }
  return treffer;
}

/**
 * Wertet den Schnelltest aus.
 *
 * @param input Antworten S1–S5 als gewählte Options-Werte.
 * @param schnelltest Inhalt aus schnelltest.json.
 */
export function evaluateSchnelltest(
  input: SchnelltestInput,
  schnelltest: SchnelltestContent,
): SchnelltestResult {
  const frageById = new Map<SchnelltestFrageId, SchnelltestFrage>(
    schnelltest.fragen.map((f) => [f.id, f]),
  );

  const problematischePunkte: SchnelltestProblem[] = [];
  const begruendung: BegruendungsZeile[] = [];

  for (const frage of schnelltest.fragen) {
    const antwort = input[frage.id];
    if (antwort === undefined) {
      throw new Error(
        `AWD-Schnelltest: Es fehlt eine Antwort für Frage ${frage.id}.`,
      );
    }
    const option = frage.optionen.find((o) => o.wert === antwort);
    if (!option) {
      throw new Error(
        `AWD-Schnelltest: Unbekannte Antwort "${antwort}" für Frage ${frage.id}.`,
      );
    }

    begruendung.push({
      regelId: frage.id,
      eingabe: option.text,
      hinweis: option.deutung,
    });

    if (option.problematisch) {
      problematischePunkte.push({
        id: frage.id,
        wert: option.wert,
        deutung: option.deutung,
      });
    }
  }
  void frageById; // Zugriffskarte für spätere Berichtsbausteine.

  const anzahl = problematischePunkte.length;
  const ergebnis = findeErgebnis(schnelltest.auswertung.ergebnisse, anzahl);

  return {
    anzahlProblematisch: anzahl,
    stufe: ergebnis.stufe,
    text: ergebnis.text,
    problematischePunkte,
    begruendung,
  };
}
