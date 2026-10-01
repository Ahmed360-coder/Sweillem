import Link from "next/link";
import { productSpecs } from "@content/products";
import { CrossSection } from "@/components/CrossSection";
import { CtaBand } from "@/components/CtaBand";
import { FamilyGrid } from "@/components/FamilyGrid";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { pageMetadata } from "@/lib/metadata";
import { explorerProducts, totalRows } from "@/lib/specs";
import { ArrowIcon } from "@/components/icons";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "SWEILLEM vitrified clay pipes DN 125 to 1000 in N (normal) and H (extra) strength classes, with bends, junctions, short pieces and other fittings.",
  path: "/products",
});

const [nPipes, hPipes] = productSpecs.pipes.tables;

export default function ProductsPage() {
  const tools = [
    {
      href: "/products/explorer",
      title: "Product explorer",
      text: `Pick a product, a class and a size and see its exact row. ${explorerProducts.length} products, ${totalRows} published rows.`,
      art: <CrossSection d1={300} d3={376} scaleTo={420} showLabels={false} className="size-20" />,
    },
    {
      href: "/products/compare",
      title: "Compare N and H class",
      text: `Normal strength DN ${nPipes.rows[0][0]} to ${nPipes.rows.at(-1)![0]} beside extra strength DN ${hPipes.rows[0][0]} to ${hPipes.rows.at(-1)![0]}, size by size.`,
      art: (
        <span className="flex items-center gap-1">
          <CrossSection d1={300} d3={355} scaleTo={420} showLabels={false} className="size-16" />
          <CrossSection d1={300} d3={376} scaleTo={420} showLabels={false} className="size-16" />
        </span>
      ),
    },
    {
      href: "/roof-tiles",
      title: "Clay roof tiles",
      text: "SWEILLEM’s second product line, in terracotta, blue and black. Switch colours in the viewer.",
      art: (
        <span className="flex gap-1.5" aria-hidden="true">
          {["#b4532e", "#3d8fd6", "#2b2b2d"].map((c) => (
            <span key={c} className="hex block size-7" style={{ background: c }} />
          ))}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="Pipes and fittings"
        lede="Vitrified clay pipes in N class, normal strength (DN 125 to 600), and H class, extra strength (DN 200 to 1000), with the bends, junctions and fittings that complete a sewer or drainage line."
      />
      <section aria-label="Product tools" className="pt-8">
        <ul className="wrap grid gap-3 md:grid-cols-3">
          {tools.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-card border border-line bg-surface p-5 text-ink no-underline transition-transform duration-300 ease-glaze hover:-translate-y-0.5 hover:border-ink"
              >
                <span className="grid gap-1.5">
                  <span className="flex items-center gap-2 font-display text-lg font-semibold">
                    {t.title}
                    <ArrowIcon className="text-maroon transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                  <span className="text-sm text-muted">{t.text}</span>
                </span>
                <span aria-hidden="true">{t.art}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Section id="families" eyebrow="Ten product families" title="Choose a product">
        <FamilyGrid />
      </Section>
      <CtaBand />
    </>
  );
}
