import { products } from "@content/products";

// Short descriptor under each product family name. Sizes and classes come
// from the published spec tables (content/specs); the rest is the product type.
const descriptors: Record<string, string> = {
  pipes: "DN 125–1000 · N and H class",
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

export const families = products.map((p) => ({
  slug: p.slug,
  name: p.name,
  href: `/products/${p.slug}`,
  descriptor: descriptors[p.slug] ?? "Fittings",
  state: p.state,
}));
