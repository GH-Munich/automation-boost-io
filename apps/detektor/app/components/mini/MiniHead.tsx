export function MiniHead({ titel, hinweis }: { titel: string; hinweis?: string }) {
  return (
    <div className="max-w-[70ch]">
      <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
        Der 2-Minuten-Detektor
      </p>
      <h1 className="balance mt-2 text-[clamp(23px,3.6vw,32px)] font-bold leading-[1.1] tracking-[-.02em]">
        {titel}
      </h1>
      {hinweis && <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{hinweis}</p>}
    </div>
  );
}
