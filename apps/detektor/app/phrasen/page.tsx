import type { Metadata } from "next";

import { PhrasenDecoder, type PhrasenConfig } from "../components/PhrasenDecoder";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Die 10 Sätze — Phrasen-Decoder · Der Agent-Washing-Detektor",
  description:
    "Zehn typische Verkaufssätze, was meist dahintersteckt und die eine Gegenfrage, die Klarheit schafft. Orientierung für das Anbietergespräch.",
};

export default function PhrasenPage() {
  const content = getContent();
  const config = content.raw["phrasen.json"] as unknown as PhrasenConfig;

  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <PhrasenDecoder config={config} />
    </div>
  );
}
