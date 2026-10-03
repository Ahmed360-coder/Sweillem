import Link from "next/link";
import { productSpecs } from "@content/products";
import { CompareArt, ExplorerArt, RoofTilesArt } from "@/components/CategoryArt";
import { CtaBand } from "@/components/CtaBand";
import { FamilyGrid } from "@/components/FamilyGrid";
import { PageHeader } from "@/components/PageHeader";
import { PipeSizeSlider } from "@/components/PipeSizeSlider";
import { TileRotator } from "@/components/TileRotator";
import { Section } from "@/components/Section";
import { pageMetadata } from "@/lib/metadata";
import { sizeStops } from "@/lib/size-finder";
import { explorerProducts, totalRows } from "@/lib/specs";
import { ArrowIcon } from "@/components/icons";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "SWEILLEM vitrified clay pipes DN 125 to 1000 in N (normal) and H (extra) strength classes, with bends, junctions, short pieces and other fittings.",
  path: "/products",
});

const [nPipes, hPipes] = productSpecs.pipes.tables;
const stops = sizeStops();

/** Crushing strength and wall thickness of one class at the given DN, from its table. */
function classFacts(t: typeof nPipes, dn: string) {
  const row = t.rows.find((r) => r[0] === dn)!;
  const num = (key: string) => parseFloat(row[t.columns.findIndex((c) => c.key === key)]);
  return { fn: num("crushingStrength"), wall: num("wallThickness") };
}

export default function ProductsPage() {
  const tools = [
    {
      href: "/products/explorer",
      title: "Product explorer",
      text: `Pick a product, a class and a size and see its exact row. ${explorerProducts.length} products, ${totalRows} published rows.`,
      art: <ExplorerArt className="h-full w-full" />,
    },
    {
      href: "/products/compare",
      title: "Compare N and H class",
      text: `Same bore, different strength. H class pipes have a thicker wall and carry a higher load. N is made from DN ${nPipes.rows[0][0]} to ${nPipes.rows.at(-1)![0]}, H from DN ${hPipes.rows[0][0]} to ${hPipes.rows.at(-1)![0]}.`,
      art: <CompareArt dn={300} n={classFacts(nPipes, "300")} h={classFacts(hPipes, "300")} className="h-full w-full text-ink" />,
    },
    {
      href: "/roof-tiles",
      title: "Clay roof tiles",
      text: "SWEILLEM’s second product line, in terracotta, blue and black. Switch colours in the viewer.",
      art: <RoofTilesArt className="h-full w-full" />,
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
                className="group grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-card border border-line bg-surface text-ink no-underline transition-transform duration-300 ease-glaze hover:-translate-y-0.5 hover:border-ink"
              >
                <span className="block aspect-[16/9] overflow-hidden border-b border-line bg-sunk p-3 text-ink" aria-hidden="true">
                  <span className="block h-full w-full transition-transform duration-500 ease-glaze group-hover:scale-[1.04]">{t.art}</span>
                </span>
                <span className="grid content-start gap-1.5 p-5">
                  <span className="flex items-center gap-2 font-display text-lg font-semibold">
                    {t.title}
                    <ArrowIcon className="text-maroon transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                  <span className="text-sm text-muted">{t.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Section
        id="size"
        eyebrow="Size finder"
        title="Slide to your pipe size"
        lede={`Drag from DN ${stops[0].dn} to ${stops.at(-1)!.dn} and turn the pipe in 3D. It is redrawn to scale, with its published figures and every fitting SWEILLEM makes at that size.`}
      >
        <PipeSizeSlider stops={stops} />
      </Section>
      <Section id="tile-3d" eyebrow="Clay roof tiles" title="Turn a roof tile" className="bg-sunk/50">
        <TileRotator />
      </Section>
      <Section id="families" eyebrow="Ten product families" title="Choose a product">
        <FamilyGrid />
      </Section>
      <CtaBand />
    </>
  );
}
