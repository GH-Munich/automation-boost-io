/**
 * AWD Regel-Engine — Typdefinitionen (M2).
 *
 * Grundsatz G1 (Reproduzierbarkeit): Die Bewertungslogik besteht aus reinen
 * Funktionen. Fachliche Werte (Schwellen, Faktoren, Texte, Preise) stehen
 * ausschliesslich in den Content-JSONs unter apps/detektor/content/ und werden
 * hier nur typisiert — niemals im Code hartkodiert.
 *
 * Namenskonvention: Code/Typen englisch, fachliche Regel-IDs (A1, N3, P3 …)
 * behalten ihre Standard-Schreibweise.
 */

/* ---------------------------------------------------------------------------
 * Gemeinsame Bausteine
 * ------------------------------------------------------------------------- */

export type StandardVersion = string;

export type Ampel = "gruen" | "gelb" | "rot";

/** Komplexitätsgrad eines Vorgangs (③): wählt das Teilband des Klassen-Korridors. */
export type Komplexitaet = "einfach" | "mittel" | "komplex";

/** Ein beliebiges geparstes JSON-Dokument mit Pflicht-Meta-Block. */
export interface RawContentFile {
  meta: {
    datei?: string;
    standard_version: StandardVersion;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Eine Zeile der Begruendungsspur (G2): ohne sie kein Ergebnis. */
export interface BegruendungsZeile {
  /** Angewandte Regel-ID (z. B. "A1.2", "R05", "P3", "T2"). */
  regelId: string;
  /** Bestaetigte Eingabe im Wortlaut, soweit vorhanden. */
  eingabe?: string | undefined;
  /** Vergebene Punkte, soweit die Regel Punkte vergibt. */
  punkte?: number | null | undefined;
  /** Kurze Erlaeuterung, warum die Regel griff. */
  hinweis?: string | undefined;
}

/* ---------------------------------------------------------------------------
 * achsen.json
 * ------------------------------------------------------------------------- */

export type AchseId = "A1" | "A2" | "A3" | "A4" | "A5" | "A6";

export interface AchsenStufe {
  regel_id: string;
  punkte: number;
  anker: string;
  wizard_option: string;
}

export interface AchsenWeissNicht {
  regel_id: string;
  wizard_option: string;
  befund: string;
}

export interface Achse {
  id: AchseId;
  name: string;
  name_en: string;
  prueffrage: string;
  wizard_frage: string;
  hinweis: string | null;
  stufen: AchsenStufe[];
  weiss_nicht: AchsenWeissNicht;
  demo_test: { titel: string; text: string };
}

export interface Band {
  id: string; // B1..B4
  von: number;
  bis: number;
  einstufung: string;
  konsequenz: string;
  kostenklasse: string;
  kostenklasse_wenn_muster_M3?: string;
}

export interface AchsenContent extends RawContentFile {
  achsen: Achse[];
  auswertung: {
    regel: string;
    baender: Band[];
    weiss_nicht_regel: string;
  };
}

/* ---------------------------------------------------------------------------
 * bedarf.json
 * ------------------------------------------------------------------------- */

export type BedarfFrageId = "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7";

export interface BedarfKlasse {
  id: string; // N0..N5
  name: string;
  kostenklasse: string | null;
  beschreibung?: string;
  loesung?: string;
  beispiel?: string;
  gruende?: Record<string, { titel: string; text: string }>;
}

/** Eine Bedingungsgruppe: Frage-ID -> zulaessige Werte. */
export type BedarfBedingung = Partial<Record<BedarfFrageId, string[]>>;

export interface BedarfRegel {
  id: string; // R01..R09
  /** Alle genannten Bedingungen muessen zutreffen (UND). */
  wenn?: BedarfBedingung;
  /** Eine der Bedingungen genuegt (ODER). */
  wenn_oder?: BedarfBedingung[];
  /** Greift, wenn keine Regel davor zutraf. */
  fallback?: boolean;
  dann: string; // Klassen-ID
  grund?: string; // nur N0: daten | prozess | risiko
  hinweis?: string;
}

export interface BedarfZusatzbefund {
  wenn: BedarfBedingung;
  befund: string;
}

export interface BedarfContent extends RawContentFile {
  fragen: unknown[];
  klassen: BedarfKlasse[];
  entscheidungsregeln: {
    hinweis: string;
    regeln: BedarfRegel[];
    vorlaeufig_bei_weiss_nicht_in: BedarfFrageId[];
    zusatzbefunde: BedarfZusatzbefund[];
    /** Datengetriebene Widerspruchs-Hinweise (B4); optional. */
    widersprueche?: BedarfZusatzbefund[];
  };
  faktor_visual: unknown;
}

/* ---------------------------------------------------------------------------
 * preislogik.json
 * ------------------------------------------------------------------------- */

export interface Kostenklasse {
  id: string;
  ordnung: number;
  name: string;
  vorgangskosten_usd: { min: number; max: number };
  /** Fixkosten-Sockel je Klasse (EUR/Jahr, P5): Einrichtung, Betrieb, Support. */
  sockel_eur: number;
  anzeige: string;
  quelle: string;
}

export interface AmpelSchwelle {
  stufe: Ampel;
  bis?: number;
  von?: number;
  ab?: number;
  /** Kurzlabel für die Ampel-Plakette (aus JSON, nicht im Code erfinden). */
  label?: string;
  text: string;
}

export interface PreislogikContent extends RawContentFile {
  regeln: Record<string, string>;
  kostenklassen: Kostenklasse[];
  /** Metadaten zum Fixkosten-Sockel (Werte je Klasse in Kostenklasse.sockel_eur). */
  sockel?: {
    einheit: string;
    label: string;
    erklaerung: string;
    editierbar: boolean;
  };
  /** Labels/Erklärung der Hybrid-Zweizeilen-Darstellung (Technik vs. Gesamt). */
  gesamtrahmen?: {
    label_technik: string;
    label_gesamt: string;
    erklaerung: string;
  };
  betriebsfaktor: {
    min: number;
    max: number;
    default: number;
    editierbar: boolean;
    label: string;
    erklaerung: string;
  };
  kurs: { usd_eur: number; editierbar: boolean; label: string };
  washing_faktor: { formel: string; ampel: AmpelSchwelle[] };
  ueberdimensionierung: { bedingung: string; befund: string; quelle: string };
  /** App-taugliche Erklärtexte (Klartext) zu den Preis-Annahmen. */
  erklaerungen?: Record<string, string>;
  /** Presets der intuitiven Preis-Maske (Nr. 4, Teil 2): Personas, Volumen-Stufen,
   *  Komplexitäts- und Aufwand-Labels. Reine Eingabe-Schicht, kein Rechenwert. */
  maske?: {
    personas: {
      id: string;
      name: string;
      volumen: number;
      noetig_klasse: string;
      komplexitaet: Komplexitaet;
    }[];
    volumen_stufen: { wert: number; label: string }[];
    komplexitaet: { grad: Komplexitaet; label: string; erklaerung: string }[];
    aufwand: {
      stufe: string;
      betriebsfaktor: number;
      label: string;
      erklaerung: string;
    }[];
  };
  /** Anzeige-Präzision (datengetrieben statt im Code fixiert). */
  anzeige?: { faktor_nachkommastellen: number; preis_nachkommastellen: number };
  beispiel_golden_test: unknown;
  disclaimer: string;
}

/* ---------------------------------------------------------------------------
 * tco-faktoren.json
 * ------------------------------------------------------------------------- */

export type TcoFaktorId = "T1" | "T2" | "T3" | "T4" | "T5";

export interface TcoFaktor {
  id: TcoFaktorId;
  name: string;
  min: number;
  max: number;
  default: number;
  typ: string;
  quelle: string;
}

export interface TcoSchritt {
  nr: number;
  label: string;
  formel: string;
  quelle?: TcoFaktorId;
}

export interface TcoRechenweg {
  beschreibung: string;
  schritte: TcoSchritt[];
}

export interface TcoContent extends RawContentFile {
  faktoren: TcoFaktor[];
  frage_preistyp: unknown;
  rechenwege: {
    A_pilotpreis: TcoRechenweg;
    B_produktivpreis: TcoRechenweg;
  };
  faustregel: string;
  kontextzahlen: unknown[];
  extremfall: unknown;
}

/* ---------------------------------------------------------------------------
 * schnelltest.json
 * ------------------------------------------------------------------------- */

export type SchnelltestFrageId = "S1" | "S2" | "S3" | "S4" | "S5";

export interface SchnelltestOption {
  wert: string;
  text: string;
  deutung: string;
  problematisch: boolean;
}

export interface SchnelltestFrage {
  id: SchnelltestFrageId;
  frage: string;
  optionen: SchnelltestOption[];
}

export interface SchnelltestErgebnis {
  von: number;
  bis: number;
  stufe: Ampel;
  text: string;
}

export interface SchnelltestContent extends RawContentFile {
  titel: string;
  untertitel: string;
  zeitangabe_min: number;
  fragen: SchnelltestFrage[];
  auswertung: { regel: string; ergebnisse: SchnelltestErgebnis[] };
}

/* ---------------------------------------------------------------------------
 * muster.json
 * ------------------------------------------------------------------------- */

export interface Muster {
  id: string; // M1..M6
  name: string;
  track_status: string;
  signale: string[];
  achsen_fokus: string[];
  [key: string]: unknown;
}

export interface MusterContent extends RawContentFile {
  grundsatz: string;
  bestaetigungstext: string;
  klassifikationsfrage: {
    frage: string;
    optionen: { wert: string; text: string }[];
  };
  muster: Muster[];
}

/* ---------------------------------------------------------------------------
 * berichtstexte.json — kanzleireviewpflichtige Standardklauseln (G1–G6)
 * ------------------------------------------------------------------------- */

/**
 * Die Klauselblöcke aus berichtstexte.json. Diese Texte sind
 * kanzleireviewpflichtig und werden im UI ausschließlich WÖRTLICH ausgegeben
 * (CLAUDE.md §10). Platzhalter wie {n}/{m} werden nur ersetzt, nicht umformuliert.
 */
export interface BerichtstexteBloecke {
  fairness_klausel: string;
  orientierungs_disclaimer: string;
  eingabebasiertheit: string;
  weiss_nicht_befund: string;
  q_verweigert: string;
  reihenfolge_governance: string;
  ueberdimensionierung: string;
  bafa_vermerk: { text: string; gueltig_bis: string };
  beratungszitat: string;
  argumentationskette: string;
  hash_fusszeile: string;
  beanstandung: string;
  ai_act_label: string;
}

export interface BerichtstexteContent extends RawContentFile {
  bloecke: BerichtstexteBloecke;
  /** Bandbezogene Handlungsempfehlungen B1–B4. */
  handlungsempfehlungen: Record<string, string>;
  /** Optionale Enabler-Einleitungssätze B1–B4 (Kanzlei-Review vor Launch offen). */
  handlungsempfehlung_enabler?: Record<string, string>;
}

/* ---------------------------------------------------------------------------
 * nutzen.json (Nutzen-Schnellcheck, Roadmap-Nr. 2)
 * ------------------------------------------------------------------------- */

/** Definition eines Reglers im Nutzen-Schnellcheck (für die UI). */
export interface NutzenEingabe {
  label: string;
  default: number;
  min: number;
  max: number;
  schritt: number;
  einheit: string;
  erklaerung: string;
  quelle: string;
}

export interface NutzenContent extends RawContentFile {
  titel: string;
  untertitel: string;
  eingaben: {
    vorgaenge_jahr: NutzenEingabe;
    zeitersparnis_minuten: NutzenEingabe;
    nacharbeit_stunden_jahr: NutzenEingabe;
    stundensatz_eur: NutzenEingabe;
    investition_eur: NutzenEingabe;
  };
  amortisation: {
    erklaerung?: string;
    ampel: { stufe: Ampel; bis_monate?: number; label: string; text: string }[];
  };
  strategische_potenziale: {
    einleitung: string;
    punkte: string[];
    gespraech: string;
  };
  disclaimer: string;
}

export interface NutzenInput {
  /** Betroffene Vorgänge pro Jahr. */
  vorgaengeJahr: number;
  /** Zeitersparnis pro Vorgang in Minuten. */
  zeitersparnisMinuten: number;
  /** Vermiedene Nacharbeit in Stunden pro Jahr (Fehler-/Nacharbeitszeile). */
  nacharbeitStundenJahr: number;
  /** Interner Stundensatz der betroffenen Tätigkeit in EUR. */
  stundensatzEur: number;
  /** Relevante Investition p. a. in EUR (i. d. R. aus dem Preis-Check). */
  investitionEur: number;
}

export interface NutzenResult {
  eingesparteStundenJahr: number;
  jahresnutzenEur: number;
  /** Grobe Amortisation in Monaten; null, wenn kein bezifferbarer Nutzen. */
  amortisationMonate: number | null;
  ampel: Ampel;
  ampelText: string;
  annahmen: {
    vorgaengeJahr: number;
    zeitersparnisMinuten: number;
    nacharbeitStundenJahr: number;
    stundensatzEur: number;
    investitionEur: number;
  };
  begruendung: BegruendungsZeile[];
}

/* ---------------------------------------------------------------------------
 * Aggregat aller geladenen Inhalte
 * ------------------------------------------------------------------------- */

export interface Content {
  /** Die gemeinsame Standard-Version aller geladenen Dateien. */
  standardVersion: StandardVersion;
  achsen: AchsenContent;
  bedarf: BedarfContent;
  preislogik: PreislogikContent;
  tco: TcoContent;
  schnelltest: SchnelltestContent;
  muster: MusterContent;
  berichtstexte: BerichtstexteContent;
  nutzen: NutzenContent;
  gelingt: GelingtContent;
  /** Alle geladenen Rohdateien nach Basisname (inkl. "minis/…"). */
  raw: Record<string, RawContentFile>;
}

/* ---------------------------------------------------------------------------
 * calculateScore — Ein-/Ausgaben
 * ------------------------------------------------------------------------- */

/** Antworten je Achse: die gewaehlte Regel-ID (z. B. "A1.2" oder "A1.X"). */
export type ScoreInput = Record<AchseId, string>;

export interface ScoreBegruendung extends BegruendungsZeile {
  achse: AchseId;
  bewertbar: boolean;
}

export interface ScoreResult {
  scoreMin: number;
  scoreMax: number;
  /** B1..B4, oder null wenn min/max in verschiedenen Baendern liegen. */
  band: string | null;
  einstufung: string | null;
  konsequenz: string | null;
  /** true, wenn keine eindeutige Einstufung moeglich war (band === null). */
  vorlaeufig: boolean;
  /** Achsen, die als "nicht bewertbar" markiert wurden (G5). */
  nichtBewertbar: AchseId[];
  begruendung: ScoreBegruendung[];
}

/* ---------------------------------------------------------------------------
 * classifyBedarf — Ein-/Ausgaben
 * ------------------------------------------------------------------------- */

export type BedarfGrund = "daten" | "prozess" | "risiko";

/** F1–F6 sind Auswahlwerte, F7 ist eine Zahl (Monatsvolumen). */
export interface BedarfInput {
  F1: string;
  F2: string;
  F3: string;
  F4: string;
  F5: string;
  F6: string;
  F7?: number;
}

/** Ein einzelner N0-Stopp-Grund (mehrere können zugleich zutreffen, B2). */
export interface BedarfGrundDetail {
  grund: BedarfGrund;
  titel: string;
  text: string;
}

/** Klassen-Spanne, wenn Unwissen keine eindeutige Einstufung erlaubt (B3, G5). */
export interface BedarfSpanne {
  von: string; // Klassen-ID (niedrigste, z. B. "N1")
  bis: string; // Klassen-ID (höchste, z. B. "N4")
  vonName: string;
  bisName: string;
}

export interface BedarfResult {
  klasse: string; // N0..N5 (Kopfklasse)
  name: string;
  kostenklasse: string | null;
  /** N0: alle zugleich zutreffenden Stopp-Gründe (B2); sonst leer. */
  gruende: BedarfGrundDetail[];
  /** Gesetzt, wenn „weiß nicht" eine Klassen-Spanne statt einer Einstufung ergibt (B3). */
  klasseSpanne: BedarfSpanne | null;
  regelId: string; // R01..R09 (erste greifende Regel)
  vorlaeufig: boolean;
  /** Zusatz- und Widerspruchs-Hinweise (additiv, keine Klassenänderung). */
  zusatzbefunde: string[];
  begruendung: BegruendungsZeile[];
}

/* ---------------------------------------------------------------------------
 * calculatePriceCorridor — Ein-/Ausgaben
 * ------------------------------------------------------------------------- */

export interface PriceInput {
  /** Tatsaechlich gelieferte Kostenklasse (Kostenklassen-ID, P1). */
  gelieferteKlasse: string;
  volumenJahr: number;
  angebotspreisJahrEur: number;
  /** Optional; Vorgabe kommt aus preislogik.betriebsfaktor. */
  betriebsfaktor?: { min: number; max: number };
  /** Optional; Vorgabe kommt aus preislogik.kurs.usd_eur. */
  kursUsdEur?: number;
  /** Optional; loest den Ueberdimensionierungs-Check aus (P4). */
  benoetigteKlasse?: string;
  /** Optional; Komplexitätsgrad (③) — wählt das Kosten-Teilband der Klasse. */
  komplexitaet?: Komplexitaet;
}

export interface PriceResult {
  gelieferteKlasse: string;
  korridorUsd: { min: number; max: number };
  korridorEur: { min: number; max: number };
  /** Fixkosten-Sockel der gelieferten Klasse (EUR/Jahr), P5. */
  sockelEur: number;
  /** Fairer Gesamtrahmen = Sockel + Nutzungskorridor (EUR/Jahr). */
  korridorGesamtEur: { min: number; max: number };
  washingFaktor: number;
  /** Aufschlag gegen die reinen Technik-Rohkosten (Klartext-Nebenwert). */
  washingFaktorTechnik: number;
  ampel: Ampel;
  ampelText: string;
  ueberdimensionierung:
    | { befund: string; benoetigteKlasse: string; gelieferteKlasse: string }
    | null;
  annahmen: {
    vorgangskostenUsd: { min: number; max: number };
    betriebsfaktor: { min: number; max: number };
    kursUsdEur: number;
  };
  begruendung: BegruendungsZeile[];
}

/* ---------------------------------------------------------------------------
 * calculateTco — Ein-/Ausgaben
 * ------------------------------------------------------------------------- */

export type Preistyp = "pilot" | "produktiv";

export interface TcoInput {
  angebotspreis: number;
  preistyp: Preistyp;
  /** Nur Rechenweg A (Pilot): Projektlaufzeit in Monaten fuer den Zeitpuffer. */
  laufzeitMonate?: number;
  /** Optionale abweichende Faktorwerte je T-ID (sonst Vorgabe aus JSON). */
  faktorenOverride?: Partial<Record<TcoFaktorId, number>>;
}

export interface TcoStufe {
  nr: number;
  label: string;
  wert: number;
  quelleId: TcoFaktorId | null;
  formel: string;
}

export interface TcoResult {
  rechenweg: "A_pilotpreis" | "B_produktivpreis";
  stufen: TcoStufe[];
  /** Realistische Kernprojektion (Stufe 2 des Wasserfalls). */
  endwert: number;
  faustregel: string;
  begruendung: BegruendungsZeile[];
}

/* ---------------------------------------------------------------------------
 * detectMuster — Ein-/Ausgaben
 * ------------------------------------------------------------------------- */

export interface MusterInput {
  /** Freitext (Angebotstext oder extrahierte Begriffe). */
  freitext?: string;
  /** Direkte Klassifikationsantwort ("M1".."M6" oder "generisch"). */
  klassifikation?: string;
}

export interface MusterTreffer {
  musterId: string;
  name: string;
  trefferwoerter: string[];
  trefferzahl: number;
  achsenFokus: string[];
  trackStatus: string;
  bestaetigungstext: string;
}

export interface MusterResult {
  /** Nach Trefferzahl absteigend sortiert; leer bei generisch. */
  treffer: MusterTreffer[];
  generisch: boolean;
  quelle: "signalwort" | "klassifikation";
  begruendung: BegruendungsZeile[];
}

/* ---------------------------------------------------------------------------
 * evaluateSchnelltest — Ein-/Ausgaben
 * ------------------------------------------------------------------------- */

/** Antworten je Frage: der gewaehlte Options-Wert. */
export type SchnelltestInput = Record<SchnelltestFrageId, string>;

export interface SchnelltestProblem {
  id: SchnelltestFrageId;
  wert: string;
  deutung: string;
}

export interface SchnelltestResult {
  anzahlProblematisch: number;
  stufe: Ampel;
  text: string;
  problematischePunkte: SchnelltestProblem[];
  begruendung: BegruendungsZeile[];
}

/* ---------------------------------------------------------------------------
 * gelingt.json (Gelingt-das-bei-uns-Check, Roadmap-Nr. 3: Risiko + Reife)
 * ------------------------------------------------------------------------- */

export type GelingtBlock = "aussen" | "innen";

export interface GelingtOption {
  wert: string;
  text: string;
  deutung: string;
  problematisch: boolean;
}

export interface GelingtFrage {
  id: string;
  block: GelingtBlock;
  frage: string;
  optionen: GelingtOption[];
}

export interface GelingtErgebnis {
  von: number;
  bis: number;
  stufe: Ampel;
  label: string;
  text: string;
}

export interface GelingtContent extends RawContentFile {
  titel: string;
  untertitel: string;
  zeitangabe_min: number;
  bloecke: { aussen: string; innen: string };
  fragen: GelingtFrage[];
  auswertung: { regel?: string; ergebnisse: GelingtErgebnis[] };
  gespraech: string;
  disclaimer: string;
}

/** Antworten je Frage-ID als gewählter Options-Wert. */
export type GelingtInput = Record<string, string>;

export interface GelingtOffenerPunkt {
  id: string;
  block: GelingtBlock;
  frage: string;
  deutung: string;
}

export interface GelingtResult {
  anzahlOffen: number;
  gesamt: number;
  stufe: Ampel;
  label: string;
  text: string;
  offenAussen: GelingtOffenerPunkt[];
  offenInnen: GelingtOffenerPunkt[];
  begruendung: BegruendungsZeile[];
}

/* ---------------------------------------------------------------------------
 * buildProtokoll — Ein-/Ausgaben
 * ------------------------------------------------------------------------- */

export interface ProtokollTeilergebnisse {
  score?: { input: ScoreInput; result: ScoreResult };
  bedarf?: { input: BedarfInput; result: BedarfResult };
  pricing?: { input: PriceInput; result: PriceResult };
  tco?: { input: TcoInput; result: TcoResult };
  muster?: { input: MusterInput; result: MusterResult };
  schnelltest?: { input: SchnelltestInput; result: SchnelltestResult };
}

export interface Protokoll {
  standardVersion: StandardVersion;
  /** Alle angewandten Regel-IDs, sortiert und dedupliziert. */
  regelIds: string[];
  eingaben: Record<string, unknown>;
  ergebnisse: Record<string, unknown>;
}
