import { MiniHead } from "../../components/mini/MiniHead";
import { MiniOutro } from "../../components/mini/MiniOutro";
import { TcoMini } from "../../components/mini/TcoMini";
import { getContent } from "../../lib/content";

export const dynamic = "force-dynamic";

export default function TcoMiniPage() {
  const c = getContent();
  const cfg = c.raw["minis/mini-tco.json"] as unknown as {
    titel: string;
    eingaben: Array<{ id?: string; default?: number }>;
    cta: { label: string };
    consent_checkbox: string;
  };
  const angebotDef = cfg.eingaben.find((e) => e.id === "angebot_eur")?.default ?? 15000;
  const laufzeitDef = cfg.eingaben.find((e) => e.id === "laufzeit_monate")?.default ?? 6;
  const disc = (
    c.raw["berichtstexte.json"] as unknown as { bloecke: { orientierungs_disclaimer: string } }
  ).bloecke.orientierungs_disclaimer;

  return (
    <div className="mx-auto max-w-wrap px-4 py-10 sm:px-8">
      <MiniHead titel={cfg.titel} hinweis="Drei Eingaben — die realistische Jahr-1-Zahl statt der Pilotrechnung." />
      <TcoMini tco={c.tco} defaultAngebot={angebotDef} defaultLaufzeit={laufzeitDef} />
      <MiniOutro ctaLabel={cfg.cta.label} ctaHref="/pruefung" consent={cfg.consent_checkbox} disclaimer={disc} />
    </div>
  );
}
