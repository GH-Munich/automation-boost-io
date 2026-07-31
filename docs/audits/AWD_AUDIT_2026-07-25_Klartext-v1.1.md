# AWD-Änderungsnotiz — Klartext-/Enabler-Nachzug (Standard 1.1)

Datum: 2026-07-25 · Anlass: Kommunikations-Leitlinie (Zielgruppe Mittelstand, Praktiker-Stimme,
Enabler-Ton „Pro KI. Gegen Abzocke.") → sprachlicher Nachzug des Prüfberichts.
Prüfstufe: leichte Prüfung nach `docs/AWD_REVIEW_STANDARD.md` (Microcopy/Wording; Bewertungslogik unberührt).

## Was geändert wurde

**Standard-Versionssprung 1.0 → 1.1** über alle 16 Content-JSONs — eine reine
**Verständlichkeits-/Wording-Version**. Keine Regel-, Schwellen-, Faktor- oder Logikänderung.

- **Bericht-Oberfläche** (`app/components/Bericht.tsx`, reine Labels): „Prüfbericht" → „Meine Einschätzung für Sie",
  „Empfehlung" → „Mein Rat für Sie", „Management-Summary" → „Das Wichtigste auf einen Blick",
  „Agentik-Score" → „Wie viel echte KI drinsteckt", „Preis-Einordnung" → „Ist der Preis fair?",
  „Begründungsspur" → „Wie ich zu dieser Einschätzung komme", „Transparenzlücke" → „Was noch offen ist",
  „Angewandte Regeln" → „Zugrunde gelegte Prüfregeln". Plus Klartext-Satz zum Preis-Aufschlag.
- **Druck/PDF** (`app/globals.css`, `Header.tsx`): `@media print` — der Bericht wird als sauberes
  Dokument ausgegeben (Navigation/Buttons `no-print`, Ampelfarben erhalten, kein Umbruch in Karten).
- **Ampel-Labels** (`content/preislogik.json`): „Verhandelbar" → „Preis in Ordnung",
  „Deutlich überteuert" → „Deutlich zu teuer", „Agent Washing" → „Klares Warnsignal beim Preis".
- **Einstufungen** (`content/achsen.json`): „Echter Agent" → „Echtes KI-System (Agent)",
  „Agentischer Workflow" → „Teilweise selbstständig (Workflow)",
  „Intelligente Automatisierung (IPA)" → „Intelligente Automatisierung — kein echter Agent",
  „Chatbot oder RPA mit neuem Etikett" → „Standard-Automatisierung mit KI-Etikett".
- **Enabler-Einleitungssätze** (`content/berichtstexte.json` `handlungsempfehlung_enabler`, neu +
  `types.ts` + Render): band­bezogener Satz vor der Handlungsempfehlung (z. B. B4:
  „Ihr Ziel bleibt erreichbar — nur mit der passenden, schlankeren Lösung."). Die kanzleigeprüften
  Handlungsempfehlungen selbst bleiben **wörtlich unverändert**.

## Verifikation

- **Golden-Tests: 76/76 grün** — die Bewertungslogik (Score, Bänder, Preis, Determinismus) ist
  bitgleich unverändert. Angepasst wurden nur die **Text-Erwartungswerte** der Fixtures
  (`golden/scoring.json` Einstufungen; `content-loader.test.ts` Version 1.1).
- **Typecheck** (Engine + App) grün. Dev-Server ohne Konsole-/Server-Fehler.
- Der fertig gerenderte Bericht + Druckvorschau wurden **nicht visuell** abgenommen
  (Browser-Pane war nicht eingeblendet → keine Screenshots).

## Offene Punkte (vor Live-Gang)

- **Kanzlei-Review:** die neuen `handlungsempfehlung_enabler`-Sätze (im Pflegehinweis markiert) und
  empfohlen zusätzlich die neuen Klartext-Wertungslabels (Ampel/Einstufung) — sie sind tendenziell
  **konservativer/weniger anklagend** als zuvor, sollten aber vor Launch rechtlich gesichtet werden.
- „Agent Washing" bleibt als **Marke** (Portal/Name); nur im Kundenergebnis steht das Klartext-Signal.
- Ausrollen erfolgt mit dem nächsten Deploy (gemeinsam, §7) — bis dahin nur lokal/Repo.
