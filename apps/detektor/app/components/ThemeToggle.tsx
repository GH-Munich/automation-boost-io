"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const el = document.documentElement;
    const cur = el.getAttribute("data-theme");
    if (cur === "dark" || cur === "light") setMode(cur);
    else setMode(window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
  }, []);

  function apply(next: Mode) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("awd-theme", next);
    } catch {
      /* localStorage kann blockiert sein — unkritisch */
    }
    setMode(next);
  }

  return (
    <div
      className="inline-flex items-stretch gap-0.5 rounded-full border border-line bg-surface-2 p-0.5"
      role="group"
      aria-label="Ansicht: Tag oder Nacht"
    >
      <button
        type="button"
        onClick={() => apply("light")}
        aria-pressed={mode === "light"}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors ${
          mode === "light" ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
        }`}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
        Tag
      </button>
      <button
        type="button"
        onClick={() => apply("dark")}
        aria-pressed={mode === "dark"}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors ${
          mode === "dark" ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
        }`}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 14.5A8 8 0 1 1 9.5 4 6.3 6.3 0 0 0 20 14.5Z" />
        </svg>
        Nacht
      </button>
    </div>
  );
}
