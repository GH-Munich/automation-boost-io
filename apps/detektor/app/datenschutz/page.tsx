import type { Metadata } from "next";

/**
 * Datenschutzerklärung.
 * DRAFT – keine Rechtsberatung (Entwurf – keine Rechtsberatung). Kanzlei-Review vor finaler Freigabe.
 *
 * Rule for this page: only processing that is verified in the code of this app (or explicitly
 * given by the operator) is described. Evidence, as of commit 282376f (live state):
 * - No API routes, no server actions, no database, no fetch() to anything:
 *   no route.ts / "use server" anywhere in app/ or src/.
 * - Browser storage (localStorage) only: app/lib/usePersistentState.ts with keys
 *   "awd-achsen-<Tür>" (app/components/Wizard.tsx), "awd-bedarf" (app/components/BedarfWizard.tsx),
 *   "awd-fragen12" (app/components/FragenZwoelf.tsx); theme "awd-theme"
 *   (app/components/ThemeToggle.tsx, app/layout.tsx).
 * - No cookies: no document.cookie / cookies() in code; live response carries no Set-Cookie.
 * - No third-party resources: CSP in middleware.ts allows only 'self' for scripts, styles, fonts,
 *   images (plus data:) and connections; fonts are system fonts (content/branding.json "schrift").
 * - No AI service, no analytics, no tracking: none in code or dependencies (package.json).
 * - Lead capture / e-mail (Brevo, M5) is NOT built: app/components/mini/MiniOutro.tsx
 *   LEAD_CAPTURE_AKTIV = false.
 * - Clipboard: copy buttons write locally (FragenZwoelf.tsx, PhrasenDecoder.tsx), nothing is sent.
 * The hosting/server-log paragraph is the operator's mandated wording (server config, not in this repo).
 */

export const metadata: Metadata = {
  title: "Datenschutz · Der Agent-Washing-Detektor",
  description: "Welche Daten der Agent-Washing-Detektor verarbeitet — kurz und in Klartext.",
};

