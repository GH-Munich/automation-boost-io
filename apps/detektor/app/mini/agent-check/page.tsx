import { Wizard } from "../../components/Wizard";
import { MiniHead } from "../../components/mini/MiniHead";
import { MiniOutro } from "../../components/mini/MiniOutro";
import { getContent } from "../../lib/content";

export const dynamic = "force-dynamic";

export default function AgentCheckMiniPage() {
  const c = getContent();
  const cfg = c.raw["minis/mini-agent-check.json"] as unknown as {
    titel: string;
    cta: { label: string };
    consent_checkbox: string;
  };
  const disc = c.berichtstexte.bloecke.fairness_klausel;

  return (
    <div className="mx-auto max-w-wrap px-4 py-10 sm:px-8">
      <MiniHead titel={cfg.titel} hinweis="Sechs Fragen, eine je Achse — ohne technische Vorkenntnisse." />
      <div className="mt-8">
        <Wizard achsen={c.achsen} berichtstexte={c.berichtstexte} />
      </div>
      <MiniOutro ctaLabel={cfg.cta.label} ctaHref="/pruefung" consent={cfg.consent_checkbox} disclaimer={disc} />
    </div>
  );
}
