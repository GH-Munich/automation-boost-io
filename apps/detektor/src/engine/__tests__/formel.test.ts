import { describe, expect, it } from "vitest";

import { evaluateFormel } from "../formel.js";

describe("evaluateFormel — Arithmetik & Präzedenz", () => {
  it("Punkt vor Strich", () => {
    expect(evaluateFormel("2 + 3 * 4", {})).toBe(14);
  });

  it("Klammern binden zuerst", () => {
    expect(evaluateFormel("(2 + 3) * 4", {})).toBe(20);
  });

  it("Subtraktion ist linksassoziativ", () => {
    expect(evaluateFormel("10 - 3 - 2", {})).toBe(5);
  });

  it("Division", () => {
    expect(evaluateFormel("100 / 4 / 5", {})).toBe(5);
  });

  it("unäres Minus", () => {
    expect(evaluateFormel("-3 + 5", {})).toBe(2);
    expect(evaluateFormel("10 * -2", {})).toBe(-20);
  });

  it("Variablen aus dem Scope", () => {
    expect(evaluateFormel("a*12 - b", { a: 100, b: 200 })).toBe(1000);
  });

  it("Unicode × und ÷", () => {
    expect(evaluateFormel("6 × 7 ÷ 2", {})).toBe(21);
  });
});

describe("evaluateFormel — echte Muster-Formeln (muster.json)", () => {
  it("M1 netto_real mit verschachtelter Klammer", () => {
    const scope = {
      lizenz_monat_eur: 2500,
      einsparung_real_vzae: 0.2,
      nachbearbeitung_vzae: 0.4,
      personalkosten_vzae_jahr_eur: 60000,
    };
    // 2500*12 - (0.2 - 0.4)*60000 = 30000 - (-0.2*60000) = 30000 + 12000
    expect(
      evaluateFormel(
        "lizenz_monat_eur*12 - (einsparung_real_vzae - nachbearbeitung_vzae)*personalkosten_vzae_jahr_eur",
        scope,
      ),
    ).toBe(42000);
  });

  it("M3 aufschlagsfaktor (Division)", () => {
    expect(
      evaluateFormel("angebot_jahr_eur / konventionell_jahr_eur", {
        angebot_jahr_eur: 60000,
        konventionell_jahr_eur: 4000,
      }),
    ).toBe(15);
  });
});

describe("evaluateFormel — Fehlerfälle", () => {
  it("unbekannte Variable wirft", () => {
    expect(() => evaluateFormel("a + b", { a: 1 })).toThrow(/Unbekannte Variable/);
  });

  it("Division durch null wirft", () => {
    expect(() => evaluateFormel("1 / 0", {})).toThrow(/Division durch null/);
  });

  it("unerwartetes Zeichen wirft", () => {
    expect(() => evaluateFormel("2 % 3", {})).toThrow(/Unerwartetes Zeichen/);
  });
});
