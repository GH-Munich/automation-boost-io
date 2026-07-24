import Link from "next/link";

const tueren = [
  {
    id: "A",
    href: "/pruefung",
    aktiv: true,
    titel: "Ein Angebot liegt vor",
    text: "Prüfen Sie ein konkretes Anbieter-Angebot: echter Agent oder umetikettiert — und ist der Preis gerechtfertigt?",
    cta: "Prüfung starten",
  },
  {
    id: "B",
    href: "/bestand",
    aktiv: true,
    titel: "Wir haben schon gekauft",
    text: "Ein Bestandssystem rückblickend einordnen und dem, was Sie zahlen, gegenüberstellen.",
    cta: "Bestand prüfen",
  },
  {
    id: "C",
    href: "/bedarf",
    aktiv: true,
    titel: "Noch kein Anbieter",
    text: "Klären, ob dieser Prozess überhaupt agentische Automatisierung braucht — Skript, Workflow oder Agent?",
    cta: "Bedarf klären",
  },
];

export default function StartPage() {
  return (
    <div className="mx-auto max-w-wrap px-4 py-12 sm:px-8 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
        AWD-Prüfstandard 1.0
      </p>
      <h1 className="balance mt-3 max-w-[18ch] text-[clamp(28px,5vw,44px)] font-bold leading-[1.05] tracking-[-.02em]">
        Ist das überhaupt ein Agent — und was darf es kosten?
      </h1>
      <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-ink-2">
        Der Detektor beantwortet drei Fragen in einer Sitzung: Braucht dieser
        Prozess agentische Automatisierung? Ist das angebotene System ein echter
        Agent? Und welcher Preis ist in Größenordnungen gerechtfertigt — nachvollziehbar,
        reproduzierbar, ohne Bauchgefühl.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {tueren.map((t) => {
          const inner = (
            <>
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-sm border border-line-strong bg-surface-2 font-mono text-[15px] font-semibold text-accent">
                  {t.id}
                </span>
                {!t.aktiv && (
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.1em] text-ink-3">
                    Stufe M3+
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-[17px] font-semibold tracking-[-.01em]">{t.titel}</h2>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-2">{t.text}</p>
              <span
                className={`mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold ${
                  t.aktiv ? "text-accent" : "text-ink-3"
                }`}
              >
                {t.cta}
                {t.aktiv && (
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )}
              </span>
            </>
          );

          const cls =
            "flex flex-col rounded-md border border-line bg-surface p-6 shadow-sm transition-colors";

          return t.aktiv ? (
            <Link key={t.id} href={t.href} className={`${cls} hover:border-line-strong no-underline`}>
              {inner}
            </Link>
          ) : (
            <div key={t.id} className={`${cls} opacity-70`} aria-disabled="true">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/schnelltest"
          className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink no-underline transition-colors hover:border-line-strong"
        >
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          Der Schnelltest — 5 Fragen, 2 Minuten
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <Link
          href="/ai-act"
          className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink no-underline transition-colors hover:border-line-strong"
        >
          <span className="h-2 w-2 rounded-full bg-warn" aria-hidden="true" />
          EU AI Act: Betrifft Sie der 2. August?
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <Link
          href="/muster"
          className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink no-underline transition-colors hover:border-line-strong"
        >
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          Mustererkennung: Kenne ich diese Masche?
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <Link
          href="/fragen"
          className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink no-underline transition-colors hover:border-line-strong"
        >
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          Die 12 Fragen vor der Unterschrift
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-3">
        <span className="font-mono text-[11px] uppercase tracking-[.1em]">Weitere 2-Minuten-Checks:</span>
        <Link href="/mini/agent-check" className="text-accent no-underline hover:underline">Ist das ein Agent?</Link>
        <Link href="/mini/bedarf" className="text-accent no-underline hover:underline">Skript, Workflow oder Agent?</Link>
        <Link href="/mini/tco" className="text-accent no-underline hover:underline">Pilot vs. Produktion</Link>
        <Link href="/mini/bafa" className="text-accent no-underline hover:underline">Zahlt der Staat mit?</Link>
      </div>

      <p className="mt-10 max-w-[62ch] text-[12.5px] leading-relaxed text-ink-3">
        Grundsatz: Der Detektor trifft keine eigenen Tatsachenbehauptungen über
        Anbieter. Bewertet werden ausschließlich Ihre bestätigten Eingaben — mit
        sichtbarer Begründung je Ergebnis.
      </p>
    </div>
  );
}
