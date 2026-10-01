// Builds src/lib/map-places.json for the projects map in the header: where
// each project and SWEILLEM address sits on the export map, and the zoom for
// each region. Run after build-reach-map.mjs: node scripts/build-map-places.mjs
// Points are city centres (or a country's centre where only the country is
// known), on the same projection as the export map.
import { readFileSync, writeFileSync } from "node:fs";
import { H, ORIGIN, W, makeProjection } from "./map-projection.mjs";

const map = JSON.parse(readFileSync("src/lib/reach-map.json", "utf8"));
const projection = makeProjection();
const r1 = (n) => Math.round(n * 10) / 10;
const at = ([lng, lat]) => {
  const [x, y] = projection([lng, lat]);
  return { x: r1(x), y: r1(y) };
};
const market = (name) => {
  const m = map.markets.find((m) => m.name === name);
  if (!m) throw new Error(`No market ${name}`);
  return { x: m.x, y: m.y };
};

// [longitude, latitude]
const places = {
  cairo: at(ORIGIN),
  "haram-central-area-makkah": at([39.826, 21.4225]),
  "sharurah-drainage": at([47.117, 17.467]),
  "new-alamein-city": at([28.9, 30.83]),
  // Only the country is known for the site in Germany.
  germany: market("Germany"),
  brueggen: at([6.183, 51.24]),
  jeddah: at([39.193, 21.486]),
};

// Each region frames its places and the markets SWEILLEM names there.
const regions = {
  europe: {
    places: ["germany", "brueggen"],
    markets: ["Germany", "Belgium", "Holland", "Czech Republic", "Italy", "Poland", "Romania", "Hungary", "Greece"],
  },
  "middle-east": {
    places: ["cairo", "new-alamein-city", "haram-central-area-makkah", "sharurah-drainage", "jeddah"],
    markets: ["Saudi Arabia", "Qatar"],
  },
  "far-east": { places: [], markets: ["Singapore", "Hong Kong", "Brunei"] },
};

/** Room around a region's points, in map units at the region's zoom. */
const PAD = 54;
const MAX_ZOOM = 3.6;
const views = { world: { k: 1, tx: 0, ty: 0 } };
for (const [id, r] of Object.entries(regions)) {
  const pts = [...r.places.map((p) => places[p]), ...r.markets.map(market)];
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // The padding stays the same on screen, so solve for the zoom with it included.
  const k = Math.min(MAX_ZOOM, (W - 2 * PAD) / Math.max(x1 - x0, 1), (H - 2 * PAD) / Math.max(y1 - y0, 1));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const tx = clamp(W / 2 - k * ((x0 + x1) / 2), W - k * W, 0);
  const ty = clamp(H / 2 - k * ((y0 + y1) / 2), H - k * H, 0);
  views[id] = { k: Math.round(k * 100) / 100, tx: r1(tx), ty: r1(ty) };
}

writeFileSync("src/lib/map-places.json", `${JSON.stringify({ places, views }, null, 2)}\n`);
console.log(JSON.stringify(views));
