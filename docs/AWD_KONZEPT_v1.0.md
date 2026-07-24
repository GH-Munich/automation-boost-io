# AWD_KONZEPT v1.0 — Der Agent-Washing-Detektor

**Gründungsdokument · Portal automation-boost.io**
Stand: 24. Juli 2026 · Status: Freigegeben zur Umsetzung (Stufe 1 / MVP)
Quellenbasis: Buch 2–6 des GHA-Buchsystems (Stand 24.07.2026) sowie Konzeptdiskussion vom 24.07.2026
Dokumentregel: Dieses Dokument ist SSOT für das Projekt AWD. Änderungen nur per Versionssprung mit Changelog (Kap. 14).

---

## 0. Zweck und festgezurrte Entscheidungen

Der AWD ist das interaktive Prüf- und Beratungsinstrument von automation-boost.io. Er beantwortet in einer Sitzung drei Fragen: **(1)** Braucht dieser Prozess überhaupt agentische Automatisierung? **(2)** Ist das angebotene oder vorhandene System ein echter Agent? **(3)** Welcher Preis ist in Größenordnungen gerechtfertigt?

### 0.1 Die vier Architekturentscheidungen (beschlossen 24.07.2026)

| # | Entscheidung | Konsequenz |
|---|---|---|
| **E1** | Einstieg über das **Prüfobjekt**, nicht über Fallmuster | Drei Türen: Angebot liegt vor / Bestandssystem / Noch kein Anbieter |
| **E2** | Fallmuster werden **erkannt, nicht erfragt** | Erkennungsregeln (M1–M6) mit Bestätigungspflicht; Sitzungsmodus mit Direktwahl |
| **E3** | MVP = generischer Pfad in voller Qualität + **3 Tracks** | Support, RAG, Voice; Tracks 4–6 in Stufe 2 (BAFA-Fenster als Taktgeber) |
| **E4** | **Korpus-Consent und Anonymisierung ab Tag 1** | Einwilligung, k-Anonymität und Löschkonzept sind Teil des Datenmodells (Kap. 9.3) |

### 0.2 Die eiserne Regel: Shared Core

Alle Pfade, Türen und Tracks bewerten mit **denselben sechs Achsen und identischen Regel-IDs** aus **einem** Prüfstandard mit **einem** Changelog. Track-Inhalte sind ausschließlich **additiv** (Zusatzfragen, Rechner, Präzedenzfälle, Berichtsbausteine). Kein Track verändert Scoring-Regeln. Diese Regel sichert Vergleichbarkeit, Register und Korpus und begrenzt den Pflegeaufwand.

---

## 1. Produkt und Positionierung

### 1.1 Die zwei Fehlkäufe, die der AWD abfängt

| Fehlkauf | Muster | Beleg (Buchsystem) |
|---|---|---|
| **Typ 1 — Agent Washing** | Chatbot/RPA zum Agentenpreis; Aufschlag Faktor 10–50 | Buch 5 (Gartner: ~130 echte von tausenden Anbietern) |
| **Typ 2 — Überdimensionierung** | Echter Agent für deterministischen Prozess; Faktor bis 1.000 ggü. Skript | Buch 5 Kap. 6 |

### 1.2 Die zwei Kennzahlen

- **Agentik-Score (0–12):** Summe der sechs Achsen (A1–A6), je 0/1/2 Punkte. Herkunft: Buch 5 Prüfkatalog.
- **Washing-Faktor:** Angebotspreis p. a. ÷ Obergrenze des gerechtfertigten Preiskorridors (Regel P3). Die eine Zahl, die der Entscheider sich merkt.

### 1.3 Was der AWD nicht ist (Negativabgrenzung, verbindlich)

Kein Leaderboard, kein Preisvergleichsportal, kein Anbieterverzeichnis mit Listing-Gebühren, keine Rechtsberatung, keine Einkaufskalkulation. Der AWD trifft **keine eigenen Tatsachenbehauptungen über Anbieter**: Bewertungsgrundlage sind ausschließlich vom Auftraggeber bestätigte Eingaben und Dokumente (Grundsatz G2).

### 1.4 Portfolio-Abgrenzung und Namensklammern

- **LLM-Kompass** (ki-boost.io) beantwortet „welches Modell". **AWD** (automation-boost.io) beantwortet „ob überhaupt, ist das einer, was darf es kosten".
- Hauptprodukt: **„Der Agent-Washing-Detektor"**. Lead-Layer: **„Der 2-Minuten-Detektor: [Frage]"**. Prüfnummern: **AWD-JJJJ-NNNNN**.
- Heimat: **detektor.automation-boost.io** (Subdomain zahlt auf Portalautorität ein).

---

## 2. Der AWD-Prüfstandard 1.0

### 2.1 Grundsätze (G1–G6)

