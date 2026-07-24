import { Wizard } from "../components/Wizard";
import { getContent } from "../lib/content";

// Content zur Laufzeit lesen (Directus-Pflege ohne Deployment).
export const dynamic = "force-dynamic";

export default function PruefungPage() {
  const content = getContent();
  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <Wizard achsen={content.achsen} />
    </div>
  );
}
