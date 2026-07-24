import type { BerichtstexteContent } from "@engine/types";

type Anbieter = {
  name: string;
  modell: string;
  preis_usd: number;
  einstieg: string | null;
  hinweis: string | null;
};
type VerstecktePosten = { posten: string; wert: string; text: string };

export type SupportPreiseConfig = {
  stand_label: string;
  realistische_rate: { min: number; max: number; quelle: string };
  definition_falle: string;
  abrechnungslogik_hinweis: string;
  anbieter: Anbieter[];
  versteckte_kosten: VerstecktePosten[];
  rechenbeispiele: string[];
  modellrechnung: string;
  volatilitaets_hinweis: string;
};

const usd = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const pct = (n: number) => `${Math.round(n * 100)} %`;

/**
 * Kostenrealität für Support-Agenten (Support-Track, additiv). Zeigt das
 * Abrechnungsmodell, die versteckte-Kosten-Fallen und dokumentierte
 * Marktreferenzen aus preise-support.json — als Orientierung, ausdrücklich kein
 * Anbieterurteil und keine Kaufempfehlung (§10/§11). Preise sind ein
 * quartalsgepflegter Stand mit sichtbarer Quelle (G6).
 */
export function SupportPreise({
  config,
  fairness,
}: {
  config: SupportPreiseConfig;
  fairness: BerichtstexteContent["bloecke"]["fairness_klausel"];
}) {
  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Kostenrealität · Support-Agenten
        </p>
        <h1 className="balance mt-2 text-[clamp(22px,3.4vw,30px)] font-bold leading-[1.15] tracking-[-.02em]">
          Was ein Support-Agent wirklich kostet
        </h1>
        <p className="mt-3 max-w-[70ch] text-[14px] leading-relaxed text-ink-2">
          Support-Agenten werden meist pro „Resolution" abgerechnet — und genau dort steckt die
          Falle. Diese Übersicht erklärt das Abrechnungsmodell und zeigt dokumentierte
          Marktreferenzen zur Orientierung. <b className="text-ink">Kein Anbieterurteil, keine
          Kaufempfehlung.</b>
        </p>
        <p className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full bg-surface-2 px-3 py-1 font-mono text-[11px] text-ink-3">
          {config.stand_label} · quartalsgepflegt
        </p>
      </section>

      {/* Abrechnungsmodell */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Das Abrechnungsmodell</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-line bg-surface-2 p-4">
            <p className="text-[13px] font-semibold text-ink">Realistische Resolution-Rate</p>
            <p className="mt-1 font-mono text-[22px] font-semibold tnum">
              {pct(config.realistische_rate.min)} – {pct(config.realistische_rate.max)}
            </p>
            <p className="mt-1 text-[11.5px] text-ink-3">Quelle: {config.realistische_rate.quelle}</p>
          </div>
          <div className="rounded-sm border border-line bg-surface-2 p-4">
            <p className="text-[13px] font-semibold text-ink">„Resolution" ist Definitionssache</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{config.definition_falle}</p>
          </div>
        </div>
        <p className="mt-4 rounded-sm border border-warn/30 bg-warn-weak/50 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
          {config.abrechnungslogik_hinweis}
        </p>
        <div className="mt-4 rounded-sm border border-line bg-surface-2 p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-3">Modellrechnung</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink">{config.modellrechnung}</p>
        </div>
      </section>

      {/* Marktreferenz Anbieter */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
          Dokumentierte Marktreferenz
        </p>
        <p className="mt-1.5 text-[12.5px] text-ink-3">
          Veröffentlichte Abrechnungsmodelle und Richtpreise — als Orientierung, nicht als Rangliste.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-ink-3">
                <th className="py-2 pr-4 font-medium">Anbieter</th>
                <th className="py-2 pr-4 font-medium">Modell</th>
                <th className="py-2 pr-4 font-medium">Richtpreis</th>
                <th className="py-2 font-medium">Einstieg</th>
              </tr>
            </thead>
            <tbody>
              {config.anbieter.map((a) => (
                <tr key={a.name} className="border-b border-line/60 align-top">
                  <td className="py-2.5 pr-4 font-medium text-ink">{a.name}</td>
                  <td className="py-2.5 pr-4 text-ink-2">{a.modell}</td>
                  <td className="py-2.5 pr-4 font-mono tnum text-ink">{usd.format(a.preis_usd)}</td>
                  <td className="py-2.5 text-ink-2">
                    {a.einstieg ?? "—"}
                    {a.hinweis && <span className="mt-0.5 block text-[11.5px] text-ink-3">{a.hinweis}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Versteckte Kosten */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Versteckte Kosten</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {config.versteckte_kosten.map((v) => (
            <div key={v.posten} className="rounded-sm border border-line bg-surface-2 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13.5px] font-semibold text-ink">{v.posten}</p>
                <p className="font-mono text-[12.5px] text-ink-2">{v.wert}</p>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rechenbeispiele */}
      <section className="rounded-md border border-line bg-surface p-6 shadow-sm sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Rechenbeispiele</p>
        <ul className="mt-3 flex flex-col gap-2">
          {config.rechenbeispiele.map((r, i) => (
            <li key={i} className="rounded-sm border border-line bg-surface-2 px-4 py-2.5 text-[13.5px] leading-relaxed text-ink-2">
              {r}
            </li>
          ))}
        </ul>
      </section>

      {/* Fairness + Volatilität */}
      <section className="rounded-md border border-line bg-surface-2 p-6 sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">Orientierung, kein Urteil</p>
        <p className="mt-3 max-w-[74ch] text-[13px] leading-relaxed text-ink-2">{fairness}</p>
        <p className="mt-3 max-w-[74ch] text-[12.5px] leading-relaxed text-ink-3">
          {config.volatilitaets_hinweis}
        </p>
      </section>
    </div>
  );
}
