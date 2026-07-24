import { describe, expect, it } from "vitest";

import { loadContent } from "../content-loader.js";
import { calculateScore } from "../scoring.js";
import type { ScoreInput } from "../types.js";
import { loadGolden } from "./helpers.js";

interface ScoringFall {
  name: string;
  input: ScoreInput;
  erwartet: {
    scoreMin: number;
    scoreMax: number;
    band: string | null;
    einstufung: string | null;
    vorlaeufig: boolean;
    nichtBewertbar: string[];
  };
}

const content = loadContent();
const golden = loadGolden<{ faelle: ScoringFall[] }>("scoring.json");

describe("calculateScore — Golden-Fälle", () => {
  for (const fall of golden.faelle) {
    it(fall.name, () => {
      const result = calculateScore(fall.input, content.achsen);
      expect(result.scoreMin).toBe(fall.erwartet.scoreMin);
      expect(result.scoreMax).toBe(fall.erwartet.scoreMax);
      expect(result.band).toBe(fall.erwartet.band);
      expect(result.einstufung).toBe(fall.erwartet.einstufung);
      expect(result.vorlaeufig).toBe(fall.erwartet.vorlaeufig);
      expect(result.nichtBewertbar).toEqual(fall.erwartet.nichtBewertbar);
      // Begründungsspur ist Pflicht (G2): je Achse eine Zeile.
      expect(result.begruendung).toHaveLength(6);
    });
  }
});

describe("calculateScore — Begründungsspur (G2)", () => {
  it("führt Regel-ID, Eingabe im Wortlaut und Punkte je Achse", () => {
    const input: ScoreInput = {
      A1: "A1.2",
      A2: "A2.1",
      A3: "A3.0",
      A4: "A4.X",
      A5: "A5.1",
      A6: "A6.0",
    };
    const result = calculateScore(input, content.achsen);
    const a1 = result.begruendung.find((b) => b.achse === "A1");
    expect(a1?.regelId).toBe("A1.2");
    expect(a1?.punkte).toBe(2);
    expect(a1?.eingabe).toBeTruthy();
    const a4 = result.begruendung.find((b) => b.achse === "A4");
    expect(a4?.bewertbar).toBe(false);
    expect(a4?.punkte).toBeNull();
  });
});

describe("calculateScore — Eingabevalidierung", () => {
  it("wirft bei unbekannter Regel-ID", () => {
    const input = {
      A1: "A1.9",
      A2: "A2.0",
      A3: "A3.0",
      A4: "A4.0",
      A5: "A5.0",
      A6: "A6.0",
    } as ScoreInput;
    expect(() => calculateScore(input, content.achsen)).toThrow();
  });
});
