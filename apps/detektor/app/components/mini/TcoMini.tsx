"use client";

import { useMemo, useState } from "react";

import { calculateTco } from "@engine/tco";
import type { Preistyp, TcoContent } from "@engine/types";

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function TcoMini({
  tco,
  defaultAngebot,
  defaultLaufzeit,
}: {
  tco: TcoContent;
  defaultAngebot: number;
  defaultLaufzeit: number;
}) {
  const [angebot, setAngebot] = useState(defaultAngebot);
  const [preistyp, setPreistyp] = useState<Preistyp>("pilot");
  const [laufzeit, setLaufzeit] = useState(defaultLaufzeit);

  const res = useMemo(
    () =>
      calculateTco(
        {
          angebotspreis: angebot,
          preistyp,
          ...(preistyp === "pilot" ? { laufzeitMonate: laufzeit } : {}),
        },
        tco,
      ),
    [angebot, preistyp, laufzeit, tco],
  );

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      <section className="h-fit rounded-md border border-line bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          <label className="block">
            <span className="text-[13px] font-medium text-ink">Angebotspreis</span>
            <input
              type="number"
              min={0}
              step={1000}
              value={Number.isFinite(angebot) ? angebot : 0}
              onChange={(e) => setAngebot(Math.max(0, Math.round(Number(e.target.value) || 0)))}
              className="mt-2 w-full rounded-sm border border-line-strong bg-surface px-3 py-2.5 font-mono text-[15px] text-ink tnum"
            />
          </label>

          <div>
            <span className="text-[13px] font-medium text-ink">Was für ein Preis ist das?</span>
            <div className="mt-2 inline-flex items-stretch gap-0.5 rounded-full border border-line bg-surface-2 p-0.5">
              {(["pilot", "produktiv"] as Preistyp[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreistyp(p)}
                  aria-pressed={preistyp === p}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    preistyp === p ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {p === "pilot" ? "Pilot-/Einstiegspreis" : "Produktivpreis"}
                </button>
              ))}
            </div>
          </div>

          {preistyp === "pilot" && (
            <label className="block">
              <span className="text-[13px] font-medium text-ink">Projektlaufzeit (Monate)</span>
              <input
                type="number"
                min={1}
                step={1}
                value={Number.isFinite(laufzeit) ? laufzeit : 0}
                onChange={(e) => setLaufzeit(Math.max(1, Math.round(Number(e.target.value) || 1)))}
                className="mt-2 w-32 rounded-sm border border-line-strong bg-surface px-3 py-2.5 font-mono text-[15px] text-ink tnum"
              />
            </label>
          )}
        </div>
      </section>

      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Vom Angebot zur echten Rechnung
        </p>
        <ol className="mt-4 flex flex-col gap-2">
          {res.stufen.map((s) => (
            <li key={s.nr} className="flex items-center gap-3 rounded-sm border border-line bg-surface-2 px-4 py-2.5">
              <span className="font-mono text-[11px] text-ink-3">{s.nr}</span>
              <span className="flex-1 text-[13.5px] text-ink-2">{s.label}</span>
              {s.quelleId && (
                <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-3">{s.quelleId}</span>
              )}
              <span className="w-32 text-right font-mono text-[14px] font-semibold tnum">
                {s.formel.includes("laufzeit") ? `${s.wert} Mon.` : eur.format(s.wert)}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-[13.5px] font-medium">Realistische Kernprojektion (Jahr 1)</span>
          <span className="font-mono text-[24px] font-semibold tnum">{eur.format(res.endwert)}</span>
        </div>
        <p className="mt-4 rounded-sm border border-line bg-surface-2 px-4 py-3 text-[12.5px] italic leading-relaxed text-ink-2">
          {res.faustregel}
        </p>
      </section>
    </div>
  );
}
