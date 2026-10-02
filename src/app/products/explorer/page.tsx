import { PageHeader } from "@/components/PageHeader";
import { ProductExplorer } from "@/components/ProductExplorer";
import { SourceNote } from "@/components/SourceNote";
import { pageMetadata } from "@/lib/metadata";
import { explorerProducts, totalRows } from "@/lib/specs";

export const metadata = pageMetadata({
  title: "Product explorer: find the exact spec row",
  description:
    "Pick a SWEILLEM vitrified clay pipe or fitting, a strength class and a nominal size, and see its published dimensions, crushing strength, length and weight.",
  path: "/products/explorer",
});

export default function ExplorerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Product explorer"
        title="Find the exact spec row"
        lede="Pick a product, a type, a strength class and a nominal size. The matching row of SWEILLEM’s published table appears with its dimensions, drawn to scale, ready to add to your quote list."
      />
      <div className="wrap grid gap-6 py-10">
        <ProductExplorer items={explorerProducts} syncUrl headingLevel={2} />
        <SourceNote>
          {totalRows} rows from the spec tables on sweillem.net, copied as published. The address bar keeps your choice, so you can share a
          size by sharing the link.
        </SourceNote>
      </div>
    </>
  );
}
