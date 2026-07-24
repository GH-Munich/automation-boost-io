"use client";

import { useState } from "react";

import type {
  AchsenContent,
  BerichtstexteContent,
  PreislogikContent,
  ScoreResult,
  TcoContent,
} from "@engine/types";
import { PreisCheck } from "./PreisCheck";
import { Wizard } from "./Wizard";

/**
 * Orchestriert den Tür-A-Kernpfad: Achsen-Wizard → Preis-Check. Der
 * Agentik-Score bestimmt nach Regel P1 die gelieferte Kostenklasse, die als
 * Vorgabe in den Preis-Check übernommen wird (und dort änderbar bleibt).
 */
export function Assessment({
  achsen,
  preislogik,
  tco,
  berichtstexte,
  defaults,
  tuer = "A",
}: {
  achsen: AchsenContent;
  preislogik: PreislogikContent;
  tco: TcoContent;
  berichtstexte: BerichtstexteContent;
  defaults: { volumenJahr: number; angebotJahr: number };
  tuer?: string;
}) {
  const [phase, setPhase] = useState<"achsen" | "preis">("achsen");
  const [score, setScore] = useState<ScoreResult | null>(null);

  function toPreis(result: ScoreResult) {
    setScore(result);
    setPhase("preis");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (phase === "preis" && score) {
    // Band → Kostenklasse (P1). Bei vorläufigem Band die höhere Klasse als
    // Vorgabe (konservativ), Nutzer kann sie im Preis-Check anpassen.
    const baender = achsen.auswertung.baender;
    const band = score.band
      ? baender.find((b) => b.id === score.band)
      : baender.find((b) => score.scoreMax >= b.von && score.scoreMax <= b.bis);
    const fallbackKlasse =
      preislogik.kostenklassen[preislogik.kostenklassen.length - 1]?.id ?? "";
    const deliveredDefault = band?.kostenklasse ?? fallbackKlasse;

    return (
      <PreisCheck
        preislogik={preislogik}
        tco={tco}
        berichtstexte={berichtstexte}
        deliveredDefault={deliveredDefault}
        vorlaeufig={score.band === null}
        defaults={defaults}
        tuer={tuer}
        onBack={() => setPhase("achsen")}
      />
    );
  }

  return (
    <Wizard
      achsen={achsen}
      berichtstexte={berichtstexte}
      onContinue={toPreis}
      tuer={tuer}
    />
  );
}
