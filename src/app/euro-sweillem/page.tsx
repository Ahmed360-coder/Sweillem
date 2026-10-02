import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Euro Sweillem, Germany",
  description:
    "Euro Sweillem is SWEILLEM’s newest launch: a European central stock of vitrified clay pipes with warehouses in Germany.",
  path: "/euro-sweillem",
});

const gallery = [
  {
    src: "/images/company/home-2025-02-18-56.png",
    alt: "A forklift moving glazed clay pipes past long stacks in a German stock yard",
    w: 1920,
    h: 963,
  },
  { src: "/images/logistics/germany-warehouses-crop.webp", alt: "SWEILLEM pipes stacked in the snow at a German warehouse", w: 1000, h: 509, pos: "object-bottom" },
  { src: "/images/company/euro-sweillem-26.jpg", alt: "A crane truck loaded with clay pipes in Germany", w: 1500, h: 1000 },
  { src: "/images/site/hero.webp", alt: "SWEILLEM pipes laid on a site in Germany, with a Euro Sweillem banner", w: 1227, h: 920 },
];

const points = [
  {
    title: "Stock in Europe",
    text: "A central stock with warehouses in Germany holds SWEILLEM pipes close to European projects.",
    source: "Company deck",
  },
  {
    title: "Shorter delivery",
    text: "Shortest delivery time is one of SWEILLEM’s main objectives, and warehouses in different parts of the world keep it short.",
    source: "About Us",
  },
  {
    title: "Made to EN 295",
    text: "Pipes are made to the European standard EN 295, and the joint seals carry DIN CERTCO’s DIN plus mark.",
    source: "About Us and DIN CERTCO certificate P1S048",
    href: "/quality",
  },
];

export default function EuroSweillemPage() {
  return (
    <>
      <PageHeader
        eyebrow="Euro Sweillem, Germany"
        title="SWEILLEM’s newest launch"
        lede="A European central stock with warehouses in Germany, taking part in projects all over the world and proving that SWEILLEM is up to international standards."
      >
        <Image
          src="/images/brand/euro-sweillem-logo.png"
          alt="EURO SWEILLEM"
          width={1024}
          height={492}
          className="mt-2 h-14 w-auto rounded-inner bg-white px-3 py-2"
        />
      </PageHeader>

      <section aria-label="Euro Sweillem central stock" className="py-[clamp(28px,4vw,48px)]">
        <div className="wrap">
          <div className="reveal relative aspect-[16/9] overflow-hidden rounded-card bg-glaze md:aspect-[21/9]">
            <Image
              src="/images/logistics/europe-central-stock-germany.jpg"
              alt="Stacks of SWEILLEM pipes at the European central stock in Germany"
              fill
              priority
              sizes="(min-width: 1180px) 1100px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <Section id="what" title="What Euro Sweillem means for European projects">
        <ul className="grid gap-3 md:grid-cols-3">
          {points.map((p, i) => (
            <li
              key={p.title}
              className="reveal grid content-start gap-2 rounded-card border border-line bg-surface p-5"
              style={{ "--dl": `${i * 90}ms` } as CSSProperties}
            >
              <span aria-hidden="true" className="hex block size-3 bg-maroon" />
              <h3 className="text-xl">{p.title}</h3>
              <p className="text-base sm:text-[15px] text-muted">{p.text}</p>
              {p.href && (
                <Link href={p.href} className="link tap w-fit text-base sm:text-[15px]">
                  Quality and standards
                </Link>
              )}
              <SourceNote>Source: {p.source}</SourceNote>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="gallery" title="In Germany">
        <ul className="grid gap-3 sm:grid-cols-2">
          {gallery.map((g, i) => (
            <li
              key={g.src}
              className="reveal relative aspect-[3/2] overflow-hidden rounded-card bg-sunk"
              style={{ "--dl": `${(i % 2) * 100}ms` } as CSSProperties}
            >
              <Image src={g.src} alt={g.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className={`object-cover ${g.pos ?? ""}`} />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="address" title="SWEILLEM in Germany">
        <div className="reveal grid gap-2 rounded-card border border-line bg-surface p-[clamp(20px,3vw,32px)] sm:max-w-md">
          <p className="font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">Address listed on sweillem.net</p>
          <p className="text-lg">
            Stiegstraße 60
            <br />
            41379 Brüggen, Germany
          </p>
        </div>
      </Section>

      <CtaBand title="Building in Europe?" text="Send a quote list with the sizes, classes and quantities you need, and where the site is." />
    </>
  );
}
