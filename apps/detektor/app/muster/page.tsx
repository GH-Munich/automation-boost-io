import type { Metadata } from "next";

import { MusterCheck } from "../components/MusterCheck";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mustererkennung — Kenne ich diese Masche? · Der Agent-Washing-Detektor",
  description:
    "Ordnet ein Angebot einem bekannten Verkaufsmuster zu (Voice, Support, RAG im Agentenmantel …) — eine Vermutung mit Bestätigungspflicht, samt Prüffragen und Präzedenzfall.",
};

export default function MusterPage() {
  const content = getContent();
  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <MusterCheck muster={content.muster} />
    </div>
  );
}
