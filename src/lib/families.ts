import { products } from "@content/products";

// Short descriptor under each product family name. Sizes and classes come
// from the published spec tables (content/specs); the rest is the product type.
const descriptors: Record<string, string> = {
  pipes: "DN 125-1000 · N and H class",
  bends: "Fittings",
  junctions: "Fittings",
  "jointing-systems": "Joints",
  "short-pieces": "Fittings",
  "input-clutch-end-plugs": "Fittings",
  "perforated-pipe": "Drainage",
  "u-trap": "Fittings",
  "enlarger-reducer": "Fittings",
  "half-channels": "Channels",
};

// Card picture for each family. Four are the live site's own drawings; the
// other six have no published picture, so they are schematic sections drawn
// in the same style by scripts/draw-product-cards.py (marked drawn: true).
const pictures: Record<string, { alt: string; drawn?: boolean; ext?: "svg" | "webp" }> = {
  pipes: { alt: "Section through a vitrified clay pipe with its socket end", drawn: true },
  bends: { alt: "Section through a bend: a socket end and a curve", drawn: true },
  junctions: { alt: "Section through a junction: a main pipe with a branch at 45 degrees", drawn: true },
  "jointing-systems": { alt: "Section through a joint: a spigot pushed home into a socket with a seal", drawn: true },
  "short-pieces": { alt: "Section through a short piece: a short length of pipe with a socket", drawn: true },
  "input-clutch-end-plugs": { alt: "Section through an end plug sealed into a pipe socket", drawn: true },
  "perforated-pipe": { alt: "Drawing of a perforated pipe, side and end views", ext: "webp" },
  "u-trap": { alt: "Drawing of a U-trap in section", ext: "webp" },
  "enlarger-reducer": { alt: "Drawing of an enlarger in section", ext: "webp" },
  "half-channels": { alt: "Drawing of two half channels", ext: "webp" },
};

export const families = products.map((p) => ({
  slug: p.slug,
  name: p.name,
  href: `/products/${p.slug}`,
  descriptor: descriptors[p.slug] ?? "Fittings",
  state: p.state,
  picture: {
    src: `/images/products/cards/${p.slug}.${pictures[p.slug]?.ext ?? "svg"}`,
    alt: pictures[p.slug]?.alt ?? p.name,
    drawn: pictures[p.slug]?.drawn ?? false,
  },
}));
