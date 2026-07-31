# AWD — Freigabe-Paket v1

> **Zweck:** Alle Werte und Texte, die vor dem v1-Launch eine Freigabe brauchen — an
> **einer** Stelle, nummeriert. **Kein Abhak-Dokument:** Wir gehen es morgen Punkt für
> Punkt im Chat durch (kurz vorstellen → Entscheidung → nächster Punkt). Hier steht nur
> der jeweils **aktuelle Vorschlagswert** als Grundlage.
>
> **Zwei Freigeber:** 🟦 **Gottfried** (fachliche Werte/Formulierungen) · ⚖️ **Kanzlei**
> (reviewpflichtige Rechtstexte). Änderungen an fachlichen Werten = Standard-Versionssprung
> (G4). Sockel-/Nutzen-/Gelingt-Werte sind reine Content-Werte, ohne Code-Änderung pflegbar.
>
> **Stand:** 31.07.2026 · Standard **1.2** · Branch `claude/awd-report-klartext-v1-1`
> (AB-034…040, lokal). Produktions-Build am 31.07. erfolgreich (Deploy-readiness grün).

---

## A · Preis-Logik (neu in AB-039/040) — 🟦 Gottfried

Grundlage: Vier-Augen-Preisprüfung vom 31.07. (4 Fachperspektiven: Technik/Token, Markt,
KMU-Kaufmann, Engine-Konsistenz).

**F-A1 · Fixkosten-Sockel je Klasse** (EUR/Jahr, additiv zum Nutzungskorridor)

| Klasse | Sockel |
|---|---|
| Skript / RPA | 3.000 |
| Chatbot / RAG | 6.000 |
| Automatisches Routing (IPA) | 8.000 |
| Agentischer Workflow | 12.000 |
| Echter Agent | 20.000 |
| Multiagenten-System | 30.000 |

**F-A2 · Kostenkorridor der neuen 6. Klasse „Multiagenten-System":** 1,00 – 30,00 USD je Vorgang.

**F-A3 · Ampel-Grenzen (Preis-Aufschlag ggü. Gesamtrahmen):** grün ≤ 2,0 · gelb 2,0 < x < 10,0 · **rot ab 10,0** (Gartner: Faktor 10–50 = Washing).

**F-A4 · Erklärtexte in der Preis-Maske** (Wortlaut in `preislogik.json` → `erklaerungen`, bitte Formulierung freigeben):
- „Warum ein KI-Chat-Vorgang nur Cent-Bruchteile kostet"
- „Warum ein echter Agent deutlich teurer ist als ein Chatbot"
- „Warum ein Multiagenten-System die teuerste Klasse ist"
- „Warum die Klassen sich preislich überlappen dürfen"
- „Warum ein Grundpreis (Sockel) dazugehört"
- „Warum der faire Preis manchmal so niedrig wirkt"
- „Was der Korridor zeigt — und was nicht"

---

## B · Nutzen-Check „Lohnt sich das?" (`/lohnt-sich`) — 🟦 Gottfried

Als VORSCHLAG markiert (`nutzen.json` pflegehinweis). Alles nur Größenordnung/Indikation (G6).

**F-B1 · Startwerte der Regler:**

| Feld | Vorschlag | Spanne |
|---|---|---|
| Betroffene Vorgänge / Jahr | 5.000 | 0 – 200.000 |
| Zeitersparnis pro Vorgang | 10 Min. | 0 – 120 |
| Vermiedene Nacharbeit / Jahr | 0 Std. | 0 – 5.000 |
| Kosten pro Arbeitsstunde | 50 € | 0 – 300 |
| Investition / Jahr | 30.000 € | 0 – 500.000 |

**F-B2 · Amortisations-Ampel:** grün „Lohnt sich klar" ≤ 12 Monate · gelb „Grenzwertig" ≤ 24 Monate · rot „Noch fraglich" > 24 Monate.

**F-B3 · Strategische-Potenziale-Texte** (unter der Zahl):
- „Mehr Zeit fürs Kerngeschäft — Ihre Leute frei für höherwertige Aufgaben."
- „Bessere Erreichbarkeit — mehr Angebote und mehr Aufträge."
- „Zufriedenere Kunden durch schnellere, verlässlichere Antworten."
- Gesprächs-Satz: „Diese Hebel lassen sich nicht seriös in eine Zahl pressen … Die heben wir gemeinsam im persönlichen Beratungsgespräch."

