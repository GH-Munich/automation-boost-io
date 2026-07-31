# AWD — Übergabe / Handoff

> **Zweck:** Vollständiger Arbeitsstand des Agent-Washing-Detektors, damit jede neue
> Session nahtlos weiterarbeiten kann, ohne dass etwas verloren geht.
> **Diese Datei ist die Wahrheit für den Session-Einstieg** — zusammen mit
> `docs/AWD_DEPLOYMENT.md`. Das claude.ai-Projektwissen (CLAUDE.md §12) ist auf M1
> **veraltet** und darf nicht als Stand herangezogen werden.

**Stand:** 31.07.2026 · **Branch:** `claude/awd-report-klartext-v1-1` ·
**Letzter Commit:** AB-038 (Klartext-Nachzug 2) · **Tests:** 86/86 grün · **Standard:** 1.1

---

## 1. Wo stehen wir

| | |
|---|---|
| **Repo (lokal)** | `C:\Users\haeus\projekte\automation-boost-io` |
| **GitHub** | `GH-Munich/automation-boost-io` |
| **Arbeitsbranch** | `claude/awd-report-klartext-v1-1` (offener PR gegen `main`) |
| **App** | `apps/detektor/` — Next.js 15 (App Router), React 19, TypeScript, Tailwind |
| **Live** | `awd.automation-boost.io` — deployed auf Stand `282376f` (**M2/M3, noch OHNE die Klartext-Verbesserungen**) |
| **Dev-Server** | `next dev` auf Port **3009** (in `apps/detektor`) |

**Wichtig:** Die Verbesserungen AB-034…037 liegen **im Branch / PR**, sind **noch nicht
live**. Live = alte Fassung. Merge + Deploy passieren erst nach Freigabe, gemeinsam (§7).

---

## 2. Was ist fertig (dieser Arbeitsstrang „alles andere")

Alle vier Commits sind gepusht und durch die 86 Golden-Tests + Typecheck abgesichert.