| ID | Grundsatz |
|---|---|
| **G1** | **Reproduzierbarkeit.** Deterministische Regel-Engine; gleiche Eingaben → gleiches Ergebnis. Kein LLM-Ermessen in der Bewertung. |
| **G2** | **Eingabebasiertheit.** Bewertet werden nur bestätigte Eingaben. Jede Achsenwertung zeigt Eingabe im Wortlaut, Regel-ID, Punktzahl und (bei Upload) Belegstelle mit Seite. |
| **G3** | **Fairness-Klausel.** „Eine niedrige Einstufung ist kein Qualitätsurteil, sondern eine Preiseinordnung." Wörtlich in jedem Bericht. |
| **G4** | **Versionierung.** Standard-Version auf jedem Bericht; Regeländerungen nur per Versionssprung; Changelog öffentlich. |
| **G5** | **„Weiß ich nicht" ist zulässig und ein Befund.** Betroffene Achse wird „nicht bewertbar"; der Score wird als Bandbreite (min/max) ausgewiesen; die Lücken erscheinen als eigene Befundzeile („n von m Kernangaben im Unternehmen nicht bekannt"). Keine 0-Punkte-Strafe. |
| **G6** | **Größenordnungen.** Alle Preisaussagen sind Korridore mit sichtbaren, editierbaren Annahmen. Ausdrücklich Orientierung, keine Einkaufskalkulation. |

### 2.2 Die sechs Achsen (Regeln A1–A6)

Je Achse gilt: 0/1/2 Punkte nach den Ankern aus Buch 5; der Demo-Test ist als Aufklapper im Wizard hinterlegt.

| Achse | Prüffrage | 0 Punkte | 1 Punkt | 2 Punkte | Demo-Test |
|---|---|---|---|---|---|
| **A1 Zielverfolgung** | Leitet das System Teilziele aus einer Zielbeschreibung ab? | Braucht Schritt-für-Schritt-Anweisung | Füllt Parameter in vordefiniertem Ablauf | Setzt eigene Teilziele | Ziel vorgeben, das nicht in der Demo vorgesehen war |
| **A2 Planung/Pfadwahl** | Wählt es den Lösungsweg selbst? | Fester Pfad | Verzweigungen im vorgegebenen Entscheidungsbaum | Nicht-deterministische Pfadwahl mit Begründung | Dieselbe Aufgabe zweimal stellen |
| **A3 Werkzeugnutzung** | Entscheidet es zur Laufzeit über Werkzeuge? | Keine / fest verdrahtet | Werkzeuge vorhanden, Zuordnung programmiert | Auswahl zur Laufzeit | Werkzeugprotokoll zeigen lassen |
| **A4 Ausnahmebehandlung** | Was passiert bei unerwartetem Zustand? | Abbruch mit Fehlermeldung | Rückfrage an den Menschen | Erkennung, alternative Strategie, Wiederaufnahme | Demo mit unvollständigen Daten / abgeschaltetem Zielsystem |
| **A5 Gedächtnis** | Bleibt Kontext über Sitzungen erhalten? | Zustandslos | Sitzungsbezogen | Persistent mit Wiederverwendung | Vorgang am Folgetag fortsetzen lassen |
| **A6 Eigenständigkeit** | Wie viele Vorgänge laufen ohne Eingriff durch — belegt? | Jeder Schritt braucht Bestätigung | Vorgänge laufen durch, Freigabe am Ende | Definierte Vorgangsklassen vollautonom mit Stichprobe | „Nicht-Interventionsrate bei Bestandskunden — gemessen wie?" |

A4 ist die trennschärfste Achse (Buch 5); A6 ist die Presto-Achse.

### 2.3 Auswertungsbänder (B1–B4)

| ID | Score | Einstufung | Konsequenztext im Bericht |
|---|---|---|---|
| **B1** | 10–12 | Echter Agent | Agentischer Preis gerechtfertigt; Governance-Prüfung erforderlich |
| **B2** | 7–9 | Agentischer Workflow | Brauchbar; Preisverhandlung auf Workflow-Niveau |
| **B3** | 4–6 | Intelligente Automatisierung (IPA) | Kein agentischer Aufschlag zahlen |
| **B4** | 0–3 | Chatbot oder RPA mit neuem Etikett | Agent Washing — ablehnen oder als das kaufen, was es ist |

Bei „Weiß nicht"-Antworten (G5): Einstufung nur, wenn min- und max-Score im selben Band liegen; sonst „vorläufig — Band X bis Y" plus Befundzeile.

### 2.4 Bedarfsklassen für Tür C (Regeln N0–N5)

| ID | Klasse | Kriterien (Auszug) | Typische Lösung |
|---|---|---|---|
| **N0** | **Stopp: erst Daten-/Prozessarbeit** | Stammdaten inkonsistent, Prozess undokumentiert, oder Fehler irreversibel und teuer | Datenprojekt / Prozessdokumentation / Mensch mit Assistenz |
| **N1** | Skript / RPA | Deterministisch, regelkonform, hohes Volumen | 50-Zeilen-Skript oder RPA |
| **N2** | RAG-Assistent | Wissensauskunft ohne Ausführung | Retrieval + LLM |
| **N3** | IPA | RPA-Ablauf, KI informiert Entscheidungen | RPA + Klassifikation/OCR |
| **N4** | Agentischer Workflow | Teilstrukturiert, wenige bekannte Ausnahmetypen | n8n-Workflow mit Agenten-Knoten |
| **N5** | Echter Agent | Ausnahmebehaftet, mehrstufig, reversibel und instrumentierbar | Agentisches System mit Freigabelogik |

### 2.5 Preislogik (Regeln P1–P4)

| ID | Regel |
|---|---|
| **P1** | Referenzklasse = **tatsächlich gelieferte** Klasse (aus Score-Band bzw. Bestandsklassifikation), nicht die beworbene. |
| **P2** | Fairer Jahreskorridor: (a) wo dokumentierte Marktpreise existieren (preise-support.json), diese als Anker; (b) sonst Vorgangskosten-Korridor × Jahresvolumen × Betriebs-/Margenfaktor **3–5** (Standard-Annahme AWD, sichtbar und editierbar). Vorgangskosten-Referenzen (Stand Mitte 2026, USD): Skript < 0,001 · Chatbot/1 Modellaufruf ~0,01 · IPA 0,01–0,30 (Standard-Annahme AWD) · Agent 0,30–8,00 (Buch 5). |
| **P3** | **Washing-Faktor** = Angebotspreis p. a. ÷ Korridor-Obergrenze. Ampel: **≤ 2** verhandelbar · **3–10** deutlich überteuert · **> 10** klassisches Agent Washing (Gartner-Spanne 10–50). |
| **P4** | **Überdimensionierungs-Check:** Ist die benötigte Klasse (Tür C bzw. Prozessangaben) niedriger als die gelieferte, ergeht der Befund „Überdimensionierung" — auch ein echter Agent kann der falsche Kauf sein (Faktor-1.000-Hinweis). |

### 2.6 TCO-Faktoren (Regeln T1–T5, Quelle Buch 6 Kap. 2)

| ID | Faktor | Wert |
|---|---|---|
| **T1** | Realistische TCO auf jedes Angebot | +30–40 % |
| **T2** | Pilot → Produktion | ×3 bis ×5 (Piloten decken 15–25 % der echten Rechnung) |
| **T3** | Personalanteil am Gesamtbudget | 40–60 % |
| **T4** | Jährliche Wartung ab Tag 1 | 15–30 % |
| **T5** | Zeitpuffer | mindestens 25 % |

Ausgabeform: Wasserfall „Vom Angebot zur echten Rechnung", jede Stufe mit Quellenlabel; Abschluss mit der Faustregel aus Buch 6 als Zitat.

### 2.7 Schnelltest (Regeln S1–S5, Quelle Buch 6 Kap. 5)

Fünf Fragen, ohne Fachwissen beantwortbar: **S1** Was passiert, wenn eine Information fehlt? (Abbruch → RPA · Rückfrage → Assistent · alternativer Weg → Agent) · **S2** Läuft derselbe Vorgang immer gleich ab? · **S3** Wie viele Vorgänge laufen ohne Eingriff durch — gemessen? (keine Messung → Kernbefund) · **S4** Sind Entscheidungen nachvollziehbar? (nein → Governance-Lücke) · **S5** Was kostet ein Vorgang tatsächlich? (unbekannt → Kostenrisiko). **Auswertung:** ≥ 3 problematische Antworten → Reifegradklärung vor jeder Anbieterauswahl.

### 2.8 Mustererkennung (Regeln M1–M6)

Grundsatz: Erkennung ist immer **Vermutung mit Bestätigungspflicht** („Dieses Angebot entspricht dem Muster …"). Quellen: extrahierte Angebotsbegriffe oder 2–3 Klassifikationsfragen. Fallback: generischer Pfad. Kein ML im MVP — reine Signalwortregeln, gepflegt in muster.json.

| ID | Muster | Erkennungssignale (Auszug) | Achsen-Fokus |
|---|---|---|---|
| **M1** | Voice-Agent | Anrufannahme, Voicebot, Telefonie, Spracherkennung | A6 (+ Presto-Frage) |
| **M2** | Support-Agent | Resolution, Automatisierungsquote, Deflection, Tickets, Preis je Resolution/Konversation | A6, Vertragsdefinition „gelöst" |
| **M3** | RPA-Upgrade | Bestandsanbieter + Bot/OCR + „jetzt intelligent/agentisch" | A1, A3 |
| **M4** | RAG im Agentenmantel | Wissensdatenbank, Unternehmenswissen, Dokumente — ohne Aktionsverben | Aktionsfrage (führt es aus?) |
| **M5** | Vertriebs-/SDR-Agent | Leads, Outbound, Sequenzen, Personalisierung, Terminbuchung | A2, A5, Quellenbeleg |
| **M6** | Plattform-Konfiguration | Copilot Studio, Agentforce, Implementierungspartner, Workshop | Implementierungsfragen (nicht Produkt) |

### 2.9 Die 12 Beschaffungsfragen (Q1–Q12, Quelle Buch 5 Kap. 5)

| Gruppe | Fragen |
|---|---|
| **Autonomie** | **Q1** Nicht-Interventionsrate bei Bestandskunden — wie gemessen? · **Q2** Wie viele Vorgänge laufen vollständig ohne Eingriff durch? · **Q3** Zeigen Sie einen Vorgang, bei dem das System einen Fehler selbst korrigiert hat. |
| **Technologie** | **Q4** Welche Komponenten stammen von Dritten, wer betreibt sie? (Presto-Frage) · **Q5** Welches Modell — und können wir wechseln? · **Q6** Werkzeugwahl zur Laufzeit oder programmiert? |
| **Nachweis** | **Q7** Vollständiges Ausführungsprotokoll eines Vorgangs vorlegen. · **Q8** Demo mit unseren Daten, inkl. absichtlich unvollständiger Fälle. · **Q9** Welche Belege für Autonomiebehauptungen? (DoNotPay-Frage) |
| **Governance** | **Q10** Audit-Trail — welche Entscheidungen sind rekonstruierbar? · **Q11** Berechtigungsmodell und Rollback? · **Q12** Was kostet ein Vorgang tatsächlich, alle Modellaufrufe eingerechnet? |

Status-Logik je Frage: **beantwortet / offen / verweigert**. Verweigert oder unbeantwortet ist ein Befund („wer ablehnt, gibt die Antwort" — Buch 5). Reihenfolgeregel im Bericht: Governance gehört in die Ausschreibung, vor die Demo.

---

## 3. Ablauf und Screens

### 3.1 Die drei Türen

**Tür A — „Ein Angebot liegt vor":** Upload (PDF/DOCX, optional) → deterministisches Parsing + Claim-Extraktion → **Belegstellen-Bestätigung** (jede extrahierte Behauptung mit Zitat und Seite; bestätigen / korrigieren / verwerfen — nur Bestätigtes wird bewertet) → Mustererkennung (Vorschlag, Bestätigung) → Größen-Weiche → Achsen-Wizard (bestätigte Claims vorbelegt) → 12-Fragen-Status → Preis-Check (Korridor, Washing-Faktor, TCO, ggf. Track-Rechner) → Bericht. Ohne Upload identisch, manuell.

**Tür B — „Wir haben schon gekauft":** Systemkontext (3–5 Fragen) → Klassifikation → Achsen-Wizard retrospektiv → „Was zahlen Sie wofür"-Abgleich → **Bestands-Check-Bericht**. Natürliche Brücke zum Presto-Tracker (Stufe 3).

**Tür C — „Noch kein Anbieter":** Bedarfs-Check (Prozessfragen: Determinismus, Volumen, Ausnahmequote, Stammdaten-Konsistenz, Dokumentation, Fehlerreversibilität, Auskunft vs. Ausführung) → Bedarfsklasse N0–N5 + **Faktor-Visual** („Skript ≈ 2.000 € einmalig vs. Agentenplattform ≈ 60.000 €/Jahr") → optional Anforderungsprofil als PDF (Vorstufe Ausschreibung) → Brücke zum Readiness-Assessment. Tür C trägt die Positionierung („ob überhaupt") und hat MVP-seitig dieselbe Qualitätsstufe wie Tür A.

### 3.2 Größen-Weiche

Am Start jeder Tür: bis 50 / 50–500 / 500–2.000 Mitarbeitende → Warnkarte mit dem typischen Einstiegsfehler der Größenklasse (Buch 6 Kap. 4) und justierte Empfehlung (bis 50: Workflow-Prüfung zuerst · 50–500: Run-Kosten und Ownership ins Pilotbudget · 500–2.000: Plattformmandat vor dem zweiten Projekt).

### 3.3 Zwei Modi, eine Engine

| | **Selbst-Check-Modus** | **Sitzungsmodus** |
|---|---|---|
| Zielnutzer | Entscheider allein (Funnel) | Gottfried/Lizenzpartner mit Kunde |
| Führung | Geführt, Erklärtexte, Aufklapper | Dicht, Track-Direktwahl, Tastaturnavigation |
| Darstellung | Mobil-tauglich | Beamer-Profil (große Typo, Live-Ergebnispanel) |
| Ergebnis | Sofort sichtbar + PDF per Mail | Live im Raum, Bericht direkt erzeugt |

### 3.4 Usability-Regeln (verbindlich für alle Screens)

Eine Frage pro Karte (O-477-Muster) · Antippen statt Tippen im Kernpfad, Freitext immer optional · jede Zahleneingabe als Slider/Stepper mit Default und sichtbarer Quelle, Defaults editierbar · Präzedenzfälle, Definitionen, Demo-Tests hinter „Mehr dazu" · Zeitbudget pro Pfad sichtbar (Ziel 12–15 Min. Hauptpfad) · Zwischenspeichern und Zurück jederzeit · **„Weiß ich nicht" überall als Antwortoption** (G5) · Live-Vorschau von Score/Ampel während der Eingabe · Entscheider-Deutsch, keine Achsen-Terminologie vor dem Ergebnis · Kontrast, Tastaturbedienung, große Touch-Ziele.

---

## 4. Die drei MVP-Tracks (additiv zum Shared Core)

| Track | Zusatzprüfung | Track-Rechner | Berichtsbaustein |
|---|---|---|---|
| **Support (M2)** | Resolution-Definition im Vertrag („Zeigen Sie die Klausel"), Abbruch = gelöst?, Helpdesk-Zusatzkosten, Overage-Klauseln | **Resolution-Rechner:** Tickets × realistische Rate (Default 42–50 %, Quelle: Intercom-Fallstudien) × Preis + Seats + Add-ons + Implementierung ÷ 12; Vergleich pro-Resolution vs. pro-Interaktion | Preisübersicht Support-Agenten (preise-support.json, „Stand Mitte 2026", quartalsgepflegt) |
| **RAG (M4)** | Führt es Aktionen aus oder liefert es Antworten? | Preisdiskrepanz: ehrlich verkauft (Einrichtung 8–25 T€, laufend 300–1.500 €/Mon.) vs. als Agent verkauft (60–150 T€, 3–8 T€/Mon.) | „Exzellentes Produkt, falscher Preis"-Einordnung |
| **Voice (M1)** | Nicht-Interventionsrate gemessen, Presto-Frage, Mitarbeiterbeteiligung an Anrufen | Personaleinsparung Erwartung vs. Realität bei realer Interventionsrate (Business-Case-Umkehr: −60 T€ → +30 T€) | Presto-Fall (SEC, 14.01.2025) als Belegkasten |

Stufe 2: RPA-Upgrade (M3), SDR (M5, Prüftest = Vorstufe des Referenz-Benchmarks aus Buch 3 Ebene 4), Plattform-Konfiguration (M6).

---

## 5. Lead-Layer „Der 2-Minuten-Detektor"

### 5.1 Prinzipien

Ein Mini beantwortet **eine** Frage mit **einem** Urteil und **einer** merkfähigen Zahl · Urteil sofort sichtbar, nur PDF/Detail per Mail (Brevo, Double-Opt-in) · jeder Mini ist eine JSON-Config auf der gemeinsamen Engine plus Landingpage · jede Konversion befüllt den Hauptwizard vor (Draft-Übergabe) · Korpus-Consent als optionale Checkbox.

### 5.2 Welle 1 (MVP)

| Mini | Mechanik | Output | Vorbefüllung |
|---|---|---|---|
| **mini-agent-check** „Ist das überhaupt ein Agent?" | 6 Fragen, eine je Achse | Agentik-Score + Band | Tür A, Achsen |
| **mini-bedarf** „Skript, Workflow oder Agent?" | 5–7 Prozessfragen | Bedarfsklasse + Faktor-Visual | Tür C |
| **mini-tco** „Ihr Pilot kostet 15.000 € — was kostet die Produktion?" | 3 Eingaben | TCO-Wasserfall, echte Jahr-1-Zahl | Preis-Check |
| **mini-ai-act** „Betrifft Sie der 2. August?" | 4 Fragen | Persönliche Pflichtenliste Art. 50 — Label „Orientierung, keine Rechtsberatung" | — |
| **mini-bafa** „Zahlt der Staat Ihre Beratung mit?" | 4 Fragen (O-477-Wiederverwendung) | „Effektiv 1.750 € statt 3.500 €" + Fristhinweis 31.12.2026 | — |
| **Schnelltest** (S1–S5) | 5 Fragen | „≥ 3 → Reifegradklärung vor Anbieterauswahl" | Tür C |

**mini-ai-act geht vorgezogen solo live** (Ziel: KW 32) — der 2. August ist der Launch-Aufhänger und wartet nicht auf den MVP.

### 5.3 Welle 2 (Backlog)

10-Sätze-Check („Wie viele dieser Sätze fielen in Ihrem letzten Anbietertermin?" — viralster Kandidat) · Support-Rechner als eigene Landingpage · Top-20-Kunden-Test (angeleiteter Selbsttest in ERP/CRM — einziger Check mit physischer Nachprüfung im eigenen System) · Souveränitäts-Check (Tier 1/2/3) · Autonomiestufen-Check (0–4) · 12-Fragen-Generator · Bestands-Check „Was haben Sie da eigentlich gekauft?".

### 5.4 GEO-Wirkung

Die Frage-Landingpages entsprechen den Suchanfragen in Google und LLM-Suche („ist das ein ki agent", „was kostet ein ki-agent wirklich"). Ziel: zitierfähige deutsche Referenzquelle je Frage — Autoritätsaufbau nach dem Artificial-Analysis-Muster (Buch 4, Modell A).

---

## 6. Transparenz- und Beanstandungsarchitektur

### 6.1 Der Dreischritt

**Das LLM extrahiert, der Mensch bestätigt, die Regel-Engine bewertet.** Kein Ermessen in der Maschine (G1, G2).

### 6.2 Berichtselemente (jeder Bericht)

Prüfnummer AWD-JJJJ-NNNNN · Standard-Version · je Achsenwertung: bestätigte Eingabe im Wortlaut, Regel-ID, Punkte, Belegstelle mit Seite · maschinenlesbares Prüfprotokoll (JSON) als Anhang · SHA-256-Hash im Fußbereich · Bericht wird bei Abschluss eingefroren; Korrekturen erzeugen Version 2 mit sichtbarem Diff · Fairness-Klausel (G3) · Orientierungs-Disclaimer (G6).

### 6.3 Prüfregister

Öffentliche Verifizierungsseite je Prüfnummer, ausschließlich Metadaten: existiert, Datum, Standard-Version, Berichtstyp. Keine Inhalte, keine Namen. Zweck: Fälschungsschutz und Vertrauensinfrastruktur (Kopierschutz-Linie 2).

### 6.4 Beanstandungsverfahren

Definierter Kanal (beanstandung@…) · Stellungnahmen von Anbietern werden dem Bericht als Anlage beigefügt, ändern aber keine Bewertung ohne neue bestätigte Eingaben · Korrekturen nur als neue Berichtsversion mit Diff.

### 6.5 Beweislast-Element (MVP: Einweg)

Die 12 Fragen (Q1–Q12) als PDF/Mail direkt aus der App an den Anbieter, mit Frist. Antworterfassung im Dashboard manuell (beantwortet/offen/verweigert). Das Anbieterportal (Zwei-Seiten-Verfahren mit eigenem Anbieter-Login) folgt in Stufe 2.

### 6.6 Rechtsleitplanken

Bewertung ausschließlich aus Auftraggeber-Eingaben (keine eigenen Tatsachenbehauptungen) · AI-Act-Inhalte strikt als Orientierung gelabelt · Kanzlei-Review aller Standard-Berichtstexte vor Launch · AVV-Frage klären für den Fall, dass Lizenzpartner Kundenangebote hochladen (Auftragsverarbeitung) · Markenrecherche „Agent-Washing-Detektor" beim DPMA.

---

## 7. Berichte

### 7.1 Die drei Typen (MVP)

| Typ | Umfang | Quelle | Funktion |
|---|---|---|---|
| **Kurzcheck-Report** | 1 Seite | Minis/Schnelltest | Lead-Magnet, per Mail |
| **AWD-Prüfbericht** | 8–12 Seiten | Tür A/B komplett | Kernprodukt, Bestandteil des 3.500-€-Assessments |
| **Vergleichsbericht** | Doppelseite + Anhänge | 2–5 Angebote zum selben Prozess | Stärkstes Sitzungsdokument |

### 7.2 Struktur AWD-Prüfbericht

1. Deckblatt (Prüfnummer, Standard-Version, Prüfobjekt, Datum, Modus)
2. Management-Summary: Score, Band, Washing-Faktor-Ampel, drei Kernbefunde
3. Score-Radar (6 Achsen) + Achsendetail nach G2
4. Preiskorridor mit Annahmen + **Business-Case-Umkehr** (Anbieterzahlen vs. realistische Zahlen, Kipppunkt)
5. TCO-Realitätsrechnung (Wasserfall, T1–T5)
6. Track-Baustein (Präzedenzfall, Track-Rechner-Ergebnis)
7. Status der 12 Fragen (inkl. „unbeantwortet ist ein Befund")
8. Transparenzlücken-Befund („Weiß nicht"-Zeile, G5)
9. Handlungsempfehlung + nächste Schritte + BAFA-Vermerk (bis 31.12.2026)
10. Methodik-Anhang, JSON-Prüfprotokoll, Hash, Fairness-Klausel

### 7.3 Wertleiter-Zuordnung

| Stufe (Buch 4) | AWD-Rolle |
|---|---|
| 0 Kostenfrei | Schnelltest + Minis + Kurzcheck-Report |
| 1 Readiness-Assessment 3.500 € | AWD-Prüfbericht (Tür A/B) bzw. Bedarfsprofil (Tür C) |
| 2 Vertiefung 6.500 € | Vergleichsbericht + Prozess-/Datenreife-Anteile |
| 3 Governance 8.500 € | Autonomiestufen-/Freigabedesign (nutzt Achsen-Daten) |
| 4 Pilotbegleitung 12.000 € | Presto-Tracker (Stufe 3) als Messinstrument |
| L1–L3 Lizenz | White-Label-AWD + quartalsgepflegte Inhalte (Retention) |

---

## 8. Dashboard und Rollen

**Struktur:** Projekte → Prozesse → Assessments/Angebote → Berichte. **Funktionen (MVP):** Login (Auth-V1-Muster), Entwürfe mit Zwischenstand, **Duplizieren** („neues Angebot zum selben Prozess" übernimmt alle Prozessdaten), Statusverwaltung (Entwurf/abgeschlossen/Version n), Berichtsarchiv mit Download, 12-Fragen-Verwaltung, Audit-Log je Assessment (append-only: wer, wann, was).

**Rollen:** MVP: Kunde, Admin/Berater (Gottfried). Stufe 2: Lizenzpartner-Mandant (White-Label, eigene Kundenliste), Anbieter (sieht nur sein Frageformular). Stufe 3: Wiedervorlagen (z. B. „Betriebs-Check in 6 Monaten").

---

## 9. Datenmodell

### 9.1 PostgreSQL-Kernentitäten

| Tabelle | Zweck | Schlüsselfelder (Auszug) |
|---|---|---|
| accounts | Nutzer/Login | id, email, role, org |
| projects / processes | Ordnungsrahmen | id, account_id, name, größenklasse, branche |
| assessments | Ein Prüfvorgang | id, process_id, tür, modus, track, standard_version, status, score_min/max, band, washing_faktor |
| uploads | Angebotsdateien | id, assessment_id, datei, sha256, storage_pfad |
| claims | Extrahierte Behauptungen | id, upload_id, text, seite, status (bestätigt/korrigiert/verworfen), korrektur |
| answers | Wizard-Antworten | id, assessment_id, rule_id, wert, quelle_claim_id, ist_weiss_nicht |
| vendor_questions | Q1–Q12-Status | id, assessment_id, q_id, status, antwort, frist |
| reports | Berichte | id, assessment_id, typ, version, frozen_at, sha256, register_nr, pdf_pfad, protokoll_json |
| register | Öffentliche Metadaten | register_nr, datum, standard_version, typ |
| consents | Einwilligungen | id, assessment_id, zweck, granted_at, revoked_at |
| corpus_entries | Anonymisierte Snapshots | id, größenklasse, branche, muster, band, score, preisklasse, standard_version, datum |
| leads | Mini-Konversionen | id, mini_id, email, draft_payload, consent |
| audit_log | Nachvollziehbarkeit | id, actor, aktion, ts, diff (append-only) |

### 9.2 Content-Dateien (JSON, Pflege via Directus, versioniert)

achsen.json (A1–A6 inkl. Anker und Demo-Tests) · bedarf.json (N0–N5 + Tür-C-Fragen) · preislogik.json (P1–P4 + Referenzkosten) · tco-faktoren.json (T1–T5 + Quellen) · muster.json (M1–M6: Signale + Track-Inhalte) · fragen-12.json (Q1–Q12) · phrasen.json (die 10 Sätze + Gegenfragen) · preise-support.json (Anbieterpreise, „Stand"-Label, **quartalsweise**) · schnelltest.json (S1–S5) · minis/*.json (je Mini eine Config) · berichtstexte.json (Standardformulierungen inkl. G3/G6) · branding.json (Stufe 2, White-Label).

Pflegeregel: preise-support.json und Anbieterkatalog quartalsweise (~0,5 PT/Quartal, Verantwortlich: Gottfried); Regeländerungen an A/B/N/P/T/S/M/Q nur per Standard-Versionssprung.

### 9.3 Consent und Anonymisierung (E4)

Einwilligung je Assessment (Zweck: anonymisierte Marktauswertung), jederzeit widerrufbar · corpus_entries enthalten keine Namen, keine Freitexte, keine Rückschlussfelder — nur Größenklasse, Branche (grob), Muster, Band, Score, Preisklasse · Perzentilanzeige erst ab **k ≥ 5** je Segment · Löschung eines Accounts kaskadiert über alle personenbezogenen Tabellen; corpus_entries sind als anonym konzipiert (Design-Intention; im Kanzlei-Review bestätigen lassen) · TOMs und Speicherfristen im Datenschutzkonzept vor Launch.

---

## 10. Technik

| Schicht | Entscheidung |
|---|---|
| Frontend | Next.js/TypeScript/Tailwind; eigene visuelle Identität automation-boost (Ableitung aus ki-boost-Designsystem erlaubt, keine 1:1-Übernahme) |
| Regel-Engine | Eigenes TS-Modul, pure functions, **Golden-Test-Suite** (Referenzfälle je Regel, Pflicht vor jedem Release), Standard-Version im Code gepinnt |
| Datenbank | PostgreSQL (bestehende Infrastruktur) |
| CMS | Directus für alle Content-JSONs und Berichtstexte (Quartalspflege ohne Deployment) |
| Automation | n8n: Berichtsversand, Fristen-Mails (Q1–Q12), Brevo-Sync, Register-Jobs |
| Extraktion | Stufe A deterministisch (pdftotext/mammoth, Zahlen-/Preisparser). Stufe B LLM-Claim-Extraktion — **Entscheidungspunkt:** (a) self-hosted via Ollama auf gha-ops (kein Egress; stützt „Ihr Angebot verlässt unsere EU-Server nicht") oder (b) EU-API als Qualitäts-Fallback. Empfehlung: (a) als Default, (b) als Schalter. |
| Hosting | Hetzner hinter Traefik, Subdomain detektor.automation-boost.io; Serverzuordnung (gha-live vs. gha-ops) wird bei M6 gemeinsam entschieden |
| Sicherheit | Auth-V1-Muster, serverseitige Rollen-Checks, Rate-Limits, Upload-Limits und -Prüfung, Storage verschlüsselt, append-only Audit-Log, keine Secrets im Terminal (Arbeitsregel) |
| Repo | **Empfehlung: neues privates Repo GH-Munich/automation-boost-io**, App unter apps/detektor; Arbeitspakete mit neuer **AB-Nummernserie** (strikte Trennung von O-/K-Serien) |

---

## 11. Roadmap

### 11.1 Stufe 1 — MVP (Umfang)

Drei Türen (generischer Pfad in voller Qualität) · Mustererkennung v1 (Regeln, kein ML) · drei Tracks (Support, RAG, Voice) · Wizard in beiden Modi · Upload + Belegstellen-Bestätigung · Preis-Check inkl. Washing-Faktor, TCO-Rechner, Resolution-Rechner · Phrasen-Übersetzer light · Einweg-Beweislast (Q1–Q12 als PDF/Mail + manuelle Statuspflege) · drei Berichtstypen mit Register, Hash, Einfrieren · Dashboard-Basis inkl. Duplizieren und Audit-Log · Lead-Layer Welle 1 (Schnelltest + 5 Minis) · Consent-Felder und corpus_entries (Erhebung ja, Anzeige erst ab k ≥ 5).

### 11.2 Meilensteine (Vorschlag)

| MS | Zeitraum | Inhalt |
|---|---|---|
| **M0** | KW 31 | Repo, Grundgerüst, Designsystem-Basis; **mini-ai-act solo live in KW 32** (Aufhänger 2. August) |
| **M1** | KW 31–32 | Prüfstandard 1.0 final + alle Content-JSONs |
| **M2** | KW 33–34 | Regel-Engine + Golden-Tests |
| **M3** | KW 35–37 | Wizard (3 Türen, 2 Modi) + Upload/Extraktion/Belegstellen |
| **M4** | KW 38–39 | Berichte (3 Typen) + Register + Hash/Versionierung |
| **M5** | KW 40–41 | Dashboard + Lead-Layer Welle 1 + Brevo |
| **M6** | KW 42 | **Deployment gemeinsam Schritt für Schritt** (Claude kündigt jedes Kommando an, Gottfried führt aus — keine Solo-Listen) · Kanzlei-Review-Freigabe · Launch |

Ziel: Live vor Mitte Oktober 2026 → volle Restlaufzeit des BAFA-Fensters (31.12.2026).

### 11.3 Stufe 2 (Q4/2026–Q1/2027)

Tracks 4–6 (RPA-Upgrade, SDR, Plattform) · Anbieterportal (Zwei-Seiten-Verfahren) · White-Label-Mandanten für die Methodik-Lizenz · Perzentile ab k ≥ 5 · Fallmuster-Kartenpaket (Druck) · Preisübersichten je Track · Welle-2-Minis · erweitertes Rollenmodell.

### 11.4 Stufe 3 (2027)

Presto-Tracker (4-Wochen-Messung der realen Nicht-Interventionsrate, Strichlisten-UI) · Anbieter-Verifikationsprogramm (Modell B klein, 8.000 €) · „Agent-Washing-Report Deutschland" quartalsweise aus dem Korpus · API-Export für Partner · DE/EN-Anbieterformular · vertieftes AI-Act-Modul.

---

## 12. Kopierschutz-Verankerung (Zusammenfassung)

| Linie | Umsetzung in diesem Konzept |
|---|---|
| Standard als Norm | Kap. 2 öffentlich als „AWD-Prüfstandard 1.0", versioniert, zitierfähig; DPMA-Recherche (Kap. 13) |
| Prüfregister | Kap. 6.3, ab MVP |
| Datenkorpus | Kap. 9.3, Erhebung ab Tag 1, Auswertung ab k ≥ 5 |
| Zwei-Seiten-Verfahren | Einweg im MVP (6.5), Portal in Stufe 2 |
| Reproduzierbarkeit | G1 + Golden-Tests (Kap. 10) — das Anti-KI-Argument im Vertrieb |

---

## 13. Offene Punkte

| # | Punkt | Nächster Schritt | Wer |
|---|---|---|---|
| 1 | Markenrecherche „Agent-Washing-Detektor" | DPMA-Recherche beauftragen/durchführen | Gottfried |
| 2 | BAFA-Beraterbörse | Listungsstatus prüfen, ggf. Registrierung | Gottfried |
| 3 | Repo-Anlage automation-boost-io | Entscheidung bestätigen, dann Anlage | gemeinsam |
| 4 | Extraktionsmodell (a) self-hosted / (b) EU-API | Entscheidung vor M3 | Gottfried |
| 5 | Kanzlei-Review Berichtstexte + AVV + Anonymitätskonzept | Vor M6 einplanen | Gottfried |
| 6 | Serverzuordnung Deployment | Bei M6 gemeinsam klären | gemeinsam |
| 7 | Pflegeprozess Preisdaten (quartalsweise, ~0,5 PT) | Ab Launch im Kalender verankern | Gottfried |

---

## 14. Changelog

| Version | Datum | Änderung |
|---|---|---|
| 1.0 | 24.07.2026 | Erstfassung als Gründungsdokument; Entscheidungen E1–E4 fixiert |
