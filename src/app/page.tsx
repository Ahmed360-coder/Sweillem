import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { CtaBand } from "@/components/CtaBand";
import { HeroSlideshow, type HeroSlide } from "@/components/HeroSlideshow";
import { FamilyGrid } from "@/components/FamilyGrid";
import { Section } from "@/components/Section";
import { frameSVG, getChapters, H, W } from "@/lib/journey/frames";
import { site, siteUrl } from "@/lib/site";

// The journey card shows the kiln mid-firing, drawn by the same code as the Process journey.
const fire = getChapters("en").find((c) => c.id === "fire")!;
const teaserFrame = frameSVG(fire.start + fire.lead + 6, { uid: "teaser" });

// Stats that SWEILLEM publishes and that agree across its sources.
// The project count stays off until SWEILLEM confirms it (docs/content-gaps.md 2.1).
const stats = [
  { value: "1935", label: "Founded in Cairo" },
  { value: "1987", label: "New plant, modern lines" },
  { value: "1200", unit: "°C", label: "Peak firing temperature" },
  { value: "100+", label: "Years design life" },
  { value: "10", label: "Product families" },
];

// Real site photos, one country after another. Places follow content/company.ts.
const heroSlides: HeroSlide[] = [
  {
    src: "/images/site/hero.webp",
    alt: "SWEILLEM vitrified clay pipes laid on a site in Germany",
    kicker: "On site",
    place: "Germany · Euro Sweillem",
  },
  {
    src: "/images/site/hero-makkah.webp",
    alt: "Stacked SWEILLEM clay pipes next to hotel towers in Makkah",
    kicker: "Haram central area",
    place: "Makkah, Saudi Arabia",
  },
  {
    src: "/images/site/hero-alamein.webp",
    alt: "Rows of SWEILLEM clay pipes on site with the New Alamein towers behind",
    kicker: "On site",
    place: "New Alamein City, Egypt",
  },
  {
    src: "/images/site/hero-makkah-lift.webp",
    alt: "A crane lifting SWEILLEM clay pipes near the minarets of the Haram in Makkah",
    kicker: "Delivery",
    place: "Makkah, Saudi Arabia",
  },
  {
    src: "/images/site/hero-germany-street.webp",
    alt: "An excavator lowering a clay pipe into a street trench in Germany",
    kicker: "Laying",
    place: "Germany · Euro Sweillem",
  },
];

function RisingHeadline({ text, emphasis }: { text: string; emphasis: string }) {
  const words = text.split(" ");
  return (
    <h1 className="text-[clamp(34px,4vw,54px)] tracking-[-.01em]">
      {words.map((word, i) => (
        <span key={i}>
          <span className="rise-word">
            <span style={{ "--i": i } as CSSProperties} className={word === emphasis ? "text-maroon" : undefined}>
              {word}
            </span>
          </span>{" "}
        </span>
      ))}
    </h1>
  );
}

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

// Places shown in SWEILLEM's deck. Client names, years and sizes follow in
// Milestone 5 once SWEILLEM confirms them (docs/content-gaps.md 4).
const featured = [
  { src: "/images/projects/makkah-crop.webp", alt: "Large SWEILLEM pipes on a project in Makkah, near the Haram", place: "Makkah", region: "Saudi Arabia" },
  { src: "/images/projects/new-alamein-crop.webp", alt: "SWEILLEM pipes waiting to be laid in New Alamein City", place: "New Alamein City", region: "Egypt" },
  { src: "/images/projects/germany-site.jpg", alt: "SWEILLEM pipes on a site in Germany", place: "Germany", region: "Europe" },
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.legalName,
  alternateName: site.name,
  url: siteUrl,
  logo: `${siteUrl}/images/brand/sweillem-logo.png`,
  foundingDate: String(site.founded),
  foundingLocation: "Cairo, Egypt",
  slogan: site.slogan,
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <section aria-label="Introduction" className="overflow-x-clip pt-[clamp(20px,4vw,56px)] pb-[clamp(48px,6vw,80px)]">
        <div className="wrap grid items-center gap-[clamp(24px,4vw,64px)] md:grid-cols-[1.25fr_1fr]">
          <div className="grid min-w-0 gap-[22px]">
            <p className="eyebrow fade-up" style={{ "--dl": "60ms" } as CSSProperties}>
              Vitrified clay pipes · Cairo, since 1935
            </p>
            <RisingHeadline text="Daring to be the first, working hard for a world-class level" emphasis="world-class" />
            <p className="lede fade-up" style={{ "--dl": "620ms" } as CSSProperties}>
              Glazed vitrified clay pipes and fittings for sewer and drainage networks, made from Aswan clay and fired at up to 1200 °C.
            </p>
            <div className="fade-up flex flex-wrap gap-3" style={{ "--dl": "760ms" } as CSSProperties}>
              <ButtonLink href="/products" arrow>
                Explore the pipes
              </ButtonLink>
              <ButtonLink href="/process" variant="ghost">
                How it’s made
              </ButtonLink>
            </div>
          </div>

          <div className="relative -order-1 aspect-[4/3.3] min-w-0 md:order-none md:aspect-[1/1.02]">
            <svg className="rings pointer-events-none absolute -inset-[8%] -z-10" viewBox="0 0 400 400" aria-hidden="true">
              {[190, 160, 128, 94].map((r, i) => (
                <circle key={r} cx="200" cy="200" r={r} style={{ "--c": Math.round(2 * Math.PI * r), "--i": i } as CSSProperties} />
              ))}
            </svg>
            <HeroSlideshow slides={heroSlides} />
            <div
              className="badge-1935 hex absolute end-2 top-[6%] z-10 grid h-24 w-[84px] place-content-center bg-maroon text-center text-on-maroon md:-end-[3%] md:h-32 md:w-28"
              aria-hidden="true"
            >
              <span className="font-mono text-[10px] font-medium tracking-[.14em] uppercase">Since</span>
              <b className="font-display text-[22px] leading-none font-bold md:text-[30px]">1935</b>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
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
              Follow one pipe from the quarry, through the kiln, to a sewer line in the ground. You move it along as you
              scroll.
            </p>
            <Link href="/process#steps" className="link w-fit">
              The six steps in detail
            </Link>
          </div>
          <Link
            href="/process#journey"
            className="reveal group relative block overflow-hidden rounded-card bg-[#f2f2ef] shadow-card"
          >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="block h-auto w-full transition-transform duration-700 ease-glaze group-hover:scale-[1.02]"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: teaserFrame }}
            />
            <span className="absolute end-3 bottom-3 flex items-center gap-3 rounded-full bg-ink/85 py-1 ps-1 pe-4 text-paper shadow-card backdrop-blur-sm sm:end-4 sm:bottom-4 sm:py-1.5 sm:ps-1.5 sm:pe-5">
              <span className="hex grid size-10 place-content-center bg-maroon text-on-maroon transition-transform duration-300 ease-set group-hover:scale-110 sm:size-12">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-display text-base font-semibold sm:text-lg">Scroll the journey</span>
            </span>
          </Link>
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
              <Link href="/projects" className="group grid h-full gap-2.5 text-ink no-underline">
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
              <ButtonLink href="/euro-sweillem" arrow className="w-fit bg-white! text-glaze! hover:bg-white/90!">
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
