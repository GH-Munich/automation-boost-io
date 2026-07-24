import { BafaMini, type BafaConfig } from "../../components/mini/BafaMini";
import { MiniHead } from "../../components/mini/MiniHead";
import { MiniOutro } from "../../components/mini/MiniOutro";
import { getContent } from "../../lib/content";

export const dynamic = "force-dynamic";

export default function BafaMiniPage() {
  const c = getContent();
  const cfg = c.raw["minis/mini-bafa.json"] as unknown as BafaConfig & {
    cta: { label: string; ziel_tuer: string | null };
    consent_checkbox: string;
  };

  return (
    <div className="mx-auto max-w-wrap px-4 py-10 sm:px-8">
      <MiniHead
        titel={cfg.titel}
        hinweis="Vier Fragen — ob die BAFA-Beratungsförderung für Sie greift. Richtlinie endet 31.12.2026."
      />
      <BafaMini config={cfg} />
      <MiniOutro ctaLabel={cfg.cta.label} ctaHref={null} consent={cfg.consent_checkbox} />
    </div>
  );
}
