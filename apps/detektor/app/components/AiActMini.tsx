"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type AaFrage = {
  id: string;
  frage: string;
  optionen: string[];
  pflicht_bei: string[];
  pflicht: string;
};
export type AiActConfig = {
  id: string;
  titel: string;
  zeitangabe_min: number;
  kontext: string;
  fragen: AaFrage[];
  ergebnis: { typ: string; anzeige: string };
  cta: { label: string; ziel_tuer: string; prefill: unknown };
  consent_checkbox: string;
  label_prominent: string;
};

// Generische Antwort-Token → Anzeige (UI-Microcopy, kein Standard-Inhalt).
const OPT_LABEL: Record<string, string> = {
  ja: "Ja",
  nein: "Nein",
  geplant: "Geplant",
  teils: "Teils",
  weiss_nicht: "Weiß ich nicht",
};
const ziel: Record<string, string> = { A: "/pruefung", B: "/bestand", C: "/bedarf" };

export function AiActMini({
  config,
  disclaimer,
}: {
  config: AiActConfig;
  disclaimer: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);

  const pflichten = useMemo(
    () =>
      config.fragen
        .filter((f) => answers[f.id] && f.pflicht_bei.includes(answers[f.id]!))
        .map((f) => ({ id: f.id, pflicht: f.pflicht })),
    [answers, config.fragen],
  );
  const answeredCount = config.fragen.filter((f) => answers[f.id] !== undefined).length;
  const allAnswered = answeredCount === config.fragen.length;

  return (
    <div className="mx-auto max-w-wrap px-4 py-10 sm:px-8">
      {/* Kopf */}
      <div className="max-w-[70ch]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
            2-Minuten-Detektor · EU AI Act
          </span>
          <span className="rounded-full border border-warn/30 bg-warn-weak px-3 py-1 text-[11.5px] font-semibold text-warn">
            {config.label_prominent}
          </span>
        </div>
        <h1 className="balance mt-3 text-[clamp(24px,4vw,36px)] font-bold leading-[1.08] tracking-[-.02em]">
          {config.titel}
        </h1>
        <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">{config.kontext}</p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Fragen */}
        <div className="flex flex-col gap-4">
          {config.fragen.map((frage) => (
            <section key={frage.id} className="rounded-md border border-line bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[12px] text-ink-3">{frage.id}</span>
                <h2 className="balance text-[16px] font-semibold leading-snug tracking-[-.01em]">{frage.frage}</h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {frage.optionen.map((opt) => {
                  const active = answers[frage.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, [frage.id]: opt }))}
                      aria-pressed={active}
                      className={`rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors ${
                        active
                          ? "border-accent bg-accent text-accent-on"
                          : "border-line-strong bg-surface hover:bg-surface-2"
                      }`}
                    >
                      {OPT_LABEL[opt] ?? opt}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Pflichtenliste */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-md border border-line bg-surface-2 p-6 shadow-sm">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">{config.ergebnis.anzeige}</p>

            {answeredCount === 0 ? (
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
                Beantworten Sie die Fragen — Ihre persönliche Pflichtenliste entsteht live.
              </p>
            ) : pflichten.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-3">
                {pflichten.map((p) => (
                  <li key={p.id} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-accent text-accent-on" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 6" />
                      </svg>
                    </span>
                    <span className="text-[13px] leading-relaxed text-ink">{p.pflicht}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[13.5px] leading-relaxed text-ink-2">
                Nach Ihren bisherigen Angaben ist keine der abgefragten Pflichten ausgelöst.
              </p>
            )}

            {allAnswered && (
              <p className="mt-4 border-t border-line pt-3 font-mono text-[11px] text-ink-3">
                {pflichten.length} von {config.fragen.length} Punkten treffen zu.
              </p>
            )}
          </div>

          <Link
            href={ziel[config.cta.ziel_tuer] ?? "/"}
            className="mt-3 flex items-center justify-center gap-2 rounded-md border border-accent bg-accent px-4 py-3 text-[14px] font-semibold text-accent-on no-underline transition-colors hover:bg-accent-2"
          >
            {config.cta.label}
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

          <label className="mt-4 flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-none accent-[var(--accent)]"
            />
            {config.consent_checkbox}
          </label>
          <p className="mt-2 font-mono text-[10.5px] text-ink-3">
            PDF-Pflichtenliste per Mail (Double-Opt-in) folgt in Stufe M5.
          </p>
        </aside>
      </div>

      <p className="mt-8 max-w-[70ch] rounded-sm border border-warn/30 bg-warn-weak/40 px-4 py-3 text-[12.5px] leading-relaxed text-ink-2">
        <b className="text-ink">{config.label_prominent}.</b> {disclaimer}
      </p>
    </div>
  );
}
