"use client";

import { useState } from "react";

type Opt = string | { wert: string; text: string };
type BafaFrage = { id: string; frage: string; optionen: Opt[]; ko_bei?: string };
type BafaFall = { foerdersatz: number; zuschuss_max_eur: number; anzeige: string };
export type BafaConfig = {
  titel: string;
  fragen: BafaFrage[];
  ergebnis: { faelle: Record<string, BafaFall>; ko_anzeige: string };
  hinweise: string[];
};

const OPT_LABEL: Record<string, string> = { ja: "Ja", nein: "Nein" };
const optWert = (o: Opt) => (typeof o === "string" ? o : o.wert);
const optText = (o: Opt) => (typeof o === "string" ? (OPT_LABEL[o] ?? o) : o.text);

export function BafaMini({ config }: { config: BafaConfig }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answeredAll = config.fragen.every((f) => answers[f.id] !== undefined);
  const ko = config.fragen.some((f) => f.ko_bei && answers[f.id] === f.ko_bei);
  const standortFrage = config.fragen.find((f) => f.optionen.some((o) => typeof o !== "string"));
  const standort = standortFrage ? answers[standortFrage.id] : undefined;
  const fall = standort ? config.ergebnis.faelle[standort] : undefined;

  const showResult = ko || (answeredAll && !!fall);

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-4">
        {config.fragen.map((frage) => (
          <section key={frage.id} className="rounded-md border border-line bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[12px] text-ink-3">{frage.id}</span>
              <h2 className="text-[16px] font-semibold leading-snug tracking-[-.01em]">{frage.frage}</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {frage.optionen.map((opt) => {
                const wert = optWert(opt);
                const active = answers[frage.id] === wert;
                return (
                  <button
                    key={wert}
                    type="button"
                    onClick={() => setAnswers((p) => ({ ...p, [frage.id]: wert }))}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors ${
                      active ? "border-accent bg-accent text-accent-on" : "border-line-strong bg-surface hover:bg-surface-2"
                    }`}
                  >
                    {optText(opt)}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-md border border-line bg-surface-2 p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Ergebnis</p>
          {!showResult ? (
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
              Beantworten Sie die vier Fragen — das Ergebnis erscheint sofort.
            </p>
          ) : ko ? (
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{config.ergebnis.ko_anzeige}</p>
          ) : (
            <>
              <p className="mt-3 text-[15px] font-semibold leading-relaxed text-ink">{fall!.anzeige}</p>
              <p className="mt-2 font-mono text-[12px] text-ink-3">
                Fördersatz {Math.round(fall!.foerdersatz * 100)} % · bis {fall!.zuschuss_max_eur.toLocaleString("de-DE")} € Zuschuss
              </p>
            </>
          )}
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {config.hinweise.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-ink-3" aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
