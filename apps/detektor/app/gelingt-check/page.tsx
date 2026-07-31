import { GelingtCheck } from "../components/GelingtCheck";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export default function GelingtPage() {
  const content = getContent();
  const g = content.gelingt;

  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <div className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Kostenlos · {g.zeitangabe_min} Minuten
        </p>
        <h1 className="balance mt-2 text-[clamp(22px,3.5vw,30px)] font-bold tracking-[-.02em]">
          {g.titel}
        </h1>
        <p className="mt-2 max-w-[64ch] text-[15px] leading-relaxed text-ink-2">{g.untertitel}</p>
      </div>
      <GelingtCheck gelingt={g} />
      <p className="mt-5 max-w-[72ch] text-[11px] leading-relaxed text-ink-3">{g.disclaimer}</p>
    </div>
  );
}
