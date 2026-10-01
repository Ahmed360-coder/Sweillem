// Builds the home-screen icons from the logo in the site header:
//   src/app/apple-icon.png        180 px, for iPhone and iPad home screens
//   public/icons/icon-192.png     for Android home screens (src/app/manifest.ts)
//   public/icons/icon-512.png     for Android splash screens and installs
// Run: node scripts/build-icons.mjs
//
// The paths come straight from src/components/Logo.tsx, in the light theme's
// colours (grey S mark, maroon SWEILLEM), on white. The S mark sits above
// SWEILLEM so both fill the square; side by side, as in the header, the name
// would be a thin strip across the middle. The small "Vitrified clay pipes
// Co." line is left out: at icon size it would be under 2 pt tall.
// The tab icon (src/app/icon.svg) stays the maroon S mark, which reads at 16 px.
import { mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const logo = readFileSync("src/components/Logo.tsx", "utf8");
const [mark, word] = [...logo.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
if (!mark || !word) throw new Error("Could not read the logo paths from src/components/Logo.tsx");

const MARK = "#7f8285"; // --logo-mark, light theme
const WORD = "#7a0404"; // --logo-word, light theme
// Where each part sits in the logo's own drawing (viewBox 0 0 642 217).
const markBox = { x: 0.92, y: 1.07, w: 146.86 - 0.92, h: 215.56 - 1.07 };
const wordBox = { x: 172.03, y: 48.79, w: 640.45 - 172.03, h: 137.02 - 48.79 };

/** Draws `d` so its box `b` is `w` wide with its top left at (x, y). */
const place = (d, fill, b, x, y, w) => {
  const s = w / b.w;
  return `<g transform="translate(${(x - b.x * s).toFixed(2)} ${(y - b.y * s).toFixed(2)}) scale(${s.toFixed(5)})"><path fill="${fill}" d="${d}"/></g>`;
};

/** The S mark above SWEILLEM, centred in a square of side `size`. */
function icon(size) {
  const markH = size * 0.47;
  const markW = (markBox.w * markH) / markBox.h;
  const wordW = size * 0.76;
  const wordH = (wordBox.h * wordW) / wordBox.w;
  const gap = size * 0.07;
  const top = (size - markH - gap - wordH) / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<rect width="${size}" height="${size}" fill="#ffffff"/>` +
      place(mark, MARK, markBox, (size - markW) / 2, top, markW) +
      place(word, WORD, wordBox, (size - wordW) / 2, top + markH + gap, wordW) +
      `</svg>`,
  );
}

mkdirSync("public/icons", { recursive: true });
// Drawn at 4x and scaled down, so the thin strokes of the letters stay crisp.
for (const [size, out] of [
  [180, "src/app/apple-icon.png"],
  [192, "public/icons/icon-192.png"],
  [512, "public/icons/icon-512.png"],
]) {
  await sharp(icon(size * 4))
    .resize(size, size)
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`wrote ${out}`);
}
