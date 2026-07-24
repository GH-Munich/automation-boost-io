# CLAUDE.md — automation-boost-io

Diese Datei steuert die Arbeit von Claude Code in diesem Repository. Sie ist verbindlich.

---

## 1. Was dieses Repository ist

**Der Agent-Washing-Detektor (AWD)** — ein Prüf- und Beratungsinstrument für deutsche KMU. Er beantwortet drei Fragen: Braucht dieser Prozess überhaupt agentische Automatisierung? Ist das angebotene System ein echter Agent? Welcher Preis ist in Größenordnungen gerechtfertigt?

Betreiber: HÄUSERER CONSULTING, Gottfried Häuserer. Portal: automation-boost.io. App-Heimat: detektor.automation-boost.io.

**Fachliche Grundlage ist `docs/AWD_KONZEPT_v1.0.md`.** Dieses Dokument ist Single Source of Truth. Vor jeder inhaltlichen Arbeit lesen. Bei Widerspruch zwischen Code und Konzept gilt das Konzept — und der Widerspruch wird gemeldet, nicht stillschweigend aufgelöst.

---

## 2. Sprache und Zielgruppe

- Sämtliche Nutzeroberflächen, Inhalte, Berichte und Fehlermeldungen sind **deutsch**.
- Zielgruppe sind **Entscheider ohne technische Vorkenntnisse**. Keine Fachterminologie in der Oberfläche: keine Achsenbezeichnungen vor dem Ergebnis, kein „RAG", kein „deterministisch" ohne Erklärung.
- Code, Kommentare, Variablennamen, Commit-Nachrichten: **englisch**. Fachbegriffe des Standards behalten ihre deutschen IDs (`A1`, `N3`, `washingFaktor` → besser `washingFactor`, aber Regel-IDs bleiben wörtlich).
- Deutsche Texte werden **immer UTF-8** geschrieben. Bei Dateierzeugung über Skripte explizit `encoding="utf-8"` setzen. Umlaute nach jedem Generierungsschritt stichprobenartig prüfen.

---

## 3. Die eiserne Regel: Shared Core

Alle Pfade, Türen (A/B/C) und Tracks (Support, RAG, Voice) bewerten mit **denselben sechs Achsen und identischen Regel-IDs** aus **einem** Prüfstandard.

- Track-Inhalte sind ausschließlich **additiv**: Zusatzfragen, Rechner, Präzedenzfälle, Berichtsbausteine.
- **Kein Track verändert Scoring-Regeln.** Kein Sonderfall, keine Ausnahme.
- Wenn eine Anforderung eine Scoring-Abweichung je Track zu verlangen scheint: **nicht implementieren, sondern melden.** Das ist ein Konzeptthema, kein Code-Thema.

---

## 4. Der Prüfstandard ist Daten, nicht Code

Der gesamte fachliche Inhalt liegt als JSON in `apps/detektor/content/`:

| Datei | Inhalt |
|---|---|
| `achsen.json` | A1–A6, Anker, Wizard-Fragen, Demo-Tests, Bänder B1–B4 |
| `bedarf.json` | Tür C: Fragen F1–F7, Klassen N0–N5, Entscheidungsregeln R01–R09 |
| `preislogik.json` | P1–P4, Kostenklassen, Washing-Faktor, Golden-Test-Referenzfall |
| `tco-faktoren.json` | T1–T5, Rechenwege Pilot/Produktiv |
| `schnelltest.json` | S1–S5 |
| `phrasen.json` | P01–P10 mit Gegenfragen |
| `fragen-12.json` | Q1–Q12, Statuslogik, Mail-Vorlage |
| `muster.json` | M1–M6: Signalwörter, Zusatzfragen, Rechner, Präzedenzfälle |
| `preise-support.json` | Anbieterpreise (quartalsgepflegt) |
| `berichtstexte.json` | Standardklauseln G1–G6, Handlungsempfehlungen |
| `branding.json` | Mandanten-Schema (White-Label ab Stufe 2) |
| `minis/*.json` | 5 Lead-Magnet-Konfigurationen |

**Regeln dazu:**

