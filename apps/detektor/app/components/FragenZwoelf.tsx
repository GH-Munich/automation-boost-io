"use client";

import { useMemo, useState } from "react";

import { usePersistentState } from "../lib/usePersistentState";

type StatusWert = "beantwortet" | "offen" | "verweigert";
type Frage = { id: string; text: string; tag?: string | null };
type Gruppe = { name: string; fragen: Frage[] };

export type FragenZwoelfConfig = {
  titel: string;
  hinweis: string;
  reihenfolgehinweis: string;
  status_optionen: { wert: string; text: string }[];
  befund_bei_verweigert: string;
  gruppen: Gruppe[];
  mail_vorlage: {
    betreff: string;
    text: string;
    platzhalter: string[];
  };
};

/** Ersetzt {schluessel}-Platzhalter, ohne den Vorlagentext umzuformulieren. */
function fuelle(text: string, werte: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (treffer, k: string) =>
    k in werte ? werte[k]! : treffer,
  );
}

export function FragenZwoelf({
  config,
  standardVersion,
}: {
  config: FragenZwoelfConfig;
  standardVersion: string;
}) {
  const alleFragen = config.gruppen.flatMap((g) => g.fragen);
  const [status, setStatus] = usePersistentState<Record<string, StatusWert>>(
    "awd-fragen12",
    {},
  );
  const [frist, setFrist] = useState("");
  const [absender, setAbsender] = useState("");
  const [kopiert, setKopiert] = useState(false);

  const zaehlung = useMemo(() => {
    let beantwortet = 0;
    let verweigert = 0;
    for (const f of alleFragen) {
      if (status[f.id] === "beantwortet") beantwortet++;
      if (status[f.id] === "verweigert") verweigert++;
    }
    return { beantwortet, verweigert, gesamt: alleFragen.length };
  }, [status, alleFragen]);

  const mailText = useMemo(() => {
    const werte = {
      frist: frist || "…",
      standard_version: standardVersion,
      absender: absender || "…",
    };
    return {
      betreff: fuelle(config.mail_vorlage.betreff, werte),
      text: fuelle(config.mail_vorlage.text, werte),
    };
  }, [frist, absender, standardVersion, config.mail_vorlage]);

  async function kopiereMail() {
    try {
      await navigator.clipboard.writeText(
        `Betreff: ${mailText.betreff}\n\n${mailText.text}`,
      );
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 2000);
    } catch {
      /* Zwischenablage nicht verfügbar — Text steht sichtbar zum Kopieren bereit. */
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Beschaffungsleitfaden
        </p>
        <h1 className="balance mt-2 text-[clamp(22px,3.4vw,30px)] font-bold leading-[1.15] tracking-[-.02em]">
          {config.titel}
        </h1>
        <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-ink-2">{config.hinweis}</p>
        <p className="mt-4 max-w-[68ch] rounded-sm border border-warn/30 bg-warn-weak/50 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
          {config.reihenfolgehinweis}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-[12.5px]">
          <span className="font-mono text-ink-2">
            {zaehlung.beantwortet}/{zaehlung.gesamt} beantwortet
          </span>
          {zaehlung.verweigert > 0 && (
            <span className="rounded-full bg-bad-weak px-2.5 py-1 font-semibold text-bad">
              {zaehlung.verweigert} verweigert
            </span>
          )}
        </div>
      </section>

      {config.gruppen.map((gruppe) => (
        <section key={gruppe.name} className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">{gruppe.name}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {gruppe.fragen.map((f) => (
              <li key={f.id} className="rounded-sm border border-line bg-surface-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="max-w-[62ch] text-[14px] leading-snug text-ink">
                    <span className="mr-2 font-mono text-[11px] text-ink-3">{f.id}</span>
                    {f.text}
                  </p>
                  {f.tag && (
                    <span className="rounded-full bg-accent-weak px-2.5 py-0.5 font-mono text-[10.5px] text-accent">
                      {f.tag}
                    </span>
                  )}
                </div>
                <div className="mt-3 inline-flex flex-wrap gap-0.5 rounded-full border border-line bg-surface p-0.5" role="group" aria-label={`Status ${f.id}`}>
                  {config.status_optionen.map((opt) => {
                    const aktiv = (status[f.id] ?? "offen") === opt.wert;
                    return (
                      <button
                        key={opt.wert}
                        type="button"
                        onClick={() => setStatus((p) => ({ ...p, [f.id]: opt.wert as StatusWert }))}
                        aria-pressed={aktiv}
                        className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors ${
                          aktiv
                            ? opt.wert === "verweigert"
                              ? "bg-bad text-accent-on"
                              : opt.wert === "beantwortet"
                                ? "bg-ok text-accent-on"
                                : "bg-surface-3 text-ink"
                            : "text-ink-2 hover:text-ink"
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                {status[f.id] === "verweigert" && (
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-bad">{config.befund_bei_verweigert}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Mail-Vorlage */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Anfrage an den Anbieter — vor der Produktvorführung
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[13px] font-medium text-ink">Frist (Antwort bis)</span>
            <input
              type="date"
              value={frist}
              onChange={(e) => setFrist(e.target.value)}
              className="mt-2 block w-full rounded-sm border border-line-strong bg-surface px-3 py-2.5 text-[14px] text-ink"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-medium text-ink">Absender</span>
            <input
              type="text"
              value={absender}
              placeholder="Name, Unternehmen"
              onChange={(e) => setAbsender(e.target.value)}
              className="mt-2 block w-full rounded-sm border border-line-strong bg-surface px-3 py-2.5 text-[14px] text-ink"
            />
          </label>
        </div>

        <div className="mt-4 rounded-sm border border-line bg-surface-2 p-4">
          <p className="text-[13px] font-semibold text-ink">{mailText.betreff}</p>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-ink-2">{mailText.text}</p>
        </div>

        <button
          type="button"
          onClick={kopiereMail}
          className="mt-4 inline-flex items-center gap-2 rounded-sm border border-accent bg-accent px-4 py-2.5 text-[14px] font-semibold text-accent-on transition-colors hover:bg-accent-2"
        >
          {kopiert ? "Kopiert ✓" : "Anschreiben kopieren"}
        </button>
      </section>
    </div>
  );
}
