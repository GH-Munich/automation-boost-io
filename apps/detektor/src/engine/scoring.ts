/**
 * scoring.ts — Agentik-Score (Engine-Funktion 2).
 *
 * Summiert die sechs Achsen A1–A6 (je 0/1/2 Punkte) zu einem Score 0–12 und
 * ordnet ihn einem Band B1–B4 zu. Reine Funktion (G1).
 *
 * Kernlogik nach G5 ("Weiß nicht" ist ein Befund, keine Null):
 * Eine ".X"-Antwort ist nicht bewertbar. Sie zaehlt im Minimum mit 0, im
 * Maximum mit 2. Ein Band wird nur gesetzt, wenn Score-Minimum und -Maximum
 * im selben Band liegen; sonst band = null, vorlaeufig = true.
 *
 * Es werden ausschliesslich Werte aus achsen.json verwendet — keine Schwellen,
 * Punkte oder Bandgrenzen im Code.
 */

import type {
  Achse,
  AchseId,
  AchsenContent,
  Band,
  ScoreBegruendung,
  ScoreInput,
  ScoreResult,
} from "./types.js";

/** Findet das Band, dessen [von, bis]-Intervall den Score enthaelt. */
function findeBand(baender: Band[], score: number): Band | null {
  for (const band of baender) {
    if (score >= band.von && score <= band.bis) return band;
  }
  return null;
}

/**
 * Berechnet den Agentik-Score aus den Achsen-Antworten.
 *
 * @param input Antworten je Achse als gewaehlte Regel-ID ("A1.2", "A3.X", …).
 * @param achsen Inhalt aus achsen.json.
 */
export function calculateScore(
  input: ScoreInput,
  achsen: AchsenContent,
): ScoreResult {
  const achsenById = new Map<AchseId, Achse>(
    achsen.achsen.map((a) => [a.id, a]),
  );

  let scoreMin = 0;
  let scoreMax = 0;
  const nichtBewertbar: AchseId[] = [];
  const begruendung: ScoreBegruendung[] = [];

  // Feste Reihenfolge A1..A6 fuer deterministische Ausgabe.
  const reihenfolge = achsen.achsen.map((a) => a.id);

  for (const achseId of reihenfolge) {
    const achse = achsenById.get(achseId);
    if (!achse) {
      throw new Error(
        `AWD-Scoring: Achse ${achseId} fehlt in achsen.json.`,
      );
    }

    const antwort = input[achseId];
    if (antwort === undefined) {
      throw new Error(
        `AWD-Scoring: Es fehlt eine Antwort für Achse ${achseId}.`,
      );
    }

    // "Weiß nicht" / ".X": nicht bewertbar (G5). Die Bandbreite ergibt sich aus
    // den möglichen Punkten der Achse selbst (kein hartkodierter Wert): das
    // Minimum rechnet mit der niedrigsten, das Maximum mit der höchsten Stufe.
    if (antwort === achse.weiss_nicht.regel_id) {
      const punkte = achse.stufen.map((s) => s.punkte);
      scoreMin += Math.min(...punkte);
      scoreMax += Math.max(...punkte);
      nichtBewertbar.push(achseId);
      begruendung.push({
        achse: achseId,
        regelId: achse.weiss_nicht.regel_id,
        eingabe: achse.weiss_nicht.wizard_option,
        punkte: null,
        bewertbar: false,
        hinweis: achse.weiss_nicht.befund,
      });
      continue;
    }

    // Regulaere Stufe: Punkte aus der Datei.
    const stufe = achse.stufen.find((s) => s.regel_id === antwort);
    if (!stufe) {
      throw new Error(
        `AWD-Scoring: Unbekannte Antwort "${antwort}" für Achse ${achseId}. ` +
          `Erlaubt sind ${achse.stufen.map((s) => s.regel_id).join(", ")} oder ${achse.weiss_nicht.regel_id}.`,
      );
    }

    scoreMin += stufe.punkte;
    scoreMax += stufe.punkte;
    begruendung.push({
      achse: achseId,
      regelId: stufe.regel_id,
      eingabe: stufe.wizard_option,
      punkte: stufe.punkte,
      bewertbar: true,
    });
  }

  const baender = achsen.auswertung.baender;
  const bandMin = findeBand(baender, scoreMin);
  const bandMax = findeBand(baender, scoreMax);

  // Einstufung nur, wenn Minimum und Maximum im selben Band liegen (G5).
  const eindeutig =
    bandMin !== null && bandMax !== null && bandMin.id === bandMax.id;

  const band = eindeutig ? bandMin.id : null;
  const einstufung = eindeutig ? bandMin.einstufung : null;
  const konsequenz = eindeutig ? bandMin.konsequenz : null;

  return {
    scoreMin,
    scoreMax,
    band,
    einstufung,
    konsequenz,
    vorlaeufig: band === null,
    nichtBewertbar,
    begruendung,
  };
}
