// Shared content types. Milestone 1 captures content as published; later
// milestones read these files to build pages, the product explorer and the
// downloads centre.

/** Where a fact came from, so every published claim can be traced. */
export type SourceRef =
  | { kind: "live-site"; url: string }
  | { kind: "deck"; file: "Sweillem vitrified clay pipes.pptx"; slide: number }
  | { kind: "report"; file: "Sweillem vitrified clay pipes and roof tiles.docx"; section: string };

/** Content we hold but must not publish until SWEILLEM confirms it. */
export type Confirmation = "confirmed" | "needs-confirmation" | "do-not-publish";

export type StrengthClass = "N" | "H" | "N/H";

export type SpecColumnKey =
  | "dn"
  | "joint"
  | "angle"
  | "strengthClass"
  | "crushingStrength"
  | "d1"
  | "d3"
  | "wallThickness"
  | "d4"
  | "d7"
  | "bmr"
  | "length"
  | "weight"
  | "aMax"
  | "eMin"
  /** Second nominal size where a table gives the two ends separately (enlarger, reducer). */
  | "dn2"
  /** Tolerances published in their own "max. dev." column. */
  | "d1Dev"
  | "d3Dev"
  /** Perforated pipe: hole diameter "a" and hole counts per perforation system. */
  | "holeDiameter"
  | "mpZ1"
  | "mpZ2"
  | "lpZ1"
  | "lpZ2"
  | "tpZ1"
  | "tpZ2"
  /** Half channels: minimum radius and minimum height. */
  | "rMin"
  | "hMin";

export interface SpecColumn {
  key: SpecColumnKey;
  /** Header text exactly as on the live site, units included. */
  label: string;
}

export interface SpecTable {
  id: string;
  title: string;
  strength: StrengthClass | null;
  /** Short-piece type code (GZ, GA, GE, GM, GU, ÜF) where the page groups by it. */
  section: string | null;
  notes: string[];
  columns: SpecColumn[];
  /** Cell text exactly as published, one string per column. */
  rows: string[][];
}

export interface ProductSpecs {
  product: string;
  title: string;
  source: string;
  captured: string;
  tables: SpecTable[];
}

export type ProductContentState =
  /** Spec tables captured as text in content/specs. */
  | "tables"
  /** Specs exist only as pictures of tables; transcription pending. */
  | "table-images"
  /** A dimension drawing without a table of values. */
  | "drawing"
  /** Live page is empty. */
  | "empty";

export interface Product {
  slug: string;
  name: string;
  liveUrl: string;
  state: ProductContentState;
  /** Local image paths under /public once downloaded (see assets-manifest.json). */
  images: string[];
  notes?: string;
}

export interface Certificate {
  name: string;
  country: string;
  category?: string;
  /** Local path under /public, or an external page for web-only certificates. */
  file?: string;
  externalUrl?: string;
  liveUrl?: string;
  status: "have-file" | "pending-download" | "missing" | "external";
  notes?: string;
}

export interface Location {
  name: string;
  kind: "office" | "plant" | "warehouse" | "agent" | "unknown";
  country: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  source: SourceRef[];
  confirmation: Confirmation;
  notes?: string;
}

export interface Project {
  slug: string;
  name: string;
  country: string;
  region: "Egypt" | "GCC" | "Europe";
  /** Real facts only. Template fields from the live site are dropped. */
  facts: string[];
  images: string[];
  liveUrl?: string;
  source: SourceRef[];
  confirmation: Confirmation;
}

export interface Fact {
  id: string;
  text: string;
  source: SourceRef[];
  confirmation: Confirmation;
  notes?: string;
}

/**
 * One certificate as printed on the scan or PDF SWEILLEM publishes. Every
 * field is transcribed from the document itself; dates are ISO (YYYY-MM-DD).
 */
export interface CertificateRecord {
  id: string;
  /** The standard or mark, as printed (e.g. "ISO 9001:2015"). */
  standard: string;
  /** What the certificate covers, in plain words. */
  title: string;
  issuer: string;
  number: string;
  /** Scope or product line as printed. */
  scope: string;
  issued: string;
  /** Expiry date printed on this copy. */
  validUntil: string;
  /** Preview image under /public. */
  image: string;
  /** Downloadable PDF under /public, when SWEILLEM publishes one. */
  file?: string;
  externalUrl?: string;
  kind: "management" | "product";
  notes?: string;
}
