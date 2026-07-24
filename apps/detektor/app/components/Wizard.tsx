"use client";

import { useMemo, useState } from "react";

import { calculateScore } from "@engine/scoring";
import type { AchseId, AchsenContent, Band, ScoreInput } from "@engine/types";

/**
 * Achsen-Wizard (Tür A, Kernpfad). Eine Frage pro Karte, Antippen, „Weiß ich
 * nicht" überall, Live-Vorschau von Score und Band. Die Bewertung macht
 * ausschließlich die reine Engine-Funktion calculateScore — kein Ermessen hier.
 *
 * Live-Logik: noch nicht beantwortete Achsen werden für die Vorschau als
 * „Weiß nicht" (.X) behandelt. So zeigt die Bandbreite (G5) von Anfang an eine
 * ehrliche Spanne, die sich mit jeder Antwort verengt.
 */
export function Wizard({ achsen }: { achsen: AchsenContent }) {
  const axes = achsen.achsen;
  const baender = achsen.auswertung.baender;

  const [answers, setAnswers] = useState<Partial<Record<AchseId, string>>>({});
  const [idx, setIdx] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const axis = axes[idx]!;
  const answeredCount = axes.filter((a) => answers[a.id] !== undefined).length;

  const fullInput = useMemo<ScoreInput>(() => {
    const out = {} as ScoreInput;
    for (const a of axes) out[a.id] = answers[a.id] ?? a.weiss_nicht.regel_id;
    return out;
  }, [answers, axes]);

  const result = useMemo(() => calculateScore(fullInput, achsen), [fullInput, achsen]);

  function bandFor(score: number): Band | undefined {
    return baender.find((b) => score >= b.von && score <= b.bis);
  }

  function choose(regelId: string) {
    setAnswers((prev) => ({ ...prev, [axis.id]: regelId }));
  }

  function next() {
    if (idx < axes.length - 1) setIdx(idx + 1);
    else setShowResult(true);
  }

  function reset() {
    setAnswers({});
    setIdx(0);
    setShowResult(false);
  }

  const scoreLabel =
    result.scoreMin === result.scoreMax
      ? `${result.scoreMin}`
      : `${result.scoreMin}–${result.scoreMax}`;

  if (showResult) {
    return (
      <ResultView
        achsen={achsen}
        result={result}
        scoreLabel={scoreLabel}
        bandFor={bandFor}
        onBack={() => setShowResult(false)}
        onReset={reset}
      />
    );
  }

  const selected = answers[axis.id];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      {/* Frage-Karte */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-xs bg-accent-weak px-2.5 py-1 font-mono text-[11px] uppercase tracking-[.1em] text-accent">
            Tür A · Achsen-Prüfung
          </span>
          <span className="font-mono text-[12px] text-ink-3">≈ 12–15 Min.</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            {axes.map((a, i) => (
              <span
                key={a.id}
                className={`block h-1 w-6 rounded-full ${
                  i === idx
                    ? "bg-accent ring-4 ring-accent-weak"
                    : answers[a.id] !== undefined
                      ? "bg-accent"
                      : "bg-surface-3"
                }`}
              />
            ))}
          </span>
          <span className="font-mono text-[12.5px] text-ink-2">
            Frage {idx + 1} von {axes.length}
          </span>
        </div>

        <h1 className="balance mt-4 text-[clamp(18px,2.4vw,22px)] font-semibold leading-[1.35] tracking-[-.01em]">
          {axis.wizard_frage}
        </h1>
        {axis.hinweis && (
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{axis.hinweis}</p>
        )}

        <div className="mt-5 flex flex-col gap-2.5">
          {axis.stufen.map((stufe) => (
            <Option
              key={stufe.regel_id}
              label={stufe.wizard_option}
              active={selected === stufe.regel_id}
              onClick={() => choose(stufe.regel_id)}
            />
          ))}
          <Option
            label={axis.weiss_nicht.wizard_option}
            active={selected === axis.weiss_nicht.regel_id}
            onClick={() => choose(axis.weiss_nicht.regel_id)}
            dashed
          />
        </div>

        <details className="mt-4 border-t border-line pt-3.5">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[13px] font-medium text-accent [&::-webkit-details-marker]:hidden">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
            Mehr dazu · {axis.demo_test.titel}
          </summary>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{axis.demo_test.text}</p>
        </details>

        <div className="mt-6 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIdx(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="rounded-sm border border-line-strong bg-surface px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Zurück
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-sm border border-accent bg-accent px-4 py-2.5 text-[14px] font-semibold text-accent-on transition-colors hover:bg-accent-2"
          >
            {idx < axes.length - 1 ? "Weiter" : "Ergebnis ansehen"}
          </button>
          <span className="ml-auto font-mono text-[12px] text-ink-3">
            {answeredCount}/{axes.length} beantwortet
          </span>
        </div>
      </section>

      {/* Live-Panel */}
      <aside className="h-fit rounded-md border border-line bg-surface-2 p-6 shadow-sm">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Live-Vorschau</p>
        <div className="mt-3 flex items-baseline gap-2">
          <b className="font-mono text-[44px] font-semibold leading-none tracking-[-.02em] tnum">{scoreLabel}</b>
          <span className="font-mono text-[18px] text-ink-3">/ 12</span>
        </div>

        {result.band ? (
          <span className="mt-3 inline-flex items-center gap-2 self-start rounded-full border border-accent/30 bg-accent-weak px-3 py-1.5 text-[13px] font-semibold text-accent">
            {result.band} · {result.einstufung}
          </span>
        ) : (
          <span className="mt-3 inline-flex items-center gap-2 self-start rounded-full border border-line-strong bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-2">
            Vorläufig · {bandFor(result.scoreMin)?.id} bis {bandFor(result.scoreMax)?.id}
          </span>
        )}

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
          <span
            className="block h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${(answeredCount / axes.length) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[12.5px]">
          <span className="text-ink-2">{answeredCount} von {axes.length} Fragen beantwortet</span>
          <span className="font-mono text-ink-3">{Math.round((answeredCount / axes.length) * 100)} %</span>
        </div>

        {result.nichtBewertbar.length > 0 && (
          <p className="mt-4 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-2">
            {result.nichtBewertbar.length} von {axes.length} Angaben noch offen — die Spanne
            verengt sich mit jeder Antwort.
          </p>
        )}
      </aside>
    </div>
  );
}

