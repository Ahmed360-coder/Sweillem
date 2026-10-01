import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { DownloadCentre } from "@/components/DownloadCentre";
import { PageHeader } from "@/components/PageHeader";
import { downloads, kindLabels } from "@/lib/downloads";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Downloads",
  description:
    "Download SWEILLEM certificates (ISO 9001, ISO 14001, ISO 45001, DIN CERTCO, SASO, Cradle to Cradle) and printable spec sheets for every pipe and fitting.",
  path: "/downloads",
});

export default function DownloadsPage() {
  const files = downloads.filter((d) => d.status !== "unavailable").length;
  return (
    <>
      <PageHeader
        eyebrow="Downloads"
        title="Certificates and spec sheets"
        lede={`Everything SWEILLEM publishes, in one searchable list: ${files} files and spec sheets you can open now, and the documents that are still to come, marked as such.`}
      >
        <p className="max-w-[70ch] text-base text-muted sm:text-[15px]">
          For each certificate’s issuer, number and scope in full, see{" "}
          <Link href="/certificates" className="link">
            Certificates
          </Link>
          .
        </p>
      </PageHeader>

      <section aria-label="Downloads" className="py-[clamp(32px,5vw,64px)]">
        <div className="wrap">
          <DownloadCentre items={downloads} kinds={kindLabels} />
        </div>
      </section>

      <CtaBand title="Need a document for a tender?" text="Add the pipes to a quote list and say which certificates and approvals your project needs." />
    </>
  );
}
