import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { ClayHero } from "@/components/ClayHero";
import { FamilyGrid } from "@/components/FamilyGrid";
import { JourneyScrollHint, JourneyTeaser } from "@/components/JourneyTeaser";
import { Section } from "@/components/Section";
import { frameSVG, getChapters } from "@/lib/journey/frames";
import { baseOpenGraph } from "@/lib/metadata";
import { organizationJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...baseOpenGraph, url: "/" },
};

// Before scripts run (and with reduced motion) the journey card shows the kiln at
// its 1200 °C peak; JourneyTeaser then steps it through all nine stages on scroll.
const fire = getChapters("en").find((c) => c.id === "fire")!;
const teaserFrame = frameSVG(fire.start + fire.lead + 8.2, { uid: "teaser" });

// Stats that SWEILLEM publishes and that agree across its sources.
// The project count stays off until SWEILLEM confirms it (docs/content-gaps.md 2.1).
const stats = [
  { value: "1935", label: "Founded in Cairo" },
  { value: "1987", label: "New plant, modern lines" },
  { value: "1200", unit: "°C", label: "Peak firing temperature" },
  { value: "100+", label: "Years design life" },
  { value: "10", label: "Product families" },
];

// Standards named on About Us and on SWEILLEM's certificate files.
const standards = [
  "EN 295",
  "SASO GSO EN 295",
  "ZPWN 295:2016",
  "ES 56/2005",
  "ASTM C700",
  "ISO 9001:2015",
  "ISO 14001:2015",
  "ISO 45001:2018",
  "DIN plus",
  "Cradle to Cradle Certified Bronze",
];

// Places shown in SWEILLEM's deck; each card opens its gallery on the Projects
// page. Client names and years follow once SWEILLEM confirms them (docs/content-gaps.md 4).
const featured = [
  { src: "/images/projects/makkah-crop.webp", alt: "Large SWEILLEM pipes on a project in Makkah, near the Haram", place: "Makkah", region: "Saudi Arabia", id: "haram-central-area-makkah" },
  { src: "/images/projects/new-alamein-crop.webp", alt: "SWEILLEM pipes waiting to be laid in New Alamein City", place: "New Alamein City", region: "Egypt", id: "new-alamein-city" },
  { src: "/images/projects/germany-site.jpg", alt: "SWEILLEM pipes on a site in Germany", place: "Germany", region: "Europe", id: "germany" },
];

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd() }} />

      <ClayHero />

      <div id="after-hero" className="wrap scroll-mt-24">
        <dl className="grid grid-cols-2 border-y border-line sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="grid min-w-0 gap-1 border-b border-line px-5 py-6 last:border-b-0 lg:border-b-0 lg:border-s lg:first:border-s-0">
              <dt className="order-2 text-[13px] text-muted">{s.label}</dt>
              <dd className="order-1 font-display text-[clamp(28px,3.4vw,44px)] leading-none font-semibold tabular-nums">
                {s.value}
                {s.unit && <small className="ms-0.5 text-[.5em] text-maroon">{s.unit}</small>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="wrap pt-8">
        <div className="marquee overflow-hidden">
          <ul aria-label="Standards and certificates" className="marquee-track flex w-max gap-2">
            {[...standards, ...standards].map((st, i) => (
              <li
                key={i}
                aria-hidden={i >= standards.length || undefined}
                className="flex-none rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-[12.5px] whitespace-nowrap"
              >
                {st}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Section
        id="families"
        title="Ten product families"
        lede="Pipes, bends, junctions and the fittings that complete a sewer or drainage line."
        action={
          <Link href="/products" className="link">
            All products
          </Link>
        }
      >
        <FamilyGrid />
      </Section>

      <section id="journey" aria-labelledby="journey-title" className="pb-[clamp(48px,7vw,96px)]">
        <div className="wrap grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:items-center">
          <div className="grid gap-3">
            <h2 id="journey-title" className="text-[clamp(26px,3.4vw,42px)]">
              From Aswan clay to the trench
            </h2>
            <p className="lede">
              Follow one pipe from the quarry, through the kiln, to a sewer line in the ground.
              <JourneyScrollHint />
            </p>
            <Link href="/process#steps" className="link w-fit">
              Every step in detail
            </Link>
          </div>
          <JourneyTeaser initial={teaserFrame} />
        </div>
      </section>

      <Section
        id="projects"
        title="Where SWEILLEM pipes are working"
        action={
          <Link href="/projects" className="link">
            All projects
          </Link>
        }
      >
        <ul className="grid gap-3 md:grid-cols-[1.5fr_1fr] md:grid-rows-2">
          {featured.map((p, i) => (
            <li
              key={p.place}
              className={`reveal ${i === 0 ? "md:row-span-2" : ""}`}
              style={{ "--dl": `${i * 100}ms` } as CSSProperties}
            >
              <Link href={`/projects#${p.id}`} className="group grid h-full gap-2.5 text-ink no-underline">
                <span className={`relative block overflow-hidden rounded-card bg-sunk ${i === 0 ? "aspect-[4/3] md:aspect-auto md:h-full md:min-h-[420px]" : "aspect-[16/9]"}`}>
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes={i === 0 ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 40vw, 100vw"}
                    className="object-cover transition-transform duration-500 ease-glaze group-hover:scale-[1.03]"
                  />
                </span>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg font-semibold">{p.place}</span>
                  <small className="font-mono text-[12px] tracking-[.12em] text-muted uppercase">{p.region}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <section aria-labelledby="euro-title" className="pb-[clamp(24px,4vw,48px)]">
        <div className="wrap">
          <div className="reveal grid overflow-hidden rounded-card bg-glaze text-white md:grid-cols-2">
            <div className="grid content-center gap-4 p-[clamp(24px,4vw,56px)]">
              <Image
                src="/images/brand/euro-sweillem-logo.png"
                alt="EURO SWEILLEM"
                width={1024}
                height={492}
                className="h-11 w-auto self-start rounded-[8px] bg-white px-2.5 py-1.5"
              />
              <h2 id="euro-title" className="text-[clamp(26px,3.4vw,40px)] text-white">
                Euro Sweillem, Germany
              </h2>
              <p className="max-w-[48ch] text-white/80">
                SWEILLEM’s newest launch: a European central stock with warehouses in Germany, so contractors in Europe can draw
                on local supply.
              </p>
              <ButtonLink href="/euro-sweillem" arrow className="w-fit bg-white! text-glaze! hover:bg-surface/90!">
                Visit Euro Sweillem
              </ButtonLink>
            </div>
            <div className="relative min-h-[240px]">
              <Image
                src="/images/logistics/germany-warehouses-crop.webp"
                alt="SWEILLEM pipes stacked at a warehouse in Germany"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover object-bottom"
              />
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
