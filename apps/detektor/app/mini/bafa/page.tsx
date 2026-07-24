import { BafaMini, type BafaConfig } from "../../components/mini/BafaMini";
import { MiniHead } from "../../components/mini/MiniHead";
import { MiniOutro } from "../../components/mini/MiniOutro";
import { getContent } from "../../lib/content";

export const dynamic = "force-dynamic";

export default function BafaMiniPage() {
  const c = getContent();
  const cfg = c.raw["minis/mini-bafa.json"] as unknown as BafaConfig & {
    untertitel?: string;
    cta: { label: string; ziel_tuer: string | null };
    consent_checkbox: string;
  };

  // Frist zentral aus berichtstexte.bafa_vermerk.gueltig_bis (eine Quelle).
  const [y, m, d] = c.berichtstexte.bloecke.bafa_vermerk.gueltig_bis.split("-");
  const frist = y && m && d ? `${d}.${m}.${y}` : null;
  const hinweis = [cfg.untertitel, frist ? `Richtlinie endet ${frist}.` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto max-w-wrap px-4 py-10 sm:px-8">
      <MiniHead titel={cfg.titel} hinweis={hinweis} />
      <BafaMini config={cfg} />
      <MiniOutro ctaLabel={cfg.cta.label} ctaHref={null} consent={cfg.consent_checkbox} />
    </div>
  );
}
