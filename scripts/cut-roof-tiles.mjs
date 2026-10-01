#!/usr/bin/env node
// Cuts the three roof tile photos from SWEILLEM's deck (public/images/roof-tiles/*.jpg)
// out of their white backgrounds, drops the "sweillem roofing tiles" badge on
// the right, and writes transparent WebPs for the colour viewer.
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname;
for (const colour of ["terracotta", "blue", "black"]) {
  const src = `${root}public/images/roof-tiles/tile-${colour}.jpg`;
  const meta = await sharp(src).metadata();
  // Badge and side bar sit in the right quarter of the 1200 px slides.
  const width = meta.width > 900 ? Math.round(meta.width * 0.72) : meta.width;
  const { data, info } = await sharp(src).extract({ left: 0, top: 0, width, height: meta.height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  // Flood-fill the near-white background from the edges so light spots on the tile survive.
  const seen = new Uint8Array(w * h);
  const stack = [];
  const white = (i) => data[i * 4] > 228 && data[i * 4 + 1] > 228 && data[i * 4 + 2] > 228;
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p] || !white(p)) continue;
    seen[p] = 1;
    data[p * 4 + 3] = 0;
    const x = p % w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (p >= w) stack.push(p - w);
    if (p < w * (h - 1)) stack.push(p + w);
  }
  const out = `${root}public/images/roof-tiles/tile-${colour}-cutout.webp`;
  const trimmed = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
  await sharp(trimmed).resize({ height: 720, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }).toFile(out);
  const m = await sharp(out).metadata();
  console.log(out.replace(root, ""), m.width, m.height);
}
