import { SchnelltestClient } from "../components/SchnelltestClient";
import { getContent } from "../lib/content";

export const dynamic = "force-dynamic";

export default function SchnelltestPage() {
  const content = getContent();
  const st = content.schnelltest;

  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <div className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Kostenlos · {st.zeitangabe_min} Minuten
        </p>
        <h1 className="balance mt-2 text-[clamp(22px,3.5vw,30px)] font-bold tracking-[-.02em]">
          {st.titel}
        </h1>
        <p className="mt-2 max-w-[64ch] text-[15px] leading-relaxed text-ink-2">{st.untertitel}</p>
      </div>
      <SchnelltestClient schnelltest={st} />
    </div>
  );
}
