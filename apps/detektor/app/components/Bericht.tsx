"use client";

import { useMemo } from "react";

import { buildProtokoll } from "@engine/protokoll";
import { calculatePriceCorridor } from "@engine/pricing";
import { calculateScore } from "@engine/scoring";
import type {
  AchseId,
  AchsenContent,
  Ampel,
  BerichtstexteContent,
  PriceInput,
  PreislogikContent,
  ScoreInput,
} from "@engine/types";
import { ComplianceNote } from "./ComplianceNote";

const AMPEL: Record<Ampel, string> = {
  gruen: "bg-ok-weak text-ok",
  gelb: "bg-warn-weak text-warn",
  rot: "bg-bad-weak text-bad",
};

/** Ersetzt {schluessel}-Platzhalter in einem Klauseltext, ohne ihn umzuformulieren. */
function fuelle(text: string, werte: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (t, k: string) => (k in werte ? werte[k]! : t));
}

export function Bericht({
  achsen,
  preislogik,
  berichtstexte,
  standardVersion,
  scoreInput,
  priceInput,
  tuer,
  onBack,
}: {
  achsen: AchsenContent;
  preislogik: PreislogikContent;
  berichtstexte: BerichtstexteContent;
  standardVersion: string;
  scoreInput: ScoreInput;
  priceInput: PriceInput;
  tuer: string;
  onBack: () => void;
}) {
  const score = useMemo(() => calculateScore(scoreInput, achsen), [scoreInput, achsen]);
  const price = useMemo(
    () => calculatePriceCorridor(priceInput, preislogik),
    [priceInput, preislogik],
  );
  const protokoll = useMemo(
    () =>
      buildProtokoll(
        {
          score: { input: scoreInput, result: score },
          pricing: { input: priceInput, result: price },
        },
        standardVersion,
      ),
    [scoreInput, score, priceInput, price, standardVersion],
  );

  const preisNk = preislogik.anzeige?.preis_nachkommastellen ?? 0;
  const faktorNk = preislogik.anzeige?.faktor_nachkommastellen ?? 1;
  const eur = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: preisNk,
  });
  const faktor = (n: number) =>
    n.toLocaleString("de-DE", { minimumFractionDigits: faktorNk, maximumFractionDigits: faktorNk });

  const baender = achsen.auswertung.baender;
  const maxScore = achsen.achsen.reduce(
    (s, a) => s + Math.max(...a.stufen.map((st) => st.punkte)),
    0,
  );
  const bandFor = (n: number) => baender.find((b) => n >= b.von && n <= b.bis);
  const scoreLabel =
    score.scoreMin === score.scoreMax
      ? `${score.scoreMin}`
      : `${score.scoreMin}–${score.scoreMax}`;
  const axisName = (id: AchseId) => achsen.achsen.find((a) => a.id === id)?.name ?? id;
  const empfehlung = score.band ? berichtstexte.handlungsempfehlungen[score.band] : null;
  const ampelLabel =
    preislogik.washing_faktor.ampel.find((a) => a.stufe === price.ampel)?.label ?? "";

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Tür {tuer} · Prüfbericht · AWD-Prüfstandard {standardVersion}
        </p>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="rounded-sm border border-line-strong bg-surface px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-surface-2"
          >
            ← Zurück
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-sm border border-accent bg-accent px-3.5 py-2 text-[13px] font-semibold text-accent-on transition-colors hover:bg-accent-2"
          >
            Drucken / als PDF sichern
          </button>
        </div>
      </div>

      {/* Management-Summary */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Management-Summary
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">Agentik-Score</p>
            <div className="mt-1 flex items-baseline gap-2">
              <b className="font-mono text-[40px] font-semibold leading-none tracking-[-.02em] tnum">{scoreLabel}</b>
              <span className="font-mono text-[18px] text-ink-3">/ {maxScore}</span>
            </div>
            {score.band ? (
              <p className="mt-2 text-[14px] text-ink-2">
                <b className="text-ink">{score.band} — {score.einstufung}</b>
              </p>
            ) : (
              <p className="mt-2 text-[14px] text-ink-2">
                Vorläufig — Band {bandFor(score.scoreMin)?.id} bis {bandFor(score.scoreMax)?.id}
              </p>
            )}
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">Preis-Einordnung</p>
            <div className="mt-1 font-mono tnum">
              <b className="text-[22px] font-semibold">
                {eur.format(price.korridorEur.min)} – {eur.format(price.korridorEur.max)}
              </b>
              <span className="ml-1 text-[12px] text-ink-3">fairer Jahreskorridor</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="font-mono text-[24px] font-semibold tnum">{faktor(price.washingFaktor)}×</span>
              <span className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[12.5px] font-semibold ${AMPEL[price.ampel]}`}>
                <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
                {ampelLabel}
              </span>
            </div>
          </div>
        </div>

        {score.band && score.konsequenz && (
          <p className="mt-5 max-w-[70ch] text-[14px] leading-relaxed text-ink-2">{score.konsequenz}</p>
        )}
      </section>

      {/* Handlungsempfehlung */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Handlungsempfehlung</p>
        {empfehlung ? (
          <p className="mt-3 max-w-[74ch] text-[14px] leading-relaxed text-ink-2">{empfehlung}</p>
        ) : (
          <p className="mt-3 max-w-[74ch] text-[14px] leading-relaxed text-ink-2">
            Die Einstufung ist vorläufig (Band {bandFor(score.scoreMin)?.id} bis {bandFor(score.scoreMax)?.id}).
            Eine bandbezogene Handlungsempfehlung folgt, sobald die offenen Angaben geklärt sind.
          </p>
        )}
      </section>

      {/* Transparenzlücke */}
      {score.nichtBewertbar.length > 0 && (
        <section className="rounded-md border border-line bg-surface-2 p-6 shadow-sm sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Transparenzlücke</p>
          <p className="mt-3 max-w-[74ch] text-[13.5px] leading-relaxed text-ink-2">
            {fuelle(berichtstexte.bloecke.weiss_nicht_befund, {
              n: String(score.nichtBewertbar.length),
              m: String(achsen.achsen.length),
            })}
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-3">
            Betroffen: {score.nichtBewertbar.map(axisName).join(", ")}.
          </p>
        </section>
      )}

      {/* Begründungsspur */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Begründungsspur je Achse
        </p>
        <ul className="mt-3 divide-y divide-line">
          {score.begruendung.map((b) => (
            <li key={b.achse} className="flex items-start gap-4 py-3">
              <span className="w-28 flex-none">
                <span className="font-mono text-[11px] text-ink-3">{b.regelId}</span>
                <span className="block text-[13px] font-medium">{axisName(b.achse)}</span>
              </span>
              <span className="flex-1 text-[13.5px] leading-snug text-ink-2">{b.eingabe}</span>
              <span className="flex-none">
                {b.bewertbar ? (
                  <span className="font-mono text-[14px] font-semibold tnum">{b.punkte} P.</span>
                ) : (
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-3">
                    nicht bewertbar
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Preislogik</p>
        <ul className="mt-2 divide-y divide-line">
          {price.begruendung.map((b, i) => (
            <li key={i} className="flex items-start gap-4 py-2.5">
              <span className="w-10 flex-none font-mono text-[11px] text-ink-3">{b.regelId}</span>
              <span className="flex-1 text-[13px] leading-snug text-ink-2">
                {b.eingabe}
                {b.hinweis && <span className="mt-0.5 block text-[12px] text-ink-3">{b.hinweis}</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <ComplianceNote berichtstexte={berichtstexte} />

      {/* Angewandte Regeln + Fußzeile */}
      <section className="rounded-md border border-line bg-surface-2 p-6 sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Angewandte Regeln</p>
        <p className="mt-2 font-mono text-[12px] leading-relaxed text-ink-2">
          {protokoll.regelIds.join(" · ")}
        </p>
        <p className="mt-4 max-w-[74ch] text-[12px] leading-relaxed text-ink-3">
          {berichtstexte.bloecke.orientierungs_disclaimer}
        </p>
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-3">
          {fuelle(berichtstexte.bloecke.hash_fusszeile, {
            register_nr: "— (bei Finalisierung vergeben)",
            standard_version: standardVersion,
            hash: "— (Server-Finalisierung)",
            verify_url: "—",
          })}
        </p>
      </section>
    </div>
  );
}
