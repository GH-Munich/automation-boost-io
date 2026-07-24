import { Assessment } from "../components/Assessment";
import { getContent } from "../lib/content";

// Content zur Laufzeit lesen (Directus-Pflege ohne Deployment).
export const dynamic = "force-dynamic";

export default function PruefungPage() {
  const content = getContent();

  // Sichtbare, änderbare Vorgabewerte — Quellen aus den Content-JSONs (G6).
  const fragen = content.bedarf.fragen as Array<{ id: string; default?: number }>;
  const f7Monat = fragen.find((f) => f.id === "F7")?.default ?? 200;
  const faktorVisual = content.bedarf.faktor_visual as { plattform_jahr_eur?: number };

  const defaults = {
    volumenJahr: f7Monat * 12,
    angebotJahr: faktorVisual.plattform_jahr_eur ?? 0,
  };

  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <Assessment
        achsen={content.achsen}
        preislogik={content.preislogik}
        tco={content.tco}
        berichtstexte={content.berichtstexte}
        standardVersion={content.standardVersion}
        defaults={defaults}
      />
    </div>
  );
}
