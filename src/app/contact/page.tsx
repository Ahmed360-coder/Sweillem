import type { ReactNode } from "react";
import Link from "next/link";
import { company } from "@content/company";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { SourceNote } from "@/components/SourceNote";
import { QuoteIcon } from "@/components/icons";
import { formsEnabled } from "@/lib/enquiry-server";
import { locations } from "@/lib/locations";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Contact SWEILLEM Vitrified Clay Pipes Co. in Cairo by email, phone or message about pipes, fittings, roof tiles and quotations.",
  path: "/contact",
});

const [mobile, ...landlines] = company.phones;
const mobileDigits = mobile.replace(/\D/g, "").replace(/^2?0?/, "");
const office = locations[0];

function mapsHref(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-line py-4 first:border-t-0 first:pt-0">
      <dt className="font-mono text-[12px] font-medium tracking-[.12em] text-muted uppercase">{label}</dt>
      <dd className="text-[17px]">{children}</dd>
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to SWEILLEM"
        lede="Ask about pipes, fittings, roof tiles or certificates. For prices, send a quote list with sizes and quantities."
      />

      <div className="wrap grid gap-10 py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="grid gap-5">
          <section aria-labelledby="reach-title" className="rounded-card border border-line bg-surface p-[clamp(18px,3vw,28px)]">
            <h2 id="reach-title" className="mb-4 text-2xl">
              Cairo office
            </h2>
            <dl>
              <Row label="Email">
                <a href={`mailto:${company.email}`} className="break-all">
                  {company.email}
                </a>
              </Row>
              <Row label="Phone">
                <a href={`tel:+20${mobileDigits}`} className="whitespace-nowrap">
                  {mobile}
                </a>
                <span className="mt-1 block text-[15px] text-muted">Also {landlines.join(", ")}</span>
              </Row>
              <Row label="Address">
                {office.address}
                <a href={mapsHref(office.address)} target="_blank" rel="noopener" className="mt-1 block w-fit text-[15px]">
                  Find it on Google Maps<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Row>
            </dl>
            <SourceNote className="mt-4">Source: Contact Us on sweillem.net.</SourceNote>
          </section>

          <Link
            href="/quote"
            className="group grid grid-cols-[auto_1fr] items-center gap-4 rounded-card border border-line bg-surface p-5 text-ink no-underline transition-colors hover:border-ink"
          >
            <span className="hex grid size-12 place-items-center bg-sunk text-maroon" aria-hidden="true">
              <QuoteIcon className="size-5" />
            </span>
            <span className="grid gap-0.5">
              <span className="font-semibold">Asking for prices?</span>
              <span className="text-[15px] text-muted">Collect sizes in the quote list and send them as one request.</span>
            </span>
          </Link>
        </div>

        <section aria-labelledby="message-title" className="grid gap-5 rounded-card border border-line bg-surface p-[clamp(18px,3vw,32px)]">
          <div className="grid gap-2">
            <h2 id="message-title" className="text-2xl">
              Send a message
            </h2>
            <p className="text-muted">Leave an email address so SWEILLEM can reply.</p>
          </div>
          <EnquiryForm kind="contact" enabled={formsEnabled()} />
        </section>
      </div>

      <Section id="places" title="Other SWEILLEM places" lede="Addresses as SWEILLEM publishes them on its site and certificates.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.slice(1).map((l) => (
            <li key={l.name + l.kind} className="grid content-start gap-2 rounded-card border border-line bg-surface p-5">
              <span className="font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">{l.kind}</span>
              <h3 className="text-lg">{l.name}</h3>
              <p className="text-base sm:text-[15px]">{l.address}</p>
              {l.kind === "Europe" && (
                <Link href="/euro-sweillem" className="w-fit text-[15px]">
                  About Euro Sweillem
                </Link>
              )}
              <SourceNote>Source: {l.source}</SourceNote>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
