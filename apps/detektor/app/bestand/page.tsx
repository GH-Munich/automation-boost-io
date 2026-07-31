import { Assessment } from "../components/Assessment";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export default function BestandPage() {
  const content = getContent();

  const fragen = content.bedarf.fragen as Array<{ id: string; default?: number }>;
  const f7Monat = fragen.find((f) => f.id === "F7")?.default ?? 200;
  const faktorVisual = content.bedarf.faktor_visual as { plattform_jahr_eur?: number };

  const defaults = {
    volumenJahr: f7Monat * 12,
    angebotJahr: faktorVisual.plattform_jahr_eur ?? 0,
  };

  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <div className="mb-5 rounded-md border border-line bg-surface-2 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Was Sie schon gekauft haben
        </p>
        <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-ink-2">
          Sie haben ein System bereits gekauft. Ordnen Sie es rückblickend anhand derselben
          sechs Achsen ein und stellen Sie das Ergebnis dem gegenüber, was Sie tatsächlich
          zahlen. Gleiche Angaben, gleiches Ergebnis — kein Anbieterurteil, nur eine
          Einordnung Ihrer bestätigten Angaben.
        </p>
      </div>
      <Assessment
        achsen={content.achsen}
        preislogik={content.preislogik}
        tco={content.tco}
        berichtstexte={content.berichtstexte}
        standardVersion={content.standardVersion}
        defaults={defaults}
        tuer="B"
      />
    </div>
  );
}
