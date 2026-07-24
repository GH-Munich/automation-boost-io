# ÜBERGABE AWD — Meilenstein M2: Regel-Engine

Stand: 24.07.2026 · Vorgänger: M0 (Konzept), M1 (Content-JSONs) · Standard-Version 1.0

---

## 1. Ausgangslage

**Fertig und im Repository vorhanden:**

- `docs/AWD_KONZEPT_v1.0.md` — fachliche SSOT, 14 Kapitel, alle Regel-IDs definiert
- `apps/detektor/content/` — 16 JSON-Dateien, validiert, UTF-8, alle mit `standard_version: "1.0"`
- `CLAUDE.md` — Arbeitsregeln für dieses Repository

**Noch nicht vorhanden:** Jeglicher Code. M2 ist der erste Code-Meilenstein.

---

## 2. Auftrag M2

Eine **deterministische Regel-Engine als TypeScript-Modul** mit vollständiger Golden-Test-Suite. Kein UI, keine Datenbank, keine API — nur die Engine und ihre Tests. Das UI folgt in M3 und setzt auf dieser Engine auf.

### 2.1 Zielstruktur

```
apps/detektor/
├── content/                    (vorhanden, nicht ändern)
│   ├── achsen.json
│   ├── bedarf.json
│   ├── preislogik.json
│   ├── tco-faktoren.json
│   ├── schnelltest.json
│   ├── phrasen.json
│   ├── fragen-12.json
│   ├── muster.json
│   ├── preise-support.json
│   ├── berichtstexte.json
│   ├── branding.json
│   └── minis/*.json
└── src/engine/
    ├── types.ts               Typdefinitionen
    ├── content-loader.ts      JSON laden + Versionsprüfung
    ├── scoring.ts             Achsen → Score → Band (inkl. Weiß-nicht-Bandbreite)
    ├── bedarf.ts              F1–F7 → Bedarfsklasse N0–N5
    ├── pricing.ts             Korridor, Washing-Faktor, Überdimensionierung
    ├── tco.ts                 T1–T5, beide Rechenwege
    ├── muster.ts              Signalworterkennung M1–M6
    ├── schnelltest.ts         S1–S5 → Ampel
    ├── protokoll.ts           Begründungsspur + Prüfprotokoll-JSON
    ├── index.ts               öffentliche API
    └── __tests__/
        ├── golden/            Referenzfälle als JSON
        └── *.test.ts
```

### 2.2 Die acht Engine-Funktionen

**1. `loadContent()` — Laden und Versionsprüfung**
Lädt alle JSONs, prüft dass jede Datei `meta.standard_version` trägt und alle identisch sind. Bei Abweichung: Abbruch mit klarer deutscher Fehlermeldung, die die abweichenden Dateien benennt. Der Rückgabewert ist typisiert.

**2. `calculateScore()` — Agentik-Score**
Eingabe: Antworten zu A1–A6, jeweils eine Regel-ID (`A1.0`, `A1.1`, `A1.2` oder `A1.X`).
Ausgabe: `scoreMin`, `scoreMax`, `band` (B1–B4 oder `null`), `vorlaeufig` (boolean), `nichtBewertbar` (Liste der Achsen), `begruendung` (je Achse: Regel-ID, Punkte, Eingabetext).

Kernlogik nach G5: Eine `.X`-Antwort ist nicht bewertbar. Sie zählt im Minimum mit 0, im Maximum mit 2. `band` wird nur gesetzt, wenn `scoreMin` und `scoreMax` im selben Band liegen; sonst `band = null`, `vorlaeufig = true` und Ausgabe der Bandbreite.

**3. `classifyBedarf()` — Bedarfsklasse Tür C**
Eingabe: Antworten F1–F7.
Ausgabe: Klasse N0–N5, bei N0 zusätzlich der Grund (`daten`, `prozess` oder `risiko`), Liste ausgelöster Zusatzbefunde, angewandte Regel-ID.

Kernlogik: Die Regeln R01–R09 aus `bedarf.json` werden **strikt in Reihenfolge** ausgewertet — die erste zutreffende gewinnt (First-Match). Die Regeln stehen in den Daten, nicht im Code; der Code interpretiert sie nur. `wenn` bedeutet: alle genannten Bedingungen müssen zutreffen. `wenn_oder` bedeutet: eine der Bedingungen genügt. `fallback: true` greift, wenn keine Regel davor zutraf.

