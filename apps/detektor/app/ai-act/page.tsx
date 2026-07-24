import type { Metadata } from "next";

import { AiActMini, type AiActConfig } from "../components/AiActMini";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Betrifft Sie der 2. August? — EU AI Act · Der 2-Minuten-Detektor",
  description:
    "Vier Fragen, eine persönliche Pflichtenliste zu den Transparenzpflichten des EU AI Act (Art. 50) zum 2. August 2026. Orientierung, keine Rechtsberatung.",
};

export default function AiActPage() {
  const content = getContent();
  const config = content.raw["minis/mini-ai-act.json"] as unknown as AiActConfig;
  const berichtstexte = content.raw["berichtstexte.json"] as unknown as {
    bloecke: { ai_act_label: string };
  };

  return <AiActMini config={config} disclaimer={berichtstexte.bloecke.ai_act_label} />;
}
