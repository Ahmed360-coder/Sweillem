import { productSpecs } from "@content/products";
import { ButtonLink } from "@/components/Button";
import { CompareClasses } from "@/components/CompareClasses";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { pageMetadata } from "@/lib/metadata";
import { cellText, rowSize } from "@/lib/specs";

export const metadata = pageMetadata({
  title: "Compare N and H class pipes",
  description:
    "SWEILLEM vitrified clay pipes in N (normal) and H (extra strength) class side by side: crushing strength, diameters and wall thickness for each size.",
  path: "/products/compare",
});

const [n, h] = productSpecs.pipes.tables;
const KEYS = ["strengthClass", "crushingStrength", "d3", "wallThickness"] as const;
const NAMES: Record<(typeof KEYS)[number], string> = {
  strengthClass: "Strength class",
  crushingStrength: "FN (kN/m)",
  d3: "Outer ø d3 (mm)",
  wallThickness: "Wall (mm)",
};

function first(t: typeof n, size: string, key: string) {
  const i = t.columns.findIndex((c) => c.key === key);
  const vals = [...new Set(t.rows.filter((r) => rowSize(t, r) === size).map((r) => cellText(r[i], t.columns[i])))];
  return vals.length ? vals.join(" · ") : "–";
}

export default function ComparePage() {
  const sizes = [...new Set([...n.rows, ...h.rows].map((r) => r[0]))].sort((a, b) => Number(a) - Number(b));
  return (
    <>
      <PageHeader
        eyebrow="Products · Pipes"
        title="N class or H class?"
        lede="SWEILLEM makes pipes in two strength classes: N, normal strength, from DN 125 to 600, and H, extra strength, from DN 200 to 1000. Pick a size to see both, drawn to the same scale."
      />
      <div className="wrap py-10">
        <CompareClasses n={n} h={h} />
      </div>
      <Section id="all-sizes" eyebrow="Every size" title="Side by side">
        <div className="relative overflow-x-auto rounded-inner border border-line bg-surface" tabIndex={0} role="region" aria-label="N and H class pipes by size, scrollable table">
          <table className="w-full border-collapse text-left text-sm tabular-nums">
            <thead>
              <tr className="bg-sunk">
                <th scope="col" rowSpan={2} className="px-3 py-2 align-bottom">
                  DN
                </th>
                {KEYS.map((k) => (
                  <th key={k} scope="colgroup" colSpan={2} className="border-l border-line px-3 pt-2 text-center text-[12.5px]">
                    {NAMES[k]}
                  </th>
                ))}
              </tr>
              <tr className="bg-sunk text-[12.5px]">
                {KEYS.flatMap((k) => [
                  <th key={`${k}n`} scope="col" className="border-l border-line px-3 pb-2 text-center">
                    N
                  </th>,
                  <th key={`${k}h`} scope="col" className="px-3 pb-2 text-center">
                    H
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sizes.map((s) => (
                <tr key={s}>
                  <th scope="row" className="px-3 py-2 font-mono font-semibold text-maroon">
                    {s}
                  </th>
                  {KEYS.flatMap((k) => [
                    <td key={`${k}n`} className="border-l border-line px-3 py-2 text-center font-mono whitespace-nowrap">
                      {first(n, s, k)}
                    </td>,
                    <td key={`${k}h`} className="px-3 py-2 text-center font-mono whitespace-nowrap">
                      {first(h, s, k)}
                    </td>,
                  ])}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">“–” means that class is not made in that size; “n/a” means no strength class applies to that size.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/products/pipes#specifications" arrow>
            Full pipe tables
          </ButtonLink>
          <ButtonLink href="/products/explorer?product=pipes" variant="ghost">
            Product explorer
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
