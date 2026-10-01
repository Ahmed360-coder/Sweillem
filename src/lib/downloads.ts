// Everything on the Downloads page, built at build time from content/. Each
// entry is a file we hold, a page that prints as a spec sheet, or a document
// SWEILLEM names but has never published (shown as not available, never as a
// link). File sizes are read from public/ so they are always right.
import { statSync } from "node:fs";
import path from "node:path";
import { certificateRecords, certificates } from "@content/certificates";
import { productSpecs, products } from "@content/products";
import { dnRange } from "./specs";

export type DownloadKind = "certificate" | "spec-sheet" | "document";

export interface DownloadAction {
  label: string;
  href: string;
  /** "PDF · 198 KB", "Image · 310 KB", "Web page". */
  format: string;
  external?: boolean;
  download?: boolean;
}

export interface DownloadItem {
  id: string;
  kind: DownloadKind;
  title: string;
  /** One line under the title: what it is and who issued it. */
  detail: string;
  country?: string;
  /** Validity, or why there is no file. */
  note?: string;
  status: "available" | "expired" | "unavailable";
  actions: DownloadAction[];
  /** Extra words the search matches (numbers, standards, issuers). */
  keywords: string;
}

export const kindLabels: Record<DownloadKind, string> = {
  certificate: "Certificates",
  "spec-sheet": "Spec sheets",
  document: "Catalogue and policy",
};

function size(publicPath: string): string {
  const bytes = statSync(path.join(process.cwd(), "public", publicPath)).size;
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;
}

const date = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// Pages are built ahead of time, so "today" is the build date. Each deploy refreshes it.
const builtOn = new Date().toISOString().slice(0, 10);

const countryOf: Record<string, string> = {
  "din-certco": "Germany",
  saso: "Saudi Arabia",
  "cradle-to-cradle": "Global",
};

/** The country names on the old Downloads table, written out in full. */
const countryName: Record<string, string> = { French: "France", KSA: "Saudi Arabia" };

const certificateItems: DownloadItem[] = certificateRecords.map((c) => {
  const lapsed = c.validUntil < builtOn;
  const actions: DownloadAction[] = [];
  if (c.file) actions.push({ label: "Download PDF", href: c.file, format: `PDF · ${size(c.file)}`, download: true });
  else actions.push({ label: "View the scan", href: c.image, format: `Image · ${size(c.image)}` });
  if (c.externalUrl) actions.push({ label: "Check the C2C registry", href: c.externalUrl, format: "Web page", external: true });
  return {
    id: c.id,
    kind: "certificate",
    title: c.standard,
    detail: `${c.title}. Issued by ${c.issuer}, number ${c.number}.`,
    country: countryOf[c.id] ?? "Egypt",
    note: lapsed
      ? `Valid until ${date(c.validUntil)}. This copy has passed its date; ask SWEILLEM for the current one.`
      : `Valid until ${date(c.validUntil)}.`,
    status: lapsed ? "expired" : "available",
    actions,
    keywords: `${c.scope} ${c.kind === "management" ? "management system ISO" : "product"}`,
  };
});

/** The six rows of the old Downloads table whose links went to "https://eg". */
const brokenItems: DownloadItem[] = certificates
  .filter((c) => c.status === "missing")
  .map((c) => ({
    id: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    kind: "certificate",
    title: c.name,
    detail: "Approval named on the old Downloads page.",
    country: countryName[c.country] ?? c.country,
    note: "Its link on the old site was broken, so there is no file to offer yet.",
    status: "unavailable",
    actions: [],
    keywords: "approval",
  }));

const specItems: DownloadItem[] = products
  .filter((p) => productSpecs[p.slug])
  .map((p) => {
    const spec = productSpecs[p.slug];
    const [lo, hi] = dnRange(spec);
    const tables = spec.tables.length;
    return {
      id: `spec-${p.slug}`,
      kind: "spec-sheet",
      title: `${p.name} spec sheet`,
      detail: `${lo === hi ? `DN ${lo}` : `DN ${lo} to ${hi}`}, ${tables} ${tables === 1 ? "table" : "tables"}. The product page prints as an A4 spec sheet, or saves as a PDF from the print dialog.`,
      status: "available",
      actions: [{ label: "Open to print", href: `/products/${p.slug}#specifications`, format: "Printable page" }],
      keywords: `${p.slug} dimensions sizes table EN 295`,
    };
  });

const documentItems: DownloadItem[] = [
  {
    id: "catalogue-2024",
    kind: "document",
    title: "Product catalogue 2024",
    detail: "SWEILLEM’s catalogue, named on the old home page.",
    note: "No file was ever linked to it. Until SWEILLEM publishes one, the spec sheets above list every size it publishes.",
    status: "unavailable",
    actions: [],
    keywords: "catalog brochure",
  },
  {
    id: "quality-policy",
    kind: "document",
    title: "Quality policy",
    detail: "SWEILLEM’s quality policy, named on the old home page.",
    note: "No file was ever linked to it.",
    status: "unavailable",
    actions: [],
    keywords: "quality",
  },
];

export const downloads: DownloadItem[] = [...certificateItems, ...brokenItems, ...specItems, ...documentItems];
