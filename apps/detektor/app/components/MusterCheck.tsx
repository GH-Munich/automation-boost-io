"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { detectMuster } from "@engine/muster";
import { evaluateFormel } from "@engine/formel";
import type { MusterContent, MusterResult } from "@engine/types";

type Eingabe = { id: string; label: string; default: number; quelle?: string };
type Rechner = {
  id: string;
  titel: string;
  eingaben: Eingabe[];
  formeln: Record<string, string>;
  hinweis?: string;
  abrechnungs_hinweis?: string;
  einordnung?: string;
  referenz?: Record<string, unknown>;
  [k: string]: unknown;
};
type Zusatzfrage = { id: string; text: string; tag?: string };
type Praezedenz = { titel: string; text: string; lehre?: string };
type MusterVoll = {
  id: string;
  name: string;
  track_status: string;
  verkaufsbehauptung?: string;
  was_meist_vorliegt?: string;
  warum_anfaellig?: string;
  achsen_fokus?: string[];
  zusatzfragen?: Zusatzfrage[];
  rechner?: Rechner;
  praezedenzfall?: Praezedenz;
};

const nf = (n: number): string =>
  Number.isFinite(n) ? n.toLocaleString("de-DE", { maximumFractionDigits: 1 }) : "—";

function humanisiere(key: string): string {
  const s = key.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TRACK: Record<string, string> = {
  mvp: "Track aktiv",
  stufe2: "Track Stufe 2",
};

export function MusterCheck({ muster }: { muster: MusterContent }) {
  const musterListe = muster.muster as unknown as MusterVoll[];
  const [freitext, setFreitext] = useState("");
  const [analyse, setAnalyse] = useState<MusterResult | null>(null);
  const [gewaehltId, setGewaehltId] = useState<string | null>(null);

  function waehle(wert: string) {
    setGewaehltId(wert);
    setAnalyse(null);
  }
  function analysiere() {
    if (!freitext.trim()) return;
    const r = detectMuster({ freitext }, muster);
    setAnalyse(r);
    setGewaehltId(r.generisch ? "generisch" : r.treffer[0]!.musterId);
  }
  function reset() {
    setFreitext("");
    setAnalyse(null);
    setGewaehltId(null);
  }

  const aktiv = gewaehltId && gewaehltId !== "generisch"
    ? musterListe.find((m) => m.id === gewaehltId) ?? null
    : null;
  const trefferwoerter =
    analyse?.treffer.find((t) => t.musterId === gewaehltId)?.trefferwoerter ?? [];

  return (
    <div className="grid gap-5">
      {/* Kopf + Auswahl */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Mustererkennung
        </p>
        <h1 className="balance mt-2 text-[clamp(22px,3.4vw,30px)] font-bold leading-[1.15] tracking-[-.02em]">
          Kenne ich diese Masche?
        </h1>
        <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-ink-2">
          {muster.grundsatz}
        </p>

        <p className="mt-6 text-[14px] font-semibold text-ink">
          {muster.klassifikationsfrage.frage}
        </p>
        <div className="mt-3 flex flex-col gap-2.5">
          {muster.klassifikationsfrage.optionen.map((opt) => {
            const gewaehlt = gewaehltId === opt.wert && !analyse;
            return (
              <button
                key={opt.wert}
                type="button"
                onClick={() => waehle(opt.wert)}
                aria-pressed={gewaehlt}
                className={`flex w-full items-center gap-3 rounded-sm border px-4 py-3 text-left text-[14.5px] leading-snug transition-colors ${
                  gewaehlt
                    ? "border-accent bg-accent-weak shadow-[inset_0_0_0_1px_var(--accent)]"
                    : opt.wert === "generisch"
                      ? "border-dashed border-line-strong text-ink-2 hover:bg-surface-2"
                      : "border-line hover:border-line-strong hover:bg-surface-2"
                }`}
              >
                {opt.wert !== "generisch" && (
                  <span className="font-mono text-[11px] text-ink-3">{opt.wert}</span>
                )}
                {opt.text}
              </button>
            );
          })}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <label className="block text-[13px] font-medium text-ink">
            … oder beschreiben Sie das Angebot in eigenen Worten
          </label>
          <div className="mt-2 flex flex-wrap gap-2.5">
            <input
              type="text"
              value={freitext}
              onChange={(e) => setFreitext(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analysiere()}
              placeholder="z. B. Voicebot für die Anrufannahme in der Telefonie"
              className="min-w-[240px] flex-1 rounded-sm border border-line-strong bg-surface px-3 py-2.5 text-[14px] text-ink"
            />
            <button
              type="button"
              onClick={analysiere}
              className="rounded-sm border border-accent bg-accent px-4 py-2.5 text-[14px] font-semibold text-accent-on transition-colors hover:bg-accent-2"
            >
              Analysieren
            </button>
          </div>
        </div>
      </section>

      {/* Ergebnis */}
      {gewaehltId === "generisch" && (
        <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Ergebnis</p>
          <h2 className="mt-2 text-[18px] font-semibold">Kein bekanntes Muster erkannt</h2>
          <p className="mt-2 max-w-[66ch] text-[13.5px] leading-relaxed text-ink-2">
            Dieses Angebot passt zu keinem der hinterlegten Muster. Das ist kein Nachteil —
            gehen Sie einfach die normale Prüfung Schritt für Schritt durch — ist das ein echter Agent, brauchen Sie das, ist der Preis fair.
          </p>
        </section>
      )}

      {aktiv && (
        <MusterDetail
          m={aktiv}
          bestaetigungstext={muster.bestaetigungstext.replace("{muster_name}", aktiv.name)}
          trefferwoerter={trefferwoerter}
          alternativen={
            analyse?.treffer
              .filter((t) => t.musterId !== gewaehltId)
              .map((t) => ({ id: t.musterId, name: t.name })) ?? []
          }
          onWaehle={(id) => setGewaehltId(id)}
          onReset={reset}
          trackLabel={TRACK[aktiv.track_status] ?? aktiv.track_status}
        />
      )}
    </div>
  );
}

function MusterDetail({
  m,
  bestaetigungstext,
  trefferwoerter,
  alternativen,
  onWaehle,
  onReset,
  trackLabel,
}: {
  m: MusterVoll;
  bestaetigungstext: string;
  trefferwoerter: string[];
  alternativen: { id: string; name: string }[];
  onWaehle: (id: string) => void;
  onReset: () => void;
  trackLabel: string;
}) {
  return (
    <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
            Vermutetes Muster · {m.id}
          </p>
          <h2 className="mt-1 text-[20px] font-semibold tracking-[-.01em]">{m.name}</h2>
        </div>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[.08em] text-ink-3">
          {trackLabel}
        </span>
      </div>

      <div className="mt-4 rounded-sm border border-accent/30 bg-accent-weak/60 px-4 py-3">
        <p className="text-[13.5px] font-medium text-ink">{bestaetigungstext}</p>
        <p className="mt-1 text-[12px] text-ink-2">
          Erkennung ist eine Vermutung mit Bestätigungspflicht — sie entscheidet nichts.
        </p>
      </div>

      {trefferwoerter.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-3">
          Erkannte Signalwörter:
          {trefferwoerter.map((w) => (
            <span key={w} className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-ink-2">
              {w}
            </span>
          ))}
        </p>
      )}

      <div className="mt-5 grid gap-4">
        {m.verkaufsbehauptung && (
          <Feld titel="So wird es verkauft" text={m.verkaufsbehauptung} />
        )}
        {m.was_meist_vorliegt && (
          <Feld titel="Was meist wirklich dahintersteckt" text={m.was_meist_vorliegt} />
        )}
        {m.warum_anfaellig && (
          <Feld titel="Warum dieses Muster anfällig ist" text={m.warum_anfaellig} />
        )}
      </div>

      {m.achsen_fokus && m.achsen_fokus.length > 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-2">
          <span className="font-medium text-ink">Achsen mit erhöhter Aufmerksamkeit:</span>
          {m.achsen_fokus.map((a) => (
            <span key={a} className="rounded-full bg-accent-weak px-2 py-0.5 font-mono text-[11px] text-accent">
              {a}
            </span>
          ))}
        </p>
      )}

      {m.zusatzfragen && m.zusatzfragen.length > 0 && (
        <div className="mt-5">
          <p className="text-[13px] font-semibold text-ink">
            Diese Fragen sollten Sie dem Anbieter stellen
          </p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {m.zusatzfragen.map((z) => (
              <li key={z.id} className="flex flex-wrap items-start justify-between gap-2 rounded-sm border border-line bg-surface-2 px-4 py-2.5">
                <span className="max-w-[62ch] text-[13.5px] leading-snug text-ink-2">
                  <span className="mr-2 font-mono text-[11px] text-ink-3">{z.id}</span>
                  {z.text}
                </span>
                {z.tag && (
                  <span className="rounded-full bg-accent-weak px-2 py-0.5 font-mono text-[10.5px] text-accent">
                    {z.tag}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {m.rechner && <RechnerBlock rechner={m.rechner} />}

      {m.id === "M2" && (
        <Link
          href="/support-preise"
          className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-semibold text-accent no-underline hover:underline"
        >
          Was ein Support-Agent wirklich kostet — Marktreferenz &amp; versteckte Kosten
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      )}

      {m.praezedenzfall && (
        <div className="mt-5 rounded-sm border border-line bg-surface-2 p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">Präzedenzfall</p>
          <p className="mt-1.5 text-[14px] font-semibold text-ink">{m.praezedenzfall.titel}</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{m.praezedenzfall.text}</p>
          {m.praezedenzfall.lehre && (
            <p className="mt-2 text-[13px] leading-relaxed text-ink">
              <span className="font-medium">Lehre: </span>
              {m.praezedenzfall.lehre}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        {alternativen.length > 0 && (
          <span className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-3">
            Andere Deutung:
            {alternativen.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onWaehle(a.id)}
                className="rounded-full border border-line-strong bg-surface px-2.5 py-1 text-[12px] font-medium text-ink-2 transition-colors hover:bg-surface-2"
              >
                {a.id} · {a.name}
              </button>
            ))}
          </span>
        )}
        <button
          type="button"
          onClick={onReset}
          className="ml-auto rounded-sm px-4 py-2 text-[13.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          Neu starten
        </button>
      </div>
    </section>
  );
}

function Feld({ titel, text }: { titel: string; text: string }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink">{titel}</p>
      <p className="mt-1 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-2">{text}</p>
    </div>
  );
}

function RechnerBlock({ rechner }: { rechner: Rechner }) {
  const [werte, setWerte] = useState<Record<string, number>>(() =>
    Object.fromEntries(rechner.eingaben.map((e) => [e.id, e.default])),
  );

  // Scope: Eingabewerte plus rechner-eigene "*_default"-Konstanten
  // (z. B. rate_marketing_default → rate_marketing).
  const scope = useMemo(() => {
    const s: Record<string, number> = { ...werte };
    for (const [k, v] of Object.entries(rechner)) {
      if (k.endsWith("_default") && typeof v === "number") {
        s[k.replace(/_default$/, "")] = v;
      }
    }
    return s;
  }, [werte, rechner]);

  const ergebnisse = useMemo(
    () =>
      Object.entries(rechner.formeln).map(([key, formel]) => {
        try {
          return { key, wert: evaluateFormel(formel, scope) };
        } catch {
          return { key, wert: null };
        }
      }),
    [rechner.formeln, scope],
  );

  const notizen = [rechner.hinweis, rechner.abrechnungs_hinweis, rechner.einordnung].filter(
    Boolean,
  ) as string[];

  return (
    <div className="mt-5 rounded-sm border border-line bg-surface-2 p-4 sm:p-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">Rechner</p>
      <p className="mt-1 text-[14px] font-semibold text-ink">{rechner.titel}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {rechner.eingaben.map((e) => (
          <label key={e.id} className="block">
            <span className="text-[12.5px] font-medium text-ink">{e.label}</span>
            {e.quelle && <span className="mt-0.5 block text-[11px] text-ink-3">{e.quelle}</span>}
            <input
              type="number"
              value={Number.isFinite(werte[e.id]!) ? werte[e.id] : 0}
              onChange={(ev) =>
                setWerte((p) => ({ ...p, [e.id]: Number(ev.target.value) || 0 }))
              }
              className="mt-1.5 block w-full rounded-sm border border-line-strong bg-surface px-3 py-2 font-mono text-[13.5px] text-ink tnum"
            />
          </label>
        ))}
      </div>

      {ergebnisse.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
          {ergebnisse.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-ink-2">{humanisiere(r.key)}</span>
              <span className="font-mono text-[15px] font-semibold tnum">
                {r.wert === null ? "—" : `${nf(r.wert)}${r.key.includes("faktor") ? "×" : ""}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {rechner.referenz && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-[12px] font-medium text-ink">Referenzwerte</p>
          <ReferenzListe daten={rechner.referenz} />
        </div>
      )}

      {notizen.map((n, i) => (
        <p key={i} className="mt-3 text-[12px] leading-relaxed text-ink-3">
          {n}
        </p>
      ))}
    </div>
  );
}

/** Rendert die verschachtelten Referenz-Blöcke (M4/M6) kompakt und generisch. */
function ReferenzListe({ daten }: { daten: Record<string, unknown> }) {
  const zeige = (v: unknown): string => {
    if (Array.isArray(v)) {
      if (v.length === 2 && v.every((x) => typeof x === "number")) {
        return `${nf(v[0] as number)}–${nf(v[1] as number)}`;
      }
      return v.map((x) => zeige(x)).join(", ");
    }
    if (typeof v === "number") return nf(v);
    return String(v);
  };
  return (
    <ul className="mt-1.5 flex flex-col gap-1 text-[12.5px] text-ink-2">
      {Object.entries(daten).map(([k, v]) =>
        v && typeof v === "object" && !Array.isArray(v) ? (
          <li key={k}>
            <span className="font-medium text-ink">{humanisiere(k)}:</span>
            <ul className="ml-3 mt-0.5 flex flex-col gap-0.5">
              {Object.entries(v as Record<string, unknown>).map(([k2, v2]) => (
                <li key={k2}>
                  <span className="text-ink-3">{humanisiere(k2)}:</span> {zeige(v2)}
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li key={k}>
            <span className="font-medium text-ink">{humanisiere(k)}:</span> {zeige(v)}
          </li>
        ),
      )}
    </ul>
  );
}
