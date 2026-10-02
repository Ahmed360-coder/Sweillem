import type { CSSProperties } from "react";
import Image from "next/image";
import { CountUp } from "@/components/CountUp";
import { CtaBand } from "@/components/CtaBand";
import { HeritageTrack, type Milestone } from "@/components/HeritageTrack";
import { ReachMap } from "@/components/ReachMap";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About SWEILLEM: vitrified clay pipes since 1935",
  description:
    "SWEILLEM has made vitrified clay pipes in Egypt since 1935, with a new factory built in 1987 and customers across the GCC, the Arab world and Europe.",
  path: "/about",
});

// Published stats only. 150+ engineers, 3 branches and the project count wait
// for SWEILLEM (docs/content-gaps.md 2.1, 2.2).
const stats = [
  { value: "90+", label: "Years of experience", source: "About Us" },
  { value: "1987", label: "New factory with advanced production lines", source: "About Us" },
  { value: "14", label: "Countries named on the customer list, from Germany to Brunei", source: "About Us" },
];

function Photo({ src, alt, contain }: { src: string; alt: string; contain?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 900px) 400px, 100vw"
      className={contain ? "bg-white object-contain p-4" : "object-cover"}
    />
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-2 p-5">
      {items.map((c) => (
        <span key={c} className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[12px]">
          {c}
        </span>
      ))}
    </div>
  );
}

const reach = ["Egypt", "Saudi Arabia", "GCC and Europe", "Euro Sweillem"];

// Only dates SWEILLEM has published (site, report, certificate files).
// Undated milestones show no year (docs/content-gaps.md 2.9).
const milestones: Milestone[] = [
  {
    year: "1935",
    title: "Founded in Cairo",
    text: "SWEILLEM starts out in the heart of Cairo with a small plant manufacturing vitrified clay pipes.",
    source: "About Us, sweillem.net",
    reach: 1,
    visual: <Photo src="/images/company/since-1935-crop.webp" alt="Glazed SWEILLEM pipes with the year 1935" />,
  },
  {
    year: "1987",
    title: "A new factory",
    text: "A new factory with advanced production lines, built with German clay pipe technology and English, German and American expertise.",
    source: "About Us and the 2024 company report",
    reach: 1,
    visual: <Photo src="/images/process/moulding.webp" alt="Pipes moving through the moulding line" />,
  },
  {
    title: "Saudi Arabia, the first international market",
    text: "Saudi Arabia becomes SWEILLEM’s first successful market outside Egypt.",
    source: "2024 company report",
    reach: 2,
    visual: <Photo src="/images/projects/makkah-crop.webp" alt="SWEILLEM pipes on a project in Makkah" />,
  },
  {
    year: "2007",
    title: "The Saudi quality mark",
    text: "The Saudi Standards organisation (SASO) first grants SWEILLEM its quality mark for vitrified clay pipes to SASO GSO EN 295.",
    source: "SASO licence 201900003011",
    reach: 2,
    visual: <Chips items={["SASO", "GSO EN 295-1", "Granted 12 May 2007"]} />,
  },
  {
    title: "Across the GCC, the Arab world and Europe",
    text: "Customers in the GCC, the Arab world and East and West European markets, with countries from Germany and Belgium to Singapore and Brunei.",
    source: "Home and About Us, sweillem.net",
    reach: 3,
    visual: <Chips items={["G.C.C", "Arab world", "East Europe", "West Europe"]} />,
  },
  {
    year: "2021",
    title: "Management systems registered",
    text: "SWEILLEM’s quality and environmental management systems are registered to ISO 9001 and ISO 14001.",
    source: "American Systems Registrar certificates 8488 and 8401",
    reach: 3,
    visual: <Chips items={["ISO 9001:2015", "ISO 14001:2015"]} />,
  },
  {
    year: "2022",
    title: "DIN CERTCO for the joint seals",
    text: "DIN CERTCO certifies SWEILLEM’s seals to EN 295-1 and EN 295-4 under the DIN plus mark.",
    source: "DIN CERTCO certificate P1S048",
    reach: 3,
    visual: <Chips items={["DIN plus", "EN 295-1:2013", "EN 295-4:2013"]} />,
  },
  {
    year: "2023",
    title: "A carbon baseline",
    text: "SWEILLEM starts measuring its CO₂ footprint, with 2023 as the baseline for its reduction goals.",
    source: "Sustainability, sweillem.net",
    reach: 3,
    visual: (
      <div className="absolute inset-0 grid content-center gap-2.5 p-5">
        {[
          ["Scope 1", 88, "88%"],
          ["Scope 2", 6.5, "6.5%"],
        ].map(([k, v, l]) => (
          <div key={k} className="grid grid-cols-[64px_1fr_44px] items-center gap-2 text-[12px]">
            <span className="font-mono">{k}</span>
            <span className="h-2 overflow-hidden rounded bg-line">
              <span className="block h-full rounded bg-maroon" style={{ width: `${v}%` }} />
            </span>
            <b className="font-mono font-medium">{l}</b>
          </div>
        ))}
      </div>
    ),
  },
  {
    year: "2024",
    title: "Health and safety certified",
    text: "ISO 45001 joins ISO 9001 and ISO 14001, and both are renewed.",
    source: "American Systems Registrar certificates 9720, 8488 and 8401",
    reach: 3,
    visual: <Chips items={["ISO 45001:2018", "ISO 9001:2015", "ISO 14001:2015"]} />,
  },
  {
    year: "2025",
    title: "Cradle to Cradle Certified",
    text: "Vitrified clay pipes DN 125 to DN 1000 with accessories achieve Cradle to Cradle Certified Full Scope Bronze.",
    source: "Cradle to Cradle certificate 9605",
    reach: 3,
    visual: <Chips items={["C2C Certified", "Bronze", "Version 4.1"]} />,
  },
  {
    when: "Newest launch",
    title: "Euro Sweillem, Germany",
    text: "A European central stock with warehouses in Germany, so contractors in Europe can draw on local supply.",
    source: "Company deck",
    reach: 4,
    visual: <Photo src="/images/logistics/germany-warehouses-crop.webp" alt="SWEILLEM pipes stacked in a warehouse yard in Germany" />,
  },
];