1. **Keine fachlichen Werte im Code hartkodieren.** Kein Schwellwert, kein Faktor, kein Fragetext, kein Anbieterpreis. Alles kommt aus den JSONs.
2. Wenn ein Wert fehlt, den der Code braucht: **melden und nachfragen**, nicht erfinden und nicht im Code ergänzen.
3. Die JSONs werden später über Directus gepflegt. Der Code muss sie zur Laufzeit lesen können, ohne Deployment.
4. Jede JSON hat einen `meta`-Block mit `standard_version`. Der Code prüft beim Laden, dass alle geladenen Dateien dieselbe `standard_version` tragen, und bricht bei Abweichung mit klarer Fehlermeldung ab.

---

## 5. Die Regel-Engine

**Grundsatz G1 (Reproduzierbarkeit) ist die wichtigste Eigenschaft des Produkts.** Gleiche Eingaben müssen immer exakt dasselbe Ergebnis liefern. Das ist das zentrale Verkaufsargument gegenüber „wir fragen halt ein LLM".

Daraus folgt zwingend:

- Die Engine besteht aus **reinen Funktionen** (pure functions). Keine Seiteneffekte, kein Zufall, keine Systemzeit in der Bewertungslogik, keine Netzwerkaufrufe.
- **Kein LLM trifft eine Bewertungsentscheidung.** Der Dreischritt lautet: *Das LLM extrahiert, der Mensch bestätigt, die Regel-Engine bewertet.* LLM-Einsatz ist ausschließlich in der Claim-Extraktion aus hochgeladenen Dokumenten zulässig — und deren Ergebnis wird dem Nutzer zur Bestätigung vorgelegt, bevor es irgendetwas beeinflusst.
- Jede Bewertung liefert eine **Begründungsspur** mit: bestätigter Eingabe im Wortlaut, angewandter Regel-ID, vergebenen Punkten, ggf. Belegstelle mit Seitenzahl. Ohne Begründungsspur kein Ergebnis.
- Die **Golden-Test-Suite ist Release-Voraussetzung.** Jede Regel hat mindestens einen Referenzfall. Kein Release, wenn ein Golden Test rot ist. Erster verifizierter Referenzfall liegt in `preislogik.json` unter `beispiel_golden_test`.

**„Weiß ich nicht" ist ein Befund, keine Null (G5).** Betroffene Achsen werden als „nicht bewertbar" markiert. Der Score wird als Bandbreite berechnet: Minimum rechnet die Achse mit 0, Maximum mit 2 Punkten. Eine Einstufung erfolgt nur, wenn Minimum und Maximum im selben Band liegen — sonst „vorläufig, Band X bis Y" plus Transparenzlücken-Befund. **Niemals eine Nullpunkte-Strafe für Unwissen.**

---

## 6. Nummernkreise — strikte Trennung

| Serie | Projekt |
|---|---|
| **AB-** | automation-boost.io / AWD ← **dieses Repository** |
| O- | ki-boost.io |
| K- | ki-kompetenz.guide |

In diesem Repository werden ausschließlich **AB-Nummern** vergeben. Niemals O- oder K-Nummern verwenden oder referenzieren.

---

## 7. Arbeitsweise mit Gottfried

- **Immer vollständige Ersatzdateien liefern.** Niemals Patch-Anweisungen, niemals Teil-Diffs, niemals „ändere Zeile 47". Fertige Dateien zum direkten Ersetzen.
- **Kein Fülltext.** Ergebnis, kurze Änderungsliste, weiter zum nächsten Punkt. Keine Zusammenfassungen des gerade Getanen, keine Höflichkeitsschleifen.
- **Keine Rückfragen, wenn die Richtung klar ist.** Nachfragen nur bei echter fachlicher Mehrdeutigkeit oder wenn ein Wert im Standard fehlt.
- **Server, Datenbank und Deployment immer gemeinsam Schritt für Schritt.** Claude kündigt jedes einzelne Kommando an, Gottfried führt es aus, Ergebnis wird besprochen, dann das nächste. **Niemals eine Liste von Serverbefehlen zum Selbstabarbeiten hinterlassen** — auch nicht in Übergabedokumenten, auch nicht als „optional".
- **Niemals Befehle, die Geheimnisse im Terminal anzeigen.** Kein `cat .env`, kein `echo $API_KEY`, kein `env`. Sichere Alternativen verwenden: `grep -c PASSWORD .env`, `wc -l .env`, `test -f .env && echo vorhanden`. Vor jedem Befehl, der sensible Daten offenlegen könnte, warnen.

