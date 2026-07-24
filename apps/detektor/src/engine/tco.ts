/**
 * tco.ts — TCO-Wasserfall (Engine-Funktion 5).
 *
 * Erzeugt den Wasserfall "Vom Angebot zur echten Rechnung" für Rechenweg A
 * (Pilotpreis) oder B (Produktivpreis). Reine Funktion (G1).
 *
 * Die Rechenwege — Stufen, Formeln und Quellen-IDs — stehen vollständig in
 * tco-faktoren.json. Der Code interpretiert die Formeln nur; die Faktorwerte
 * (T1–T5) kommen aus der Datei. Keine Faktoren oder Formeln im Code.
 *
 * Formel-Variablen:
 *   angebot   — Eingabepreis
 *   laufzeit  — Projektlaufzeit in Monaten (nur Rechenweg A)
 *   ergebnis  — Wert der letzten "Basis"-Stufe (Formel ohne "ergebnis")
 *   T1..T5    — Faktorwert aus tco-faktoren.json (Vorgabe oder Override)
 */

import type {
  BegruendungsZeile,
  TcoContent,
  TcoFaktor,
  TcoFaktorId,
  TcoInput,
  TcoRechenweg,
  TcoResult,
  TcoStufe,
} from "./types.js";

/* --- Winziger, sicherer Formel-Interpreter (nur + × ( ) Zahlen Bezeichner) --- */

type Token =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: "+" | "*" }
  | { t: "lp" }
  | { t: "rp" };

function tokenize(formel: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < formel.length) {
    const c = formel[i]!;
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if (c === "(") {
      tokens.push({ t: "lp" });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ t: "rp" });
      i++;
      continue;
    }
    if (c === "+") {
      tokens.push({ t: "op", v: "+" });
      i++;
      continue;
    }
    // "×" (U+00D7) und "*" bedeuten Multiplikation.
    if (c === "×" || c === "*") {
      tokens.push({ t: "op", v: "*" });
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let num = "";
      while (i < formel.length && /[0-9.]/.test(formel[i]!)) {
        num += formel[i];
        i++;
      }
      tokens.push({ t: "num", v: Number(num) });
      continue;
    }
    if (/[A-Za-z]/.test(c)) {
      let id = "";
      while (i < formel.length && /[A-Za-z0-9]/.test(formel[i]!)) {
        id += formel[i];
        i++;
      }
      tokens.push({ t: "id", v: id });
      continue;
    }
    throw new Error(`AWD-TCO: Unerwartetes Zeichen "${c}" in Formel "${formel}".`);
  }
  return tokens;
}

/** Recursive-descent-Auswertung: expr := term ('+' term)*; term := factor ('*' factor)*. */
function evaluate(formel: string, scope: Record<string, number>): number {
  const tokens = tokenize(formel);
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];

  function parseFactor(): number {
    const tok = peek();
    if (!tok) throw new Error(`AWD-TCO: Formel "${formel}" ist unvollständig.`);
    if (tok.t === "num") {
      pos++;
      return tok.v;
    }
    if (tok.t === "id") {
      pos++;
      const val = scope[tok.v];
      if (val === undefined) {
        throw new Error(
          `AWD-TCO: Unbekannte Variable "${tok.v}" in Formel "${formel}".`,
        );
      }
      return val;
    }
    if (tok.t === "lp") {
      pos++;
      const val = parseExpr();
      const close = peek();
      if (!close || close.t !== "rp") {
        throw new Error(`AWD-TCO: Fehlende Klammer in Formel "${formel}".`);
      }
      pos++;
      return val;
    }
    throw new Error(`AWD-TCO: Syntaxfehler in Formel "${formel}".`);
  }

  function parseTerm(): number {
    let val = parseFactor();
    let tok = peek();
    while (tok && tok.t === "op" && tok.v === "*") {
      pos++;
      val *= parseFactor();
      tok = peek();
    }
    return val;
  }

  function parseExpr(): number {
    let val = parseTerm();
    let tok = peek();
    while (tok && tok.t === "op" && tok.v === "+") {
      pos++;
      val += parseTerm();
      tok = peek();
    }
    return val;
  }

  const result = parseExpr();
  if (pos !== tokens.length) {
    throw new Error(`AWD-TCO: Formel "${formel}" konnte nicht vollständig gelesen werden.`);
  }
  return result;
}