| Commit | Inhalt | Seite / Ort |
|---|---|---|
| **AB-034** | Klartext-Bericht + Verdikt-Block „Mein Rat für Sie" + Druck-/PDF-Layout; **Standard-Sprung 1.0 → 1.1** (alle 16 content-JSONs, Ampel-/Einstufungs-Labels auf Klartext, Enabler-Sätze) | `app/components/Bericht.tsx`, `app/globals.css`, alle `content/*.json` |
| **AB-035** | **Nutzen-Schnellcheck** („Lohnt sich das?") — Schieberegler, Amortisation, zwei-Ebenen-Ergebnis; + Fix des Dev-CSP-Bugs (Fast-Refresh) | `/lohnt-sich`, `content/nutzen.json`, `src/engine/nutzen.ts`, `NutzenCheck.tsx` |
| **AB-036** | **Gelingt-das-bei-uns-Check** — 8 Fragen in 2 Blöcken (G1–G5 „Anbieter & Lösung" / außen, G6–G8 „Sie selbst" / innen: Knowhow, Akzeptanz & Bauchgefühl, Ziele & Prozesse); Ampel nach Zahl offener Punkte | `/gelingt-check`, `content/gelingt.json`, `src/engine/gelingt.ts`, `GelingtCheck.tsx` |
| **AB-037** | **Klartext-Nachzug 1** — Jargon-Überschriften im Preis-Check auf verständliche Sprache | `app/components/PreisCheck.tsx` |
| **AB-038** | **Klartext-Nachzug 2** — restliche Jargon-Labels: Wizard-Kopf („Ist das ein echter Agent?"), „Agentik-Score" → „Agenten-Reifegrad", Bedarf-/Bestands-Kopf, Muster-Hinweis, Bericht-Kopf (+ tote `tuer`-Prop entfernt) | `Wizard.tsx`, `BedarfWizard.tsx`, `bestand/page.tsx`, `MusterCheck.tsx`, `PreisCheck.tsx`, `Bericht.tsx`, `Assessment.tsx` |

**Muster für jeden neuen Baustein** (bewährt, bitte beibehalten):
`content/<name>.json` (Werte + `meta.standard_version`) → `src/engine/<name>.ts` (reine
Funktion) → Golden-Tests `src/engine/__tests__/golden/<name>.json` + `<name>.test.ts` →
UI-Komponente + Seite + Header-Nav-Link.

**Zur Prüfung durch Gottfried:** Die Fragen/Werte in `nutzen.json` und `gelingt.json`
sind als **VORSCHLAG** markiert (siehe `pflegehinweis` im jeweiligen JSON). Bitte live
gegenlesen: `/lohnt-sich` und `/gelingt-check` — Formulierungen sind frei anpassbar.

---

## 3. Was ist offen

### 3a. Klartext-Nachzug — ERLEDIGT (AB-037 + AB-038)
Alle sichtbaren Jargon-Labels sind auf Klartext gezogen: Preis-Check (AB-037) sowie
Wizard-Kopf („Ist das ein echter Agent?"), „Agentik-Score" → „Agenten-Reifegrad",
Bedarf-/Bestands-Kopf, Muster-Hinweis und Bericht-Kopf (AB-038, inkl. Entfernen der
dann toten `tuer`-Prop aus `Bericht`/`Assessment`). Rein sprachlich, kein
Standard-Sprung, keine Engine-Berührung. Verbliebene „Achsen-/Agentik-"-Begriffe
stehen nur noch in Code-Kommentaren (`scoring.ts`, `Assessment.tsx`) — kein UI.

### 3b. Nr. 4 — Preis-Maske verfeinern (größer, braucht Freigabe)
Geplant: **Lösungsart-Leiter** (Multiagent / Agent / automatisches Routing /
deterministische Programmierung — „verkauft vs. nötig") + **Personas / typische
Use-Cases** + **3 Schieberegler** (Volumen in 7 Stufen · Komplexität in 3 Graden ·
Modell/Aufwand). 
**Achtung:** berührt die **Kern-Preis-Engine** (`preislogik.json`, `pricing.ts`) und
braucht **neue fachliche Standard-Werte** → **G4-Versionssprung** (1.1 → 1.2) und
Freigabe von Gottfried. **Werte nicht erfinden** — als Vorschlagsliste vorlegen, wie bei
Nutzen/Gelingt.

### 3c. Später (von Gottfried bewusst zurückgestellt — Server/externe Dienste)
- **CTAs / nächste Schritte** an den Ergebnis-Stellen der Tools.
- **Lead-Erfassung** → **Brevo Double-Opt-in** (DB-Tabelle `leads`, Consent) — das ist
  der **M5-Layer, noch ungebaut**. Leads laufen **nicht** über n8n.
- **Terminbuchung** → **meetergo** (nicht Cal.com/Calendly!).
- **Upload / Claim-Extraktion** (ursprünglich „M4") — server-lastig (Ollama), gemeinsam.

---

## 4. Spielregeln (gelten dauerhaft — NICHT verletzen)

1. **§7 — Server/DB/Deployment immer gemeinsam, Schritt für Schritt.** EIN Kommando
   ankündigen → Gottfried führt aus → Ergebnis besprechen → nächstes. Nie eine
   Befehlsliste zum Selbstabarbeiten. **Keine Kommandos, die Geheimnisse zeigen**
   (kein `cat .env` o. Ä.).
2. **Terminal-Label** `[lokal]` / `[ops]` / `[live]` bei jedem Server-Kommando —
   **außerhalb** des Copy-Paste-Blocks. (`ops` = 91.99.30.118, `live` = 91.99.136.48).
3. **Lokal = PowerShell**, Befehle mit `;` trennen (kein `&&`). Jeder Block startet mit
   explizitem Verzeichniswechsel.
4. **Isolation.** `ki-boost.io`, `ki-anwendungsfaelle.de` und die ops-Dienste (api, cms,
   Metabase) **nicht anfassen**. AWD läuft als isoliertes Compose-Projekt
   `automation-boost`. *Diese Session: nur lokales AWD-Repo berührt, keine
   Server-/ops-Eingriffe → Isolation gewahrt.*
5. **Regel-Engine bleibt deterministisch (G1).** Kein LLM trifft eine
   Bewertungsentscheidung: **LLM extrahiert → Mensch bestätigt → Regel-Engine bewertet.**
   Keine fachlichen Werte hartkodieren — alles in `content/*.json`.
6. **Standard-Version (G4).** Änderungen an fachlichen Werten (v. a. `achsen.json`,
   `preislogik.json`) = Versionssprung in **allen** content-JSONs (Loader prüft, dass
   `meta.standard_version` überall identisch ist).
7. **Golden-Tests sind das Release-Gate.** Vor jedem Commit grün
   (aktuell 86/86).
8. **Ton — „Pro KI. Gegen Abzocke."** Ermöglicher, nicht Panikmacher. Absender =
   **Mann aus der Praxis / Sparringspartner auf Augenhöhe**, ausdrücklich **kein**
   offizieller Gutachter/TÜV. Zielgruppe = KMU-Entscheider, KI-fremd aber kaufmännisch
   versiert → Klartext, keine Engine-/Code-Begriffe.

---

## 5. Technik / Kommandos (alle in `apps/detektor`)

```
npm run dev -- -p 3009      # Dev-Server (bzw. preview-Config "awd-detektor")
npm test                    # Golden-Tests (vitest run) — Release-Gate, 86/86
npx tsc -p tsconfig.json --noEmit    # App-Typecheck
npm run typecheck                    # Engine-Typecheck (tsconfig.engine.json)
```

**Architektur:** `src/engine/` = reine deterministische Funktionen (G1) ·
`content/*.json` = alle fachlichen Werte (Content-as-data), geladen über
`content-loader.ts`, jede Datei mit `meta.standard_version` · `app/` = Next.js-UI.

**Erledigter Dev-Fix (nicht rückgängig machen):** In `middleware.ts` gibt es
`'unsafe-eval'` **nur im Development** (für React Fast Refresh); die Produktions-CSP
(nonce + strict-dynamic) ist unverändert. `app/layout.tsx` hat
`suppressHydrationWarning` am Theme-Init-Script. Ohne diesen Fix war die lokale
Dev-App komplett nicht-interaktiv.

**Conversion-Stack (für 3c, gesetzt — nicht neu diskutieren):** meetergo = Termine ·
Brevo = Leads (Double-Opt-in, Tabelle `leads`) · n8n = nur Sync/Versand
(Berichte, Fristen-Mails, Brevo-Abgleich), **nie** Lead-Capture.

---

## 6. Startbefehl für die nächste Session

```
Weiter am Agent-Washing-Detektor (AWD).
Lies zuerst docs/AWD_HANDOFF.md im Repo C:\Users\haeus\projekte\automation-boost-io —
dort steht der vollständige Stand, die Spielregeln (§7, Isolation, deterministische
Engine, Klartext-Ton) und die offenen Punkte. Fasse mir den Stand kurz zusammen und
schlage den nächsten Schritt vor (Klartext-Nachzug der restlichen Tools ODER Nr. 4
Preis-Maske). Leg nicht sofort mit Code los.
```
