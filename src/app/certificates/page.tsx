import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { certificateRecords } from "@content/certificates";
import type { CertificateRecord } from "@content/types";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/Section";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Certificates",
  description:
    "SWEILLEM certificates: ISO 9001, ISO 14001 and ISO 45001, DIN CERTCO for joint seals to EN 295, the SASO quality mark and Cradle to Cradle Certified Bronze.",
  path: "/certificates",
});

const date = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Pages are built ahead of time, so "today" is the build date. Each deploy refreshes it.
const builtOn = new Date().toISOString().slice(0, 10);

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-3 py-1.5 text-[14px]">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

function CertificateCard({ c, i }: { c: CertificateRecord; i: number }) {
  const lapsed = c.validUntil < builtOn;
  const landscape = /cradle|9001-2015-scan|asr/.test(c.image);
  return (
    <li
      className="reveal grid content-start overflow-hidden rounded-card border border-line bg-surface"
      style={{ "--dl": `${(i % 3) * 80}ms` } as CSSProperties}
    >
      <a
        href={c.image}
        target="_blank"
        rel="noopener"
        className="group relative block aspect-[4/3] overflow-hidden border-b border-line bg-sunk"
        aria-label={`Open the ${c.standard} certificate image`}
      >
        <Image
          src={c.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className={`transition-transform duration-500 ease-glaze group-hover:scale-[1.03] ${
            landscape ? "object-contain p-3" : "object-cover object-top"
          }`}
        />
      </a>
      <div className="grid gap-3 p-5">
        <div className="grid gap-1">
          <span className="font-mono text-[12px] font-medium tracking-[.12em] text-maroon uppercase">{c.title}</span>
          <h3 className="text-xl">{c.standard}</h3>
        </div>
        <dl className="divide-y divide-line border-y border-line">
          <Field label="Issued by">{c.issuer}</Field>
          <Field label="Number">
            <span className="font-mono">{c.number}</span>
          </Field>
          <Field label="Covers">{c.scope}</Field>
          <Field label="Issued">{date(c.issued)}</Field>
          <Field label="Valid until">
            {date(c.validUntil)}
            {lapsed && (
              <span className="mt-1 block text-[13px] text-warn">
                This copy has passed its date. Ask SWEILLEM for the current one.
              </span>
            )}
          </Field>
        </dl>
        {c.notes && <p className="text-base text-muted sm:text-[13px]">{c.notes}</p>}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {c.file && (
            <a href={c.file} className="link tap text-base sm:text-[15px]" download>
              Download PDF
            </a>
          )}
          {c.externalUrl && (
            <a href={c.externalUrl} className="link tap text-base sm:text-[15px]" target="_blank" rel="noopener noreferrer">
              Check the C2C registry
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export default function CertificatesPage() {
  const product = certificateRecords.filter((c) => c.kind === "product");
  const management = certificateRecords.filter((c) => c.kind === "management");
  return (
    <>
      <PageHeader
        eyebrow="Certificates"
        title="Certificates"
        lede="Every SWEILLEM certificate, with its issuer, number and dates. Open any one to see the full copy."
      />

      <Section id="product" title="Product certificates" lede="For the pipes and their joint seals.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {product.map((c, i) => (
            <CertificateCard key={c.id} c={c} i={i} />
          ))}
        </ul>
      </Section>

      <Section
        id="management"
        title="Management systems"
        lede="ISO 9001, ISO 14001 and ISO 45001. We are certified by two certification bodies, and both sets are listed."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {management.map((c, i) => (
            <CertificateCard key={c.id} c={c} i={i} />
          ))}
        </ul>
      </Section>

      <section aria-labelledby="more-title" className="pb-[clamp(24px,4vw,48px)]">
        <div className="wrap">
          <div className="grid gap-2 rounded-card border border-dashed border-line p-[clamp(20px,3vw,28px)]">
            <h2 id="more-title" className="text-lg">
              Looking for another approval?
            </h2>
            <p className="max-w-[70ch] text-base sm:text-[15px] text-muted">
              SWEILLEM also names approvals in Belgium, the Czech Republic, Egypt, France, the Netherlands and Singapore. They
              are added here as soon as the files are available. Until then,{" "}
              <Link href="/contact" className="link">
                ask SWEILLEM
              </Link>{" "}
              for a copy.
            </p>
          </div>
        </div>
      </section>

      <CtaBand title="Need certificates for a tender?" text="Add the pipes to a quote list and say which approvals your project needs." />
    </>
  );
}
