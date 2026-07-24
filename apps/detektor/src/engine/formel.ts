/**
 * formel.ts — kleiner, sicherer Arithmetik-Interpreter (Engine-Hilfsfunktion).
 *
 * Wertet die `formel`-Strings aus den Content-JSONs aus (z. B. die Muster-
 * Rechner in muster.json). Unterstützt + − × ÷, Klammern und unäres Minus über
 * benannte Variablen und Zahlen. Kein `eval`, keine Seiteneffekte (G1).
 *
 * Grammatik:
 *   expr   := term (('+' | '-') term)*
 *   term   := unary (('*' | '/') unary)*
 *   unary  := '-' unary | factor
 *   factor := number | id | '(' expr ')'
 */

type Token =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" }
  | { t: "lp" }
  | { t: "rp" };

function tokenize(formel: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < formel.length) {
    const c = formel[i]!;
    if (c === " " || c === "\t" || c === "\n") {
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
    if (c === "+" || c === "-") {
      tokens.push({ t: "op", v: c });
      i++;
      continue;
    }
    // "×"/"*" = Multiplikation, "÷"/"/" = Division.
    if (c === "*" || c === "×") {
      tokens.push({ t: "op", v: "*" });
      i++;
      continue;
    }
    if (c === "/" || c === "÷") {
      tokens.push({ t: "op", v: "/" });
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
    if (/[A-Za-z_]/.test(c)) {
      let id = "";
      while (i < formel.length && /[A-Za-z0-9_]/.test(formel[i]!)) {
        id += formel[i];
        i++;
      }
      tokens.push({ t: "id", v: id });
      continue;
    }
    throw new Error(`AWD-Formel: Unerwartetes Zeichen "${c}" in "${formel}".`);
  }
  return tokens;
}

/**
 * Wertet eine Formel gegen einen Variablen-Scope aus.
 *
 * @param formel Der Formelausdruck (z. B. "a*12 - (b - c)*d").
 * @param scope  Zuordnung Variablenname → Zahlwert.
 */
export function evaluateFormel(
  formel: string,
  scope: Record<string, number>,
): number {
  const tokens = tokenize(formel);
  let pos = 0;
  const peek = (): Token | undefined => tokens[pos];

  function parseFactor(): number {
    const tok = peek();
    if (!tok) throw new Error(`AWD-Formel: "${formel}" ist unvollständig.`);
    if (tok.t === "num") {
      pos++;
      return tok.v;
    }
    if (tok.t === "id") {
      pos++;
      const val = scope[tok.v];
      if (val === undefined) {
        throw new Error(`AWD-Formel: Unbekannte Variable "${tok.v}" in "${formel}".`);
      }
      return val;
    }
    if (tok.t === "lp") {
      pos++;
      const val = parseExpr();
      const close = peek();
      if (!close || close.t !== "rp") {
        throw new Error(`AWD-Formel: Fehlende Klammer in "${formel}".`);
      }
      pos++;
      return val;
    }
    throw new Error(`AWD-Formel: Syntaxfehler in "${formel}".`);
  }

  function parseUnary(): number {
    const tok = peek();
    if (tok && tok.t === "op" && tok.v === "-") {
      pos++;
      return -parseUnary();
    }
    if (tok && tok.t === "op" && tok.v === "+") {
      pos++;
      return parseUnary();
    }
    return parseFactor();
  }

  function parseTerm(): number {
    let val = parseUnary();
    let tok = peek();
    while (tok && tok.t === "op" && (tok.v === "*" || tok.v === "/")) {
      const op = tok.v;
      pos++;
      const rhs = parseUnary();
      if (op === "/") {
        if (rhs === 0) {
          throw new Error(`AWD-Formel: Division durch null in "${formel}".`);
        }
        val /= rhs;
      } else {
        val *= rhs;
      }
      tok = peek();
    }
    return val;
  }

  function parseExpr(): number {
    let val = parseTerm();
    let tok = peek();
    while (tok && tok.t === "op" && (tok.v === "+" || tok.v === "-")) {
      const op = tok.v;
      pos++;
      const rhs = parseTerm();
      val = op === "+" ? val + rhs : val - rhs;
      tok = peek();
    }
    return val;
  }

  const result = parseExpr();
  if (pos !== tokens.length) {
    throw new Error(`AWD-Formel: "${formel}" konnte nicht vollständig gelesen werden.`);
  }
  return result;
}
