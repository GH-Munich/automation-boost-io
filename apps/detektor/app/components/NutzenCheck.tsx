"use client";

import { useMemo, useState } from "react";

import { calculateNutzen } from "@engine/nutzen";
import type { Ampel, NutzenContent, NutzenEingabe } from "@engine/types";

const AMPEL: Record<Ampel, string> = {
  gruen: "bg-ok-weak text-ok",
  gelb: "bg-warn-weak text-warn",
  rot: "bg-bad-weak text-bad",
};

export function NutzenCheck({ nutzen }: { nutzen: NutzenContent }) {
  const e = nutzen.eingaben;
  const [vorgaenge, setVorgaenge] = useState(e.vorgaenge_jahr.default);
  const [zeit, setZeit] = useState(e.zeitersparnis_minuten.default);
  const [nacharbeit, setNacharbeit] = useState(e.nacharbeit_stunden_jahr.default);
  const [satz, setSatz] = useState(e.stundensatz_eur.default);
  const [investition, setInvestition] = useState(e.investition_eur.default);

  const nf = new Intl.NumberFormat("de-DE");
  const eur = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const res = useMemo(
    () =>
      calculateNutzen(
        {
          vorgaengeJahr: vorgaenge,
          zeitersparnisMinuten: zeit,
          nacharbeitStundenJahr: nacharbeit,
          stundensatzEur: satz,
          investitionEur: investition,
        },
        nutzen,
      ),
    [vorgaenge, zeit, nacharbeit, satz, investition, nutzen],
  );
  const ampelLabel =
    nutzen.amortisation.ampel.find((a) => a.stufe === res.ampel)?.label ?? "";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Eingaben — Schieberegler */}
      <section className="rounded-md border border-line bg-surface p-5">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Ihre Annahmen</p>
        <div className="mt-4 flex flex-col gap-4">
          <Regler def={e.vorgaenge_jahr} value={vorgaenge} onChange={setVorgaenge} anzeige={nf.format(vorgaenge)} />
          <Regler def={e.zeitersparnis_minuten} value={zeit} onChange={setZeit} anzeige={String(zeit)} />
          <Regler def={e.nacharbeit_stunden_jahr} value={nacharbeit} onChange={setNacharbeit} anzeige={nf.format(nacharbeit)} />
          <Regler def={e.stundensatz_eur} value={satz} onChange={setSatz} anzeige={String(satz)} />
          <Regler def={e.investition_eur} value={investition} onChange={setInvestition} anzeige={nf.format(investition)} />
        </div>
      </section>

      {/* Ergebnis + strategische Potenziale */}
      <section className="flex flex-col rounded-md border border-line bg-surface p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">Nutzen / Jahr</p>
            <b className="mt-1 block font-mono text-[26px] font-semibold leading-none tnum">{eur.format(res.jahresnutzenEur)}</b>
            <p className="mt-1 font-mono text-[11px] text-ink-3">{nf.format(res.eingesparteStundenJahr)} Std × {eur.format(satz)}</p>
          </div>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">Investition / Jahr</p>
            <b className="mt-1 block font-mono text-[26px] font-semibold leading-none tnum">{eur.format(investition)}</b>
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">Zahlt sich zurück in</p>
          {res.amortisationMonate !== null ? (
            <>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <div className="flex items-baseline gap-1.5">
                  <b className="font-mono text-[40px] font-semibold leading-none tracking-[-.02em] tnum">{res.amortisationMonate}</b>
                  <span className="font-mono text-[16px] text-ink-3">Monaten</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-semibold ${AMPEL[res.ampel]}`}>
                  <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
                  {ampelLabel}
                </span>
              </div>
              <p className="mt-2 max-w-[48ch] text-[12.5px] leading-relaxed text-ink-2">{res.ampelText}</p>
            </>
          ) : (
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">
              Vorgänge und Zeitersparnis angeben — dann erscheint die Amortisation.
            </p>
          )}
        </div>

        <div className="mt-auto border-t border-line pt-4">
          <p className="text-[12px] font-medium text-ink">{nutzen.strategische_potenziale.einleitung}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {nutzen.strategische_potenziale.punkte.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] leading-snug text-ink-2">
                <span className="mt-[5px] h-1.5 w-1.5 flex-none rounded-full bg-accent" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11.5px] italic leading-snug text-ink-3">{nutzen.strategische_potenziale.gespraech}</p>
        </div>
      </section>

      <p className="text-[11px] leading-relaxed text-ink-3 lg:col-span-2">{nutzen.disclaimer}</p>
    </div>
  );
}

/** Ein Schieberegler mit Wertanzeige; Erklärung erscheint per Hover (title). */
function Regler({
  def,
  value,
  onChange,
  anzeige,
}: {
  def: NutzenEingabe;
  value: number;
  onChange: (n: number) => void;
  anzeige: string;
}) {
  const tip = def.quelle ? `${def.erklaerung} · Quelle: ${def.quelle}` : def.erklaerung;
  return (
    <div title={tip}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-1 text-[12.5px] font-medium text-ink">
          {def.label}
          <span className="cursor-help font-mono text-[11px] text-ink-3" aria-hidden="true">ⓘ</span>
        </span>
        <span className="font-mono text-[14px] font-semibold tnum text-ink">
          {anzeige}
          <span className="ml-1 text-[11px] font-normal text-ink-3">{def.einheit}</span>
        </span>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.schritt}
        value={value}
        onChange={(ev) => onChange(Number(ev.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer"
        style={{ accentColor: "var(--accent)" }}
        aria-label={def.label}
      />
    </div>
  );
}
