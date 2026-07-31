import { describe, expect, it } from "vitest";

import { loadContent } from "../content-loader.js";
import { calculateNutzen } from "../nutzen.js";
import type { NutzenInput } from "../types.js";
import { loadGolden } from "./helpers.js";

interface NutzenFall {
  name: string;
  input: NutzenInput;
  erwartet: {
    eingesparteStundenJahr: number;
    jahresnutzenEur: number;
    amortisationMonate: number | null;
    ampel: string;
  };
}

const content = loadContent();
const golden = loadGolden<{ faelle: NutzenFall[] }>("nutzen.json");

describe("calculateNutzen — Golden-Fälle", () => {
  for (const fall of golden.faelle) {
    it(fall.name, () => {
      const r = calculateNutzen(fall.input, content.nutzen);
      expect(r.eingesparteStundenJahr).toBe(fall.erwartet.eingesparteStundenJahr);
      expect(r.jahresnutzenEur).toBe(fall.erwartet.jahresnutzenEur);
      expect(r.amortisationMonate).toBe(fall.erwartet.amortisationMonate);
      expect(r.ampel).toBe(fall.erwartet.ampel);
    });
  }
});
