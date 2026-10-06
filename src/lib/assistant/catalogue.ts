import { productSpecs, products } from "@content/products";
import { rowSize, tableTitle } from "@/lib/specs";

// Everything the assistant may put on a visitor's quote list: one entry per
// published spec table, with its sizes, plus the roof tile colours. Lines are
// built exactly as the "Add to quote" buttons on the product pages build them,
// so a line the assistant adds matches one added by hand.

export interface QuoteLine {
  product: string;
  size: string;
  strengthClass?: string;
}

export interface CatalogueEntry {
  /** Spec table id, or "roof-tiles". */
  id: string;
  /** What the quote list shows, e.g. "Pipes, Pipes · H class, extra strength". */
  product: string;
  /** Product page the entry comes from. */
  path: string;
  strengthClass?: string;
  /** Sizes as the list shows them after "DN ", or tile colours. */
  sizes: string[];
  /** True when sizes are colours, not DN. */
  colours?: boolean;
}

// Same names as tileColours in RoofTileViewer (a client module, so not imported here).
const ROOF_TILE_COLOURS = ["Terracotta", "Blue", "Black"];

export const catalogue: CatalogueEntry[] = [
  ...products.flatMap((p) =>
    (productSpecs[p.slug]?.tables ?? []).map((t) => ({
      id: t.id,
      product: `${p.name}, ${tableTitle(t)}`,
      path: `/products/${p.slug}#${t.id}`,
      strengthClass: t.strength ?? undefined,
      sizes: [...new Set(t.rows.map((r) => rowSize(t, r)))],
    })),
  ),
  { id: "roof-tiles", product: "Clay roof tiles", path: "/roof-tiles", sizes: ROOF_TILE_COLOURS, colours: true },
];

const bare = (s: string) =>
  s
    .replace(/^\s*DN\s*/i, "")
    .replace(/\s+/g, "")
    .toLowerCase();

/** The quote line for a table and size, or an error the model can act on. */
export function resolveLine(id: string, size: string): { line: QuoteLine } | { error: string } {
  const entry = catalogue.find((e) => e.id === id);
  if (!entry) return { error: `Unknown table "${id}".` };
  const match = entry.sizes.find((s) => bare(s) === bare(size));
  if (!match) return { error: `${entry.product} has no size "${size}". Published sizes: ${entry.sizes.join(", ")}.` };
  return {
    line: entry.colours ? { product: entry.product, size: match } : { product: entry.product, size: `DN ${match}`, strengthClass: entry.strengthClass },
  };
}

/** Compact list for the model's instructions. */
export function catalogueText() {
  return catalogue.map((e) => `- ${e.id}: ${e.product} (${e.path}). ${e.colours ? "Colours" : "DN sizes"}: ${e.sizes.join(", ")}`).join("\n");
}
