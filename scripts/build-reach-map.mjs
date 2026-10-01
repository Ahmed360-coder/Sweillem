// Builds src/lib/reach-map.json, the export map on About, from Natural Earth
// country shapes (world-atlas). Run: node scripts/build-reach-map.mjs
// Only the countries SWEILLEM names on its About page are highlighted.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoAzimuthalEqualArea, geoPath, geoInterpolate, geoCentroid } from "d3-geo";
import { feature, mesh, merge } from "topojson-client";

const require = createRequire(import.meta.url);
const load = (f) => JSON.parse(readFileSync(require.resolve(`world-atlas/${f}`), "utf8"));
// The base map uses the coarse 110m shapes; the markets use 50m, which also has
// the small ones (Singapore, Hong Kong, Brunei).
const coarse = load("countries-110m.json");
const world = load("countries-50m.json");

const W = 1000;
const H = 620;
/** Cairo, where the pipes leave from. */
const ORIGIN = [31.24, 30.04];

// Order of the list on sweillem.net/about-us. ids are ISO 3166 numeric.
export const MARKETS = [
  { name: "Germany", id: "276" },
  { name: "Belgium", id: "056" },
  { name: "Holland", id: "528" },
  { name: "Czech Republic", id: "203" },
  { name: "Italy", id: "380" },
  { name: "Poland", id: "616" },
  { name: "Romania", id: "642" },
  { name: "Hungary", id: "348" },
  { name: "Saudi Arabia", id: "682" },
  { name: "Qatar", id: "634" },
  { name: "Greece", id: "300" },
  { name: "Singapore", id: "702" },
  { name: "Hong Kong", id: "344" },
  { name: "Brunei", id: "096" },
];

const all = feature(world, world.objects.countries).features;
const byId = new Map(all.map((f) => [String(f.id).padStart(3, "0"), f]));
for (const m of MARKETS) if (!byId.has(m.id)) throw new Error(`No shape for ${m.name}`);

// Equal-area view centred near Egypt, fitted so Europe and the Far East both fit.
const projection = geoAzimuthalEqualArea().rotate([-52, -34]);
projection.fitExtent(
  [
    [24, 24],
    [W - 24, H - 24],
  ],
  { type: "MultiPoint", coordinates: [[-9.5, 56], [24, 58], [118, 23], [104, 0.5], [116, 3.5], [5, 37], [52, 15]] },
);
projection.clipExtent([
  [0, 0],
  [W, H],
]);
const path = geoPath(projection).digits(1);
const r1 = (n) => Math.round(n * 10) / 10;

// Land as one shape, borders as one thin line: two paths for the whole base map.
const land = path(merge(coarse, coarse.objects.countries.geometries));
const borders = path(mesh(coarse, coarse.objects.countries, (a, b) => a !== b));

const [ox, oy] = projection(ORIGIN);
const egypt = path(byId.get("818"));

const markets = MARKETS.map((m) => {
  const f = byId.get(m.id);
  const c = geoCentroid(f);
  const [x, y] = projection(c);
  // A great-circle route from Cairo, lifted into an arc so it reads as a shipment.
  const interp = geoInterpolate(ORIGIN, c);
  const pts = Array.from({ length: 33 }, (_, i) => projection(interp(i / 32)));
  const dx = x - ox;
  const dy = y - oy;
  const len = Math.hypot(dx, dy) || 1;
  const lift = Math.min(90, len * 0.22);
  const arc = pts
    .map(([px, py], i) => {
      const t = i / 32;
      const h = Math.sin(Math.PI * t) * lift;
      // Lift sideways from the straight line: always "up" on screen.
      const nx = dy / len;
      const ny = -dx / len;
      const s = ny > 0 ? -1 : 1;
      return `${i ? "L" : "M"}${r1(px + nx * h * s)},${r1(py + ny * h * s)}`;
    })
    .join("");
  return { name: m.name, id: m.id, d: path(f), x: r1(x), y: r1(y), arc };
});

const out = { width: W, height: H, land, borders, egypt, origin: { x: r1(ox), y: r1(oy) }, markets };
writeFileSync("src/lib/reach-map.json", JSON.stringify(out));
console.log(`reach-map.json: ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