/* --- Rechenweg-Verarbeitung --- */

function runde(x: number, n: number): number {
  const faktor = 10 ** n;
  return Math.round(x * faktor) / faktor;
}

/**
 * Berechnet den TCO-Wasserfall.
 *
 * @param input Angebotspreis, Preistyp (pilot/produktiv); optional Laufzeit
 *   in Monaten und abweichende Faktorwerte.
 * @param tco Inhalt aus tco-faktoren.json.
 */
export function calculateTco(input: TcoInput, tco: TcoContent): TcoResult {
  const rechenwegId =
    input.preistyp === "pilot" ? "A_pilotpreis" : "B_produktivpreis";
  const rechenweg: TcoRechenweg = tco.rechenwege[rechenwegId];

  const faktorById = new Map<TcoFaktorId, TcoFaktor>(
    tco.faktoren.map((f) => [f.id, f]),
  );

  const faktorWert = (id: TcoFaktorId): number => {
    const override = input.faktorenOverride?.[id];
    if (override !== undefined) return override;
    const f = faktorById.get(id);
    if (!f) {
      throw new Error(`AWD-TCO: Faktor ${id} fehlt in tco-faktoren.json.`);
    }
    return f.default;
  };

  // Faktorwerte in einen Scope legen (T1..T5).
  const scope: Record<string, number> = { angebot: input.angebotspreis };
  if (input.laufzeitMonate !== undefined) {
    scope.laufzeit = input.laufzeitMonate;
  }
  for (const f of tco.faktoren) {
    scope[f.id] = faktorWert(f.id);
  }

  const stufen: TcoStufe[] = [];
  const benutzteFaktoren = new Set<TcoFaktorId>();
  let ergebnis: number | undefined;
  let endwert = input.angebotspreis;

  for (const schritt of rechenweg.schritte) {
    const brauchtLaufzeit = schritt.formel.includes("laufzeit");
    // Zeitpuffer-Stufe nur berechnen, wenn eine Laufzeit vorliegt.
    if (brauchtLaufzeit && input.laufzeitMonate === undefined) {
      continue;
    }

    const lokalerScope = { ...scope, ...(ergebnis !== undefined ? { ergebnis } : {}) };
    const wert = runde(evaluate(schritt.formel, lokalerScope), 2);

    stufen.push({
      nr: schritt.nr,
      label: schritt.label,
      wert,
      quelleId: schritt.quelle ?? null,
      formel: schritt.formel,
    });
    if (schritt.quelle) benutzteFaktoren.add(schritt.quelle);

    const hatErgebnis = schritt.formel.includes("ergebnis");
    // Nur monetäre Basis-Stufen (Formel ohne "ergebnis" UND ohne "laufzeit")
    // schreiben den ergebnis-Bezug und den Endwert fort. Info-Zeilen (nutzen
    // "ergebnis") und die Zeitpuffer-Stufe (nutzt "laufzeit") tun es nicht —
    // so bleibt der ergebnis-Bezug auch bei künftigen Content-Änderungen stabil.
    if (!hatErgebnis && !brauchtLaufzeit) {
      ergebnis = wert;
      endwert = wert;
    }
  }

  const begruendung: BegruendungsZeile[] = stufen
    .filter((s) => s.quelleId !== null)
    .map((s) => {
      const f = faktorById.get(s.quelleId!);
      return {
        regelId: s.quelleId!,
        eingabe: `${s.label}: ${s.wert}`,
        hinweis: f?.quelle,
      };
    });

  return {
    rechenweg: rechenwegId,
    stufen,
    endwert,
    faustregel: tco.faustregel,
    begruendung,
  };
}
