import Link from "next/link";

/**
 * Site-wide footer with the legally required links (Impressum, Datenschutz).
 * Rendered once in the root layout, so every page carries both links.
 * Hidden in print so the printed report stays clean.
 */
export function Footer() {
  return (
    <footer className="mt-16 border-t border-line print:hidden">
      <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-x-5 gap-y-2 px-4 py-6 text-[12.5px] text-ink-3 sm:px-8">
        <span className="mr-auto">Der Agent-Washing-Detektor · HÄUSERER CONSULTING</span>
        <nav aria-label="Rechtliches" className="flex items-center gap-4">
          <Link href="/impressum" className="text-ink-2 no-underline hover:text-ink hover:underline">
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-ink-2 no-underline hover:text-ink hover:underline">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
