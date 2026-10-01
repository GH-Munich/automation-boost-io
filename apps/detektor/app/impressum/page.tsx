import type { Metadata } from "next";

/**
 * Impressum.
 * DRAFT – keine Rechtsberatung (Entwurf – keine Rechtsberatung).
 *
 * Source: the Impressum of haeuserer.info (same operator, HÄUSERER CONSULTING),
 * taken over 1:1 as published on 2026-10-02 (website/index.html, view-impressum;
 * identical to https://haeuserer.info/impressum.html). Do not edit the wording
 * here without changing the source as well.
 */

export const metadata: Metadata = {
  title: "Impressum · Der Agent-Washing-Detektor",
  description: "Anbieterkennzeichnung des Agent-Washing-Detektors (HÄUSERER CONSULTING).",
};

const h2 = "mt-8 text-[17px] font-semibold tracking-[-.01em] text-ink";
const p = "mt-2 text-[14.5px] leading-relaxed text-ink-2";

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <article className="max-w-[70ch]">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Rechtliches</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-.02em] text-ink sm:text-[32px]">Impressum</h1>

        <h2 className={h2}>Angaben gemäß § 5 DDG</h2>
        <p className={p}>
          <strong className="text-ink">HÄUSERER CONSULTING</strong>
          <br />
          Inhaber: Gottfried Häuserer
          <br />
          Otto-Engl-Platz 8a
          <br />
          81241 München, Deutschland
        </p>

        <h2 className={h2}>Kontakt</h2>
        <p className={p}>
          Telefon: +49 (0)176 312 40 897
          <br />
          E-Mail: haeuserer(at)haeuserer.info
        </p>

        <h2 className={h2}>Umsatzsteuer-ID</h2>
        <p className={p}>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE280863200</p>

        <h2 className={h2}>Gewerbeanmeldung</h2>
        <p className={p}>Gewerbeerlaubnis nach § 14 GewO erteilt am 07.10.2025 von LH München KVR III/211.</p>

        {/* // OFFEN: "§ 55 Abs. 2 RStV" is taken over 1:1 from haeuserer.info; the RStV was replaced
            by the Medienstaatsvertrag (now § 18 Abs. 2 MStV). Fix in both places after legal check. */}
        <h2 className={h2}>Journalistisch-redaktionelle Inhalte</h2>
        <p className={p}>
          Redaktionell verantwortlich i.&nbsp;S.&nbsp;d. § 55 Abs. 2 RStV: Gottfried Häuserer, Otto-Engl-Platz 8a,
          81241 München
        </p>

        <h2 className={h2}>Haftungshinweise</h2>
        <p className={p}>
          <strong className="text-ink">Haftung für Inhalte:</strong>
          <br />
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich. Eine Haftung für die absolute Richtigkeit und Aktualität wird nicht übernommen.
          Fehlerhinweise werden gerne entgegengenommen.
        </p>
        <p className={p}>
          <strong className="text-ink">Haftung für Links:</strong>
          <br />
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Für
          die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei
          Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>
        <p className={p}>
          <strong className="text-ink">Urheberrecht:</strong>
          <br />
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
          Urheberrecht. Vervielfältigung, Bearbeitung oder Verbreitung bedarf der schriftlichen Zustimmung. Bei
          Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
        </p>

        <p className="mt-8 text-[12.5px] text-ink-3">Stand: September 2026</p>
      </article>
    </div>
  );
}
