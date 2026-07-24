import Link from "next/link";

export function MiniOutro({
  ctaLabel,
  ctaHref,
  consent,
  disclaimer,
}: {
  ctaLabel: string;
  ctaHref?: string | null;
  consent: string;
  disclaimer?: string;
}) {
  return (
    <div className="mt-8 flex max-w-[70ch] flex-col gap-4 border-t border-line pt-6">
      {ctaHref ? (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 self-start rounded-md border border-accent bg-accent px-5 py-3 text-[14px] font-semibold text-accent-on no-underline transition-colors hover:bg-accent-2"
        >
          {ctaLabel}
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-2 self-start rounded-md border border-line-strong bg-surface px-5 py-3 text-[14px] font-semibold text-ink-2">
          {ctaLabel}
          <span className="font-mono text-[11px] text-ink-3">Kontakt in Kürze</span>
        </span>
      )}

      <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-2">
        <input type="checkbox" className="mt-0.5 h-4 w-4 flex-none accent-[var(--accent)]" />
        {consent}
      </label>
      <p className="font-mono text-[10.5px] text-ink-3">
        PDF-Report per Mail (Double-Opt-in) folgt in Stufe M5.
      </p>
      {disclaimer && <p className="text-[12px] leading-relaxed text-ink-3">{disclaimer}</p>}
    </div>
  );
}
