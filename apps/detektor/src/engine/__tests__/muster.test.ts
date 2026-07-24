import { describe, expect, it } from "vitest";

import { loadContent } from "../content-loader.js";
import { detectMuster } from "../muster.js";
import type { MusterInput } from "../types.js";
import { loadGolden } from "./helpers.js";

interface MusterFall {
  name: string;
  input: MusterInput;
  erwartet: {
    generisch: boolean;
    topMuster?: string;
    zweitMuster?: string;
    mindestensTreffer?: number;
    quelle?: string;
  };
}

const content = loadContent();
const golden = loadGolden<{ faelle: MusterFall[] }>("muster.json");

describe("detectMuster — Golden-Fälle", () => {
  for (const fall of golden.faelle) {
    it(fall.name, () => {
      const result = detectMuster(fall.input, content.muster);
      expect(result.generisch).toBe(fall.erwartet.generisch);

      if (fall.erwartet.generisch) {
        expect(result.treffer).toHaveLength(0);
        return;
      }

      expect(result.treffer[0]?.musterId).toBe(fall.erwartet.topMuster);
      if (fall.erwartet.mindestensTreffer !== undefined) {
        expect(result.treffer[0]!.trefferzahl).toBeGreaterThanOrEqual(
          fall.erwartet.mindestensTreffer,
        );
      }
      if (fall.erwartet.zweitMuster !== undefined) {
        expect(result.treffer[1]?.musterId).toBe(fall.erwartet.zweitMuster);
      }
      if (fall.erwartet.quelle !== undefined) {
        expect(result.quelle).toBe(fall.erwartet.quelle);
      }
    });
  }
});

describe("detectMuster — Bestätigungspflicht (Vermutung, keine Entscheidung)", () => {
  it("liefert je Treffer einen Bestätigungstext mit dem Musternamen", () => {
    const result = detectMuster(
      { freitext: "Voicebot für die Anrufannahme" },
      content.muster,
    );
    const top = result.treffer[0]!;
    expect(top.bestaetigungstext).toContain(top.name);
    expect(top.bestaetigungstext).toContain("?");
  });
});
