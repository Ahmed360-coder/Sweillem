import type { CSSProperties } from "react";
import Link from "next/link";
import { certificateRecords } from "@content/certificates";
import { productSpecs } from "@content/products";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Quality: made and tested to EN 295",
  description:
    "SWEILLEM vitrified clay pipes are made to EN 295 and GSO EN 295 in Normal and High strength classes, from DN 125 to DN 1000, under ISO 9001.",
  path: "/quality",
});

/** One row per size: strength class (TKL) and crushing strength (FN) for N and H pipes. */
function strengthRows() {
  const tables = productSpecs.pipes.tables;
  const pick = (strength: "N" | "H") => {
    const t = tables.find((x) => x.strength === strength);
    const map = new Map<string, { tkl: string; fn: string }>();
    if (!t) return map;
    const col = (key: string) => t.columns.findIndex((c) => c.key === key);
    const [dn, tkl, fn] = [col("dn"), col("strengthClass"), col("crushingStrength")];
    for (const r of t.rows) if (!map.has(r[dn])) map.set(r[dn], { tkl: r[tkl], fn: r[fn] });
    return map;
  };
  const n = pick("N");
  const h = pick("H");
  const sizes = [...new Set([...n.keys(), ...h.keys()])].sort((a, b) => Number(a) - Number(b));
  return sizes.map((dn) => ({ dn, n: n.get(dn), h: h.get(dn) }));
}

// Standards as named on About Us (product) and on the certificate files (management).
const standards = [
  { name: "EN 295", what: "European standard for vitrified clay pipes", proof: "DIN CERTCO certificate P1S048 (seals)" },
  { name: "SASO GSO EN 295", what: "Gulf version of EN 295, for Saudi Arabia", proof: "SASO quality mark licence" },
  { name: "ZPWN 295:2016", what: "German standard", proof: "Named on About Us" },
  { name: "ES 56/2005", what: "Egyptian standard", proof: "Named on About Us" },
  { name: "ASTM C700", what: "American standard", proof: "Named on About Us" },
  { name: "ISO 9001:2015", what: "Quality management", proof: "Certificates 8488 and MSE 0640525A" },
  { name: "ISO 14001:2015", what: "Environmental management", proof: "Certificates 8401 and MSE 0640525B" },
  { name: "ISO 45001:2018", what: "Health and safety management", proof: "Certificates 9720 and MSE 0640525C" },
];

const checks = [
  {
    step: "Raw material",
    text: "Aswan clay is inspected on arrival and tested for its share of fine minerals, salts and aluminium oxide (Al₂O₃).",
  },
  {
    step: "Before glazing",
    text: "Dried pipes pass a quality check before they go to the glazing section.",
  },
  {
    step: "Firing",
    text: "Shuttle kilns fire each diameter on its own curve up to 1200 °C, so the glaze becomes a glassy cover inside and out.",
  },
  {
    step: "Joints",
    text: "Joints are tested for watertightness at 0.5, 1 and 2.4 bar and for angular deflection to EN 295-3:2012.",
    href: "/joint-performance",
  },
];