**4. `calculatePriceCorridor()` — Preiskorridor und Washing-Faktor**
Eingabe: gelieferte Kostenklasse, Jahresvolumen, Betriebsfaktor (Vorgabe 3–5), USD/EUR-Kurs, Angebotspreis p. a., optional benötigte Klasse.
Ausgabe: Korridor in USD und EUR, Washing-Faktor, Ampelstufe, optional Überdimensionierungs-Befund.

Formel: Untergrenze = `vorgangskosten.min × volumen × betriebsfaktor.min`, Obergrenze = `vorgangskosten.max × volumen × betriebsfaktor.max`, dann Umrechnung mit dem Kurs. Washing-Faktor = `angebotspreis / korridorObergrenzeEur`. Überdimensionierung, wenn `ordnung(benoetigt) < ordnung(geliefert)`.

Der Referenzfall in `preislogik.json` unter `beispiel_golden_test` ist rechnerisch verifiziert und der erste Golden Test: chatbot_rag, 24.000 Vorgänge, Faktor 3–5, Kurs 0,90, Angebot 60.000 € → Korridor 324–5.400 € → Washing-Faktor 11,1 → rot.

**5. `calculateTco()` — TCO-Wasserfall**
Eingabe: Angebotspreis, Preistyp (`pilot` oder `produktiv`), optional Laufzeit in Monaten, optional abweichende Faktoren.
Ausgabe: Wasserfallstufen mit Bezeichnung, Wert und Quellen-ID (T1–T5), Endwert.

Rechenweg A (Pilotpreis) und Rechenweg B (Produktivpreis) stehen in `tco-faktoren.json`. Jede Stufe trägt ihre Quellen-ID mit, damit der Bericht sie ausweisen kann.

**6. `detectMuster()` — Mustererkennung**
Eingabe: Freitext (Angebotstext oder extrahierte Begriffe), optional direkte Klassifikationsantwort.
Ausgabe: erkanntes Muster mit Trefferwörtern, oder `generisch`.

Reine Signalwortsuche gegen die `signale`-Listen in `muster.json`, case-insensitive, Umlaut-tolerant. Kein Machine Learning. **Das Ergebnis ist immer eine Vermutung mit Bestätigungspflicht** — die Engine liefert den Vorschlag plus den Bestätigungstext, entscheidet aber nichts. Bei mehreren Treffern: alle zurückgeben, nach Trefferzahl sortiert. Bei null Treffern: `generisch`.

**7. `evaluateSchnelltest()` — Schnelltest S1–S5**
Eingabe: fünf Antworten.
Ausgabe: Anzahl problematischer Antworten, Ampelstufe, Ergebnistext, Liste der problematischen Punkte mit ihrer Deutung.

**8. `buildProtokoll()` — Prüfprotokoll**
Eingabe: alle Teilergebnisse eines Assessments.
Ausgabe: maschinenlesbares JSON mit allen Eingaben, angewandten Regel-IDs, Ergebnissen und der Standard-Version. Dieses Objekt wird später gehasht (SHA-256) und dem Bericht angehängt.

Das Protokoll enthält **keine** Zeitstempel innerhalb der Bewertungslogik — sonst wäre G1 verletzt. Zeitstempel werden außerhalb der Engine hinzugefügt.

### 2.3 Golden-Test-Suite

Jede der acht Funktionen braucht Referenzfälle. Mindestabdeckung:

| Bereich | Pflichtfälle |
|---|---|
| Scoring | Je ein Fall für B1, B2, B3, B4 · ein Fall mit einer `.X`-Antwort, Bandbreite bleibt im selben Band · ein Fall mit mehreren `.X`, Band wird `null` und `vorlaeufig` · ein Fall mit allen sechs `.X` (Score 0–12) |
| Bedarf | Je ein Fall für N0-daten, N0-prozess, N0-risiko, N1, N2, N3, N4, N5 · ein Fall, der den Fallback R09 auslöst · ein Fall, der die First-Match-Reihenfolge beweist (mehrere Regeln träfen zu, die erste gewinnt) |
| Pricing | Der Referenzfall aus `preislogik.json` · je ein Fall grün, gelb, rot · ein Überdimensionierungs-Fall |
| TCO | Ein Fall Rechenweg A, ein Fall Rechenweg B |
| Muster | Je ein Treffer für M1, M2, M4 (MVP-Tracks) · ein Fall mit Mehrfachtreffern · ein Fall ohne Treffer → `generisch` |
| Schnelltest | Ein Fall grün, ein Fall gelb, ein Fall rot |

