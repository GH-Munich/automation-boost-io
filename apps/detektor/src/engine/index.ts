/**
 * index.ts — öffentliche API der AWD-Regel-Engine (M2).
 *
 * Die Engine besteht aus reinen Bewertungsfunktionen (G1) plus dem einzigen
 * I/O-Grenzfall loadContent(). Alle fachlichen Werte stammen aus den
 * Content-JSONs; im Code stehen keine Schwellen, Faktoren, Texte oder Preise.
 */

export * from "./types.js";

export {
  loadContent,
  assertSameStandardVersion,
  DEFAULT_CONTENT_DIR,
} from "./content-loader.js";
export { calculateScore } from "./scoring.js";
export { classifyBedarf, findeKlasse } from "./bedarf.js";
export { calculatePriceCorridor } from "./pricing.js";
export { calculateNutzen } from "./nutzen.js";
export { evaluateGelingt } from "./gelingt.js";
export { calculateTco } from "./tco.js";
export { detectMuster } from "./muster.js";
export { evaluateFormel } from "./formel.js";
export { evaluateSchnelltest } from "./schnelltest.js";
export { buildProtokoll } from "./protokoll.js";

import { calculatePriceCorridor } from "./pricing.js";
import { calculateScore } from "./scoring.js";
import { calculateTco } from "./tco.js";
import { classifyBedarf } from "./bedarf.js";
import { detectMuster } from "./muster.js";
import { evaluateSchnelltest } from "./schnelltest.js";
import { buildProtokoll } from "./protokoll.js";
import type {
  BedarfInput,
  Content,
  MusterInput,
  PriceInput,
  Protokoll,
  ScoreInput,
  SchnelltestInput,
  TcoInput,
  BedarfResult,
  MusterResult,
  PriceResult,
  ScoreResult,
  SchnelltestResult,
  TcoResult,
} from "./types.js";

/** Eingaben für ein vollständiges Assessment (jeder Teil ist optional). */
export interface AssessInput {
  score?: ScoreInput;
  bedarf?: BedarfInput;
  pricing?: PriceInput;
  tco?: TcoInput;
  muster?: MusterInput;
  schnelltest?: SchnelltestInput;
}

/** Zusammengeführtes Assessment-Ergebnis inklusive Prüfprotokoll. */
export interface AssessResult {
  score?: ScoreResult;
  bedarf?: BedarfResult;
  pricing?: PriceResult;
  tco?: TcoResult;
  muster?: MusterResult;
  schnelltest?: SchnelltestResult;
  protokoll: Protokoll;
}

/**
 * Führt alle angegebenen Engine-Teile über denselben Content aus und baut das
 * Prüfprotokoll. Reine Funktion (bis auf den bereits geladenen Content) —
 * dieselben Eingaben liefern bitgleich dasselbe Ergebnis (G1).
 */
export function assess(content: Content, input: AssessInput): AssessResult {
  const score =
    input.score !== undefined
      ? calculateScore(input.score, content.achsen)
      : undefined;
  const bedarf =
    input.bedarf !== undefined
      ? classifyBedarf(input.bedarf, content.bedarf)
      : undefined;
  const pricing =
    input.pricing !== undefined
      ? calculatePriceCorridor(input.pricing, content.preislogik)
      : undefined;
  const tco =
    input.tco !== undefined
      ? calculateTco(input.tco, content.tco)
      : undefined;
  const muster =
    input.muster !== undefined
      ? detectMuster(input.muster, content.muster)
      : undefined;
  const schnelltest =
    input.schnelltest !== undefined
      ? evaluateSchnelltest(input.schnelltest, content.schnelltest)
      : undefined;

  const protokoll = buildProtokoll(
    {
      ...(score && input.score ? { score: { input: input.score, result: score } } : {}),
      ...(bedarf && input.bedarf ? { bedarf: { input: input.bedarf, result: bedarf } } : {}),
      ...(pricing && input.pricing ? { pricing: { input: input.pricing, result: pricing } } : {}),
      ...(tco && input.tco ? { tco: { input: input.tco, result: tco } } : {}),
      ...(muster && input.muster ? { muster: { input: input.muster, result: muster } } : {}),
      ...(schnelltest && input.schnelltest ? { schnelltest: { input: input.schnelltest, result: schnelltest } } : {}),
    },
    content.standardVersion,
  );

  return {
    ...(score ? { score } : {}),
    ...(bedarf ? { bedarf } : {}),
    ...(pricing ? { pricing } : {}),
    ...(tco ? { tco } : {}),
    ...(muster ? { muster } : {}),
    ...(schnelltest ? { schnelltest } : {}),
    protokoll,
  };
}
