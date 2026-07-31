/**
 * pricing.ts — Preiskorridor und Washing-Faktor (Engine-Funktion 4).
 *
 * Berechnet den fairen Jahreskorridor (P2), den Washing-Faktor (P3) und den
 * Überdimensionierungs-Befund (P4). Reine Funktion (G1). Alle Werte
 * (Vorgangskosten, Betriebsfaktor, Kurs, Ampel-Schwellen) stammen aus
 * preislogik.json.
 *
 * Formel (Übergabe §2.2):
 *   Untergrenze = vorgangskosten.min × volumen × betriebsfaktor.min
 *   Obergrenze  = vorgangskosten.max × volumen × betriebsfaktor.max
 *   Umrechnung  × kurs (USD → EUR)
 *   Washing-Faktor = angebotspreis / korridorObergrenzeEur
 *   Überdimensionierung, wenn ordnung(benoetigt) < ordnung(geliefert)
 */

import type {
  Ampel,
  BegruendungsZeile,
  Komplexitaet,
  Kostenklasse,
  PreislogikContent,
  PriceInput,
  PriceResult,
} from "./types.js";

/** Deterministisches Runden auf n Nachkommastellen. */
function runde(x: number, n: number): number {
  const faktor = 10 ** n;
  return Math.round(x * faktor) / faktor;
}

/**
 * Wählt das Kosten-Teilband nach Komplexität (③): ein Drittel des
 * Klassen-Korridors. Geometrische Drittel (Ratio^(1/3)); bei min = 0
 * (Klasse 1 „Skript/RPA") lineare Drittel, da geometrisch undefiniert.
 * Reine Funktion — nutzt nur die vorhandenen Klassen-Grenzen, keine neuen Werte.
 */
function komplexitaetsBand(
  kosten: { min: number; max: number },
  grad: Komplexitaet,
): { min: number; max: number } {
  const { min, max } = kosten;
  if (min <= 0) {
    const drittel = (max - min) / 3;
    if (grad === "einfach") return { min, max: min + drittel };
    if (grad === "mittel")
      return { min: min + drittel, max: min + 2 * drittel };
    return { min: min + 2 * drittel, max };
  }
  const r = Math.pow(max / min, 1 / 3);
  if (grad === "einfach") return { min, max: min * r };
  if (grad === "mittel") return { min: min * r, max: min * r * r };
  return { min: min * r * r, max };
}

/** Ordnet den Washing-Faktor einer Ampelstufe zu (Schwellen aus JSON). */
function ampelFuer(
  washingFaktor: number,
  ampel: PreislogikContent["washing_faktor"]["ampel"],
): { stufe: Ampel; text: string } {
  const gruen = ampel.find((a) => a.stufe === "gruen");
  const gelb = ampel.find((a) => a.stufe === "gelb");
  const rot = ampel.find((a) => a.stufe === "rot");

  if (!gruen || !gelb || !rot) {
    throw new Error(
      "AWD-Pricing: Ampel-Schwellen (gruen/gelb/rot) fehlen in preislogik.json.",
    );
  }

  // grün: wf ≤ gruen.bis · gelb: gruen.bis < wf < gelb.bis · rot: wf ≥ gelb.bis
  // Faktor 10 zählt bereits als Washing (Gartner 10–50) → rot ab 10,0 (B1).
  if (gruen.bis !== undefined && washingFaktor <= gruen.bis) {
    return { stufe: "gruen", text: gruen.text };
  }
  if (gelb.bis !== undefined && washingFaktor < gelb.bis) {
    return { stufe: "gelb", text: gelb.text };
  }
  return { stufe: "rot", text: rot.text };
}

function findeKostenklasse(
  preislogik: PreislogikContent,
  id: string,
): Kostenklasse {
  const klasse = preislogik.kostenklassen.find((k) => k.id === id);
  if (!klasse) {
    throw new Error(
      `AWD-Pricing: Unbekannte Kostenklasse "${id}". ` +
        `Bekannt: ${preislogik.kostenklassen.map((k) => k.id).join(", ")}.`,
    );
  }
  return klasse;
}

/**
 * Berechnet Preiskorridor, Washing-Faktor und ggf. Überdimensionierung.
 *
 * @param input Gelieferte Klasse, Jahresvolumen, Angebotspreis; optional
 *   Betriebsfaktor, Kurs und benötigte Klasse (Vorgaben aus preislogik.json).
 * @param preislogik Inhalt aus preislogik.json.
 */
