"use client";

import { useMemo, useState } from "react";

import { evaluateSchnelltest } from "@engine/schnelltest";
import type {
  Ampel,
  SchnelltestContent,
  SchnelltestFrageId,
  SchnelltestInput,
} from "@engine/types";

const AMPEL: Record<Ampel, { chip: string; dot: string; label: string }> = {
  gruen: { chip: "bg-ok-weak text-ok", dot: "bg-ok", label: "Gute Ausgangslage" },
  gelb: { chip: "bg-warn-weak text-warn", dot: "bg-warn", label: "Punkte klären" },
  rot: { chip: "bg-bad-weak text-bad", dot: "bg-bad", label: "Reifegrad klären" },
};

export function SchnelltestClient({ schnelltest }: { schnelltest: SchnelltestContent }) {
  const fragen = schnelltest.fragen;
  const [answers, setAnswers] = useState<Partial<Record<SchnelltestFrageId, string>>>({});

  const answeredCount = fragen.filter((f) => answers[f.id] !== undefined).length;
  const allAnswered = answeredCount === fragen.length;

  const result = useMemo(
    () => (allAnswered ? evaluateSchnelltest(answers as SchnelltestInput, schnelltest) : null),
    [allAnswered, answers, schnelltest],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      <div className="flex flex-col gap-4">
        {fragen.map((frage, i) => {
          const chosen = answers[frage.id];
          return (
            <section key={frage.id} className="rounded-md border border-line bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[12px] text-ink-3">{frage.id}</span>
                <h2 className="balance text-[16px] font-semibold leading-snug tracking-[-.01em]">{frage.frage}</h2>
              </div>
              <div className="mt-4 flex flex-col gap-2">
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
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${opt.problematisch ? "bg-bad-weak text-bad" : "bg-ok-weak text-ok"}`}>
                          {opt.deutung}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {i === fragen.length - 1 && (
                <p className="mt-3 font-mono text-[11px] text-ink-3">Ohne Fachwissen beantwortbar.</p>
              )}
            </section>
          );
        })}
      </div>

      {/* Ergebnis */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-md border border-line bg-surface-2 p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Auswertung</p>

          {result ? (
            <>
              <div className="mt-3 flex items-baseline gap-2">
                <b className="font-mono text-[42px] font-semibold leading-none tnum">{result.anzahlProblematisch}</b>
                <span className="font-mono text-[16px] text-ink-3">/ {fragen.length}</span>
              </div>
              <p className="mt-1 text-[12.5px] text-ink-2">problematische Antworten</p>

              <span className={`mt-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-semibold ${AMPEL[result.stufe].chip}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${AMPEL[result.stufe].dot}`} aria-hidden="true" />
                {AMPEL[result.stufe].label}
              </span>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{result.text}</p>

              {result.problematischePunkte.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
                  {result.problematischePunkte.map((p) => (
                    <li key={p.id} className="text-[12.5px] leading-relaxed">
                      <span className="font-mono text-ink-3">{p.id}</span>{" "}
                      <span className="text-ink-2">{p.deutung}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
                <span className="block h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${(answeredCount / fragen.length) * 100}%` }} />
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
                {answeredCount} von {fragen.length} Fragen beantwortet. Das Ergebnis erscheint,
                sobald alle beantwortet sind.
              </p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
