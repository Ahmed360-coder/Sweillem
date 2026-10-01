import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@content/products";
import { ButtonLink } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { FamilyGrid } from "@/components/FamilyGrid";
import { Logo } from "@/components/Logo";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { ProductExplorer } from "@/components/ProductExplorer";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { SpecTable, hasFootnoteMarks } from "@/components/SpecTable";
import { pageMetadata } from "@/lib/metadata";
import { productPage, type Drawing } from "@/lib/product-pages";
import { siteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = productPage(slug);
  if (!page) return {};
  return pageMetadata({
    title: `${page.product.name}: sizes and specifications`,
    description: `SWEILLEM vitrified clay ${page.product.name.toLowerCase()}. ${page.summary}`.slice(0, 158),
    path: page.family.href,
  });
}

function DrawingFigure({ d, priority = false }: { d: Drawing; priority?: boolean }) {
  return (
    <figure className="grid gap-2.5">
      <div className="overflow-hidden rounded-inner border border-line bg-white p-3">
        <Image src={d.src} alt={d.alt} width={d.width} height={d.height} priority={priority} sizes="(min-width: 1024px) 560px, 100vw" className="mx-auto h-auto w-full max-w-[640px]" />
      </div>
      <figcaption className="text-sm text-muted">{d.caption}</figcaption>
    </figure>
  );
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const page = productPage(slug);
  if (!page) notFound();
  const { product, family, spec, drawings, legend, facts, summary, transcribed } = page;
  const loose = drawings.filter((d) => !d.forTable);

  return (
    <>
      {/* Spec-sheet heading, shown only when printed. */}
      <div className="print-only mb-4 hidden items-end justify-between border-b border-black pb-3">
        <Logo className="h-10 w-auto" />
        <p className="text-right text-xs">
          Specification sheet · {product.name}
          <br />
          {siteUrl.replace(/^https?:\/\//, "")}
          {family.href}
        </p>
      </div>

      <PageHeader eyebrow={`Products · ${family.descriptor}`} title={product.name} lede={summary}>
        <nav aria-label="Breadcrumb" className="no-print order-first text-sm text-muted">
          <ol className="flex flex-wrap gap-1.5">
            <li>
              <Link href="/products" className="link">
                Products
              </Link>
              <span aria-hidden="true"> /</span>
            </li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
      </PageHeader>

      <div className="wrap grid gap-8 py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <div className="grid gap-6">
          {loose.length > 0 ? (
            loose.map((d, i) => <DrawingFigure key={d.src} d={d} priority={i === 0} />)
          ) : drawings.length === 0 ? (
            <figure className="grid gap-2.5">
              <div className="relative aspect-[3/2] overflow-hidden rounded-inner border border-line bg-white">
                <Image src={family.picture.src} alt={family.picture.alt} fill priority unoptimized={family.picture.src.endsWith(".svg")} sizes="(min-width: 1024px) 560px, 100vw" className="object-contain" />
              </div>
              {family.picture.drawn && (
                <figcaption className="text-sm text-muted">Schematic section drawn for this site. SWEILLEM has not published a drawing of this product.</figcaption>
              )}
            </figure>
          ) : null}
          {legend.length > 0 && (
            <dl className="grid gap-2 rounded-inner border border-line bg-surface p-4 text-sm sm:grid-cols-3">
              {legend.map((l) => (
                <div key={l.term} className="grid gap-0.5">
                  <dt className="font-mono font-semibold text-maroon">{l.term}</dt>
                  <dd>{l.text}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="grid gap-5">
          {facts.length > 0 && (
            <dl className="grid divide-y divide-line rounded-card border border-line bg-surface">
              {facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[10rem_minmax(0,1fr)] gap-3 px-5 py-3.5 max-sm:grid-cols-1 max-sm:gap-0.5">
                  <dt className="text-sm text-muted">{f.label}</dt>
                  <dd className="font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="no-print flex flex-wrap gap-3">
            {spec ? (
              <>
                <ButtonLink href="#specifications" arrow>
                  See the tables
                </ButtonLink>
                <PrintButton />
              </>
            ) : (
              <ButtonLink href="/contact" arrow>
                Ask SWEILLEM about {product.name.toLowerCase()}
              </ButtonLink>
            )}
            {slug === "pipes" && (
              <ButtonLink href="/products/compare" variant="ghost">
                Compare N and H class
              </ButtonLink>
            )}
          </div>
          {slug === "jointing-systems" && <JointingFacts />}
        </div>
      </div>

      {spec && (
        <Section id="find" eyebrow="Find a size" title="Pick a size" className="no-print bg-sunk/50">
          <ProductExplorer items={[{ slug, name: product.name, spec }]} />
        </Section>
      )}

      {spec && (
        <section id="specifications" aria-labelledby="specifications-title" className="py-[clamp(48px,7vw,96px)]">
          <div className="wrap grid gap-10">
            <div className="grid gap-3">
              <p className="eyebrow">Specifications</p>
              <h2 id="specifications-title" className="text-[clamp(26px,3.4vw,42px)]">
                Every published size
              </h2>
            </div>
            {spec.tables.map((t) => {
              const d = drawings.find((x) => x.forTable === t.id);
              return (
                <div key={t.id} className={d ? "grid gap-6" : undefined}>
                  {d && <div className="max-w-xl"><DrawingFigure d={d} /></div>}
                  <SpecTable table={t} productName={product.name} />
                </div>
              );
            })}
            <div className="grid gap-2">
              {hasFootnoteMarks(spec.tables) && (
                <SourceNote>
                  Values marked * or ** carry a footnote on SWEILLEM’s published table, but the footnote text itself is not published.
                </SourceNote>
              )}
              <SourceNote>
                {transcribed
                  ? `SWEILLEM publishes these tables as pictures. They were typed out cell by cell from the pictures on sweillem.net${family.href.replace("/products", "")}.`
                  : `Copied cell for cell from the tables on sweillem.net${family.href.replace("/products", "")}, as published.`}{" "}
                Column names are written out in full; hover a heading to see it as published.
              </SourceNote>
            </div>
          </div>
        </section>
      )}

      {!spec && product.state === "empty" && slug !== "jointing-systems" && (
        <div className="wrap py-6">
          <EmptyProduct name={product.name} />
        </div>
      )}

      <section aria-labelledby="families-title" className="no-print pb-10">
        <div className="wrap grid gap-5">
          <h2 id="families-title" className="font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">
            All product families
          </h2>
          <FamilyGrid current={slug} />
        </div>
      </section>
      <div className="no-print">
        <CtaBand />
      </div>
    </>
  );
}

function EmptyProduct({ name }: { name: string }) {
  return (
    <div className="grid justify-items-start gap-3 rounded-card border border-dashed border-line bg-surface p-[clamp(20px,3vw,32px)]">
      <h2 className="text-xl">No sizes published yet</h2>
      <p className="max-w-[60ch] text-muted">
        The {name.toLowerCase()} page on SWEILLEM’s current site is empty, so there is nothing to copy yet. SWEILLEM can tell you which
        sizes are available for your line.
      </p>
    </div>
  );
}

function JointingFacts() {
  return (
    <div className="grid gap-3 rounded-card border border-line bg-surface p-5">
      <h2 className="text-xl">What SWEILLEM publishes about its joints</h2>
      <ul className="grid list-disc gap-2 ps-5 text-[15px]">
        <li>
          The spec tables give each size a joint type, <span className="font-mono">F</span> or <span className="font-mono">C</span>. In the{" "}
          <Link href="/products/pipes" className="link">
            pipe tables
          </Link>
          , F is listed for DN 125 to 200 and C for DN 200 to 1000.
        </li>
        <li>To stop roots getting in, SWEILLEM uses a polyurethane joint with a hardness of 67 ± 5 Shore A.</li>
        <li>Joints are watertight at 0.5, 1 and 2.4 bar, internal or external, and tested for angular deflection to EN 295-3:2012.</li>
      </ul>
      <p className="text-sm text-muted">
        The Jointing Systems page on the current site is empty. The test results are on{" "}
        <Link href="/joint-performance" className="link">
          Joint performance
        </Link>
        .
      </p>
    </div>
  );
}
