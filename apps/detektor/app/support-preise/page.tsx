import type { Metadata } from "next";

import { SupportPreise, type SupportPreiseConfig } from "../components/SupportPreise";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Was ein Support-Agent wirklich kostet · Der Agent-Washing-Detektor",
  description:
    "Das Resolution-Abrechnungsmodell, versteckte Kosten und dokumentierte Marktreferenzen für Support-Agenten. Orientierung, kein Anbieterurteil, quartalsgepflegt.",
};

export default function SupportPreisePage() {
  const content = getContent();
  const config = content.raw["preise-support.json"] as unknown as SupportPreiseConfig;

  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <SupportPreise config={config} fairness={content.berichtstexte.bloecke.fairness_klausel} />
    </div>
  );
}
