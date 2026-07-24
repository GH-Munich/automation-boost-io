import { describe, expect, it } from "vitest";

import { classifyBedarf } from "../bedarf.js";
import { loadContent } from "../content-loader.js";
import type { BedarfInput, BedarfRegel } from "../types.js";
import { loadGolden } from "./helpers.js";

interface BedarfFall {
  name: string;
  input: BedarfInput;
  erwartet: {
    klasse: string;
    grund: string | null;
    regelId: string;
    vorlaeufig: boolean;
  };
  haetten_ebenfalls_getroffen?: string[];
}

const content = loadContent();
const golden = loadGolden<{ faelle: BedarfFall[] }>("bedarf.json");

describe("classifyBedarf — Golden-Fälle", () => {
  for (const fall of golden.faelle) {
    it(fall.name, () => {
      const result = classifyBedarf(fall.input, content.bedarf);
      expect(result.klasse).toBe(fall.erwartet.klasse);
      expect(result.grund).toBe(fall.erwartet.grund);
      expect(result.regelId).toBe(fall.erwartet.regelId);
      expect(result.vorlaeufig).toBe(fall.erwartet.vorlaeufig);
      expect(result.begruendung.length).toBeGreaterThan(0);
    });
  }
});

/**
 * First-Match-Beweis: Für den letzten Golden-Fall würden mehrere Regeln
 * zutreffen; der Test prüft, dass die spätere Reihenfolge auch tatsächlich
 * getroffen hätte — nur die erste gewinnt.
 */
describe("classifyBedarf — First-Match (Reihenfolge ist verbindlich)", () => {
  const fall = golden.faelle.find((f) => f.haetten_ebenfalls_getroffen);
  it("spätere Regeln träfen ebenfalls zu, gewinnen aber nicht", () => {
    expect(fall).toBeDefined();
    const regeln = content.bedarf.entscheidungsregeln.regeln;

    const trifft = (regel: BedarfRegel, input: BedarfInput): boolean => {
      if (regel.fallback) return true;
      const gruppen = regel.wenn ? [regel.wenn] : (regel.wenn_oder ?? []);
      const werte = input as unknown as Record<string, string>;
      const gruppeOk = (g: Record<string, string[]>): boolean =>
        Object.entries(g).every(([fid, erlaubt]) => erlaubt.includes(werte[fid]!));
      return regel.wenn
        ? gruppeOk(regel.wenn as Record<string, string[]>)
        : gruppen.some((g) => gruppeOk(g as Record<string, string[]>));
    };

    for (const id of fall!.haetten_ebenfalls_getroffen!) {
      const regel = regeln.find((r) => r.id === id)!;
      expect(trifft(regel, fall!.input)).toBe(true);
    }
    // Ergebnis ist trotzdem die erste Regel.
    expect(classifyBedarf(fall!.input, content.bedarf).regelId).toBe(
      fall!.erwartet.regelId,
    );
  });
});

describe("classifyBedarf — Zusatzbefunde (additiv, keine Klassenänderung)", () => {
  it("F4=teilweise erzeugt einen Zusatzbefund, ändert aber die Klasse nicht", () => {
    const input: BedarfInput = {
      F1: "ausfuehrung",
      F2: "immer",
      F3: "kaum",
      F4: "teilweise",
      F5: "ja",
      F6: "leicht",
      F7: 1000,
    };
    const result = classifyBedarf(input, content.bedarf);
    expect(result.klasse).toBe("N1"); // R05
    expect(result.zusatzbefunde.length).toBeGreaterThan(0);
  });
});