Die Referenzfälle liegen als JSON in `__tests__/golden/`, damit sie ohne Codeänderung erweiterbar sind.

**Zusätzlicher Pflichttest: Determinismus.** Ein Test führt dieselbe Eingabe 100-mal durch die komplette Engine und stellt sicher, dass das Ergebnis bitgleich ist. Das ist der Test, der G1 absichert.

---

## 3. Verbindliche Vorgaben

1. **Keine fachlichen Werte im Code.** Kein Schwellwert, kein Faktor, kein Fragetext, kein Preis. Alles aus den JSONs. Wenn ein Wert fehlt: melden, nicht erfinden.
2. **Reine Funktionen.** Keine Seiteneffekte, kein Zufall, keine Systemzeit, keine Netzwerkaufrufe in der Bewertungslogik.
3. **Kein LLM in der Bewertung.** Die Engine ruft niemals ein Sprachmodell auf.
4. **Begründungsspur immer.** Jedes Ergebnis trägt Regel-ID, Eingabe und Punkte mit sich.
5. **„Weiß nicht" ist niemals eine Null.** Immer Bandbreite nach G5.
6. **Shared Core.** Kein Track verändert Scoring-Regeln. Falls eine Anforderung das zu verlangen scheint: melden.
7. **Vollständige Dateien liefern**, keine Patches.
8. **AB-Nummernserie** für Arbeitspakete und Commits.

---

## 4. Definition of Done für M2

- [ ] Alle acht Engine-Funktionen implementiert und typisiert
- [ ] Golden-Test-Suite vollständig nach Abschnitt 2.3, alle Tests grün
- [ ] Determinismus-Test (100 Durchläufe, bitgleich) grün
- [ ] Versionsprüfung beim Content-Laden funktioniert und schlägt bei manipulierter `standard_version` fehl
- [ ] Kein einziger fachlicher Wert im Code hartkodiert — per Suche nachweisbar
- [ ] `npm test` läuft ohne Fehler durch
- [ ] Commit und Push nach `GH-Munich/automation-boost-io`

---

## 5. Was NICHT zu M2 gehört

UI und Wizard (M3) · Upload und Claim-Extraktion (M3) · Datenbank und Persistenz (M3/M4) · Berichtserzeugung und PDF (M4) · Register, Hash, Versionierung (M4) · Dashboard (M5) · Minis als Landingpages (M5) · Deployment (M6, **gemeinsam Schritt für Schritt**).

---

## 6. Offene Punkte — nicht eigenmächtig auflösen

| Punkt | Status |
|---|---|
| Extraktionsmodell: self-hosted Ollama auf gha-ops vs. EU-API | Entscheidung Gottfried, vor M3 |
| Farbwerte Designsystem (`branding.json` steht auf `TODO`) | Entscheidung Gottfried, vor M3 |
| Serverzuordnung Deployment | gemeinsam bei M6 |
| Kanzlei-Review der Berichtstexte | Gottfried, vor M6 |
| DPMA-Markenrecherche „Agent-Washing-Detektor" | Gottfried, laufend |
| BAFA-Beraterbörse: Listungsstatus | Gottfried, laufend |

---

## 7. Terminlage

Zielbild: live vor Mitte Oktober 2026, damit die Restlaufzeit des BAFA-Fensters (Richtlinie endet 31.12.2026) voll nutzbar ist.

**Vorgezogen und terminkritisch:** `mini-ai-act` soll solo live gehen, bevor der EU AI Act am 2. August 2026 allgemein anwendbar wird. Die Konfiguration liegt fertig in `content/minis/mini-ai-act.json` mit `vorablaunch: true`. Dieser Mini braucht nur eine Landingpage und die Schnelltest-Mechanik — nicht die volle Engine. Falls M2 und die Landingpage terminlich kollidieren, hat der Mini Vorrang.
