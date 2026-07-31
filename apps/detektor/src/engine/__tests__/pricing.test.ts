import { describe, expect, it } from "vitest";

import { loadContent } from "../content-loader.js";
import { calculatePriceCorridor } from "../pricing.js";
import type { PriceInput } from "../types.js";
import { loadGolden } from "./helpers.js";

interface PricingFall {
  name: string;
  input: PriceInput;
  erwartet: {
    korridorUsd?: { min: number; max: number };
    korridorEur: { min: number; max: number };
    sockelEur?: number;
    korridorGesamtEur?: { min: number; max: number };
    washingFaktor: number;
    washingFaktorTechnik?: number;
    ampel: string;
    ueberdimensionierung: boolean;
  };
}

const content = loadContent();
const golden = loadGolden<{ faelle: PricingFall[] }>("pricing.json");

describe("calculatePriceCorridor — Golden-Fälle", () => {
  for (const fall of golden.faelle) {
    it(fall.name, () => {
      const result = calculatePriceCorridor(fall.input, content.preislogik);
      if (fall.erwartet.korridorUsd) {
        expect(result.korridorUsd).toEqual(fall.erwartet.korridorUsd);
      }
      expect(result.korridorEur).toEqual(fall.erwartet.korridorEur);
      if (fall.erwartet.sockelEur !== undefined) {
        expect(result.sockelEur).toBe(fall.erwartet.sockelEur);
      }
      if (fall.erwartet.korridorGesamtEur) {
        expect(result.korridorGesamtEur).toEqual(
          fall.erwartet.korridorGesamtEur,
        );
      }
      expect(result.washingFaktor).toBe(fall.erwartet.washingFaktor);
      if (fall.erwartet.washingFaktorTechnik !== undefined) {
        expect(result.washingFaktorTechnik).toBe(
          fall.erwartet.washingFaktorTechnik,
        );
      }
      expect(result.ampel).toBe(fall.erwartet.ampel);
      expect(result.ueberdimensionierung !== null).toBe(
        fall.erwartet.ueberdimensionierung,
      );
    });
  }
});

describe("calculatePriceCorridor — Referenzfall stimmt mit preislogik.json überein", () => {
  it("engine-Ergebnis deckt sich mit beispiel_golden_test", () => {
    const ref = content.preislogik.beispiel_golden_test as {
      eingaben: {
        gelieferte_klasse: string;
        volumen_jahr: number;
        betriebsfaktor: [number, number];
        kurs_usd_eur: number;
        angebotspreis_jahr_eur: number;
      };
      erwartet: {
        korridor_usd_jahr: [number, number];
        korridor_eur_jahr: [number, number];
        sockel_eur: number;
        korridor_gesamt_eur_jahr: [number, number];
        washing_faktor: number;
        washing_faktor_technik: number;
        ampel: string;
      };
    };
    const e = ref.eingaben;
    const result = calculatePriceCorridor(
      {
        gelieferteKlasse: e.gelieferte_klasse,
        volumenJahr: e.volumen_jahr,
        betriebsfaktor: { min: e.betriebsfaktor[0], max: e.betriebsfaktor[1] },
        kursUsdEur: e.kurs_usd_eur,
        angebotspreisJahrEur: e.angebotspreis_jahr_eur,
      },
      content.preislogik,
    );
    expect(result.korridorUsd).toEqual({
      min: ref.erwartet.korridor_usd_jahr[0],
      max: ref.erwartet.korridor_usd_jahr[1],
    });
    expect(result.korridorEur).toEqual({
      min: ref.erwartet.korridor_eur_jahr[0],
      max: ref.erwartet.korridor_eur_jahr[1],
    });
    expect(result.sockelEur).toBe(ref.erwartet.sockel_eur);
    expect(result.korridorGesamtEur).toEqual({
      min: ref.erwartet.korridor_gesamt_eur_jahr[0],
      max: ref.erwartet.korridor_gesamt_eur_jahr[1],
    });
    expect(result.washingFaktor).toBe(ref.erwartet.washing_faktor);
    expect(result.washingFaktorTechnik).toBe(
      ref.erwartet.washing_faktor_technik,
    );
    expect(result.ampel).toBe(ref.erwartet.ampel);
  });
});