const locations = [
  {
    kind: "Office",
    name: "Cairo office",
    address: "Osman Towers, Kornish El Nile, Cairo, Egypt",
    source: "Contact Us, sweillem.net, and the Cradle to Cradle certificate",
  },
  {
    kind: "Registered address",
    name: "Cairo",
    address: "6 El-Saad Street, Shoubra Gardens, Khalafawi Square, Cairo, Egypt",
    source: "ISO 9001, 14001 and 45001 certificates",
  },
  {
    kind: "Factory",
    name: "Saryaqos",
    address: "Cairo Ismailia Agricultural Road, Saryaqos, Qalyubia, Egypt",
    source: "ISO, SASO and DIN CERTCO certificates",
  },
  {
    kind: "Site",
    name: "Arab Al Hoson",
    address: "El Mataria, Egypt",
    source: "Company deck",
  },
  {
    kind: "Europe",
    name: "Germany",
    address: "Stiegstraße 60, 41379 Brüggen, Germany",
    source: "sweillem.net footer",
  },
  {
    kind: "Saudi Arabia",
    name: "Jeddah",
    address: "Jeddah, Kingdom of Saudi Arabia",
    source: "sweillem.net footer",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About SWEILLEM"
        title="Ninety years of vitrified clay"
        lede="“Daring to be the first, working hard for a world-class level” has been SWEILLEM’s philosophy since it began in Cairo in 1935."
      />

      <section aria-labelledby="who-title" className="py-[clamp(32px,5vw,64px)]">
        <div className="wrap grid gap-[clamp(28px,5vw,64px)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-5">
            <h2 id="who-title" className="text-[clamp(26px,3.4vw,40px)]">
              Who we are
            </h2>
            <div className="grid max-w-[62ch] gap-4 text-[17px] leading-relaxed">
              <p>
                In the heart of Cairo, Egypt, SWEILLEM started out in 1935 with a small plant manufacturing vitrified clay
                pipes. Learning, developing and keeping the same excellence of quality pushed SWEILLEM to serve and add to
                the vitrified clay pipe industry.
              </p>
              <p>
                In 1987 SWEILLEM built a new factory with advanced production lines to meet the demands of the local market.
                Since then it has kept up with what is new in the field and expanded worldwide.
              </p>
              <p>
                With full R&amp;D facilities and an efficient technical team, SWEILLEM serves Egypt, the Middle East, the Far
                East and Europe. Warehouses in different parts of the world keep delivery times short, and the aim stays the
                same: continuous improvement in delivery time, price and performance.
              </p>
            </div>
            <SourceNote>Edited from About Us on sweillem.net.</SourceNote>
          </div>
          <div className="grid grid-cols-2 gap-3 self-start">
            <div className="reveal relative col-span-2 aspect-[16/9] overflow-hidden rounded-card">
              <Image
                src="/images/company/home-about-2.jpg"
                alt="Crates of glazed SWEILLEM pipes and fittings ready to ship"
                fill
                sizes="(min-width: 900px) 520px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="reveal relative aspect-square overflow-hidden rounded-card" style={{ "--dl": "120ms" } as CSSProperties}>
              <Image src="/images/site/glazed.webp" alt="Glazed pipes in the Cairo plant" fill sizes="(min-width: 900px) 260px, 50vw" className="object-cover" />
            </div>
            <div className="reveal relative aspect-square overflow-hidden rounded-card" style={{ "--dl": "220ms" } as CSSProperties}>
              <Image
                src="/images/company/about-2025-02-18-4.png"
                alt="A robot arm handling a clay pipe"
                fill
                sizes="(min-width: 900px) 260px, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <dl className="grid border-y border-line sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="grid min-w-0 gap-1 border-b border-line px-5 py-6 last:border-b-0 sm:border-s sm:border-b-0 sm:first:border-s-0">
              <dt className="order-2 text-[14px] text-muted">{s.label}</dt>
              <dd className="order-1 font-display text-[clamp(32px,4vw,52px)] leading-none font-semibold tabular-nums">
                <CountUp value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <section aria-labelledby="heritage-title" className="pt-[clamp(48px,7vw,96px)]">
        <div className="wrap mb-8 grid gap-3">
          <h2 id="heritage-title" className="text-[clamp(26px,3.4vw,42px)]">
            From a Cairo plant in 1935 to today
          </h2>
          <p className="lede">
            The main steps in SWEILLEM’s history, with the years SWEILLEM has published.
          </p>
        </div>
        <HeritageTrack milestones={milestones} reach={reach} />
      </section>

      <Section
        id="reach"
        title="Where SWEILLEM pipes go"
        lede="Customers across the GCC, the Arab world and East and West European markets."
      >
        <ReachMap />
        <SourceNote className="mt-4">
          The list on About Us ends with “etc.”, so the map also marks the countries filled red on SWEILLEM’s own export
          map. Map shapes: Natural Earth. Satellite views: NASA Earth at Night and Blue Marble.
        </SourceNote>
      </Section>

      <Section id="locations" title="Where SWEILLEM is" lede="Addresses as SWEILLEM publishes them on its site and certificates.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((l, i) => (
            <li
              key={l.name}
              className="reveal grid content-start gap-2 rounded-card border border-line bg-surface p-5"
              style={{ "--dl": `${i * 70}ms` } as CSSProperties}
            >
              <span className="font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">{l.kind}</span>
              <h3 className="text-lg">{l.name}</h3>
              <p className="text-base sm:text-[15px]">{l.address}</p>
              <SourceNote>Source: {l.source}</SourceNote>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand />
    </>
  );
}
