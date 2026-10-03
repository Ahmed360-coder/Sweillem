import type { CSSProperties } from "react";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { JointDemo } from "@/components/JointDemo";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Joint performance: watertight joints, tested",
  description:
    "SWEILLEM pipe joints seal watertight at 0.5, 1 and 2.4 bar with a polyurethane joint of 67 ± 5 Shore A, and are tested for angular deflection to EN 295-3:2012.",
  path: "/joint-performance",
});

const pressures = [
  { bar: "0.5", note: "Test pressure for the 15-minute line test" },
  { bar: "1", note: "Internal or external" },
  { bar: "2.4", note: "Internal or external" },
];

const testSteps = [
  "Fill the pipes with water (laminar flow) and make sure all the air in the line is out.",
  "Apply a water pressure of 0.5 bar and hold it for 15 minutes.",
  "The water lost in that time must stay within the limit set by the European Standards.",
];

// Transcribed from the figure on the live Joint Performance page.
const deflection = [
  { range: "100 ≤ DN ≤ 200", mm: 80 },
  { range: "200 < DN ≤ 500", mm: 30 },
  { range: "500 < DN ≤ 800", mm: 20 },
  { range: "DN > 800", mm: 10 },
];

export default function JointPerformancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Joint performance"
        title="Watertight joints, tested"
        lede="SWEILLEM joints seal watertight under pressure, inside and out, and keep roots out of the line. Here is what is tested and how."
      />

      <Section id="watertight" title="Water tightness">
        <div className="grid gap-[clamp(28px,5vw,64px)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
          <JointDemo />
          <div className="grid gap-4">
            <p className="text-[17px] leading-relaxed">
              Jointing systems C and F are designed so that the spigot and socket, and the interference between them, give a
              seal that stays watertight at 0.5, 1 and 2.4 bar, internal or external.
            </p>
            <p className="text-[17px] leading-relaxed">
              To stop roots getting in, SWEILLEM uses a polyurethane joint with a hardness of 67 ± 5 Shore A.
            </p>
            <ul className="grid grid-cols-3 gap-2">
              {pressures.map((p, i) => (
                <li
                  key={p.bar}
                  className="reveal grid content-start gap-1 rounded-inner border border-line bg-surface p-3"
                  style={{ "--dl": `${300 + i * 120}ms` } as CSSProperties}
                >
                  <span className="font-display text-[clamp(24px,3vw,32px)] leading-none font-semibold tabular-nums">
                    {p.bar}
                    <small className="ms-1 text-[.5em] text-maroon">bar</small>
                  </span>
                  <span className="text-[12.5px] text-muted">{p.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="test" title="The line test" lede="How water tightness is checked on a pipeline, as SWEILLEM describes it.">
        <ol className="grid gap-3 md:grid-cols-3">
          {testSteps.map((t, i) => (
            <li
              key={t}
              className="reveal grid content-start gap-3 rounded-card border border-line bg-surface p-5"
              style={{ "--dl": `${i * 100}ms` } as CSSProperties}
            >
              <span className="hex grid size-9 place-content-center bg-brand font-mono text-sm font-semibold text-on-brand">
                {i + 1}
              </span>
              <p>{t}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="deflection"
        title="Angular deflection"
        lede="Under EN 295-3:2012, one pipe in a joint assembly is deflected, and the joint must hold the test pressure without any leakage."
      >
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
          <div className="reveal overflow-hidden rounded-card border border-line bg-surface">
            <table className="w-full border-collapse text-[15px] tabular-nums">
              <caption className="sr-only">Deflection per metre of deflected pipe length, by nominal size</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-3 text-start font-mono text-[12px] font-medium tracking-[.1em] text-muted uppercase">
                    Nominal size
                  </th>
                  <th scope="col" className="px-5 py-3 text-start font-mono text-[12px] font-medium tracking-[.1em] text-muted uppercase">
                    Deflection, mm per m
                  </th>
                </tr>
              </thead>
              <tbody>
                {deflection.map((d, i) => (
                  <tr key={d.range} className="border-b border-line last:border-b-0">
                    <th scope="row" className="px-5 py-3 text-start font-mono font-medium">
                      {d.range}
                    </th>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <span className="w-8 font-semibold">{d.mm}</span>
                        <span aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded bg-sunk">
                          <span
                            className="grow-x block h-full rounded bg-maroon"
                            style={{ "--v": d.mm / 80, "--i": i } as CSSProperties}
                          />
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3">
            <p className="text-[17px] leading-relaxed">
              Smaller pipes are allowed more deflection per metre of deflected pipe length. A DN 150 joint, for example, is
              tested at 80 mm per metre; a DN 1000 joint at 10 mm.
            </p>
            <p className="text-base sm:text-[15px] text-muted">
              Joint types for each size are listed in the{" "}
              <Link href="/products/pipes" className="link">
                pipe tables
              </Link>
              .
            </p>
          </div>
        </div>
        <SourceNote className="mt-4">Text and figures from Joint Performance on sweillem.net.</SourceNote>
      </Section>

      <Section id="seals" title="Certified seals">
        <div className="reveal grid gap-4 rounded-card border border-line bg-surface p-[clamp(20px,3vw,32px)] md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid gap-2">
            <p className="font-mono text-xs tracking-[.12em] text-maroon uppercase">DIN CERTCO · Registration P1S048</p>
            <p className="max-w-[62ch]">
              SWEILLEM’s seals hold the DIN plus mark, tested to EN 295-1:2013 and EN 295-4:2013 and certification scheme WN
              295, valid until 31 May 2027.
            </p>
          </div>
          <Link href="/certificates" className="link tap w-fit">
            View the certificate
          </Link>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
