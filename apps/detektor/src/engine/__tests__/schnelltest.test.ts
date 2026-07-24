import { describe, expect, it } from "vitest";

import { loadContent } from "../content-loader.js";
import { evaluateSchnelltest } from "../schnelltest.js";
import type { SchnelltestInput } from "../types.js";
import { loadGolden } from "./helpers.js";

interface SchnelltestFall {
  name: string;
  input: SchnelltestInput;
  erwartet: { anzahlProblematisch: number; stufe: string };
}

const content = loadContent();
const golden = loadGolden<{ faelle: SchnelltestFall[] }>("schnelltest.json");

describe("evaluateSchnelltest — Golden-Fälle", () => {
  for (const fall of golden.faelle) {
    it(fall.name, () => {
      const result = evaluateSchnelltest(fall.input, content.schnelltest);
      expect(result.anzahlProblematisch).toBe(fall.erwartet.anzahlProblematisch);
      expect(result.stufe).toBe(fall.erwartet.stufe);
      expect(result.problematischePunkte).toHaveLength(
        fall.erwartet.anzahlProblematisch,
      );
      expect(result.begruendung).toHaveLength(5);
    });
  }
});