const h2 = "mt-9 text-[17px] font-semibold tracking-[-.01em] text-ink";
const p = "mt-2 text-[14.5px] leading-relaxed text-ink-2";
const ul = "mt-2 list-disc space-y-1.5 pl-5 text-[14.5px] leading-relaxed text-ink-2";

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-wrap px-4 py-8 sm:px-8 sm:py-10">
      <article className="max-w-[70ch]">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Rechtliches</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-.02em] text-ink sm:text-[32px]">
          Datenschutzerklärung
        </h1>

        <h2 className={h2}>Das Wichtigste in Kürze</h2>
        <p className={p}>
          Der Agent-Washing-Detektor funktioniert ohne Anmeldung, ohne Kontaktformular und ohne Analyse-Werkzeuge.
          Ihre Antworten in den Prüfungen und Checks werden direkt in Ihrem Browser ausgewertet und nicht an uns
          übertragen. Wir setzen keine Cookies und binden keine Dienste anderer Anbieter ein. Was beim Aufruf der
          Seiten trotzdem anfällt, steht unten.
        </p>

        <h2 className={h2}>Verantwortlicher</h2>
        <p className={p}>
          HÄUSERER CONSULTING
          <br />
          Inhaber: Gottfried Häuserer
          <br />
          Otto-Engl-Platz 8a
          <br />
          81241 München, Deutschland
          <br />
          Telefon: +49 (0)176 312 40 897
          <br />
          E-Mail: haeuserer(at)haeuserer.info
        </p>

        {/* // OFFEN: Wording mandated by the operator (2026-10-02). Not verifiable in this repo:
            log fields (incl. "no user agent / referer"), the temporary blocking of conspicuous IPs and the
            7-day deletion live in the server/Traefik configuration. DPA (AVV) with Hetzner confirmed by the
            operator (same as ki-boost.io privacy policy). */}
        <h2 className={h2}>Hosting und Server-Logs</h2>
        <p className={p}>
          Diese Anwendung läuft auf unserem eigenen Server bei der Hetzner Online GmbH in Deutschland. Bei jedem
          Aufruf protokolliert der Server automatisch: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse,
          HTTP-Statuscode, übertragene Datenmenge und das verwendete Verschlüsselungsverfahren. Browser-Kennung und
          Herkunftsseite speichern wir nicht. Wir brauchen diese Daten, damit der Dienst stabil und sicher läuft.
          IP-Adressen, die auffällig viele fehlerhafte Aufrufe erzeugen, sperrt der Server vorübergehend. Nach sieben
          Tagen werden die Log-Dateien automatisch gelöscht. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p className={p}>
          Mit Hetzner haben wir einen Vertrag über Auftragsverarbeitung (AVV) gemäß Art. 28 DSGVO geschlossen.
        </p>

        <h2 className={h2}>Ihre Eingaben bleiben in Ihrem Browser</h2>
        <p className={p}>
          Alle Prüfungen, Checks und Rechner laufen in Ihrem Browser. Ihre Antworten, Zahlen und Texte werden dabei
          nicht an unseren Server geschickt und nicht von uns gespeichert. Damit Sie eine Prüfung unterbrechen und
          später weitermachen können, legt Ihr Browser einen Zwischenstand im lokalen Speicher Ihres Geräts ab
          („Local Storage“):
        </p>
        <ul className={ul}>
          <li>Ihre Antworten in der Agenten-Prüfung, im Bedarfs-Check und bei den 12 Fragen vor der Unterschrift,</li>
          <li>Ihre Wahl zwischen Tag- und Nacht-Ansicht.</li>
        </ul>
        <p className={p}>
          Diese Daten verlassen Ihr Gerät nicht, wir haben keinen Zugriff darauf. Sie bleiben gespeichert, bis Sie
          sie löschen — zum Beispiel über die Browser-Einstellungen („Websitedaten löschen“). Wenn Sie den
          Detektor in einem privaten Fenster nutzen, entfällt der Zwischenstand beim Schließen.
        </p>
        {/* // OFFEN: Legal basis for the local storage (likely § 25 Abs. 2 Nr. 2 TDDDG, strictly necessary for
            the "save and resume" function requested by the user) — not stated on purpose, needs legal check. */}
        <p className={p}>
          Texte, die Sie in Eingabefelder schreiben (etwa Ihren Namen als Absender der Anbieter-Anfrage), werden
          nur auf Ihrem Bildschirm verwendet. Über „Kopieren“ landet der fertige Text in der Zwischenablage Ihres
          Geräts; von dort entscheiden Sie selbst, wohin er geht.
        </p>

        <h2 className={h2}>Keine Cookies, keine Analyse, keine fremden Dienste</h2>
        <ul className={ul}>
          <li>Wir setzen keine Cookies.</li>
          <li>Wir nutzen keine Besucher-Statistik, kein Tracking und keine Werbe-Dienste.</li>
          <li>
            Schriften, Skripte und Bilder kommen ausschließlich von unserem eigenen Server. Es werden keine Inhalte
            anderer Anbieter nachgeladen (zum Beispiel keine Web-Schriften oder Karten).
          </li>
          <li>
            Die Bewertung übernimmt ein festes Regelwerk. Ihre Eingaben werden an keinen KI-Dienst
            weitergegeben.
          </li>
          <li>
            Es gibt derzeit kein Kontaktformular und keinen E-Mail-Versand von Berichten. Sobald sich das ändert,
            ergänzen wir diese Erklärung, bevor die Funktion freigeschaltet wird.
          </li>
        </ul>

        <h2 className={h2}>Ihre Rechte</h2>
        <p className={p}>Soweit wir personenbezogene Daten von Ihnen verarbeiten, haben Sie das Recht auf</p>
        <ul className={ul}>
          <li>Auskunft (Art. 15 DSGVO),</li>
          <li>Berichtigung (Art. 16 DSGVO),</li>
          <li>Löschung (Art. 17 DSGVO),</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
          <li>
            Widerspruch gegen Verarbeitungen, die auf Art. 6 Abs. 1 lit. f DSGVO beruhen, aus Gründen, die sich aus
            Ihrer besonderen Situation ergeben (Art. 21 DSGVO).
          </li>
        </ul>
        <p className={p}>Eine kurze Nachricht an die oben genannte E-Mail-Adresse genügt.</p>

        <h2 className={h2}>Beschwerderecht</h2>
        {/* // OFFEN: Competent authority assumed from the operator's seat in Munich (private sector, Bavaria
            = BayLDA). Confirm in legal review. */}
        <p className={p}>
          Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO). Für uns zuständig ist
          das Bayerische Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach.
        </p>

        <p className="mt-9 text-[12.5px] text-ink-3">Stand: Oktober 2026</p>
      </article>
    </div>
  );
}
