"use client";

import { useMemo, useState } from "react";

import { calculatePriceCorridor } from "@engine/pricing";
import { calculateTco } from "@engine/tco";
import type {
  Ampel,
  BerichtstexteContent,
  PreislogikContent,
  PriceInput,
  Preistyp,
  TcoContent,
} from "@engine/types";
import { ComplianceNote } from "./ComplianceNote";

const AMPEL: Record<Ampel, string> = {
  gruen: "bg-ok-weak text-ok",
  gelb: "bg-warn-weak text-warn",
  rot: "bg-bad-weak text-bad",
};

export function PreisCheck({
  preislogik,
  tco,
  berichtstexte,
  deliveredDefault,
  vorlaeufig,
  defaults,
  onBack,
  onBericht,
  tuer = "A",
}: {
  preislogik: PreislogikContent;
  tco: TcoContent;
  berichtstexte: BerichtstexteContent;
  deliveredDefault: string;
  vorlaeufig: boolean;
  defaults: { volumenJahr: number; angebotJahr: number };
  onBack: () => void;
  onBericht?: (input: PriceInput) => void;
  tuer?: string;
}) {
  const [klasse, setKlasse] = useState(deliveredDefault);
  const [volumen, setVolumen] = useState(defaults.volumenJahr);
  const [angebot, setAngebot] = useState(defaults.angebotJahr);
  const [preistyp, setPreistyp] = useState<Preistyp>("produktiv");

  // Sichtbare, änderbare Annahmen (G6) — Vorgaben aus preislogik.json.
  const [faktorMin, setFaktorMin] = useState(preislogik.betriebsfaktor.min);
  const [faktorMax, setFaktorMax] = useState(preislogik.betriebsfaktor.max);
  const [kurs, setKurs] = useState(preislogik.kurs.usd_eur);
  // Projektlaufzeit in Monaten (nur Pilotpreis, Zeitpuffer-Stufe T5); 0 = offen.
  const [laufzeit, setLaufzeit] = useState(0);

  // Anzeige-Präzision aus den Daten (preislogik.anzeige), mit sicheren Vorgaben.
  const faktorNk = preislogik.anzeige?.faktor_nachkommastellen ?? 1;
  const preisNk = preislogik.anzeige?.preis_nachkommastellen ?? 0;
  const eur = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: preisNk,
  });
  const usd = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: preisNk,
  });
  const faktor = (n: number): string =>
    n.toLocaleString("de-DE", {
      minimumFractionDigits: faktorNk,
      maximumFractionDigits: faktorNk,
    });
  const ampelLabel = (stufe: Ampel): string =>
    preislogik.washing_faktor.ampel.find((a) => a.stufe === stufe)?.label ?? "";

  const price = useMemo(
    () =>
      calculatePriceCorridor(
        {
          gelieferteKlasse: klasse,
          volumenJahr: volumen,
          angebotspreisJahrEur: angebot,
          betriebsfaktor: { min: faktorMin, max: faktorMax },
          kursUsdEur: kurs,
        },
        preislogik,
      ),
    [klasse, volumen, angebot, faktorMin, faktorMax, kurs, preislogik],
  );

  const tcoRes = useMemo(
    () =>
      calculateTco(
        {
          angebotspreis: angebot,
          preistyp,
          ...(preistyp === "pilot" && laufzeit > 0
            ? { laufzeitMonate: laufzeit }
            : {}),
        },
        tco,
      ),
    [angebot, preistyp, laufzeit, tco],
  );

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Tür {tuer} · Preis-Check
        </p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-sm border border-line-strong bg-surface px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-surface-2"
        >
          ← Zurück zum Score
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Eingaben */}
        <section className="h-fit rounded-md border border-line bg-surface p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Annahmen</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
            Größenordnungen mit sichtbaren, änderbaren Annahmen — Orientierung, keine
            Einkaufskalkulation.
          </p>

          <div className="mt-5 flex flex-col gap-5">
            <Field label="Tatsächlich gelieferte Klasse" hint="aus dem Agentik-Score übernommen — hier prüf- und änderbar">
              {vorlaeufig && (
                <span className="mb-1.5 block text-[12px] text-ink-3">
                  Score war vorläufig — Klasse bitte prüfen.
                </span>
              )}
              <select
                value={klasse}
                onChange={(e) => setKlasse(e.target.value)}
                className="w-full rounded-sm border border-line-strong bg-surface px-3 py-2.5 text-[14px] text-ink"
              >
                {preislogik.kostenklassen.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} · {k.anzeige}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Jahresvolumen (Vorgänge)" hint="Vorgabe aus dem Bedarfs-Check (Monatsvolumen × 12) — änderbar">
              <NumberInput value={volumen} onChange={setVolumen} step={100} min={1} />
            </Field>

            <Field label="Angebotspreis pro Jahr" hint="Vorgabe: typischer Plattformpreis pro Jahr — änderbar">
              <NumberInput value={angebot} onChange={setAngebot} step={1000} suffix="€" />
            </Field>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-line pt-4">
            <div className="flex items-center justify-between py-0.5 text-[12.5px] text-ink-2">
              <span>Vorgangskosten {klasse}</span>
              <span className="font-mono text-ink">
                {price.annahmen.vorgangskostenUsd.min}–{price.annahmen.vorgangskostenUsd.max} USD
              </span>
            </div>

            {preislogik.betriebsfaktor.editierbar ? (
              <Field
                label={preislogik.betriebsfaktor.label}
                hint={preislogik.betriebsfaktor.erklaerung}
              >
                <span className="flex items-center gap-2">
                  <NumberInput value={faktorMin} onChange={setFaktorMin} step={1} min={1} />
                  <span className="font-mono text-[13px] text-ink-3">bis</span>
                  <NumberInput value={faktorMax} onChange={setFaktorMax} step={1} min={1} />
                </span>
              </Field>
            ) : (
              <div className="flex items-center justify-between py-0.5 text-[12.5px] text-ink-2">
                <span>{preislogik.betriebsfaktor.label}</span>
                <span className="font-mono text-ink">
                  {price.annahmen.betriebsfaktor.min}–{price.annahmen.betriebsfaktor.max}
                </span>
              </div>
            )}

            {preislogik.kurs.editierbar ? (
              <Field label={preislogik.kurs.label} hint="USD → EUR — Standard-Annahme AWD, sichtbar und änderbar.">
                <NumberInput value={kurs} onChange={setKurs} step={0.05} min={0} decimals />
              </Field>
            ) : (
              <div className="flex items-center justify-between py-0.5 text-[12.5px] text-ink-2">
                <span>{preislogik.kurs.label}</span>
                <span className="font-mono text-ink">{price.annahmen.kursUsdEur}</span>
              </div>
            )}
          </div>
        </section>

        {/* Ergebnis: Korridor + Washing-Faktor */}
        <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
            Fairer Jahreskorridor
          </p>
          <div className="mt-2 flex items-baseline gap-2 font-mono tnum">
            <b className="text-[26px] font-semibold tracking-[-.01em]">{eur.format(price.korridorEur.min)}</b>
            <span className="text-ink-3">–</span>
            <b className="text-[26px] font-semibold tracking-[-.01em]">{eur.format(price.korridorEur.max)}</b>
          </div>
          <p className="mt-1 font-mono text-[12px] text-ink-3">
            {usd.format(price.korridorUsd.min)} – {usd.format(price.korridorUsd.max)} · pro Jahr
          </p>

          <div className="mt-6 border-t border-line pt-5">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Washing-Faktor</p>
            {angebot > 0 && price.korridorEur.max > 0 ? (
              <>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <b className="font-mono text-[46px] font-semibold leading-none tracking-[-.02em] tnum">
                      {faktor(price.washingFaktor)}
                    </b>
                    <span className="font-mono text-[20px] text-ink-3">×</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-semibold ${AMPEL[price.ampel]}`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />
                    {ampelLabel(price.ampel)}
                  </span>
                </div>
                <p className="mt-3 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-2">{price.ampelText}</p>
                <p className="mt-5 font-mono text-[11.5px] leading-relaxed text-ink-3">
                  {eur.format(angebot)} ÷ {eur.format(price.korridorEur.max)} (Korridor-Obergrenze) = {faktor(price.washingFaktor)}×
                </p>
              </>
            ) : (
              <p className="mt-3 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-2">
                {angebot > 0
                  ? "Für den Washing-Faktor bitte ein Jahresvolumen ab 1 Vorgang angeben."
                  : "Angebotspreis eingeben — dann erscheint der Washing-Faktor."}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* TCO-Wasserfall */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
              Vom Angebot zur echten Rechnung
            </p>
            <p className="mt-1 text-[13px] text-ink-2">TCO-Realitätsrechnung (Buch 6, T1–T5).</p>
          </div>
          <div className="inline-flex items-stretch gap-0.5 rounded-full border border-line bg-surface-2 p-0.5" role="group" aria-label="Preistyp">
            {(["pilot", "produktiv"] as Preistyp[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPreistyp(p)}
                aria-pressed={preistyp === p}
                className={`rounded-full px-3.5 py-1 text-[12.5px] font-medium transition-colors ${
                  preistyp === p ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
                }`}
              >
                {p === "pilot" ? "Pilotpreis" : "Produktivpreis"}
              </button>
            ))}
          </div>
        </div>

        {preistyp === "pilot" && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sm border border-line bg-surface-2 px-4 py-3">
            <label className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-ink">Projektlaufzeit</span>
              <span className="w-28">
                <NumberInput value={laufzeit} onChange={setLaufzeit} step={1} suffix="Mon." />
              </span>
            </label>
            <span className="flex-1 text-[12px] leading-relaxed text-ink-3">
              Für den Zeitpuffer (T5) auf die Projektlaufzeit. 0 = offen — dann bleibt die
              Zeitpuffer-Stufe ausgeblendet.
            </span>
          </div>
        )}

        <ol className="mt-5 flex flex-col gap-2">
          {tcoRes.stufen.map((s) => (
            <li
              key={s.nr}
              className="flex items-center gap-3 rounded-sm border border-line bg-surface-2 px-4 py-2.5"
            >
              <span className="font-mono text-[11px] text-ink-3">{s.nr}</span>
              <span className="flex-1 text-[13.5px] text-ink-2">{s.label}</span>
              {s.quelleId && (
                <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-3">
                  {s.quelleId}
                </span>
              )}
              <span className="w-32 text-right font-mono text-[14px] font-semibold tnum">
                {s.formel.includes("laufzeit") ? `${s.wert} Mon.` : eur.format(s.wert)}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-[13.5px] font-medium">Realistische Kernprojektion (Jahr 1)</span>
          <span className="font-mono text-[22px] font-semibold tnum">{eur.format(tcoRes.endwert)}</span>
        </div>
        <p className="mt-4 rounded-sm border border-line bg-surface-2 px-4 py-3 text-[12.5px] italic leading-relaxed text-ink-2">
          {tcoRes.faustregel}
        </p>
      </section>

      {/* Begründungsspur Preislogik (G2, Regeln P1–P4) */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Begründung · Preislogik
        </p>
        <ul className="mt-3 divide-y divide-line">
          {price.begruendung.map((b, i) => (
            <li key={i} className="flex items-start gap-4 py-3">
              <span className="w-10 flex-none font-mono text-[11px] text-ink-3">{b.regelId}</span>
              <span className="flex-1 text-[13px] leading-snug text-ink-2">
                {b.eingabe}
                {b.hinweis && (
                  <span className="mt-0.5 block text-[12px] text-ink-3">{b.hinweis}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <ComplianceNote berichtstexte={berichtstexte} />

      <p className="max-w-[70ch] text-[12px] leading-relaxed text-ink-3">
        {berichtstexte.bloecke.orientierungs_disclaimer}
      </p>

      {onBericht && (
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              onBericht({
                gelieferteKlasse: klasse,
                volumenJahr: volumen,
                angebotspreisJahrEur: angebot,
                betriebsfaktor: { min: faktorMin, max: faktorMax },
                kursUsdEur: kurs,
              })
            }
            className="inline-flex items-center gap-2 rounded-sm border border-accent bg-accent px-4 py-2.5 text-[14px] font-semibold text-accent-on transition-colors hover:bg-accent-2"
          >
            Prüfbericht erstellen
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <span className="text-[12.5px] text-ink-3">
            Fasst Score, Preis und Begründung zu einem Prüfbericht zusammen.
          </span>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <span className="mt-0.5 block text-[11.5px] text-ink-3">{hint}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  step,
  suffix,
  min = 0,
  decimals = false,
}: {
  value: number;
  onChange: (n: number) => void;
  step: number;
  suffix?: string;
  min?: number;
  decimals?: boolean;
}) {
  return (
    <span className="relative flex items-center">
      <input
        type="number"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : min}
        onChange={(e) => {
          const raw = Number(e.target.value);
          const n = Number.isFinite(raw) ? raw : min;
          onChange(Math.max(min, decimals ? n : Math.round(n)));
        }}
        className="w-full rounded-sm border border-line-strong bg-surface px-3 py-2.5 font-mono text-[14px] text-ink tnum"
      />
      {suffix && <span className="pointer-events-none absolute right-3 font-mono text-[13px] text-ink-3">{suffix}</span>}
    </span>
  );
}