export default function QualityPage() {
  const rows = strengthRows();
  const managementCount = new Set(certificateRecords.filter((c) => c.kind === "management").map((c) => c.standard)).size;
  return (
    <>
      <PageHeader
        eyebrow="Quality"
        title="Made and tested to EN 295"
        lede="SWEILLEM pipes are made to EN 295 in Normal (N) and High (H) strength classes, and to GSO EN 295 for the Gulf, from DN 125 to DN 1000."
      />

      <Section
        id="classes"
        title="Strength classes by size"
        lede="Every pipe size has a strength class (TKL) and a minimum crushing strength (FN, in kN per metre). H pipes are the extra-strength range."
      >
        <div className="reveal overflow-x-auto rounded-card border border-line bg-surface" tabIndex={0} role="region" aria-label="Strength classes table, scrolls sideways">
          <table className="w-full min-w-[520px] border-collapse text-[15px] tabular-nums">
            <caption className="sr-only">Strength class and crushing strength of N and H pipes by nominal size</caption>
            <thead>
              <tr className="border-b border-line text-start">
                <th scope="col" rowSpan={2} className="px-4 py-3 text-start font-mono text-[12px] font-medium tracking-[.1em] text-muted uppercase">
                  Size DN
                </th>
                <th scope="colgroup" colSpan={2} className="border-s border-line px-4 pt-3 text-start font-display text-base font-semibold">
                  N pipes <span className="font-sans text-[13px] font-normal text-muted">normal strength</span>
                </th>
                <th scope="colgroup" colSpan={2} className="border-s border-line px-4 pt-3 text-start font-display text-base font-semibold">
                  H pipes <span className="font-sans text-[13px] font-normal text-muted">extra strength</span>
                </th>
              </tr>
              <tr className="border-b border-line">
                {["TKL", "FN kN/m", "TKL", "FN kN/m"].map((h, i) => (
                  <th key={i} scope="col" className={`px-4 pb-3 text-start font-mono text-[12px] font-medium tracking-[.1em] text-muted uppercase ${i % 2 === 0 ? "border-s border-line" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dn} className="border-b border-line last:border-b-0 hover:bg-sunk/60">
                  <th scope="row" className="px-4 py-2.5 text-start font-mono font-semibold">
                    {r.dn}
                  </th>
                  <td className="border-s border-line px-4 py-2.5">{r.n?.tkl ?? "-"}</td>
                  <td className="px-4 py-2.5">{r.n?.fn ?? "-"}</td>
                  <td className="border-s border-line px-4 py-2.5">{r.h?.tkl ?? "-"}</td>
                  <td className="px-4 py-2.5">{r.h?.fn ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SourceNote className="mt-3">
          From the N and H pipe tables on sweillem.net, as published. “-” means the table gives no value for that size. Full
          dimensions are on the{" "}
          <Link href="/products/pipes" className="link">
            Pipes
          </Link>{" "}
          page.
        </SourceNote>
      </Section>

      <Section id="standards" title="Standards SWEILLEM works to" lede={`Product standards for the pipes and their joints, and ${managementCount} certified management systems.`}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {standards.map((s, i) => (
            <li
              key={s.name}
              className="reveal grid content-start gap-1.5 rounded-card border border-line bg-surface p-5"
              style={{ "--dl": `${i * 50}ms` } as CSSProperties}
            >
              <span className="font-mono text-[15px] font-semibold">{s.name}</span>
              <span className="text-[15px] text-muted">{s.what}</span>
              <span className="mt-1 text-[12.5px] text-muted">{s.proof}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link href="/certificates" className="link">
            See every certificate
          </Link>
        </p>
      </Section>

      <Section id="checks" title="Where quality is checked" lede="Checks named in SWEILLEM’s own description of how a pipe is made.">
        <ol className="grid gap-3 md:grid-cols-4">
          {checks.map((c, i) => (
            <li
              key={c.step}
              className="reveal relative grid content-start gap-2 rounded-card border border-line bg-surface p-5"
              style={{ "--dl": `${i * 80}ms` } as CSSProperties}
            >
              <span className="font-mono text-xs font-medium tracking-[.12em] text-maroon uppercase">0{i + 1}</span>
              <h3 className="text-lg">{c.step}</h3>
              <p className="text-base sm:text-[15px] text-muted">{c.text}</p>
              {c.href && (
                <Link href={c.href} className="link tap w-fit text-base sm:text-[15px]">
                  Joint performance
                </Link>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="why-clay" title="Why vitrified clay lasts">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="reveal grid content-start gap-3 rounded-card bg-glaze p-[clamp(20px,3vw,32px)] text-white">
            <p className="font-mono text-xs tracking-[.12em] text-white/70 uppercase">Physical properties</p>
            <h3 className="text-2xl text-white">Highest abrasion resistance</h3>
            <p className="text-white/85">
              Vitrified clay is the most abrasion-resistant material for sewer lines. Its natural components handle sewage
              running at very high velocity through the line, up to 10 m/s.
            </p>
          </article>
          <article
            className="reveal grid content-start gap-3 rounded-card border border-line bg-surface p-[clamp(20px,3vw,32px)]"
            style={{ "--dl": "120ms" } as CSSProperties}
          >
            <p className="font-mono text-xs tracking-[.12em] text-maroon uppercase">Chemical properties</p>
            <h3 className="text-2xl">Resistant to corrosion</h3>
            <p className="text-muted">
              Vitrified clay is the only sewer pipe material proven over centuries to resist sulfide-generated acids, most
              industrial wastes, solvents and aggressive soils. The H₂S formed when sulphur breaks down is what corrodes most
              sewer pipes. Resisting it gives vitrified clay pipes a life expectancy of more than 100 years.
            </p>
          </article>
        </div>
        <SourceNote className="mt-3">From About Us on sweillem.net.</SourceNote>
      </Section>

      <section aria-labelledby="en295-title" className="pb-[clamp(24px,4vw,48px)]">
        <div className="wrap">
          <div className="grid gap-2 rounded-card border border-dashed border-line p-[clamp(20px,3vw,28px)]">
            <h2 id="en295-title" className="text-lg">
              EN 295 and GSO EN 295 requirement tables
            </h2>
            <p className="max-w-[70ch] text-base sm:text-[15px] text-muted">
              The current site shows these requirements as pictures hosted on another website. They will appear here as
              readable tables once SWEILLEM supplies them as text.
            </p>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
