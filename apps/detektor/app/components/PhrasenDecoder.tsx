"use client";

import { useState } from "react";

type Phrase = { id: string; satz: string; bedeutung: string; gegenfrage: string };
export type PhrasenConfig = {
  titel: string;
  phrasen: Phrase[];
  praxishinweis: string;
};

export function PhrasenDecoder({ config }: { config: PhrasenConfig }) {
  const [kopiert, setKopiert] = useState<string | null>(null);

  async function kopiere(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setKopiert(id);
      window.setTimeout(() => setKopiert((k) => (k === id ? null : k)), 2000);
    } catch {
      /* Zwischenablage nicht verfügbar — der Text steht sichtbar bereit. */
    }
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Phrasen-Decoder
        </p>
        <h1 className="balance mt-2 text-[clamp(22px,3.4vw,30px)] font-bold leading-[1.15] tracking-[-.02em]">
          {config.titel}
        </h1>
        <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-ink-2">
          Verkaufssätze, die häufig fallen — was meist dahintersteckt und die eine Gegenfrage,
          die Klarheit schafft. Kein Anbieterurteil, nur eine Lesehilfe für Ihr Gespräch.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {config.phrasen.map((p) => (
          <section key={p.id} className="flex flex-col rounded-md border border-line bg-surface p-5 shadow-sm">
            <p className="font-mono text-[11px] text-ink-3">{p.id}</p>
            <p className="mt-1.5 text-[16px] font-semibold leading-snug text-ink">„{p.satz}"</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
              <span className="font-medium text-ink">Was oft gemeint ist: </span>
              {p.bedeutung}
            </p>
            <div className="mt-3 flex-1 rounded-sm border border-line bg-surface-2 p-3">
              <p className="text-[13.5px] leading-relaxed text-ink">
                <span className="font-medium">Gegenfrage: </span>
                {p.gegenfrage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => kopiere(p.id, p.gegenfrage)}
              className="mt-3 self-start rounded-sm border border-line-strong bg-surface px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-surface-2"
            >
              {kopiert === p.id ? "Gegenfrage kopiert ✓" : "Gegenfrage kopieren"}
            </button>
          </section>
        ))}
      </div>

      <section className="rounded-md border border-line bg-surface-2 p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Praxishinweis</p>
        <p className="mt-2.5 max-w-[74ch] text-[13.5px] leading-relaxed text-ink-2">{config.praxishinweis}</p>
      </section>
    </div>
  );
}
