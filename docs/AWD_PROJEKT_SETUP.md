# AWD — Projekt- und Repository-Setup

Stand: 24.07.2026 · Übergang von Chat-Arbeit zu Claude Code

---

## 1. Claude-Projekt anlegen

**Projektname:** `AWD — Agent-Washing-Detektor`

### 1.1 Ins Projektwissen hochladen

| Datei | Zweck |
|---|---|
| `AWD_KONZEPT_v1.0.md` | Fachliche SSOT — jeder Chat kennt Standard und Entscheidungen |
| `CLAUDE.md` | Arbeitsregeln, Shared Core, Nummernkreise |
| `UEBERGABE_AWD_M2.md` | Aktueller Arbeitsstand und Auftrag |
| Die 16 Content-JSONs | Damit Standardänderungen im Chat gegen den echten Inhalt geprüft werden |
| BUCH-2 bis BUCH-6 | Quellenkopien für Belegprüfung und Herleitung — siehe 1.2 |

### 1.2 Die Bücher: Quellenkopien mit Rangfolge

Die Bücher 2–6 gehören ins Projektwissen, weil der Prüfstandard aus ihnen abgeleitet ist. Ohne sie fehlt bei Standard-Diskussionen die Belegstelle — etwa bei Fragen wie „stützt die Quelle den Ampel-Schwellwert noch?" oder „woher stammt die Resolution-Rate von 42–50 %?".

**Zwei Vorkehrungen gegen Versionsdrift:**

1. **Versionsstand in den Dateinamen**, damit eine veraltete Projektkopie sofort erkennbar ist:
   - `BUCH-2_Gesamtmarkt-Agentensysteme_2026-07.md`
   - `BUCH-3_Positionierung-automation-boost_2026-07.md`
   - `BUCH-4_Geschaeftsmodelle-Marktpotenzial-DE_2026-07.md`
   - `BUCH-5_Echte-Agenten-vs-Agent-Washing_2026-07.md`
   - `BUCH-6_Hochrisikozone-Fallmuster-Kostenfallen_2026-07.md`

2. **Rangfolge in den Projektanweisungen festhalten** (Text siehe 1.3): SSOT bleibt das Buchsystem, für den Prüfstandard gilt das Konzept, die Bücher dienen der Belegprüfung.

**Nicht ins Projektwissen:** Buch 1 und die übrigen Teile des Buchsystems. Sie tragen zum AWD nichts bei und verdünnen den Kontext.

**Pflegeregel:** Wird eines der Bücher 2–6 im Buchsystem überarbeitet, die Projektkopie mit neuem Datumsstand ersetzen und prüfen, ob der Prüfstandard nachzieht — eine Buchänderung kann einen Standard-Versionssprung auslösen (G4).

### 1.3 Projektanweisungen

Folgender Text als Projektanweisung eintragen:

> Dieses Projekt ist der Agent-Washing-Detektor (AWD) für automation-boost.io. Fachliche SSOT ist AWD_KONZEPT_v1.0.md im Projektwissen — bei Widerspruch zwischen Aussage und Konzept gilt das Konzept, und der Widerspruch wird benannt.
>
> Die Bücher 2–6 im Projektwissen sind Quellenkopien mit Stand Juli 2026, nicht die SSOT. SSOT ist das Buchsystem. Für den AWD-Prüfstandard gilt AWD_KONZEPT_v1.0.md; die Bücher dienen der Belegprüfung und Herleitung. Bei Widerspruch zwischen Buch und Konzept gilt das Konzept, und der Widerspruch wird benannt.
>
> Arbeitsweise: Immer vollständige Ersatzdateien, niemals Patches oder Teil-Diffs. Kein Fülltext — Ergebnis, kurze Änderungsliste, weiter. Keine Rückfragen, wenn die Richtung klar ist. Deutsch, Du-Form. Deutsche Texte immer UTF-8, bei Dateierzeugung über Skripte explizit encoding="utf-8".
>
> Server, Datenbank und Deployment ausschließlich gemeinsam Schritt für Schritt: jedes Kommando einzeln ankündigen, Gottfried führt aus, Ergebnis besprechen, dann das nächste. Niemals Listen von Serverbefehlen zum Selbstabarbeiten hinterlassen, auch nicht in Übergabedokumenten. Niemals Befehle, die Passwörter, API-Schlüssel oder Secrets im Terminal anzeigen — sichere Alternativen verwenden und vorher warnen.
>
> Nummernkreis für dieses Projekt ist AB-. Niemals O- (ki-boost.io) oder K- (ki-kompetenz.guide) verwenden.
>
> Eiserne Regel Shared Core: Alle Türen und Tracks bewerten mit denselben sechs Achsen und identischen Regel-IDs. Track-Inhalte sind ausschließlich additiv. Kein Track verändert Scoring-Regeln — falls eine Anforderung das zu verlangen scheint, melden statt umsetzen.
>
> Grundsatz G1 Reproduzierbarkeit: Kein LLM trifft eine Bewertungsentscheidung. Das LLM extrahiert, der Mensch bestätigt, die Regel-Engine bewertet.
>
> Grundsatz G5: "Weiß ich nicht" ist ein Befund, niemals eine Null. Immer Score-Bandbreite statt Punktabzug.
>
> Der AWD trifft keine eigenen Tatsachenbehauptungen über Anbieter. Bewertet werden ausschließlich vom Auftraggeber bestätigte Eingaben.

