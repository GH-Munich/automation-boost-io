"use client";

import { useMemo, useState } from "react";

import { classifyBedarf } from "@engine/bedarf";
import type { BedarfContent, BedarfInput, BedarfKlasse } from "@engine/types";

type FrageOpt = { wert: string; text: string };
type Frage = {
  id: string;
  kurz: string;
  frage: string;
  optionen?: FrageOpt[];
  typ?: string;
  default?: number;
  min?: number;
  max?: number;
  hinweis?: string;
};
type FaktorVisual = {
  titel: string;
  skript_einmalig_eur: number;
  plattform_jahr_eur: number;
  text: string;
  quelle: string;
};

const eur0 = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function BedarfWizard({
  bedarf,
  frageIds,
}: {
  bedarf: BedarfContent;
  frageIds?: string[];
}) {
  const alle = bedarf.fragen as unknown as Frage[];
  const fragen = frageIds ? alle.filter((f) => frageIds.includes(f.id)) : alle;
  const f7 = alle.find((f) => f.id === "F7");

  const makeInitial = (): Record<string, string | number> =>
    f7?.default !== undefined ? { F7: f7.default } : {};

  const [answers, setAnswers] = useState<Record<string, string | number>>(makeInitial);
  const [idx, setIdx] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const frage = fragen[idx]!;
  const isZahl = frage.typ === "zahl";
  const current = answers[frage.id];
  const answeredCurrent = isZahl ? true : current !== undefined;

  function choose(wert: string) {
    setAnswers((p) => ({ ...p, [frage.id]: wert }));
  }
  function setZahl(n: number) {
    const min = frage.min ?? 0;
    const max = frage.max ?? Number.MAX_SAFE_INTEGER;
    setAnswers((p) => ({ ...p, [frage.id]: Math.min(max, Math.max(min, n)) }));
  }
  function reset() {
    setAnswers(makeInitial());
    setIdx(0);
    setShowResult(false);
  }

  if (showResult) {
    const input = {
      F1: answers.F1,
      F2: answers.F2,
      F3: answers.F3,
      F4: answers.F4,
      F5: answers.F5,
      F6: answers.F6,
      F7: typeof answers.F7 === "number" ? answers.F7 : undefined,
    } as BedarfInput;
    return <BedarfResult bedarf={bedarf} input={input} onReset={reset} onBack={() => setShowResult(false)} />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-xs bg-accent-weak px-2.5 py-1 font-mono text-[11px] uppercase tracking-[.1em] text-accent">
            Tür C · Bedarfs-Check
          </span>
          <span className="font-mono text-[12px] text-ink-3">≈ 5 Min.</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            {fragen.map((f, i) => (
              <span
                key={f.id}
                className={`block h-1 w-6 rounded-full ${
                  i === idx ? "bg-accent ring-4 ring-accent-weak" : answers[f.id] !== undefined ? "bg-accent" : "bg-surface-3"
                }`}
              />
            ))}
          </span>
          <span className="font-mono text-[12.5px] text-ink-2">
            Frage {idx + 1} von {fragen.length} · {frage.kurz}
          </span>
        </div>

        <h1 className="balance mt-4 text-[clamp(18px,2.4vw,22px)] font-semibold leading-[1.35] tracking-[-.01em]">
          {frage.frage}
        </h1>

        {isZahl ? (
          <div className="mt-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZahl((typeof current === "number" ? current : 0) - (frage.min && frage.min > 10 ? 50 : 10))}
                className="grid h-11 w-11 place-items-center rounded-sm border border-line-strong bg-surface text-[20px] hover:bg-surface-2"
                aria-label="Weniger"
              >
                −
              </button>
              <input
                type="number"
                min={frage.min}
                max={frage.max}
                value={typeof current === "number" ? current : ""}
                onChange={(e) => setZahl(Math.round(Number(e.target.value) || 0))}
                className="w-40 rounded-sm border border-line-strong bg-surface px-3 py-2.5 text-center font-mono text-[18px] text-ink tnum"
              />
              <button
                type="button"
                onClick={() => setZahl((typeof current === "number" ? current : 0) + (frage.min && frage.min > 10 ? 50 : 10))}
                className="grid h-11 w-11 place-items-center rounded-sm border border-line-strong bg-surface text-[20px] hover:bg-surface-2"
                aria-label="Mehr"
              >
                +
              </button>
              <span className="font-mono text-[13px] text-ink-3">/ Monat</span>
            </div>
            {frage.hinweis && <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{frage.hinweis}</p>}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2.5">
            {frage.optionen!.map((opt) => (
              <button
                key={opt.wert}
                type="button"
                onClick={() => choose(opt.wert)}
                aria-pressed={current === opt.wert}
                className={`flex w-full items-start gap-3 rounded-sm border px-4 py-3 text-left text-[14.5px] leading-snug transition-colors ${
                  current === opt.wert
                    ? "border-accent bg-accent-weak shadow-[inset_0_0_0_1px_var(--accent)]"
                    : opt.wert === "weiss_nicht"
                      ? "border-dashed border-line-strong text-ink-2 hover:bg-surface-2"
                      : "border-line hover:border-line-strong hover:bg-surface-2"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full border ${
                    current === opt.wert ? "border-accent bg-accent text-accent-on" : "border-line-strong text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 6" />
                  </svg>
                </span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
        )}

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
            onClick={() => (idx < fragen.length - 1 ? setIdx(idx + 1) : setShowResult(true))}
            disabled={!answeredCurrent}
            className="rounded-sm border border-accent bg-accent px-4 py-2.5 text-[14px] font-semibold text-accent-on transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {idx < fragen.length - 1 ? "Weiter" : "Ergebnis ansehen"}
          </button>
        </div>
      </section>

      <aside className="h-fit rounded-md border border-line bg-surface-2 p-6 shadow-sm">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Worum es geht</p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          Bevor ein Anbieter gewählt wird: Braucht dieser Prozess überhaupt agentische
          Automatisierung — oder genügt ein Skript, ein RAG-Assistent oder ein Workflow?
        </p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          Die Einordnung folgt festen Regeln (deterministisch) — gleiche Angaben, gleiches Ergebnis.
        </p>
      </aside>
    </div>
  );
}

function BedarfResult({
  bedarf,
  input,
  onReset,
  onBack,
}: {
  bedarf: BedarfContent;
  input: BedarfInput;
  onReset: () => void;
  onBack: () => void;
}) {
  const result = useMemo(() => classifyBedarf(input, bedarf), [input, bedarf]);
  const klasse = bedarf.klassen.find((k) => k.id === result.klasse) as BedarfKlasse | undefined;
  const fv = bedarf.faktor_visual as unknown as FaktorVisual;
  const istStopp = result.klasse === "N0";

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Ergebnis · Bedarfsklasse
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span
            className={`grid h-14 w-14 flex-none place-items-center rounded-md font-mono text-[20px] font-semibold ${
              istStopp ? "bg-warn-weak text-warn" : "bg-accent-weak text-accent"
            }`}
          >
            {result.klasse}
          </span>
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-.01em]">{result.name}</h1>
            {result.vorlaeufig && (
              <span className="mt-1 inline-block rounded-full bg-surface-2 px-2.5 py-0.5 text-[12px] font-medium text-ink-2">
                vorläufig — im Gespräch verifizieren
              </span>
            )}
          </div>
        </div>

        {result.klasseSpanne && (
          <div className="mt-5 rounded-sm border border-line-strong bg-surface-2 p-4">
            <p className="text-[14px] font-semibold text-ink">
              Vorläufige Bandbreite: {result.klasseSpanne.von} bis {result.klasseSpanne.bis}
            </p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
              Eine Ihrer Angaben ist noch unklar. Je nach Klärung liegt die Einordnung
              zwischen „{result.klasseSpanne.vonName}“ und „{result.klasseSpanne.bisName}“.
              Erst nach Klärung im Gespräch steht die endgültige Klasse fest.
            </p>
          </div>
        )}

        {istStopp && result.gruende.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {result.gruende.map((g) => (
              <div key={g.grund} className="rounded-sm border border-warn/30 bg-warn-weak/50 p-4">
                <p className="text-[14px] font-semibold text-ink">{g.titel}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{g.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-3 text-[13.5px] leading-relaxed text-ink-2">
            {klasse?.beschreibung && <p>{klasse.beschreibung}</p>}
            {klasse?.loesung && (
              <p>
                <span className="font-medium text-ink">Typische Lösung: </span>
                {klasse.loesung}
              </p>
            )}
            {klasse?.beispiel && (
              <p className="text-ink-3">
                <span className="font-medium">Beispiel: </span>
                {klasse.beispiel}
              </p>
            )}
          </div>
        )}

        {result.zusatzbefunde.length > 0 && (
          <ul className="mt-5 flex flex-col gap-2">
            {result.zusatzbefunde.map((b, i) => (
              <li key={i} className="rounded-sm border border-line bg-surface-2 px-4 py-2.5 text-[13px] leading-relaxed text-ink-2">
                {b}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Faktor-Visual */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">{fv.titel}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-sm border border-line bg-surface-2 p-4">
            <p className="text-[12.5px] text-ink-2">Skript / RPA</p>
            <p className="mt-1 font-mono text-[24px] font-semibold tnum">{eur0.format(fv.skript_einmalig_eur)}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-3">einmalig</p>
          </div>
          <div className="rounded-sm border border-line bg-surface-2 p-4">
            <p className="text-[12.5px] text-ink-2">Agentenplattform</p>
            <p className="mt-1 font-mono text-[24px] font-semibold tnum">{eur0.format(fv.plattform_jahr_eur)}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-3">pro Jahr</p>
          </div>
        </div>
        <p className="mt-4 text-[13.5px] leading-relaxed text-ink-2">{fv.text}</p>
        {fv.quelle && (
          <p className="mt-2 font-mono text-[11px] text-ink-3">Quelle: {fv.quelle}</p>
        )}
      </section>

      {/* Begründung */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Begründung · Regel {result.regelId}
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {result.begruendung.map((b, i) => (
            <li key={i} className="flex items-center gap-3 text-[13.5px] text-ink-2">
              <span className="font-mono text-[11px] text-ink-3">{b.regelId}</span>
              <span className="font-mono">{b.eingabe ?? b.hinweis}</span>
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
          Zurück
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
