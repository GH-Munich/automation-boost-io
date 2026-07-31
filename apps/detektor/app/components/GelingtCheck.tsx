"use client";

import { useMemo, useState } from "react";

import { evaluateGelingt } from "@engine/gelingt";
import type { Ampel, GelingtBlock, GelingtContent, GelingtInput } from "@engine/types";

const AMPEL: Record<Ampel, { chip: string; dot: string }> = {
  gruen: { chip: "bg-ok-weak text-ok", dot: "bg-ok" },
  gelb: { chip: "bg-warn-weak text-warn", dot: "bg-warn" },
  rot: { chip: "bg-bad-weak text-bad", dot: "bg-bad" },
};

export function GelingtCheck({ gelingt }: { gelingt: GelingtContent }) {
  const fragen = gelingt.fragen;
  const [answers, setAnswers] = useState<Partial<Record<string, string>>>({});

  const answeredCount = fragen.filter((f) => answers[f.id] !== undefined).length;
  const allAnswered = answeredCount === fragen.length;

  const result = useMemo(
    () => (allAnswered ? evaluateGelingt(answers as GelingtInput, gelingt) : null),
    [allAnswered, answers, gelingt],
  );

  const bloecke: { key: GelingtBlock; label: string }[] = [
    { key: "aussen", label: gelingt.bloecke.aussen },
    { key: "innen", label: gelingt.bloecke.innen },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      <div className="flex flex-col gap-6">
        {bloecke.map((b) => (
          <div key={b.key} className="flex flex-col gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">{b.label}</p>
            {fragen
              .filter((f) => f.block === b.key)
              .map((frage) => {
                const chosen = answers[frage.id];
                return (
                  <section key={frage.id} className="rounded-md border border-line bg-surface p-5 shadow-sm">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[12px] text-ink-3">{frage.id}</span>
                      <h2 className="balance text-[15px] font-semibold leading-snug tracking-[-.01em]">{frage.frage}</h2>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      {frage.optionen.map((opt) => {
                        const active = chosen === opt.wert;
                        return (
                          <button
                            key={opt.wert}
                            type="button"
                            onClick={() => setAnswers((p) => ({ ...p, [frage.id]: opt.wert }))}
                            aria-pressed={active}
                            className={`flex items-center gap-3 rounded-sm border px-4 py-2.5 text-left text-[14px] transition-colors ${
                              active
                                ? "border-accent bg-accent-weak shadow-[inset_0_0_0_1px_var(--accent)]"
                                : "border-line hover:border-line-strong hover:bg-surface-2"
                            }`}
                          >
                            <span
                              className={`grid h-4 w-4 flex-none place-items-center rounded-full border ${
                                active ? "border-accent bg-accent text-accent-on" : "border-line-strong text-transparent"
                              }`}
                              aria-hidden="true"
                            >
                              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5 5L20 6" />
                              </svg>
                            </span>
                            <span className="flex-1">{opt.text}</span>
                            {active && (
                              <span className={`hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline ${opt.problematisch ? "bg-warn-weak text-warn" : "bg-ok-weak text-ok"}`}>
                                {opt.deutung}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
          </div>
        ))}
      </div>

      {/* Ergebnis */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-md border border-line bg-surface-2 p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Ihre Bereitschaft</p>

          {result ? (
            <>
              <div className="mt-3 flex items-baseline gap-2">
                <b className="font-mono text-[38px] font-semibold leading-none tnum">{result.anzahlOffen}</b>
                <span className="font-mono text-[15px] text-ink-3">/ {result.gesamt} offen</span>
              </div>
              <span className={`mt-3 inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-semibold ${AMPEL[result.stufe].chip}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${AMPEL[result.stufe].dot}`} aria-hidden="true" />
                {result.label}
              </span>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{result.text}</p>

              {(result.offenAussen.length > 0 || result.offenInnen.length > 0) && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-[12px] font-medium text-ink">Diese Punkte gehören ins Gespräch:</p>
                  {result.offenAussen.length > 0 && (
                    <div className="mt-2">
                      <p className="font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-3">{gelingt.bloecke.aussen}</p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {result.offenAussen.map((p) => (
                          <li key={p.id} className="flex items-start gap-1.5 text-[12.5px] leading-snug text-ink-2">
                            <span className="mt-[5px] h-1.5 w-1.5 flex-none rounded-full bg-warn" aria-hidden="true" />
                            {p.deutung}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.offenInnen.length > 0 && (
                    <div className="mt-3">
                      <p className="font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-3">{gelingt.bloecke.innen}</p>
                      <ul className="mt-1 flex flex-col gap-1">
                        {result.offenInnen.map((p) => (
                          <li key={p.id} className="flex items-start gap-1.5 text-[12.5px] leading-snug text-ink-2">
                            <span className="mt-[5px] h-1.5 w-1.5 flex-none rounded-full bg-accent" aria-hidden="true" />
                            {p.deutung}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <p className="mt-4 border-t border-line pt-4 text-[12px] italic leading-relaxed text-ink-3">{gelingt.gespraech}</p>
            </>
          ) : (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
                <span className="block h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${(answeredCount / fragen.length) * 100}%` }} />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
                {answeredCount} von {fragen.length} Fragen beantwortet. Die Einschätzung erscheint,
                sobald alle beantwortet sind.
              </p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
