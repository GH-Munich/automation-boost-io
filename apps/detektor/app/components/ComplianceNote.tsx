import type { BerichtstexteContent } from "@engine/types";

/**
 * Rendert die kanzleireviewpflichtigen Standardklauseln WÖRTLICH aus
 * berichtstexte.json (G2 Bewertungsgrundlage, G3 Fairness). Die Klauseltexte
 * werden nicht umformuliert — Überschriften sind reine UI-Labels, nicht Teil
 * der Klausel (CLAUDE.md §10).
 */
export function ComplianceNote({
  berichtstexte,
}: {
  berichtstexte: BerichtstexteContent;
}) {
  const b = berichtstexte.bloecke;
  return (
    <section className="rounded-md border border-line bg-surface-2 p-6 sm:p-7">
      <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
        Grundlage & Fairness
      </p>

      <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">
        Fairness-Klausel (G3)
      </p>
      <p className="mt-1.5 max-w-[74ch] text-[13px] leading-relaxed text-ink-2">
        {b.fairness_klausel}
      </p>

      <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">
        Bewertungsgrundlage (G2)
      </p>
      <p className="mt-1.5 max-w-[74ch] text-[13px] leading-relaxed text-ink-2">
        {b.eingabebasiertheit}
      </p>
    </section>
  );
}

/** Ersetzt die Platzhalter {n}/{m} in einem Klauseltext, ohne ihn umzuformulieren. */
export function fuelleKlausel(
  text: string,
  werte: Record<string, string | number>,
): string {
  return text.replace(/\{(\w+)\}/g, (treffer, schluessel: string) =>
    schluessel in werte ? String(werte[schluessel]) : treffer,
  );
}
