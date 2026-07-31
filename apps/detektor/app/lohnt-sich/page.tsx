import { NutzenCheck } from "../components/NutzenCheck";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export default function LohntSichPage() {
  const content = getContent();
  const n = content.nutzen;

  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <div className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Kostenlos · grobe Größenordnung
        </p>
        <h1 className="balance mt-2 text-[clamp(22px,3.5vw,30px)] font-bold tracking-[-.02em]">
          {n.titel}
        </h1>
        <p className="mt-2 max-w-[64ch] text-[15px] leading-relaxed text-ink-2">{n.untertitel}</p>
      </div>
      <NutzenCheck nutzen={n} />
    </div>
  );
}
