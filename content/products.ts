import type { Product, ProductSpecs } from "./types";
import pipes from "./specs/pipes.json" with { type: "json" };
import bends from "./specs/bends.json" with { type: "json" };
import junctions from "./specs/junctions.json" with { type: "json" };
import shortPieces from "./specs/short-pieces.json" with { type: "json" };
import perforatedPipe from "./specs/perforated-pipe.json" with { type: "json" };
import enlargerReducer from "./specs/enlarger-reducer.json" with { type: "json" };
import halfChannels from "./specs/half-channels.json" with { type: "json" };

/** The ten product pages on the live site, in its menu order. */
export const products: Product[] = [
  { slug: "pipes", name: "Pipes", liveUrl: "https://sweillem.net/pipes/", state: "tables", images: [] },
  { slug: "bends", name: "Bends", liveUrl: "https://sweillem.net/bends/", state: "tables", images: [] },
  { slug: "junctions", name: "Junctions", liveUrl: "https://sweillem.net/junctions/", state: "tables", images: [] },
  {
    slug: "jointing-systems",
    name: "Jointing Systems",
    liveUrl: "https://sweillem.net/jointing-systems/",
    state: "empty",
    images: [],
    notes: "Live page is empty. Joint types C and F and the polyurethane joint (67 ± 5 Shore A) are described on Joint Performance.",
  },
  { slug: "short-pieces", name: "Short Pieces", liveUrl: "https://sweillem.net/short-pieces/", state: "tables", images: [] },
  {
    slug: "input-clutch-end-plugs",
    name: "Input clutch & End plugs",
    liveUrl: "https://sweillem.net/input-clutch-end-plugs/",
    state: "empty",
    images: [],
  },
  {
    slug: "perforated-pipe",
    name: "Perforated Pipe",
    liveUrl: "https://sweillem.net/perforated-pipe/",
    state: "tables",
    images: ["/images/products/perforated-pipe-drawing.jpg"],
    notes: "Legend: a = the diameter of hole; Z1 = no. of holes per piece (radial); Z2 = no. of holes per piece (longitudinal).",
  },
  {
    slug: "u-trap",
    name: "U-Trap",
    liveUrl: "https://sweillem.net/u-trap/",
    state: "drawing",
    images: ["/images/products/u-trap.jpg"],
    notes: "The live page holds a dimension drawing (DN2 d8, d4, d3, A, B, M1) and no table of values.",
  },
  {
    slug: "enlarger-reducer",
    name: "Enlarger and Reducer",
    liveUrl: "https://sweillem.net/enlarger-reducer/",
    state: "tables",
    // Paired by what each drawing shows; the live page has them under the wrong headings.
    images: ["/images/products/enlarger-drawing.jpg", "/images/products/reducer-drawing.jpg"],
  },
  {
    slug: "half-channels",
    name: "Half Channels",
    liveUrl: "https://sweillem.net/half-channels/",
    state: "tables",
    images: ["/images/products/half-channel-drawing.jpg"],
    notes: 'Published as "Half Channels 1 8 0 ⁰" (180°).',
  },
];

/** Spec tables captured as text, keyed by product slug. */
export const productSpecs: Record<string, ProductSpecs> = {
  pipes: pipes as ProductSpecs,
  bends: bends as ProductSpecs,
  junctions: junctions as ProductSpecs,
  "short-pieces": shortPieces as ProductSpecs,
  "perforated-pipe": perforatedPipe as ProductSpecs,
  "enlarger-reducer": enlargerReducer as ProductSpecs,
  "half-channels": halfChannels as ProductSpecs,
};
