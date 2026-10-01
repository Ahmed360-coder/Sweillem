import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@content/products";
import { BuildNote } from "@/components/BuildNote";
import { FamilyGrid } from "@/components/FamilyGrid";
import { PageHeader } from "@/components/PageHeader";
import { families } from "@/lib/families";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => families.find((f) => f.slug === slug);

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const f = find(slug);
  if (!f) return {};
  return pageMetadata({
    title: f.name,
    description: `SWEILLEM vitrified clay ${f.name.toLowerCase()}: specifications, sizes and strength classes.`,
    path: f.href,
  });
}

const stateNote = {
  tables: "The full specification tables, copied cell for cell from the published tables, with a cross-section drawn to scale and an add-to-quote button on every size.",
  "table-images":
    "The specification tables. SWEILLEM publishes these only as pictures of tables today, so they are transcribed and checked before they go live.",
  empty: "This product page is empty on the current site. It is filled once SWEILLEM sends the description and specifications.",
} as const;

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const f = find(slug);
  if (!f) notFound();
  return (
    <>
      <PageHeader eyebrow={`Products · ${f.descriptor}`} title={f.name} />
      <BuildNote milestone={4}>
        <p>{stateNote[f.state]}</p>
      </BuildNote>
      <section aria-label="Other product families" className="pb-10">
        <div className="wrap grid gap-5">
          <h2 className="font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">All product families</h2>
          <FamilyGrid current={f.slug} />
        </div>
      </section>
    </>
  );
}
