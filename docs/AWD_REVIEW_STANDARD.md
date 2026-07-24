# AWD-Review-Standard — Das Mehr-Augen-Prinzip

Stand: 2026-07-24 · Status: **verbindlich** (Master) · gilt für dieses Repository

Dieses Dokument ist Teil der verbindlichen Arbeitsregeln (siehe `CLAUDE.md` §13). Es
legt fest, wie Änderungen am AWD vor der Umsetzung und vor jedem Release geprüft
werden — nach dem Vier-/Sechs-/Acht-Augen-Prinzip eines Auditors mit
unterschiedlichen Brillen.

---

## 1. Warum

Der AWD verkauft **Reproduzierbarkeit und Nachvollziehbarkeit** (G1/G2). Ein
Prüfinstrument muss sich selbst an dem Standard messen, den es anlegt. Golden-Tests
(G1) und CI beweisen die Korrektheit **bekannter** Fälle. Das Mehr-Augen-Audit
härtet zusätzlich gegen **unbekannte** Fehlermodi und gegen **rechtliche
Angreifbarkeit** — genau die Punkte, an denen ein Anbieter oder dessen Anwalt ein
Ergebnis attackieren würde.

Ziel jeder Prüfung: Die Beurteilung ist **zu Beginn möglichst sicher**, das
Ergebnis hat **Hand und Fuß**, und die Begründung ist **compliance-seitig
unangreifbar dokumentiert**.

## 2. Geltung und Auslöser

**Volles Audit (6–8 Brillen) — verbindlich bei:**
- jedem Release / Meilenstein-Abschluss;
- jeder Änderung an der Regel-Engine (`apps/detektor/src/engine/**`);
- jeder Änderung an den Prüfstandard-JSONs (`achsen`, `bedarf`, `preislogik`,
  `tco-faktoren`, `schnelltest`, `muster`, `fragen-12`, `phrasen`);
- jeder Änderung an `berichtstexte.json` (kanzleireviewpflichtig);
- sicherheitsrelevantem Code (`content-loader`, Upload/Extraktion, Auth,
  CSP/Header, Prüfprotokoll/Hash).

**Leichte Prüfung (mind. 1–2 passende Brillen) genügt bei:**
- reiner UI-Microcopy, Styling, Tooling/CI, Dokumentation.

Im Zweifel gilt die höhere Stufe.

**Additiv, kein Ersatz.** Das Audit ersetzt weder die Golden-Test-Release-Voraussetzung
(G1, `CLAUDE.md` §5) noch die CI, noch das gemeinsame Schritt-für-Schritt bei
Server/Datenbank/Deployment (`CLAUDE.md` §7).

## 3. Die Brillen

Jede Brille prüft **unabhängig, parallel, nur-lesend und adversarial** (sucht aktiv
Fehler). Substanzielle Änderungen: mindestens 4 Brillen. Release: 6–8. Für die
anspruchsvollsten Brillen (Fachlogik, Compliance, Usability, Security, Red-Team)
wird das **stärkste verfügbare Modell** eingesetzt.

| # | Brille | Fokus |
|---|---|---|
| 1 | **Fachlogik & Rechen-Korrektheit** | Setzt die Engine den Standard exakt um? Grenzfälle, Off-by-one, Rundung, Datei-Interpretation. |
| 2 | **Determinismus & Reinheit (G1)** | Kein Zeit/Zufall/LLM/Netz; stabile Sortier-/Schlüsselordnung; server↔client bitgleich; Protokoll hash-fähig. |
| 3 | **Compliance & Begründungsspur** | G2/G3/G6, AI-Act-Label, DSGVO, keine eigenen Anbieter-Aussagen; jedes Ergebnis mit vollständiger, verteidigbarer Spur. |
| 4 | **Hartkodierte fachliche Werte** | Code ↔ Daten: kein Schwellwert/Faktor/Fragetext/Preis/Klausel im Code (§4). Microcopy vs. Standard-Inhalt sauber getrennt. |
| 5 | **UI-Treue** | Usability-Regeln (§9); stellt die UI die Engine-Ergebnisse treu dar, oder führt sie in die Irre? |
| 6 | **Adversarial Red-Team** | Aktiv versuchen, ein falsches/instabiles/unverteidigbares Ergebnis zu erzeugen; divergierende Standard-Lesarten aufdecken. |
| 7 | **Usability** | Für nicht-technische Entscheider tatsächlich benutzbar? Kognitive Last, Accessibility (WCAG), Mobil, Wording. |
| 8 | **Security** | Injection/XSS, Server/Client-Grenze, Header/CSP, Secrets, Supply-Chain, DSGVO; Vorkehrungen für geplante Teile (Upload/Auth/Hash). |

Jeder Befund nennt: **Datei:Zeile · Schwere · Bezug auf G1–G6/Standard · Fix-Vorschlag · [BESTÄTIGT | MÖGLICH]**.

## 4. Zweite Sichtprüfung — adversariale Verifikation

Befunde der Brillen werden **nicht blind übernommen.** Jeder relevante Befund wird
selbst gegen Code und Standard **reproduziert** (konkrete Eingabe → tatsächliches
Ergebnis) und als *bestätigt* oder *verworfen* markiert. Das ist der zweite Teil des
Mehr-Augen-Prinzips: Prüfer finden, die Verifikation bestätigt.

## 5. Triage in drei Töpfe

- **A · Code-Fixes** — verifizierte Defekte oder Härtung ohne Standard-/Konzeptänderung
  und ohne erfundene Werte. → umsetzen (Commit/Push, CI grün).
- **B · Standard-/Konzept-Fragen** — Widersprüche oder Lücken im Prüfstandard/Konzept.
  → **an Gottfried melden, nicht eigenmächtig auflösen** (`CLAUDE.md` §1, §3, §4.2).
- **C · Fehlende Daten/JSON-Felder** — der Code bräuchte einen Wert, der im Standard
  fehlt. → **melden, nicht erfinden** (`CLAUDE.md` §4); Vorschlag zur Freigabe.

## 6. Dokumentationspflicht (compliance-fest)

Jedes volle Audit erzeugt ein datiertes Protokoll unter
`docs/audits/AWD_AUDIT_<JJJJ-MM-TT>[_<scope>].md` mit:
- Umfang und Auslöser, eingesetzte Brillen und Modelle;
- alle Befunde (Datei:Zeile, Schwere, BESTÄTIGT/MÖGLICH), Verifikationsergebnis;
- Auflösung je Befund: Fix-Commit / an Gottfried gemeldet / verworfen (mit Grund);
- Verweis auf die Begründungsspur bzw. das maschinenlesbare Prüfprotokoll
  (`buildProtokoll`) als Audit-Trail.

So ist jede Beurteilung lückenlos nachvollziehbar und ihre Herleitung belegbar —
die Grundlage der compliance-seitigen Unangreifbarkeit.

## 7. Ablauf in Kürze

1. **Umfang** bestimmen → Auslöser prüfen (Abschnitt 2).
2. **Brillen** parallel, unabhängig, nur-lesend, adversarial (Abschnitt 3).
3. **Verifizieren** (Abschnitt 4).
4. **Triage** A/B/C (Abschnitt 5).
5. **B/C an Gottfried**, **A vorlegen** → nach Freigabe umsetzen; nichts umsetzen,
   bevor die konsolidierte Liste vorgelegt wurde.
6. **Audit-Protokoll** dokumentieren (Abschnitt 6).

---

Erstanwendung: das M3-Audit vom 24.07.2026, dokumentiert unter
`docs/audits/AWD_AUDIT_2026-07-24_M3.md`.
