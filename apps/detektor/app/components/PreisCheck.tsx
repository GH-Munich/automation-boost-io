"use client";

import { useMemo, useState } from "react";

import { calculatePriceCorridor } from "@engine/pricing";
import { calculateTco } from "@engine/tco";
import type {
  Ampel,
  BerichtstexteContent,
  Komplexitaet,
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
  m3Klasse,
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
  m3Klasse?: string | null;
  onBack: () => void;
  onBericht?: (input: PriceInput) => void;
  tuer?: string;
}) {
  const maske = preislogik.maske;
  const aufwandStufen = maske?.aufwand ?? [];
  const stepWerte = (maske?.volumen_stufen ?? []).map((s) => s.wert);
  const naechsteStufe = (v: number): number =>
    stepWerte.length
      ? stepWerte.reduce((b, w) => (Math.abs(w - v) < Math.abs(b - v) ? w : b), stepWerte[0]!)
      : v;
  const stdAufwandIdx = Math.max(
    0,
    aufwandStufen.findIndex(
      (a) => a.betriebsfaktor === preislogik.betriebsfaktor.default,
    ),
  );

  const [klasse, setKlasse] = useState(deliveredDefault);
  const [benoetigt, setBenoetigt] = useState(deliveredDefault);
  const [m3, setM3] = useState(false);
  const [volumen, setVolumen] = useState(() => naechsteStufe(defaults.volumenJahr));
  const [komplexitaet, setKomplexitaet] = useState<Komplexitaet>("mittel");
  const [aufwandIdx, setAufwandIdx] = useState(stdAufwandIdx);
  const [angebot, setAngebot] = useState(defaults.angebotJahr);
  const [preistyp, setPreistyp] = useState<Preistyp>("produktiv");
  const [kurs, setKurs] = useState(preislogik.kurs.usd_eur);

  // Betriebsfaktor kommt aus dem Aufwand-Regler (④); Kurs bleibt Feinjustage (G6).
  const bf =
    aufwandStufen[aufwandIdx]?.betriebsfaktor ?? preislogik.betriebsfaktor.default;
  const stufeLabel =
    maske?.volumen_stufen.find((s) => s.wert === volumen)?.label ?? "";
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
          betriebsfaktor: { min: bf, max: bf },
          kursUsdEur: kurs,
          komplexitaet,
          ...(benoetigt && benoetigt !== klasse
            ? { benoetigteKlasse: benoetigt }
            : {}),
        },
        preislogik,
      ),
    [klasse, benoetigt, volumen, komplexitaet, angebot, bf, kurs, preislogik],
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
          Ist der Preis fair?
        </p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-sm border border-line-strong bg-surface px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-surface-2"
        >
          ← Zurück
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Eingaben */}
        <section className="h-fit rounded-md border border-line bg-surface p-6 shadow-sm">
          {/* Typischer Fall (Personas) */}
          {maske && maske.personas.length > 0 && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
                Typischer Fall
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-3">
                Wählen Sie den Fall, der am ehesten passt — das füllt Volumen, „nötig" und
                Komplexität vor.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {maske.personas.map((p) => {
                  const aktiv =
                    p.volumen === volumen &&
                    p.komplexitaet === komplexitaet &&
                    p.noetig_klasse === benoetigt;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setVolumen(p.volumen);
                        setKomplexitaet(p.komplexitaet);
                        setBenoetigt(p.noetig_klasse);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-colors ${
                        aktiv
                          ? "border-accent bg-accent-weak text-accent"
                          : "border-line text-ink-2 hover:bg-surface-2"
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lösungsart-Leiter: geliefert vs. nötig */}
          <div className="mt-6">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
              Was wird geliefert — was ist nötig?
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-3">
              Klicken Sie die tatsächlich gelieferte Stufe an. „Nötig" ergibt sich aus dem
              gewählten Fall.
            </p>
            {vorlaeufig && (
              <span className="mt-2 block text-[12px] text-ink-3">
                Reifegrad war vorläufig — gelieferte Stufe bitte prüfen.
              </span>
            )}
            <div className="mt-3 flex flex-col gap-1.5">
              {[...preislogik.kostenklassen]
                .sort((a, b) => b.ordnung - a.ordnung)
                .map((k) => {
                  const istGeliefert = k.id === klasse;
                  const istNoetig = k.id === benoetigt;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setKlasse(k.id)}
                      className={`flex items-center gap-2 rounded-sm border px-3 py-2 text-left transition-colors ${
                        istGeliefert
                          ? "border-accent bg-accent-weak"
                          : "border-line hover:bg-surface-2"
                      }`}
                    >
                      <span
                        className={`flex-1 text-[13px] ${
                          istGeliefert ? "font-semibold text-accent" : "text-ink-2"
                        }`}
                      >
                        {k.name}
                      </span>
                      <span className="font-mono text-[10.5px] text-ink-3">{k.anzeige}</span>
                      {istGeliefert && (
                        <span className="rounded-full bg-accent-weak px-2 py-0.5 text-[10px] font-semibold text-accent">
                          geliefert
                        </span>
                      )}
                      {istNoetig && (
                        <span className="rounded-full bg-ok-weak px-2 py-0.5 text-[10px] font-semibold text-ok">
                          nötig
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
            {m3Klasse && (
              <label className="mt-2.5 flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-2">
                <input
                  type="checkbox"
                  checked={m3}
                  onChange={(e) => {
                    setM3(e.target.checked);
                    if (e.target.checked) setKlasse(m3Klasse);
                  }}
                  className="mt-0.5"
                />
                <span>
                  Angebot ist ein KI-Upgrade eines RPA-Bestandsanbieters (Muster M3). Nach dem
                  Prüfstandard ist die Referenzklasse dann die konventionelle Lösung.
                </span>
              </label>
            )}
          </div>

          {/* Regler: Volumen · Komplexität · Aufwand + Angebotspreis */}
          <div className="mt-6 flex flex-col gap-5 border-t border-line pt-5">
            {maske && maske.volumen_stufen.length > 0 && (
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium text-ink">Wie oft im Jahr?</span>
                  <span className="font-mono text-[12.5px] text-ink-2 tnum">
                    {volumen.toLocaleString("de-DE")}
                    {stufeLabel && <span className="text-ink-3"> · {stufeLabel}</span>}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maske.volumen_stufen.length - 1}
                  step={1}
                  value={Math.max(0, stepWerte.indexOf(volumen))}
                  onChange={(e) => setVolumen(stepWerte[Number(e.target.value)] ?? volumen)}
                  className="mt-2 w-full"
                  aria-label="Wie oft im Jahr?"
                />
              </div>
            )}

            {maske && maske.komplexitaet.length > 0 && (
              <Segmented
                label="Wie kompliziert ist ein Vorgang?"
                hint={maske.komplexitaet.find((k) => k.grad === komplexitaet)?.erklaerung}
                options={maske.komplexitaet.map((k) => ({ value: k.grad, label: k.label }))}
                value={komplexitaet}
                onChange={(v) => setKomplexitaet(v as Komplexitaet)}
              />
            )}

            {aufwandStufen.length > 0 && (
              <Segmented
                label="Wie aufwendig sind Betrieb & Modell?"
                hint={aufwandStufen[aufwandIdx]?.erklaerung}
                options={aufwandStufen.map((a, i) => ({ value: String(i), label: a.label }))}
                value={String(aufwandIdx)}
                onChange={(v) => setAufwandIdx(Number(v))}
              />
            )}

            <Field label="Angebotspreis pro Jahr" hint="Der Jahrespreis aus dem Angebot — hier eintragen.">
              <NumberInput value={angebot} onChange={setAngebot} step={1000} suffix="€" />
            </Field>
          </div>

          {/* Feinjustage / Annahmen (G6) */}
          <div className="mt-5 flex flex-col gap-4 border-t border-line pt-4">
            <div className="flex items-center justify-between py-0.5 text-[12.5px] text-ink-2">
              <span>Vorgangskosten (gewählte Stufe)</span>
              <span className="font-mono text-ink">
                {price.annahmen.vorgangskostenUsd.min}–{price.annahmen.vorgangskostenUsd.max} USD
              </span>
            </div>
            <div className="flex items-center justify-between py-0.5 text-[12.5px] text-ink-2">
              <span>{preislogik.betriebsfaktor.label} (aus Aufwand)</span>
              <span className="font-mono text-ink">{bf}</span>
            </div>
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

        {/* Ergebnis: Hybrid — reine Technik-Rohkosten + realistischer Gesamtrahmen + Preis-Aufschlag */}
        <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
          {/* Nebenzeile: reine Technik-Rohkosten (entlarvt Skript-zum-Agentenpreis) */}
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
            {preislogik.gesamtrahmen?.label_technik ?? "Reine Technik-Rohkosten"} pro Jahr
          </p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono tnum">
            <b className="text-[18px] font-semibold tracking-[-.01em] text-ink-2">{eur.format(price.korridorEur.min)}</b>
            <span className="text-ink-3">–</span>
            <b className="text-[18px] font-semibold tracking-[-.01em] text-ink-2">{eur.format(price.korridorEur.max)}</b>
            <span className="ml-1 text-[11px] text-ink-3">
              ({usd.format(price.korridorUsd.min)} – {usd.format(price.korridorUsd.max)})
            </span>
          </div>

          {/* Hauptzeile: realistischer Gesamtrahmen inkl. Fixkosten-Sockel */}
          <div className="mt-5 border-t border-line pt-5">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
              {preislogik.gesamtrahmen?.label_gesamt ?? "Realistischer Gesamtrahmen (inkl. Einrichtung & Betrieb)"}
            </p>
            <div className="mt-2 flex items-baseline gap-2 font-mono tnum">
              <b className="text-[26px] font-semibold tracking-[-.01em]">{eur.format(price.korridorGesamtEur.min)}</b>
              <span className="text-ink-3">–</span>
              <b className="text-[26px] font-semibold tracking-[-.01em]">{eur.format(price.korridorGesamtEur.max)}</b>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-3">
              enthält einen Fixkosten-Sockel von {eur.format(price.sockelEur)} (Einrichtung, Betrieb, Support, Wartung)
            </p>
          </div>

          {/* Preis-Aufschlag gegen den Gesamtrahmen (Ampel-Basis) */}
          <div className="mt-6 border-t border-line pt-5">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Preis-Aufschlag</p>
            {angebot > 0 && price.korridorGesamtEur.max > 0 ? (
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
                  {eur.format(angebot)} ÷ {eur.format(price.korridorGesamtEur.max)} (Gesamtrahmen-Obergrenze) = {faktor(price.washingFaktor)}×
                </p>
                {Number.isFinite(price.washingFaktorTechnik) && (
                  <p className="mt-1.5 max-w-[46ch] text-[12px] leading-relaxed text-ink-3">
                    Zum Vergleich: das{" "}
                    <b className="font-semibold text-ink-2">{faktor(price.washingFaktorTechnik)}×</b> der reinen
                    Technik-Rohkosten — so viel liegt der Preis über dem, was die Technik selbst verursacht.
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-2">
                {angebot > 0
                  ? "Für den Preis-Aufschlag bitte ein Jahresvolumen ab 1 Vorgang angeben."
                  : "Angebotspreis eingeben — dann erscheint der Preis-Aufschlag."}
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
              Was es über die Jahre wirklich kostet
            </p>
            <p className="mt-1 text-[13px] text-ink-2">Was neben dem Angebotspreis über die ganze Laufzeit wirklich zusammenkommt.</p>
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
          So ist der Preis gerechnet
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
                betriebsfaktor: { min: bf, max: bf },
                kursUsdEur: kurs,
                komplexitaet,
                ...(benoetigt && benoetigt !== klasse
                  ? { benoetigteKlasse: benoetigt }
                  : {}),
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

function Segmented({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string | undefined;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <div
        className="mt-2 inline-flex w-full items-stretch gap-0.5 rounded-full border border-line bg-surface-2 p-0.5"
        role="group"
        aria-label={label}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`flex-1 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
              value === o.value
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && <span className="mt-1 block text-[11.5px] leading-relaxed text-ink-3">{hint}</span>}
    </div>
  );
}
