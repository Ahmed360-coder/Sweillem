import { productSpecs, products } from "@content/products";
import type { Product } from "@content/types";
import { families } from "./families";
import { classNames, dnRange, jointsOf, strengthsOf } from "./specs";

// Page-level details for each product page. Everything is taken from the
// live product pages or computed from their tables; nothing is described
// that SWEILLEM does not publish (docs/content-gaps.md 5.1, 5.6).

export interface Drawing {
  src: string;
  alt: string;
  caption: string;
  /** Spec table id the drawing belongs next to. */
  forTable?: string;
  width: number;
  height: number;
}

interface PageExtras {
  drawings?: Drawing[];
  /** Legend printed on the live page, verbatim. */
  legend?: { term: string; text: string }[];
  /** True when the tables were typed out from pictures of tables. */
  transcribed?: boolean;
}

const extras: Record<string, PageExtras> = {
  "perforated-pipe": {
    transcribed: true,
    drawings: [
      {
        src: "/images/products/perforated-pipe-drawing.jpg",
        alt: "Drawing of a perforated pipe: side view with rows of holes along length L1, outer diameter d3, inner diameter d1, and an end view of the MP system",
        caption: "Perforated pipe, side view and end view (MP system). Drawing from sweillem.net.",
        width: 1000,
        height: 260,
      },
    ],
    legend: [
      { term: "a", text: "The diameter of hole" },
      { term: "Z1", text: "No. of holes per piece (radial)" },
      { term: "Z2", text: "No. of holes per piece (longitudinal)" },
    ],
  },
  "enlarger-reducer": {
    transcribed: true,
    drawings: [
      {
        src: "/images/products/enlarger-drawing.jpg",
        alt: "Drawing of an enlarger in section: a socket at nominal size DN1 widening to a larger DN2",
        caption: "Enlarger: DN1 widens to DN2. Drawing from sweillem.net.",
        forTable: "enlarger",
        width: 513,
        height: 248,
      },
      {
        src: "/images/products/reducer-drawing.jpg",
        alt: "Drawing of a reducer in section: a socket at nominal size DN1 narrowing to a smaller DN2",
        caption: "Reducer: DN1 narrows to DN2. Drawing from sweillem.net.",
        forTable: "reducers",
        width: 913,
        height: 408,
      },
    ],
  },
  "half-channels": {
    transcribed: true,
    drawings: [
      {
        src: "/images/products/half-channel-drawing.jpg",
        alt: "Drawing of two half channels showing nominal size DN, radius R, height H, wall s and length L",
        caption: "Half channels 180°: DN, R, H, s and L. Drawing from sweillem.net.",
        width: 850,
        height: 290,
      },
    ],
  },
  "u-trap": {
    drawings: [
      {
        src: "/images/products/u-trap.jpg",
        alt: "Section drawing of a U-trap with dimensions DN2 d8, d4, d3, A, B and M1 marked",
        caption: "U-trap in section, with its dimension letters. Drawing from sweillem.net.",
        width: 1000,
        height: 845,
      },
    ],
  },
};

export interface ProductPage {
  product: Product;
  family: (typeof families)[number];
  spec: (typeof productSpecs)[string] | undefined;
  drawings: Drawing[];
  legend: { term: string; text: string }[];
  transcribed: boolean;
  /** One factual sentence built from the tables. */
  summary: string;
  facts: { label: string; value: string }[];
}

const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

export function productPage(slug: string): ProductPage | undefined {
  const product = products.find((p) => p.slug === slug);
  const family = families.find((f) => f.slug === slug);
  if (!product || !family) return undefined;
  const spec = productSpecs[slug];
  const x = extras[slug] ?? {};
  const facts: ProductPage["facts"] = [];
  let summary: string;

  if (spec) {
    const [lo, hi] = dnRange(spec);
    const strengths = strengthsOf(spec).filter((s) => s !== "N/H");
    const joints = jointsOf(spec);
    const rows = spec.tables.reduce((n, t) => n + t.rows.length, 0);
    facts.push({ label: "Nominal sizes", value: lo === hi ? `DN ${lo}` : `DN ${lo} to ${hi}` });
    if (strengths.length) facts.push({ label: "Strength classes", value: strengths.map((s) => `${s} (${classNames[s].long.toLowerCase()})`).join(", ") });
    if (joints.length) facts.push({ label: "Joint types", value: list(joints) });
    facts.push({ label: "Specification rows", value: `${rows} in ${spec.tables.length} ${spec.tables.length === 1 ? "table" : "tables"}` });
    summary = `${product.name} in nominal sizes DN ${lo} to ${hi}${
      strengths.length === 2 ? ", in normal (N) and extra (H) strength classes" : ""
    }. Every size SWEILLEM publishes is listed below, with its dimensions${joints.length ? " and joint type" : ""}.`;
  } else if (product.state === "drawing") {
    summary = `SWEILLEM publishes a dimension drawing for the ${product.name.toLowerCase()} but no table of sizes yet.`;
  } else {
    summary = `SWEILLEM lists ${product.name.toLowerCase()} among its products but has not published a description or sizes yet.`;
  }

  return {
    product,
    family,
    spec,
    drawings: x.drawings ?? [],
    legend: x.legend ?? [],
    transcribed: x.transcribed ?? false,
    summary,
    facts,
  };
}
