import { BedarfWizard } from "../../components/BedarfWizard";
import { MiniHead } from "../../components/mini/MiniHead";
import { MiniOutro } from "../../components/mini/MiniOutro";
import { getContent } from "../../lib/content";

export const dynamic = "force-dynamic";

export default function BedarfMiniPage() {
  const c = getContent();
  const cfg = c.raw["minis/mini-bedarf.json"] as unknown as {
    titel: string;
    fragen: Array<{ ref?: string }>;
    cta: { label: string };
    consent_checkbox: string;
  };
  const frageIds = cfg.fragen
    .map((f) => f.ref?.split(".")[1])
    .filter((id): id is string => Boolean(id));
  const disc = (
    c.raw["berichtstexte.json"] as unknown as { bloecke: { orientierungs_disclaimer: string } }
  ).bloecke.orientierungs_disclaimer;

  return (
    <div className="mx-auto max-w-wrap px-4 py-10 sm:px-8">
      <MiniHead titel={cfg.titel} hinweis="Sechs Prozessfragen — die Einordnung folgt festen Regeln." />
      <div className="mt-8">
        <BedarfWizard bedarf={c.bedarf} frageIds={frageIds} />
      </div>
      <MiniOutro ctaLabel={cfg.cta.label} ctaHref="/bedarf" consent={cfg.consent_checkbox} disclaimer={disc} />
    </div>
  );
}
