// Builds the export map on About:
//   src/lib/export-map.json                  vector layer (countries, labels, routes)
//   public/images/company/export-map-borders.svg  coast and border lines (a static file, so the
//                                                About page doesn't carry 110 KB of paths twice)
//   public/images/company/export-map-night.webp  night satellite background
// Run: node scripts/build-export-map.mjs
//
// Country shapes: Natural Earth 50m (world-atlas). Night imagery: NASA's
// "Earth at night", as shipped in the three-globe package (scripts/assets/).
// The main view is Europe and the Middle East, like SWEILLEM's own map; the
// Far East markets sit in an inset box with its own projection.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoArea, geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import { presimplify, simplify } from "topojson-simplify";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const raw = JSON.parse(readFileSync(require.resolve("world-atlas/countries-50m.json"), "utf8"));
// Drop detail finer than the map can show: at about 20 px a degree, triangles
// under 0.0015 square degrees are well under a pixel.
const world = simplify(presimplify(raw), 0.0015);

const W = 1400;
const H = 820;
/** Cairo, where the pipes leave from. */
const ORIGIN = [31.24, 30.04];
/** The Far East inset, in map pixels. */
const INSET = { x: 1092, y: 18, w: 290, h: 330 };

// SWEILLEM's markets. "about" = named on the About Us page (in its order);
// "map" = filled red on the map SWEILLEM publishes on its site.
// Label offsets (dx, dy, in map pixels) move a few names off crowded borders.
const MARKETS = [
  { name: "Germany", id: "276", source: "about" },
  { name: "Belgium", id: "056", source: "about", dx: -26, dy: 4 },
  { name: "Holland", id: "528", source: "about", dx: -6, dy: -8 },
  { name: "Czech Republic", id: "203", source: "about" },
  { name: "Italy", id: "380", source: "about", dx: -18, dy: -38 },
  { name: "Poland", id: "616", source: "about" },
  { name: "Romania", id: "642", source: "about" },
  { name: "Hungary", id: "348", source: "about" },
  { name: "Saudi Arabia", id: "682", source: "about" },
  { name: "Qatar", id: "634", source: "about", dx: 26, dy: 0 },
  { name: "Greece", id: "300", source: "about", dx: -10, dy: -10 },
  { name: "Singapore", id: "702", source: "about", inset: true },
  { name: "Hong Kong", id: "344", source: "about", inset: true },
  { name: "Brunei", id: "096", source: "about", inset: true },
  { name: "France", id: "250", source: "map" },
  { name: "Spain", id: "724", source: "map" },
  { name: "Austria", id: "040", source: "map", dy: 2 },
  { name: "Bulgaria", id: "100", source: "map" },
  { name: "Syria", id: "760", source: "map" },
  { name: "Lebanon", id: "422", source: "map", dx: -34, dy: 4 },
  { name: "Jordan", id: "400", source: "map", dy: 6 },
  { name: "Kuwait", id: "414", source: "map", dx: 4, dy: -14 },
];

const all = feature(world, world.objects.countries).features;
const byId = new Map(all.map((f) => [String(f.id).padStart(3, "0"), f]));
for (const m of MARKETS) if (!byId.has(m.id)) throw new Error(`No shape for ${m.name}`);

// Main view: Spain to the Gulf, Poland to the Red Sea, like SWEILLEM's map.
const main = geoMercator().fitExtent(
  [
    [0, 0],
    [W, H],
  ],
  { type: "MultiPoint", coordinates: [[-10.2, 44], [24, 56.2], [57.5, 30], [44, 20.5], [-9, 36]] },
);
main.clipExtent([
  [0, 0],
  [W, H],
]);

// Inset: Hong Kong, Brunei and Singapore.
const inset = geoMercator().fitExtent(
  [
    [INSET.x + 18, INSET.y + 44],
    [INSET.x + INSET.w - 18, INSET.y + INSET.h - 18],
  ],
  { type: "MultiPoint", coordinates: [[102.5, 23.5], [117.5, 23.5], [102.5, 0.4], [117.5, 0.4]] },
);
inset.clipExtent([
  [INSET.x, INSET.y],
  [INSET.x + INSET.w, INSET.y + INSET.h],
]);

const mainPath = geoPath(main).digits(1);
const insetPath = geoPath(inset).digits(1);
const r1 = (n) => Math.round(n * 10) / 10;

// White coast and border lines, as on the night photo.
const lines = mesh(world, world.objects.countries);
const borders = mainPath(lines);
const insetBorders = insetPath(lines);

const [ox, oy] = main(ORIGIN);