---

## 8. Git

- Repository: `GH-Munich/automation-boost-io` (privat)
- Nach jeder Arbeitssitzung: `git add . && git commit -m "..." && git push`
- Commit-Nachrichten englisch, im Imperativ, mit AB-Nummer wo zutreffend: `AB-001: add rule engine core with golden tests`

---

## 9. Technik-Stack

| Schicht | Wahl |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind |
| Engine | Eigenes TS-Modul, pure functions, Vitest für Golden Tests |
| Datenbank | PostgreSQL |
| CMS | Directus (Content-JSONs und Berichtstexte) |
| Automation | n8n (Berichtsversand, Fristen-Mails, Brevo-Sync) |
| Hosting | Hetzner hinter Traefik |

**Designsystem:** Eigene visuelle Identität für automation-boost. Ableitungen aus dem ki-boost-Designsystem sind erlaubt, eine 1:1-Übernahme nicht. Farbwerte stehen in `branding.json` derzeit auf `TODO` — nicht raten, sondern anfragen.

**Usability-Regeln (verbindlich für alle Screens):**
- Eine Frage pro Karte
- Antippen statt Tippen im Kernpfad; Freitext immer optional
- Jede Zahleneingabe als Slider oder Stepper mit Vorgabewert und **sichtbarer Quelle**; Vorgabewerte änderbar
- „Weiß ich nicht" überall als Antwortoption
- Erklärungen, Präzedenzfälle und Demo-Tests hinter „Mehr dazu"
- Zwischenspeichern und Zurück jederzeit möglich
- Live-Vorschau von Score und Ampel während der Eingabe
- Zeitbudget je Pfad sichtbar (Ziel: 12–15 Minuten für den Hauptpfad)

---

## 10. Rechtliche Leitplanken — nicht verhandelbar

- Der AWD trifft **keine eigenen Tatsachenbehauptungen über Anbieter**. Bewertet werden ausschließlich vom Auftraggeber bestätigte Eingaben und von ihm bereitgestellte Dokumente.
- Die **Fairness-Klausel** (G3) steht wörtlich in jedem Bericht: Eine niedrige Einstufung ist kein Qualitätsurteil, sondern eine Preiseinordnung.
- Alle Preisaussagen sind **Größenordnungen mit sichtbaren, änderbaren Annahmen** — Orientierung, keine Einkaufskalkulation (G6).
- AI-Act-Inhalte tragen immer das Label **„Orientierung, keine Rechtsberatung"**.
- Berichtstexte aus `berichtstexte.json` sind **kanzleireviewpflichtig**. Formulierungen dort nicht eigenmächtig ändern — Änderungsvorschläge melden.

---

## 11. Was NICHT gebaut wird

Kein Leaderboard. Kein Preisvergleichsportal. Kein Anbieterverzeichnis mit Listing-Gebühren. Keine Rechtsberatung. Keine Einkaufskalkulation. Keine Bewertung von Anbietern aus eigener Recherche.

---

## 12. Aktueller Stand

**Abgeschlossen:** M0 (Konzept), M1 (16 Content-JSONs, validiert).
**Als Nächstes:** M2 — Regel-Engine mit Golden-Test-Suite. Auftrag siehe `docs/UEBERGABE_AWD_M2.md`.

Offene Entscheidungen, die den Code betreffen (nicht eigenmächtig auflösen):
- Extraktionsmodell: self-hosted Ollama auf gha-ops (Empfehlung) oder EU-API als Qualitäts-Fallback
- Serverzuordnung für das Deployment (wird bei M6 gemeinsam entschieden)
- Farbwerte des Designsystems