### 1.4 Arbeitsteilung Chat vs. Claude Code

| Im Projekt-Chat | In Claude Code |
|---|---|
| Konzeptentscheidungen, Standard-Versionssprünge | Regel-Engine, Tests, Refactoring |
| Content-JSON-Pflege (Preise quartalsweise) | Wizard, Komponenten, API-Routen |
| Berichtstexte und Formulierungen | Datenbankschema, Migrationen |
| Positionierung, Roadmap, Marketing | Build, Lint, git |
| Deployment (gemeinsam Schritt für Schritt) | — |

---

## 2. Repository anlegen

### 2.1 Struktur

```
automation-boost-io/                (privat, GH-Munich)
├── CLAUDE.md
├── README.md
├── .gitignore
├── docs/
│   ├── AWD_KONZEPT_v1.0.md
│   └── UEBERGABE_AWD_M2.md
└── apps/
    └── detektor/
        └── content/
            ├── achsen.json
            ├── bedarf.json
            ├── berichtstexte.json
            ├── branding.json
            ├── fragen-12.json
            ├── muster.json
            ├── phrasen.json
            ├── preise-support.json
            ├── preislogik.json
            ├── schnelltest.json
            ├── tco-faktoren.json
            └── minis/
                ├── mini-agent-check.json
                ├── mini-ai-act.json
                ├── mini-bafa.json
                ├── mini-bedarf.json
                └── mini-tco.json
```

### 2.2 Ablauf

1. Auf GitHub das private Repository `automation-boost-io` unter `GH-Munich` anlegen — ohne README, ohne .gitignore (kommt aus dem lokalen Stand).
2. Lokal einen Ordner anlegen, die Struktur oben aufbauen.
3. `awd-content_v1.0.zip` nach `apps/detektor/` entpacken — das Zip enthält bereits den Ordner `content/`.
4. `CLAUDE.md` ins Wurzelverzeichnis, `AWD_KONZEPT_v1.0.md` und `UEBERGABE_AWD_M2.md` nach `docs/`.
5. Repository initialisieren, erster Commit, Push.

Die konkreten Git-Kommandos gehen wir gemeinsam durch, sobald das Repository auf GitHub existiert — Schritt für Schritt, wie bei allen Server- und Deployment-Themen.

### 2.3 .gitignore

```
node_modules/
.next/
out/
dist/
build/
.env
.env.*
!.env.example
*.log
.DS_Store
.vscode/
.idea/
coverage/
*.tsbuildinfo
uploads/
```

---

## 3. Erster Claude-Code-Prompt

Nach dem Setup in `automation-boost-io` starten und folgenden Prompt verwenden:

> Lies CLAUDE.md und docs/AWD_KONZEPT_v1.0.md vollständig, dann docs/UEBERGABE_AWD_M2.md. Verschaffe dir einen Überblick über die JSON-Dateien in apps/detektor/content/ — insbesondere achsen.json, bedarf.json und preislogik.json.
>
> Setze anschließend M2 um: die deterministische Regel-Engine mit vollständiger Golden-Test-Suite, exakt nach Abschnitt 2 des Übergabedokuments. Beginne mit types.ts und content-loader.ts, dann scoring.ts mit seinen Golden Tests, damit wir die Weiß-nicht-Bandbreite früh verifizieren können.
>
> Keine fachlichen Werte im Code hartkodieren. Wenn ein Wert im Standard fehlt, den du brauchst: melden statt erfinden.

---

## 4. Reihenfolge der nächsten Schritte

| Schritt | Wo | Anmerkung |
|---|---|---|
| Projekt anlegen, Wissen hochladen | Claude-Web | ~10 Minuten |
| Repository anlegen, Dateien einsortieren | lokal + GitHub | Git-Kommandos gemeinsam |
| M2 Regel-Engine | Claude Code | erster Code-Meilenstein |
| Landingpage `mini-ai-act` | Claude Code | **terminkritisch, Ziel KW 32** |
| M3 Wizard und Upload | Claude Code | braucht vorher: Extraktionsmodell- und Farbentscheidung |

**Der AI-Act-Mini hat Vorrang vor M2, falls es terminlich eng wird.** Der 2. August verschiebt sich nicht; die Konfiguration liegt fertig vor und braucht nur eine Landingpage plus die einfache Schnelltest-Mechanik, nicht die volle Engine.

---

## 5. Was vor M3 von dir entschieden werden muss

| Entscheidung | Warum sie den Code blockiert |
|---|---|
| Extraktionsmodell: self-hosted Ollama auf gha-ops oder EU-API | Bestimmt Architektur des Upload-Pfads. Empfehlung: Ollama als Vorgabe, EU-API als zuschaltbarer Fallback — stützt das Versprechen, dass Angebote die eigenen EU-Server nicht verlassen |
| Farbwerte automation-boost | `branding.json` steht auf `TODO`; ohne Werte kein Designsystem |
| Serverzuordnung `gha-live` vs. `gha-ops` | Erst bei M6 nötig, gemeinsam |

Laufend, ohne Code-Bezug: DPMA-Markenrecherche, BAFA-Listungsstatus, Kanzlei-Review der Berichtstexte vor Launch.
