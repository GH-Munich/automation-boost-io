import { describe, expect, it } from "vitest";

import { assess, type AssessInput } from "../index.js";
import { loadContent } from "../content-loader.js";

const content = loadContent();

/**
 * Ein Assessment, das alle acht Engine-Teile berührt — die vollständige Engine.
 */
const eingabe: AssessInput = {
  score: {
    A1: "A1.2",
    A2: "A2.1",
    A3: "A3.X",
    A4: "A4.2",
    A5: "A5.1",
    A6: "A6.0",
  },
  bedarf: {
    F1: "ausfuehrung",
    F2: "meist",
    F3: "kaum",
    F4: "teilweise",
    F5: "ja",
    F6: "aufwaendig",
    F7: 1200,
  },
  pricing: {
    gelieferteKlasse: "chatbot_rag",
    volumenJahr: 24000,
    betriebsfaktor: { min: 3, max: 5 },
    kursUsdEur: 0.9,
    angebotspreisJahrEur: 60000,
    benoetigteKlasse: "skript_rpa",
  },
  tco: { angebotspreis: 15000, preistyp: "pilot", laufzeitMonate: 6 },
  muster: {
    freitext: "Voicebot für die Anrufannahme in der Telefonie, Support-Tickets",
  },
  schnelltest: {
    S1: "weiss_nicht",
    S2: "ja",
    S3: "keine",
    S4: "nein",
    S5: "bekannt",
  },
};

describe("Determinismus (G1) — die zentrale Produkteigenschaft", () => {
  it("liefert bei 100 Durchläufen bitgleich dasselbe Ergebnis", () => {
    const referenz = JSON.stringify(assess(content, eingabe));
    for (let i = 0; i < 100; i++) {
      const lauf = JSON.stringify(assess(content, eingabe));
      expect(lauf).toBe(referenz);
    }
  });

  it("berührt tatsächlich alle Engine-Teile", () => {
    const result = assess(content, eingabe);
    expect(result.score).toBeDefined();
    expect(result.bedarf).toBeDefined();
    expect(result.pricing).toBeDefined();
    expect(result.tco).toBeDefined();
    expect(result.muster).toBeDefined();
    expect(result.schnelltest).toBeDefined();
    expect(result.protokoll).toBeDefined();
  });
});

describe("buildProtokoll — Prüfprotokoll (G1/G2)", () => {
  it("enthält Standard-Version, gesammelte Regel-IDs und keine Zeitstempel", () => {
    const { protokoll } = assess(content, eingabe);

    expect(protokoll.standardVersion).toBe(content.standardVersion);

    // Regel-IDs sind sortiert und dedupliziert.
    const sortiert = [...protokoll.regelIds].sort((a, b) => a.localeCompare(b));
    expect(protokoll.regelIds).toEqual(sortiert);
    expect(new Set(protokoll.regelIds).size).toBe(protokoll.regelIds.length);

    // Es sind Regel-IDs aus mehreren Bereichen enthalten.
    expect(protokoll.regelIds).toContain("A1.2");
    expect(protokoll.regelIds.some((id) => id.startsWith("P"))).toBe(true);
    expect(protokoll.regelIds.some((id) => id.startsWith("T"))).toBe(true);

    // Kein Zeitstempel in der Bewertungslogik.
    const serialisiert = JSON.stringify(protokoll);
    expect(serialisiert).not.toMatch(/timestamp|zeitstempel|"date"|createdAt/i);
  });

  it("ist stabil (bitgleich) über zwei Durchläufe", () => {
    const a = JSON.stringify(assess(content, eingabe).protokoll);
    const b = JSON.stringify(assess(content, eingabe).protokoll);
    expect(a).toBe(b);
  });
});
