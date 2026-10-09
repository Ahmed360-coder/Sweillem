import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Services: how SWEILLEM supports a project",
  description:
    "How SWEILLEM supports engineers, contractors and buyers: N and H class pipes and fittings, stock in Germany, quick delivery and certificates for approvals.",
  path: "/services",
});

// Built from what SWEILLEM states on its site, deck and certificates, and
// approved by SWEILLEM on 1 October 2026 (docs/content-gaps.md 7.5).
const services = [
  {
    title: "Pipes and fittings for the whole line",
    text: "Ten product families, from pipes DN 125 to DN 1000 in Normal and High strength classes to bends, junctions, short pieces and half channels.",
    source: "Product pages, sweillem.net",
    href: "/products",
    cta: "See the products",
  },
  {
    title: "Stock close to your site",
    text: "Warehouse facilities in different parts of the world, including the Euro Sweillem central stock in Germany.",
    source: "About Us and the company deck",
    href: "/euro-sweillem",
    cta: "About Euro Sweillem",
  },
  {
    title: "Delivery on time",
    text: "Short delivery times are one of our main objectives, with continuous work on delivery time, price and performance.",
    source: "About Us",
  },
  {
    title: "A technical team",
    text: "Full R&D facilities and an efficient technical team, with products kept up to date with the standards of each market.",
    source: "About Us",
    href: "/quality",
    cta: "Quality and standards",
  },
  {
    title: "Certificates for approvals",
    text: "ISO 9001, ISO 14001 and ISO 45001, DIN CERTCO for the joint seals, the SASO quality mark and Cradle to Cradle Certified pipes, to support approvals and tenders.",
    source: "Certificate files, sweillem.net",
    href: "/certificates",
    cta: "View certificates",
  },
  {
    title: "Quotations",
    text: "Build a list of the sizes, classes and quantities your project needs and send it to SWEILLEM in one request.",
    source: "This site",
    href: "/quote",
    cta: "Start a quote list",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="How SWEILLEM supports a project"
        lede="For engineers, contractors and buyers: the pipes, the stock, the delivery and the paperwork a sewer or drainage project needs."
      />

      <section aria-label="Delivery" className="py-[clamp(28px,4vw,48px)]">
        <div className="wrap grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <div className="reveal relative aspect-[16/10] overflow-hidden rounded-card bg-glaze">
            <Image
              src="/images/company/euro-sweillem-26.jpg"
              alt="A crane truck loaded with SWEILLEM pipes"
              fill
              priority
              sizes="(min-width: 640px) 60vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="reveal relative aspect-[16/10] overflow-hidden rounded-card bg-glaze sm:aspect-auto" style={{ "--dl": "120ms" } as CSSProperties}>
            <Image
              src="/images/company/home-about-2.jpg"
              alt="Crated pipes and fittings ready for shipping"
              fill
              sizes="(min-width: 640px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <Section id="services" title="What we do">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <li
              key={s.title}
              className="reveal group grid content-start gap-3 rounded-card border border-line bg-surface p-6"
              style={{ "--dl": `${(i % 3) * 90}ms` } as CSSProperties}
            >
              <span className="font-mono text-xs font-medium tracking-[.12em] text-maroon">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-xl">{s.title}</h3>
              <p className="text-base sm:text-[15px] text-muted">{s.text}</p>
              {s.href && (
                <Link href={s.href} className="link tap w-fit text-base sm:text-[15px]">
                  {s.cta}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <CtaBand title="Do you have a question?" text="Ask SWEILLEM about sizes, classes, joints or delivery for your project." />
    </>
  );
}
