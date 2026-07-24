import type { Metadata } from "next";

import { FragenZwoelf, type FragenZwoelfConfig } from "../components/FragenZwoelf";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Die 12 Fragen vor der Unterschrift — Der Agent-Washing-Detektor",
  description:
    "Zwölf Prüffragen für die Ausschreibung — ohne technische Vorkenntnisse stellbar. Unbeantwortete Nachweisfragen sind ein eigenständiger Befund.",
};

export default function FragenPage() {
  const content = getContent();
  const config = content.raw["fragen-12.json"] as unknown as FragenZwoelfConfig;

  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <FragenZwoelf config={config} standardVersion={content.standardVersion} />
    </div>
  );
}
