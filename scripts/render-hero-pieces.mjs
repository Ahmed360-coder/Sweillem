// Renders the home hero's glazed clay pipes, fittings and shards with three.js
// (scripts/hero-pieces/scene.html) in headless Chromium, trims each to its
// edges and saves it as a transparent WebP in public/images/hero/.
//   node scripts/render-hero-pieces.mjs [name ...]
// CHROMIUM_PATH picks a browser when Playwright's own is not installed.
import { readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "public/images/hero");

// name: scene query (object, turn, tilt, camera height, seed) and the saved height in px.
const pieces = {
  "pipe-wide": { q: "w=big&ry=0.3", h: 1100 },
  "pipe-dark": { q: "w=mid&ry=1.1", h: 1300 },
  "pipe-honey": { q: "w=small&ry=2.1", h: 1100 },
  junction: { q: "w=junction&ry=0.4&tz=0.25", h: 700 },
  bend: { q: "w=bend&ry=0.6&tx=0.2&el=0.3", h: 600 },
  "short-piece": { q: "w=short&tx=0.55&tz=0.35&el=0.35", h: 500 },
  "shard-1": { q: "w=shard&tx=0.5&tz=0.3&ry=0.4&el=0.4&seed=11", h: 360 },
  "shard-2": { q: "w=shard2&tx=-0.3&tz=1.1&ry=2.8&el=0.5&seed=29", h: 360 },
  "shard-3": { q: "w=shard3&tx=0.3&tz=-0.6&ry=2.6&el=0.3&seed=41", h: 360 },
};

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(pieces);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });
page.on("pageerror", (e) => console.error(e.message));
// Serve the scene and three.js from disk, no web server needed.
await page.route("http://hero.local/**", async (route) => {
  const path = new URL(route.request().url()).pathname;
  const file = path.startsWith("/node_modules/") ? join(root, path) : join(root, "scripts/hero-pieces", path);
  const type = file.endsWith(".js") ? "text/javascript" : "text/html";
  route.fulfill({ body: await readFile(file), contentType: type }).catch(() => route.fulfill({ status: 404 }));
});
for (const name of names) {
  const { q, h } = pieces[name];
  await page.goto(`http://hero.local/scene.html?${q}`);
  await page.waitForFunction(() => window.done, null, { timeout: 180_000 });
  const png = await page.locator("canvas").screenshot({ omitBackground: true });
  await sharp(png).trim({ threshold: 1 }).resize({ height: h, withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(join(out, `${name}.webp`));
  console.log(name);
}
await browser.close();