---

## C · Gelingt-Check „Gelingt das bei uns?" (`/gelingt-check`) — 🟦 Gottfried

Als VORSCHLAG markiert (`gelingt.json` pflegehinweis). Bereitschafts-Indikation, keine Rechtsberatung.

**F-C1 · Die 8 Fragen** (5 außen „Anbieter & Lösung", 3 innen „Sie selbst"):
- G1 Anbieterwechsel/Lock-in · G2 Datenhoheit & Zugriff · G3 Betreiberrisiko (Anbieter fällt aus) · G4 Kostentransparenz (Wartung/Updates/Verbrauch) · G5 Nachvollziehbarkeit & Eingriff
- G6 eigenes Knowhow · G7 Akzeptanz im Team · G8 Ziel & Prozess-Ordnung

Je Frage 4 Antworten; „offen" und „weiß nicht" zählen als **offener Punkt** (problematisch). Formulierungen/Deutungen bitte gegenlesen (Wortlaut in `gelingt.json`).

**F-C2 · Ampel nach Zahl offener Punkte:** grün „Gute Voraussetzungen" 0–1 · gelb „Solide Basis, ein paar offene Punkte" 2–4 · rot „Wichtige Punkte zuerst klären" 5–8.

---

## D · Reviewpflichtige Rechtstexte — ⚖️ Kanzlei (B8)

**F-D1 · AI-Act-Mini „Betrifft Sie der 2. August?"** (`mini-ai-act.json`, `pflegehinweis`: „Kanzlei-Review vor Launch"). Zu prüfende Rechtsaussagen:
- 2. August 2026: EU AI Act allgemein anwendbar; Hochrisiko-Pflichten verschoben auf Dezember 2027; Transparenzpflichten Art. 50 gelten.
- Zuständige Behörde DE: **BSI**. Sanktionsrahmen: bis 35 Mio. € oder 7 % des weltweiten Jahresumsatzes.
- Art. 4 KI-Kompetenzpflicht seit Februar 2025 (trifft nahezu alle Unternehmen).
- Übergangsregel Bestandssysteme: + 6 Monate (bis Februar 2027) für Transparenz/Kennzeichnung.
- Pflicht-Aussagen je Frage (Chatbot-Kennzeichnung, KI-Inhalte/Deepfakes, KI-Kompetenz, Bestandssystem-Frist).
- Consent-Checkbox-Text: „Anonymisierte Nutzung meiner Angaben für Marktauswertungen (jederzeit widerrufbar)."
- Prominentes Label: „Orientierung, keine Rechtsberatung."

**F-D2 · Standardklauseln im Prüfbericht** (`berichtstexte.json` → `bloecke`, im UI **wörtlich** ausgegeben): Fairness-Klausel, Orientierungs-Disclaimer, Eingabebasiertheit, „Weiß nicht"-Befund, Reihenfolge-Governance, Überdimensionierung, **AI-Act-Label**, **BAFA-Vermerk** (mit `gueltig_bis`), Beratungszitat, Argumentationskette, Hash-Fußzeile, Beanstandung. Diese sind bereits als kanzleireviewpflichtig geführt — finaler Gegen-Check vor Launch.

---

## Nicht Teil von v1 (bewusst nach hinten)

- **Conversion-Schicht (ganz zum Schluss):** CTAs an den Ergebnissen + **meetergo** (Termine) + **Brevo** (Leads, Double-Opt-in, DB-Tabelle `leads`) + weitere externe Tools.
- **v1.1:** Datei-Upload mit automatischer Claim-Extraktion (Ollama).

## Weg zu v1-live (nach Freigabe)

1. Diese Liste Punkt für Punkt freigeben (🟦 Gottfried / ⚖️ Kanzlei).
2. Merge + Deploy AB-034…040 auf `awd.automation-boost.io` — gemeinsam, §7, mit Isolations- + 200-Checks der Fremd-Sites.
