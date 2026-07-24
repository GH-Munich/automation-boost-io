"use client";

import { useState } from "react";

import type {
  AchsenContent,
  BerichtstexteContent,
  PreislogikContent,
  PriceInput,
  ScoreInput,
  ScoreResult,
  TcoContent,
} from "@engine/types";
import { Bericht } from "./Bericht";
import { PreisCheck } from "./PreisCheck";
import { Wizard } from "./Wizard";

/**
 * Orchestriert den Tür-A-Kernpfad: Achsen-Wizard → Preis-Check → Prüfbericht.
 * Der Agentik-Score bestimmt nach Regel P1 die gelieferte Kostenklasse, die als
 * Vorgabe in den Preis-Check übernommen wird (und dort änderbar bleibt). Der
 * Bericht führt Score, Preis und Begründung über dieselbe Engine zusammen.
 */
export function Assessment({
  achsen,
  preislogik,
  tco,
  berichtstexte,
  standardVersion,
  defaults,
  tuer = "A",
}: {
  achsen: AchsenContent;
  preislogik: PreislogikContent;
  tco: TcoContent;
  berichtstexte: BerichtstexteContent;
  standardVersion: string;
  defaults: { volumenJahr: number; angebotJahr: number };
  tuer?: string;
}) {
  const [phase, setPhase] = useState<"achsen" | "preis" | "bericht">("achsen");
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [scoreInput, setScoreInput] = useState<ScoreInput | null>(null);
  const [priceInput, setPriceInput] = useState<PriceInput | null>(null);

  function nachOben() {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toPreis(input: ScoreInput, result: ScoreResult) {
    setScoreInput(input);
    setScore(result);
    setPhase("preis");
    nachOben();
  }
  function toBericht(input: PriceInput) {
    setPriceInput(input);
    setPhase("bericht");
    nachOben();
  }

  if (phase === "bericht" && scoreInput && priceInput) {
    return (
      <Bericht
        achsen={achsen}
        preislogik={preislogik}
        berichtstexte={berichtstexte}
        standardVersion={standardVersion}
        scoreInput={scoreInput}
        priceInput={priceInput}
        tuer={tuer}
        onBack={() => {
          setPhase("preis");
          nachOben();
        }}
      />
    );
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
        onBericht={toBericht}
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
