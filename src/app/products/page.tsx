import { BuildNote } from "@/components/BuildNote";
import { FamilyGrid } from "@/components/FamilyGrid";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "SWEILLEM vitrified clay pipes DN 125 to 1000 in Normal and High strength classes, with bends, junctions, short pieces and other fittings.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="Pipes and fittings"
        lede="Vitrified clay pipes in Normal class (DN 125 to 600) and High class (DN 200 to 1000), with the bends, junctions and fittings that complete a sewer or drainage line."
      />
      <section aria-label="Product families" className="py-10">
        <div className="wrap">
          <FamilyGrid />
        </div>
      </section>
      <BuildNote milestone={4}>
        <p>
          A product explorer: choose a product, a nominal size and a strength class and see the exact specification row, drawn to
          scale, with an add-to-quote button on every size.
        </p>
      </BuildNote>
    </>
  );
}
