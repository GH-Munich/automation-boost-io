import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import {
  assertSameStandardVersion,
  DEFAULT_CONTENT_DIR,
  loadContent,
} from "../content-loader.js";
import type { RawContentFile } from "../types.js";

describe("loadContent — echter Content", () => {
  it("lädt alle Pflichtdateien und liefert eine einheitliche Standard-Version", () => {
    const content = loadContent();
    expect(content.standardVersion).toBe("1.2");
    expect(content.achsen.achsen).toHaveLength(6);
    expect(content.bedarf.entscheidungsregeln.regeln.length).toBeGreaterThan(0);
    expect(content.preislogik.kostenklassen.length).toBeGreaterThan(0);
    expect(content.tco.faktoren.length).toBe(5);
    expect(content.schnelltest.fragen.length).toBe(5);
    expect(content.muster.muster.length).toBe(6);
  });
});

describe("assertSameStandardVersion — reine Prüfung", () => {
  const datei = (name: string, version: unknown): { name: string; data: RawContentFile } => ({
    name,
    data: { meta: { standard_version: version as string } },
  });

  it("akzeptiert identische Versionen", () => {
    expect(
      assertSameStandardVersion([
        datei("a.json", "1.0"),
        datei("b.json", "1.0"),
      ]),
    ).toBe("1.0");
  });

  it("wirft bei abweichender Version und benennt die Datei", () => {
    expect(() =>
      assertSameStandardVersion([
        datei("achsen.json", "1.0"),
        datei("preislogik.json", "1.1"),
      ]),
    ).toThrow(/preislogik\.json/);
  });

  it("wirft bei fehlender meta.standard_version", () => {
    expect(() =>
      assertSameStandardVersion([
        datei("achsen.json", "1.0"),
        datei("kaputt.json", undefined),
      ]),
    ).toThrow(/standard_version/);
  });
});

describe("loadContent — manipulierte Standard-Version schlägt fehl (DoD)", () => {
  const tmp = mkdtempSync(join(tmpdir(), "awd-content-"));

  afterAll(() => {
    // Aufräumen ist unkritisch; das OS entfernt tmp-Verzeichnisse ohnehin.
  });

  it("bricht ab, wenn eine Datei eine abweichende Version trägt", () => {
    cpSync(DEFAULT_CONTENT_DIR, tmp, { recursive: true });

    const pfad = join(tmp, "preislogik.json");
    const roh = JSON.parse(readFileSync(pfad, "utf-8")) as RawContentFile;
    roh.meta.standard_version = "9.9";
    writeFileSync(pfad, JSON.stringify(roh, null, 2), "utf-8");

    expect(() => loadContent(tmp)).toThrow(/preislogik\.json/);
    expect(() => loadContent(tmp)).toThrow(/Standard-Version/);
  });
});
