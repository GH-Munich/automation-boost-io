/**
 * nutzen.ts — Nutzen-Schnellcheck (Amortisation als Größenordnung).
 *
 * Reine Funktion (G1). Rechnet ausschließlich die belastbaren, harten Nutzen
 * (Zeitersparnis + vermiedene Nacharbeit) gegen die Investition. Die
 * strategischen Potenziale (Opportunität: freigewordene Zeit, Erreichbarkeit,
 * Kundenzufriedenheit) werden BEWUSST NICHT beziffert — sie sind reiner
 * Anzeige-Inhalt (nutzen.json.strategische_potenziale) und Anlass fürs
 * Beratungsgespräch. Alle Werte und Ampel-Schwellen stammen aus nutzen.json.
 *
 * Nur Größenordnung/Orientierung (G6), keine Einkaufskalkulation.
 */

import type {
  Ampel,
  BegruendungsZeile,
  NutzenContent,
  NutzenInput,
  NutzenResult,
} from "./types.js";

/** Deterministisches Runden auf n Nachkommastellen. */
function runde(x: number, n: number): number {
  const faktor = 10 ** n;
  return Math.round(x * faktor) / faktor;
}

/** Ordnet die Amortisationsdauer (Monate) einer Ampelstufe zu (Schwellen aus JSON). */
function ampelFuer(
  monate: number | null,
  ampel: NutzenContent["amortisation"]["ampel"],
): { stufe: Ampel; text: string } {
  const gruen = ampel.find((a) => a.stufe === "gruen");
  const gelb = ampel.find((a) => a.stufe === "gelb");
  const rot = ampel.find((a) => a.stufe === "rot");
  if (!gruen || !gelb || !rot) {
    throw new Error(
      "AWD-Nutzen: Ampel-Schwellen (gruen/gelb/rot) fehlen in nutzen.json.",
    );
  }
  // Kein bezifferbarer Nutzen (kein Payback) → rot.
  if (monate === null) return { stufe: "rot", text: rot.text };
  // Kleiner ist besser: grün ≤ bis_monate · gelb ≤ bis_monate · sonst rot.
  if (gruen.bis_monate !== undefined && monate <= gruen.bis_monate) {
    return { stufe: "gruen", text: gruen.text };
  }
  if (gelb.bis_monate !== undefined && monate <= gelb.bis_monate) {
    return { stufe: "gelb", text: gelb.text };
  }
  return { stufe: "rot", text: rot.text };
}

/**
 * Berechnet den groben jährlichen Nutzen und die Amortisation.
 *
 * @param input Vorgänge, Zeitersparnis, vermiedene Nacharbeit, Stundensatz, Investition.
 * @param nutzen Inhalt aus nutzen.json (Ampel-Schwellen).
 */
export function calculateNutzen(
  input: NutzenInput,
  nutzen: NutzenContent,
): NutzenResult {
  const stundenAusZeit = (input.vorgaengeJahr * input.zeitersparnisMinuten) / 60;
  const eingesparteStundenJahr = runde(
    stundenAusZeit + input.nacharbeitStundenJahr,
    1,
  );
  const jahresnutzenEur = runde(eingesparteStundenJahr * input.stundensatzEur, 0);

  const amortisationMonate =
    jahresnutzenEur > 0
      ? runde((input.investitionEur / jahresnutzenEur) * 12, 1)
      : null;

  const { stufe, text } = ampelFuer(amortisationMonate, nutzen.amortisation.ampel);

  const begruendung: BegruendungsZeile[] = [
    {
      regelId: "N-Zeit",
      eingabe: `${input.vorgaengeJahr} Vorgänge × ${input.zeitersparnisMinuten} Min ÷ 60 + ${input.nacharbeitStundenJahr} Std Nacharbeit`,
      hinweis: `${eingesparteStundenJahr} Std/Jahr eingespart`,
    },
    {
      regelId: "N-Nutzen",
      eingabe: `${eingesparteStundenJahr} Std × ${input.stundensatzEur} €`,
      punkte: jahresnutzenEur,
      hinweis: `Grober Jahresnutzen: ${jahresnutzenEur} €`,
    },
    {
      regelId: "N-Amort",
      eingabe: `${input.investitionEur} € ÷ ${jahresnutzenEur} €/Jahr`,
      hinweis:
        amortisationMonate === null
          ? "Kein bezifferbarer Nutzen — keine Amortisation berechenbar."
          : `Amortisation ≈ ${amortisationMonate} Monate → ${stufe}`,
    },
  ];

  return {
    eingesparteStundenJahr,
    jahresnutzenEur,
    amortisationMonate,
    ampel: stufe,
    ampelText: text,
    annahmen: {
      vorgaengeJahr: input.vorgaengeJahr,
      zeitersparnisMinuten: input.zeitersparnisMinuten,
      nacharbeitStundenJahr: input.nacharbeitStundenJahr,
      stundensatzEur: input.stundensatzEur,
      investitionEur: input.investitionEur,
    },
    begruendung,
  };
}
