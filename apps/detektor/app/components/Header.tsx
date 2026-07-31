import Link from "next/link";

import { getContent } from "../lib/content";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const standardVersion = getContent().standardVersion;
  return (
    <header className="no-print sticky top-0 z-20 border-b border-line bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-wrap items-center gap-4 px-4 py-3 sm:px-8">
        <Link href="/" className="mr-auto flex items-center gap-3 no-underline">
          <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-sm border border-line-strong bg-surface-2 text-accent" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 21 21" />
              <path d="M8 10.5h5M10.5 8v5" />
            </svg>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-[-.01em] text-ink">Der Agent-Washing-Detektor</span>
            <span className="font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-3">Prüfstandard {standardVersion} · automation-boost.io</span>
          </span>
        </Link>

        <nav aria-label="Bereiche" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-sm px-2.5 py-1.5 text-[13px] font-medium text-ink-2 no-underline transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}

const NAV = [
  { href: "/pruefung", label: "Prüfung" },
  { href: "/bedarf", label: "Bedarf" },
  { href: "/muster", label: "Muster" },
  { href: "/fragen", label: "12 Fragen" },
  { href: "/schnelltest", label: "Schnelltest" },
];