function Option({
  label,
  active,
  onClick,
  dashed,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dashed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-start gap-3 rounded-sm border px-4 py-3 text-left text-[14.5px] leading-snug transition-colors ${
        active
          ? "border-accent bg-accent-weak shadow-[inset_0_0_0_1px_var(--accent)]"
          : dashed
            ? "border-dashed border-line-strong text-ink-2 hover:bg-surface-2"
            : "border-line hover:border-line-strong hover:bg-surface-2"
      }`}
    >
      <span
        className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full border ${
          active ? "border-accent bg-accent text-accent-on" : "border-line-strong text-transparent"
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 6" />
        </svg>
      </span>
      <span>{label}</span>
    </button>
  );
}

function ResultView({
  achsen,
  result,
  scoreLabel,
  bandFor,
  onBack,
  onReset,
}: {
  achsen: AchsenContent;
  result: ReturnType<typeof calculateScore>;
  scoreLabel: string;
  bandFor: (score: number) => Band | undefined;
  onBack: () => void;
  onReset: () => void;
}) {
  const axisName = (id: AchseId) => achsen.achsen.find((a) => a.id === id)?.name ?? id;
  const bandMin = bandFor(result.scoreMin);
  const bandMax = bandFor(result.scoreMax);

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Ergebnis · Management-Summary
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">Agentik-Score</p>
            <div className="mt-1 flex items-baseline gap-2">
              <b className="font-mono text-[48px] font-semibold leading-none tracking-[-.02em] tnum">{scoreLabel}</b>
              <span className="font-mono text-[20px] text-ink-3">/ 12</span>
            </div>
          </div>
          <div className="flex-1">
            {result.band ? (
              <>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-weak px-3 py-1.5 text-[14px] font-semibold text-accent">
                  {result.band} — {result.einstufung}
                </span>
                <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-ink-2">{result.konsequenz}</p>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-3 py-1.5 text-[14px] font-semibold text-ink">
                  Vorläufig — Band {bandMin?.id} bis {bandMax?.id}
                </span>
                <p className="mt-3 max-w-[54ch] text-[14px] leading-relaxed text-ink-2">
                  Der Score liegt zwischen <b className="text-ink">{bandMin?.einstufung}</b> und{" "}
                  <b className="text-ink">{bandMax?.einstufung}</b>. Eine eindeutige Einstufung ist
                  erst möglich, wenn die offenen Angaben geklärt sind.
                </p>
              </>
            )}
          </div>
        </div>

        {result.nichtBewertbar.length > 0 && (
          <p className="mt-6 rounded-sm border border-line bg-surface-2 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
            <b className="text-ink">Transparenzlücke.</b>{" "}
            {result.nichtBewertbar.length} von {achsen.achsen.length} Kernangaben sind nicht
            bekannt oder wurden nicht gezeigt ({result.nichtBewertbar.map(axisName).join(", ")}).
            Das ist ein Befund, keine Null.
          </p>
        )}
      </section>

      {/* Begründungsspur (G2) */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Begründung je Achse
        </p>
        <ul className="mt-3 divide-y divide-line">
          {result.begruendung.map((b) => (
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
      </section>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="rounded-sm border border-line-strong bg-surface px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-surface-2"
        >
          Zurück zur Prüfung
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-sm px-4 py-2.5 text-[14px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          Neu starten
        </button>
      </div>
    </div>
  );
}
