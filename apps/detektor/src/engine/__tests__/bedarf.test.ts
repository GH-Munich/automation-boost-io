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
    gruende: string[];
    regelId: string;
    vorlaeufig: boolean;
    klasseSpanne: { von: string; bis: string } | null;
    zusatzbefundeMin?: number;
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
      expect(result.gruende.map((g) => g.grund)).toEqual(fall.erwartet.gruende);
      expect(result.regelId).toBe(fall.erwartet.regelId);
      expect(result.vorlaeufig).toBe(fall.erwartet.vorlaeufig);
      expect(result.begruendung.length).toBeGreaterThan(0);

      if (fall.erwartet.klasseSpanne === null) {
        expect(result.klasseSpanne).toBeNull();
      } else {
        expect(result.klasseSpanne).not.toBeNull();
        expect(result.klasseSpanne!.von).toBe(fall.erwartet.klasseSpanne.von);
        expect(result.klasseSpanne!.bis).toBe(fall.erwartet.klasseSpanne.bis);
      }

      if (fall.erwartet.zusatzbefundeMin !== undefined) {
        expect(result.zusatzbefunde.length).toBeGreaterThanOrEqual(
          fall.erwartet.zusatzbefundeMin,
        );
      }
    });
  }
});

/**
 * Jeder in gruende ausgewiesene N0-Grund muss auf einen in bedarf.json
 * definierten Grundtext (titel/text) verweisen — kein erfundener Grund (G2).
 */
describe("classifyBedarf — N0-Gründe sind vollständig aufgelöst", () => {
  it("jeder Grund hat Titel und Text aus bedarf.json", () => {
    const fall = golden.faelle.find((f) => f.erwartet.gruende.length > 1);
    expect(fall).toBeDefined();
    const result = classifyBedarf(fall!.input, content.bedarf);
    expect(result.gruende.length).toBeGreaterThan(1);
    for (const g of result.gruende) {
      expect(g.titel.length).toBeGreaterThan(0);
      expect(g.text.length).toBeGreaterThan(0);
    }
  });
});

/**
 * First-Match-Beweis (Kopfregel): Für den betreffenden Golden-Fall würden
 * mehrere Regeln zutreffen; der Test prüft, dass die späteren Regeln
 * tatsächlich getroffen hätten — die erste bleibt jedoch die Kopfregel.
 */
describe("classifyBedarf — First-Match (Reihenfolge ist verbindlich)", () => {
  const fall = golden.faelle.find((f) => f.haetten_ebenfalls_getroffen);
  it("spätere Regeln träfen ebenfalls zu, gewinnen aber nicht als Kopfregel", () => {
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
    // Kopfregel ist trotzdem die erste.
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
