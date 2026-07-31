/**
 * gelingt.ts — „Gelingt das bei uns?"-Check (Bereitschaft außen + innen).
 *
 * Zählt die offenen Punkte (problematische Antworten) und leitet daraus eine
 * Ampelstufe ab; die offenen Punkte werden nach Block (außen = Anbieter/Lösung,
 * innen = Auftraggeber) getrennt ausgewiesen. Reine Funktion (G1). Fragen,
 * Optionen, problematisch-Zuordnung und Schwellen stehen in gelingt.json.
 */

import type {
  BegruendungsZeile,
  GelingtContent,
  GelingtErgebnis,
  GelingtInput,
  GelingtOffenerPunkt,
  GelingtResult,
} from "./types.js";

function findeErgebnis(
  ergebnisse: GelingtErgebnis[],
  anzahl: number,
): GelingtErgebnis {
  const treffer = ergebnisse.find((e) => anzahl >= e.von && anzahl <= e.bis);
  if (!treffer) {
    throw new Error(
      `AWD-Gelingt: Für ${anzahl} offene Punkte ist kein Ergebnisband in gelingt.json definiert.`,
    );
  }
  return treffer;
}

/**
 * Wertet den Gelingt-Check aus.
 *
 * @param input Antworten je Frage-ID als gewählte Options-Werte.
 * @param gelingt Inhalt aus gelingt.json.
 */
export function evaluateGelingt(
  input: GelingtInput,
  gelingt: GelingtContent,
): GelingtResult {
  const offenAussen: GelingtOffenerPunkt[] = [];
  const offenInnen: GelingtOffenerPunkt[] = [];
  const begruendung: BegruendungsZeile[] = [];

  for (const frage of gelingt.fragen) {
    const antwort = input[frage.id];
    if (antwort === undefined) {
      throw new Error(`AWD-Gelingt: Es fehlt eine Antwort für Frage ${frage.id}.`);
    }
    const option = frage.optionen.find((o) => o.wert === antwort);
    if (!option) {
      throw new Error(
        `AWD-Gelingt: Unbekannte Antwort "${antwort}" für Frage ${frage.id}.`,
      );
    }

    begruendung.push({
      regelId: frage.id,
      eingabe: option.text,
      hinweis: option.deutung,
    });

    if (option.problematisch) {
      const punkt: GelingtOffenerPunkt = {
        id: frage.id,
        block: frage.block,
        frage: frage.frage,
        deutung: option.deutung,
      };
      if (frage.block === "aussen") offenAussen.push(punkt);
      else offenInnen.push(punkt);
    }
  }

  const anzahlOffen = offenAussen.length + offenInnen.length;
  const ergebnis = findeErgebnis(gelingt.auswertung.ergebnisse, anzahlOffen);

  return {
    anzahlOffen,
    gesamt: gelingt.fragen.length,
    stufe: ergebnis.stufe,
    label: ergebnis.label,
    text: ergebnis.text,
    offenAussen,
    offenInnen,
    begruendung,
  };
}
