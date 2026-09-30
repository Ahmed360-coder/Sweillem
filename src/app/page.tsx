import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { BuildNote } from "@/components/BuildNote";
import { FamilyGrid } from "@/components/FamilyGrid";
import { Section } from "@/components/Section";
import { site, siteUrl } from "@/lib/site";

// Stats that SWEILLEM publishes and that agree across its sources.
// The project count stays off until SWEILLEM confirms it (docs/content-gaps.md 2.1).
const stats = [
  { value: "1935", label: "Founded in Cairo" },
  { value: "1987", label: "New plant, modern lines" },
  { value: "1200", unit: "°C", label: "Peak firing temperature" },
  { value: "100+", label: "Years design life" },
  { value: "10", label: "Product families" },
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
            <div className="frame-cut absolute inset-0 overflow-hidden bg-glaze">
              <Image
                src="/images/site/hero.webp"
                alt="SWEILLEM vitrified clay pipes laid on a site in Germany"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div
              className="badge-1935 hex absolute end-2 top-[6%] z-10 grid h-24 w-[84px] place-content-center bg-maroon text-center text-on-maroon md:-end-[3%] md:h-32 md:w-28"
              aria-hidden="true"
            >
              <span className="font-mono text-[10px] font-medium tracking-[.14em] uppercase">Since</span>
              <b className="font-display text-[22px] leading-none font-bold md:text-[30px]">1935</b>
            </div>
            <p className="absolute start-3 bottom-3 z-10 grid gap-0.5 rounded-inner bg-surface px-4 py-3 shadow-card md:-start-[4%] md:bottom-[10%] md:min-w-[200px]">
              <small className="font-mono text-[11px] font-medium tracking-[.1em] text-muted uppercase">On site</small>
              <strong className="font-display text-base font-semibold">Germany · Euro Sweillem</strong>
            </p>
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

      <BuildNote milestone={3}>
        <p>
          The rest of the home page follows next: the how-it’s-made film, featured projects in Makkah, New Alamein City and Germany,
          and Euro Sweillem.
        </p>
      </BuildNote>
    </>
  );
}