/**
 * A route from Cairo to a point on the map, bowed upwards so it reads as a
 * shipment. The inset markets are routed to their spot in the inset.
 */
function route([tx, ty]) {
  const n = 32;
  const dx = tx - ox;
  const dy = ty - oy;
  const len = Math.hypot(dx, dy) || 1;
  const lift = Math.min(110, len * 0.24);
  // Unit normal, flipped so the bow always points up the screen.
  const flip = dx / len > 0 ? 1 : -1;
  const nx = (dy / len) * flip;
  const ny = (-dx / len) * flip;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const h = Math.sin(Math.PI * t) * lift;
    return `${i ? "L" : "M"}${r1(ox + dx * t + nx * h)},${r1(oy + dy * t + ny * h)}`;
  }).join("");
}

/** The country's largest landmass, so islands and overseas parts don't pull its label away. */
function mainland(f) {
  if (f.geometry.type !== "MultiPolygon") return f;
  const polys = f.geometry.coordinates.map((coordinates) => ({ type: "Polygon", coordinates }));
  return polys.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a));
}

const markets = MARKETS.map((m) => {
  const f = byId.get(m.id);
  const path = m.inset ? insetPath : mainPath;
  const land = mainland(f);
  const [cx, cy] = path.centroid(land);
  // Label size follows the country's size on the map, like the photo.
  const size = Math.round(Math.min(32, Math.max(13.5, Math.sqrt(path.area(land)) * 0.14)));
  return {
    name: m.name,
    id: m.id,
    source: m.source,
    inset: Boolean(m.inset),
    d: path(f),
    x: r1(cx),
    y: r1(cy),
    label: { x: r1(cx + (m.dx ?? 0)), y: r1(cy + (m.dy ?? 0)), size },
    arc: route([cx, cy]),
  };
});

const out = {
  width: W,
  height: H,
  inset: INSET,
  egypt: mainPath(byId.get("818")),
  origin: { x: r1(ox), y: r1(oy) },
  markets,
};
writeFileSync("src/lib/export-map.json", JSON.stringify(out));
console.log(`export-map.json: ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
writeFileSync("public/images/company/export-map-borders.svg", bordersSvg(W, H, [borders, insetBorders]));

/** White coast and border lines on a transparent ground, drawn over the photo. */
export function bordersSvg(width, height, paths) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".7" stroke-linejoin="round">${paths.map((d) => `<path d="${d}"/>`).join("")}</g></svg>\n`;
}

// ---- Backgrounds: reproject the equirectangular NASA images ----
/** Renders one background: every map pixel is looked up in the source image. */
async function background(srcFile, outFile, tone) {
  const src = sharp(srcFile);
  const { width: SW, height: SH } = await src.metadata();
  const srcPx = await src.removeAlpha().raw().toBuffer();
  const outPx = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const inInset = x >= INSET.x && x < INSET.x + INSET.w && y >= INSET.y && y < INSET.y + INSET.h;
      const [lon, lat] = (inInset ? inset : main).invert([x + 0.5, y + 0.5]);
      // Bilinear sample of the equirectangular source.
      const fx = ((lon + 180) / 360) * SW - 0.5;
      const fy = ((90 - lat) / 180) * SH - 0.5;
      const x0 = Math.max(0, Math.min(SW - 2, Math.floor(fx)));
      const y0 = Math.max(0, Math.min(SH - 2, Math.floor(fy)));
      const ax = fx - x0;
      const ay = fy - y0;
      const o = (y * W + x) * 3;
      for (let c = 0; c < 3; c++) {
        const p = (px, py) => srcPx[(py * SW + px) * 3 + c];
        outPx[o + c] =
          (p(x0, y0) * (1 - ax) + p(x0 + 1, y0) * ax) * (1 - ay) + (p(x0, y0 + 1) * (1 - ax) + p(x0 + 1, y0 + 1) * ax) * ay;
      }
    }
  }
  await tone(sharp(outPx, { raw: { width: W, height: H, channels: 3 } }))
    .webp({ quality: 72 })
    .toFile(outFile);
  console.log(`${outFile} written`);
}

// Night: NASA "Earth at night". The city lights are lifted a little, as on SWEILLEM's photo.
await background("scripts/assets/earth-night.jpg", "public/images/company/export-map-night.webp", (img) => img.linear(1.25, -6));
// Day: NASA "Blue Marble", slightly muted so the red countries and white names stand out.
await background("scripts/assets/earth-day.jpg", "public/images/company/export-map-day.webp", (img) =>
  img.modulate({ saturation: 0.85, brightness: 0.92 }),
);