export function calculatePriceCorridor(
  input: PriceInput,
  preislogik: PreislogikContent,
): PriceResult {
  const geliefert = findeKostenklasse(preislogik, input.gelieferteKlasse);
  // ③ Komplexität wählt (falls gesetzt) das Teilband des Klassen-Korridors.
  const kosten = input.komplexitaet
    ? komplexitaetsBand(geliefert.vorgangskosten_usd, input.komplexitaet)
    : geliefert.vorgangskosten_usd;

  const betriebsfaktor = input.betriebsfaktor ?? {
    min: preislogik.betriebsfaktor.min,
    max: preislogik.betriebsfaktor.max,
  };
  const kurs = input.kursUsdEur ?? preislogik.kurs.usd_eur;

  // Korridor in USD, dann Umrechnung in EUR.
  const usdMin = kosten.min * input.volumenJahr * betriebsfaktor.min;
  const usdMax = kosten.max * input.volumenJahr * betriebsfaktor.max;
  const eurMin = usdMin * kurs;
  const eurMax = usdMax * kurs;

  const korridorUsd = { min: runde(usdMin, 2), max: runde(usdMax, 2) };
  const korridorEur = { min: runde(eurMin, 2), max: runde(eurMax, 2) };

  // Fixkosten-Sockel je Klasse (P5): additiver Grundpreis für Einrichtung,
  // Betrieb, Support und Wartung. Fairer Gesamtrahmen = Sockel + Nutzungskorridor.
  const sockelEur = geliefert.sockel_eur;
  const korridorGesamtEur = {
    min: runde(korridorEur.min + sockelEur, 2),
    max: runde(korridorEur.max + sockelEur, 2),
  };

  // Preis-Aufschlag = Angebotspreis / Gesamtrahmen-Obergrenze (P3, Ampel-Basis).
  // Der Faktor wird aus dem ANGEZEIGTEN (auf 2 NK gerundeten) Korridorwert
  // berechnet und die Ampel auf demselben gerundeten Faktor entschieden — so
  // widersprechen gezeigte Zahl, Begründungsspur und Urteil nie an den Grenzen
  // (A1). Grenzsemantik B1: grün ≤ 2,0 · gelb < 10,0 · rot ≥ 10,0.
  const washingFaktor =
    korridorGesamtEur.max > 0
      ? runde(input.angebotspreisJahrEur / korridorGesamtEur.max, 1)
      : Infinity;
  // Zusätzlicher Klartext-Wert: Aufschlag gegen die reinen Technik-Rohkosten.
  const washingFaktorTechnik =
    korridorEur.max > 0
      ? runde(input.angebotspreisJahrEur / korridorEur.max, 1)
      : Infinity;
  const { stufe, text } = ampelFuer(
    washingFaktor,
    preislogik.washing_faktor.ampel,
  );

  // Überdimensionierung (P4): benötigte Klasse liegt unter der gelieferten.
  let ueberdimensionierung: PriceResult["ueberdimensionierung"] = null;
  if (input.benoetigteKlasse) {
    const benoetigt = findeKostenklasse(preislogik, input.benoetigteKlasse);
    if (benoetigt.ordnung < geliefert.ordnung) {
      ueberdimensionierung = {
        befund: preislogik.ueberdimensionierung.befund,
        benoetigteKlasse: benoetigt.id,
        gelieferteKlasse: geliefert.id,
      };
    }
  }

  const begruendung: BegruendungsZeile[] = [
    {
      regelId: "P1",
      eingabe: `Referenzklasse: ${geliefert.id} (${geliefert.name})`,
      hinweis: preislogik.regeln.P1,
    },
    {
      regelId: "P2",
      eingabe: `${geliefert.anzeige} × ${input.volumenJahr} Vorgänge × Faktor ${betriebsfaktor.min}–${betriebsfaktor.max}, Kurs ${kurs}`,
      hinweis: `Nutzungskorridor (Technik): ${korridorEur.min}–${korridorEur.max} EUR/Jahr`,
    },
    {
      regelId: "P5",
      eingabe: `+ Fixkosten-Sockel ${sockelEur} EUR`,
      hinweis: `Fairer Gesamtrahmen: ${korridorGesamtEur.min}–${korridorGesamtEur.max} EUR/Jahr`,
    },
    {
      regelId: "P3",
      eingabe: `${input.angebotspreisJahrEur} EUR ÷ ${korridorGesamtEur.max} EUR`,
      punkte: washingFaktor,
      hinweis: `Preis-Aufschlag ${washingFaktor}× → ${stufe} (vs. reine Technik: ${washingFaktorTechnik}×)`,
    },
  ];
  if (ueberdimensionierung) {
    begruendung.push({
      regelId: "P4",
      eingabe: `benötigt ${ueberdimensionierung.benoetigteKlasse} < geliefert ${ueberdimensionierung.gelieferteKlasse}`,
      hinweis: preislogik.ueberdimensionierung.befund,
    });
  }

  return {
    gelieferteKlasse: geliefert.id,
    korridorUsd,
    korridorEur,
    sockelEur,
    korridorGesamtEur,
    washingFaktor,
    washingFaktorTechnik,
    ampel: stufe,
    ampelText: text,
    ueberdimensionierung,
    annahmen: {
      vorgangskostenUsd: { min: kosten.min, max: kosten.max },
      betriebsfaktor,
      kursUsdEur: kurs,
    },
    begruendung,
  };
}
