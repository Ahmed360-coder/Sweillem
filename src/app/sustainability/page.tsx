import type { CSSProperties } from "react";
import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Sustainability: measuring our footprint",
  description:
    "SWEILLEM’s 2023 carbon baseline: Scope 1 about 19,964 t CO₂ (88%), Scope 2 about 1,464 t, around 5% renewable electricity, and Cradle to Cradle Certified pipes.",
  path: "/sustainability",
});

// 2023 figures exactly as published on the live Sustainability page.
const emissions = [
  { label: "Scope 1", detail: "Direct: diesel and natural gas in production", tonnes: 19963.9, share: "88%" },
  { label: "Scope 2, location-based", detail: "Indirect: purchased electricity", tonnes: 1464.2, share: "6.5%" },
  { label: "Scope 2, market-based", detail: "Indirect: purchased electricity", tonnes: 1259.2, share: "5.5%" },
];
const max = emissions[0].tonnes;
const t = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const scopes = [
  {
    name: "Scope 1",
    kind: "Direct emissions",
    text: "Greenhouse gas from sources SWEILLEM owns or controls, such as fuel burned in vehicles and in facility processes. At SWEILLEM this is mainly the gas burned at the kilns.",
    status: "Declared",
  },
  {
    name: "Scope 2",
    kind: "Indirect: electricity",
    text: "Emissions from the electricity, steam, heat or cooling SWEILLEM buys, mainly for its offices and production facilities.",
    status: "Declared",
  },
  {
    name: "Scope 3",
    kind: "Other indirect emissions",
    text: "Emissions in the wider supply chain. SWEILLEM is still developing these calculations.",
    status: "In development",
  },
];

export default function SustainabilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sustainability"
        title="Measuring our footprint"
        lede="SWEILLEM started calculating its CO₂ footprint in 2023 and uses that year as the baseline for its emission reduction goals."
      />

      <div className="wrap pt-6">
        <dl className="grid border-y border-line sm:grid-cols-3">
          {[
            { value: "2023", label: "Baseline year for CO₂ reporting" },
            { value: "5%", label: "Less Scope 1 since 2020, by switching to natural drying (approx.)" },
            { value: "5%", label: "Of production electricity from renewable sources in 2023 (approx.)" },
          ].map((s) => (
            <div key={s.label} className="grid min-w-0 gap-1 border-b border-line px-5 py-6 last:border-b-0 sm:border-s sm:border-b-0 sm:first:border-s-0">
              <dt className="order-2 text-[14px] text-muted">{s.label}</dt>
              <dd className="order-1 font-display text-[clamp(32px,4vw,52px)] leading-none font-semibold tabular-nums">
                {s.value === "2023" ? s.value : <CountUp value={s.value} />}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <Section
        id="emissions"
        title="2023 emissions, tonnes of CO₂"
        lede="Scope 2 is reported two ways: location-based uses the grid average, market-based the electricity SWEILLEM actually buys."
      >
        <div className="reveal rounded-card border border-line bg-surface p-[clamp(16px,3vw,32px)]">
          <table className="w-full border-collapse">
            <caption className="sr-only">SWEILLEM 2023 greenhouse gas emissions in tonnes of CO₂, with share of the total</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Scope</th>
                <th scope="col">Tonnes of CO₂ and share of the total</th>
              </tr>
            </thead>
            <tbody>
              {emissions.map((e, i) => (
                <tr key={e.label} className="border-b border-line last:border-b-0">
                  <th scope="row" className="w-[38%] py-4 pe-4 text-start align-top font-normal sm:w-[240px]">
                    <span className="block font-display text-lg leading-tight font-semibold">{e.label}</span>
                    <span className="mt-1 block text-[13px] text-muted">{e.detail}</span>
                  </th>
                  <td className="py-4 align-middle">
                    <span className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
                      <b className="font-mono text-[15px] font-semibold tabular-nums">{t(e.tonnes)} t</b>
                      <span className="font-mono text-[13px] text-muted">{e.share}</span>
                    </span>
                    <span aria-hidden="true" className="block h-3 overflow-hidden rounded-full bg-sunk">
                      <span
                        className={`grow-x block h-full rounded-full ${i === 0 ? "bg-maroon" : "bg-slate"}`}
                        style={{ "--v": e.tonnes / max, "--i": i } as CSSProperties}
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote className="mt-3">
          Figures as published on the Sustainability page of sweillem.net (May 2025). Shares are SWEILLEM’s own.
        </SourceNote>
      </Section>

      <Section id="scopes" title="What each scope covers" lede="SWEILLEM follows the Greenhouse Gas Protocol, which separates direct emissions from those in the supply chain.">
        <ol className="grid gap-3 md:grid-cols-3">
          {scopes.map((s, i) => (
            <li
              key={s.name}
              className={`reveal grid content-start gap-3 rounded-card p-5 ${i === 0 ? "bg-brand text-on-brand" : "border border-line bg-surface"}`}
              style={{ "--dl": `${i * 100}ms` } as CSSProperties}
            >
              <span className={`w-fit rounded-full px-2.5 py-0.5 font-mono text-[12px] tracking-[.08em] uppercase ${i === 0 ? "bg-white/15" : "bg-sunk text-muted"}`}>
                {s.status}
              </span>
              <h3 className={`text-2xl ${i === 0 ? "text-on-brand" : ""}`}>{s.name}</h3>
              <p className={`font-medium ${i === 0 ? "" : "text-maroon"}`}>{s.kind}</p>
              <p className={`text-base sm:text-[15px] ${i === 0 ? "opacity-90" : "text-muted"}`}>{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="built-to-last" title="Pipes made to last">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="reveal grid content-start gap-3 rounded-card border border-line bg-surface p-[clamp(20px,3vw,32px)]">
            <p className="font-mono text-xs tracking-[.12em] text-maroon uppercase">Cradle to Cradle Certified · Bronze</p>
            <h3 className="text-2xl">Certified for circularity</h3>
            <p className="text-muted">
              SWEILLEM’s vitrified clay pipes DN 125 to DN 1000 with accessories are Cradle to Cradle Certified at Full Scope
              Bronze level (version 4.1, certificate 9605, May 2025 to May 2028).
            </p>
            <Link href="/certificates" className="link tap w-fit">
              View the certificate
            </Link>
          </article>
          <article
            className="reveal grid content-start gap-3 rounded-card border border-line bg-surface p-[clamp(20px,3vw,32px)]"
            style={{ "--dl": "120ms" } as CSSProperties}
          >
            <p className="font-mono text-xs tracking-[.12em] text-maroon uppercase">More than 100 years</p>
            <h3 className="text-2xl">A long service life</h3>
            <p className="text-muted">
              Vitrified clay resists corrosion from sewer gases, industrial wastes and aggressive soils, which gives the pipes a
              life expectancy of more than 100 years. SWEILLEM’s environmental management is certified to ISO 14001.
            </p>
            <Link href="/quality#why-clay" className="link w-fit">
              Why vitrified clay lasts
            </Link>
          </article>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
