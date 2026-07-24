import { describe, expect, it } from "vitest";

import { loadContent } from "../content-loader.js";
import { calculateTco } from "../tco.js";
import type { TcoInput } from "../types.js";
import { loadGolden } from "./helpers.js";

interface TcoFall {
  name: string;
  input: TcoInput;
  erwartet: {
    rechenweg: string;
    endwert: number;
    stufen: { nr: number; wert: number; quelleId: string | null }[];
  };
}

const content = loadContent();
const golden = loadGolden<{ faelle: TcoFall[] }>("tco.json");

describe("calculateTco — Golden-Fälle", () => {
  for (const fall of golden.faelle) {
    it(fall.name, () => {
      const result = calculateTco(fall.input, content.tco);
      expect(result.rechenweg).toBe(fall.erwartet.rechenweg);
      expect(result.endwert).toBe(fall.erwartet.endwert);
      expect(result.stufen).toHaveLength(fall.erwartet.stufen.length);
      for (const erwarteteStufe of fall.erwartet.stufen) {
        const stufe = result.stufen.find((s) => s.nr === erwarteteStufe.nr);
        expect(stufe, `Stufe ${erwarteteStufe.nr}`).toBeDefined();
        expect(stufe!.wert).toBe(erwarteteStufe.wert);
        expect(stufe!.quelleId).toBe(erwarteteStufe.quelleId);
      }
    });
  }
});

describe("calculateTco — abweichende Faktoren (Override)", () => {
  it("nutzt den Override statt der Vorgabe", () => {
    // T2-Vorgabe ist 4; Override auf 5 verschiebt den Produktivbetrieb.
    const result = calculateTco(
      { angebotspreis: 15000, preistyp: "pilot", faktorenOverride: { T2: 5 } },
      content.tco,
    );
    const stufe2 = result.stufen.find((s) => s.nr === 2);
    expect(stufe2!.wert).toBe(75000);
    expect(result.endwert).toBe(75000);
  });
});
