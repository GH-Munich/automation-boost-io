import { describe, expect, it } from "vitest";

import { loadContent } from "../content-loader.js";
import { evaluateGelingt } from "../gelingt.js";
import type { GelingtInput } from "../types.js";
import { loadGolden } from "./helpers.js";

interface GelingtFall {
  name: string;
  input: GelingtInput;
  erwartet: { anzahlOffen: number; stufe: string; aussen: number; innen: number };
}

const content = loadContent();
const golden = loadGolden<{ faelle: GelingtFall[] }>("gelingt.json");

describe("evaluateGelingt — Golden-Fälle", () => {
  for (const fall of golden.faelle) {
    it(fall.name, () => {
      const r = evaluateGelingt(fall.input, content.gelingt);
      expect(r.anzahlOffen).toBe(fall.erwartet.anzahlOffen);
      expect(r.stufe).toBe(fall.erwartet.stufe);
      expect(r.offenAussen.length).toBe(fall.erwartet.aussen);
      expect(r.offenInnen.length).toBe(fall.erwartet.innen);
    });
  }
});
