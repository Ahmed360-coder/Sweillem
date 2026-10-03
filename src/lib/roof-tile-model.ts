import type * as THREE_NS from "three";

// A SWEILLEM interlocking clay roof tile built from the tile photo, for laying
// on a 3D roof. Big forms (the headlap band and its pockets, the two rolls in
// their pan, the stepped-down right lock) are real geometry. Fine relief (lock
// ribs, the "Made in Egypt" and SWEILLEM stamp, the nail hole and the grain of
// fired clay) is a normal map, and a colour map adds mottling and darker glaze
// in the hollows. SWEILLEM publishes no tile dimensions: the shape follows the
// photo, but nothing here is to scale.

type Three = typeof THREE_NS;

/** Drawing units, as in ClayTile: 84 wide, 144 high, y down from the head. */
export const TILE_W = 84;
export const TILE_H = 144;
/** Body thickness below the face, in drawing units. */
export const TILE_DEPTH = 3;
/** Scene units per drawing unit: a tile is 1 high. */
export const S = 1 / TILE_H;

/** Where the stamp sits on the headlap band (measured on the tile photo). */
const STAMP = { x: 19, y: 6.2, w: 34, h: 7.4 };
const ROLLS = [27, 57];
const ROLL_R = 8.5;
const ROLL_TOP = 31;
const ROLL_END = 136;

const ss = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
/** A soft-edged raised (or, with negative height, sunken) rectangle. */
const box = (x: number, y: number, x0: number, x1: number, y0: number, y1: number, h: number, soft: number) =>
  h * ss(x0 - soft, x0 + soft, x) * (1 - ss(x1 - soft, x1 + soft, x)) * ss(y0 - soft, y0 + soft, y) * (1 - ss(y1 - soft, y1 + soft, y));
/** A thin ridge along a line, for lock ribs. */
const ridge = (d: number, h: number, w: number) => h * Math.max(0, 1 - (d / w) ** 2);

/** Is a point inside the tile outline (stepped at the top right and bottom left)? */
export function inside(x: number, y: number) {
  if (x < 0 || x > TILE_W || y < 0 || y > TILE_H) return false;
  if (y < 5) return x > 4 && x < 68;
  if (y > 139) return x > 14;
  return true;
}

/** Height of the big forms, in drawing units above the flat face. */
export function formHeight(x: number, y: number) {
  let h = 0;
  h += box(x, y, 8, 69.5, 5.5, 27, 1.6, 0.8); // headlap band
  for (const [x0, x1] of [[12, 27], [32, 47], [52, 66]]) h += box(x, y, x0, x1, 15, 25, -1.1, 0.6); // pockets in the band
  h += box(x, y, 70.5, 90, -6, 150, -1.4, 0.6); // right lock steps down under the next tile
  h += box(x, y, 14, 69, 29, 141, -0.5, 1); // pan the rolls stand in
  for (const cx of ROLLS) {
    const cy = Math.min(ROLL_END - ROLL_R, Math.max(ROLL_TOP + ROLL_R, y));
    const d = Math.hypot(x - cx, (y - cy) * (y < cy ? 1.15 : 1)) / ROLL_R;
    if (d < 1) h = Math.max(h, 4.4 * Math.sqrt(1 - d * d) - 0.2);
  }
  return h;
}

/** Small fixed-seed random numbers, so every visit shows the same tiles. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The stamp as a mask (1 where the letters and frames stand up), drawn on a canvas. */
function stampMask(res: number, wordPath: string) {
  const w = Math.round(STAMP.w * res);
  const h = Math.round(STAMP.h * res);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = g.strokeStyle = "#fff";
  const lw = Math.max(1.5, h * 0.07);
  g.lineWidth = lw;
  // "Made in / Egypt" in a framed box, then the wordmark in a rounded frame.
  const bw = w * 0.26;
  g.beginPath();
  g.roundRect(lw, lw, bw - lw * 2, h - lw * 2, h * 0.1);
  g.stroke();
  g.font = `600 ${Math.round(h * 0.3)}px Arial, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("Made in", bw / 2, h * 0.36);
  g.fillText("Egypt", bw / 2, h * 0.67);
  const fx = bw + lw * 2;
  const fw = w - fx - lw;
  g.beginPath();
  g.roundRect(fx, lw, fw, h - lw * 2, (h - lw * 2) / 2);
  g.stroke();
  // The wordmark path spans x 172 to 640 and y 49 to 137 in the logo's units.
  const k = Math.min((h * 0.56) / (137 - 49), (fw * 0.8) / (640 - 172));
  g.translate(fx + (fw - (640 - 172) * k) / 2 - 172 * k, (h - (137 - 49) * k) / 2 - 49 * k);
  g.scale(k, k);
  g.fill(new Path2D(wordPath));
  const data = g.getImageData(0, 0, w, h).data;
  const mask = new Float32Array(w * h);
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] / 255;
  return { mask, w, h };
}

/** A blur for the stamp, so the letters stand up with soft shoulders like pressed clay. */
function blur(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const n = 2 * r + 1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += src[y * w + Math.min(w - 1, Math.max(0, x + k))];
      tmp[y * w + x] = s / n;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x];
      out[y * w + x] = s / n;
    }
  return out;
}

/**
 * Normal map (fine relief) and colour map (mottling, darker glaze in hollows)
 * for the tile face, at `res` pixels per drawing unit.
 */
export function tileTextures(T: Three, wordPath: string, res = 6) {
  const W = TILE_W * res;
  const H = TILE_H * res;
  const stamp = stampMask(res, wordPath);
  const stampSoft = blur(stamp.mask, stamp.w, stamp.h, 1);
  const rand = seeded(7);
  // Value noise for grain: a coarse and a fine grid of random heights.
  const grid = (n: number) => Array.from({ length: (n + 1) * (n + 1) }, rand);
  const coarse = grid(48);
  const noise = (g: number[], n: number, u: number, v: number) => {
    const x = u * n;
    const y = v * n;
    const xi = Math.min(n - 1, Math.floor(x));
    const yi = Math.min(n - 1, Math.floor(y));
    const fx = ss(0, 1, x - xi);
    const fy = ss(0, 1, y - yi);
    const a = g[yi * (n + 1) + xi];
    const b = g[yi * (n + 1) + xi + 1];
    const c = g[(yi + 1) * (n + 1) + xi];
    const d = g[(yi + 1) * (n + 1) + xi + 1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };

  const detail = new Float32Array(W * H);
  const form = new Float32Array(W * H);
  for (let py = 0; py < H; py++) {
    const y = (py + 0.5) / res;
    for (let px = 0; px < W; px++) {
      const x = (px + 0.5) / res;
      let d = 0;
      // Left lock: two grooves' ribs. Right lock: ribs and cross ribs.
      if (y > 10 && y < 134) d += ridge(Math.min(Math.abs(x - 2.6), Math.abs(x - 7.6)), 0.7, 0.9);
      if (y > 32 && y < 138) d += ridge(Math.min(Math.abs(x - 71.4), Math.abs(x - 78.2)), 0.6, 0.8);
      if (x > 71 && x < 84) d += ridge(Math.min(Math.abs(y - 60), Math.abs(y - 84), Math.abs(y - 108)), 0.6, 0.8);
      // Fine lines either side of the gap between the rolls.
      if (y > 30 && y < 136) d += ridge(Math.min(Math.abs(x - 39.5), Math.abs(x - 44.5)), 0.35, 0.7);
      // Nail hole in the band.
      d -= 1.2 * Math.max(0, 1 - Math.hypot(x - 53, y - 12.5) / 1.2);
      // The stamp.
      const sx = Math.floor((x - STAMP.x) * res);
      const sy = Math.floor((y - STAMP.y) * res);
      if (sx >= 0 && sy >= 0 && sx < stamp.w && sy < stamp.h) d += 0.55 * stampSoft[sy * stamp.w + sx];
      // Grain of fired clay.
      d += 0.12 * noise(coarse, 48, x / TILE_W, y / TILE_H) + 0.05 * rand();
      detail[py * W + px] = d;
      form[py * W + px] = formHeight(x, y);
    }
  }

  const normal = new Uint8ClampedArray(W * H * 4);
  const colour = new Uint8ClampedArray(W * H * 4);
  const at = (a: Float32Array, x: number, y: number) => a[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
  const mottle = grid(12);
  for (let py = 0; py < H; py++)
    for (let px = 0; px < W; px++) {
      const i = py * W + px;
      // Slopes in height units per drawing unit. Texture u runs along x and v along y (head to tail).
      const dx = ((at(detail, px + 1, py) - at(detail, px - 1, py)) * res) / 2;
      const dy = ((at(detail, px, py + 1) - at(detail, px, py - 1)) * res) / 2;
      const len = Math.hypot(dx, dy, 1);
      normal[i * 4] = ((-dx / len) * 0.5 + 0.5) * 255;
      normal[i * 4 + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      normal[i * 4 + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      normal[i * 4 + 3] = 255;
      // Colour: soft mottling, glaze pooling darker in hollows and paler on the rolls.
      const f = form[i];
      const m = noise(mottle, 12, px / W, py / H);
      const v = 0.8 + 0.1 * ss(-1.4, 4.2, f) + 0.08 * m + 0.03 * rand() - 0.04 * Math.max(0, -detail[i]);
      colour[i * 4] = colour[i * 4 + 1] = colour[i * 4 + 2] = Math.min(255, v * 255);
      colour[i * 4 + 3] = 255;
    }

  const texture = (data: Uint8ClampedArray, srgb: boolean) => {
    const t = new T.DataTexture(data, W, H, T.RGBAFormat);
    // Rows run from the head down, matching v in the geometry.
    t.flipY = false;
    t.colorSpace = srgb ? T.SRGBColorSpace : T.NoColorSpace;
    t.anisotropy = 8;
    t.generateMipmaps = true;
    t.minFilter = T.LinearMipmapLinearFilter;
    t.magFilter = T.LinearFilter;
    t.needsUpdate = true;
    return t;
  };
  return { normalMap: texture(normal, false), map: texture(colour, true) };
}

/**
 * The tile's geometry, in scene units: the face (x across, y toward the head,
 * z up out of the face), plus its sides and underside. Texture v runs from the
 * head (v = 0, the first texture row) to the tail.
 */
export function tileGeometry(T: Three) {
  // A 2-unit grid that also breaks at the outline's steps, so cells follow the outline exactly.
  const steps = (size: number, breaks: number[]) => [...new Set([...Array.from({ length: size / 2 + 1 }, (_, k) => k * 2), ...breaks])].sort((a, b) => a - b);
  const X = steps(TILE_W, [4, 14, 68]);
  const Y = steps(TILE_H, [5, 139]);
  const nx = X.length - 1;
  const ny = Y.length - 1;
  const pos: number[] = [];
  const uv: number[] = [];
  for (let j = 0; j <= ny; j++)
    for (let i = 0; i <= nx; i++) {
      pos.push((X[i] - TILE_W / 2) * S, (TILE_H / 2 - Y[j]) * S, formHeight(X[i], Y[j]) * S);
      uv.push(X[i] / TILE_W, Y[j] / TILE_H);
    }
  const vid = (i: number, j: number) => j * (nx + 1) + i;
  const cell = (i: number, j: number) => i >= 0 && j >= 0 && i < nx && j < ny && inside((X[i] + X[i + 1]) / 2, (Y[j] + Y[j + 1]) / 2);
  const index: number[] = [];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      if (!cell(i, j)) continue;
      index.push(vid(i, j), vid(i, j + 1), vid(i + 1, j), vid(i + 1, j), vid(i, j + 1), vid(i + 1, j + 1));
    }
  const face = new T.BufferGeometry();
  face.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  face.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  face.setIndex(index);
  face.computeVertexNormals();

  // Sides along the outline, then the flat underside as one shape.
  const shell: number[] = [];
  const shellUv: number[] = [];
  const zb = -TILE_DEPTH * S;
  const p = (i: number, j: number, top: boolean) => [(X[i] - TILE_W / 2) * S, (TILE_H / 2 - Y[j]) * S, top ? formHeight(X[i], Y[j]) * S : zb];
  const quad = (a: number[], b: number[], c: number[], d: number[], u: number, v: number) => {
    shell.push(...a, ...b, ...c, ...c, ...b, ...d);
    for (let k = 0; k < 6; k++) shellUv.push(u, v);
  };
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      if (!cell(i, j)) continue;
      const u = (X[i] + X[i + 1]) / 2 / TILE_W;
      const v = (Y[j] + Y[j + 1]) / 2 / TILE_H;
      // A wall on each open edge, facing out.
      if (!cell(i, j - 1)) quad(p(i, j, true), p(i + 1, j, true), p(i, j, false), p(i + 1, j, false), u, v);
      if (!cell(i, j + 1)) quad(p(i + 1, j + 1, true), p(i, j + 1, true), p(i + 1, j + 1, false), p(i, j + 1, false), u, v);
      if (!cell(i - 1, j)) quad(p(i, j + 1, true), p(i, j, true), p(i, j + 1, false), p(i, j, false), u, v);
      if (!cell(i + 1, j)) quad(p(i + 1, j, true), p(i + 1, j + 1, true), p(i + 1, j, false), p(i + 1, j + 1, false), u, v);
    }
  const outline = [[4, 0], [68, 0], [68, 5], [84, 5], [84, 144], [14, 144], [14, 139], [0, 139], [0, 5], [4, 5]];
  const under = new T.ShapeGeometry(new T.Shape(outline.map(([x, y]) => new T.Vector2((x - TILE_W / 2) * S, (TILE_H / 2 - y) * S))));
  const up = under.getAttribute("position");
  for (const k of Array.from(under.getIndex()?.array ?? []).reverse()) {
    // Reversed winding, so the underside faces down.
    shell.push(up.getX(k), up.getY(k), zb);
    shellUv.push(0.5, 0.5);
  }
  under.dispose();
  const sides = new T.BufferGeometry();
  sides.setAttribute("position", new T.Float32BufferAttribute(shell, 3));
  sides.setAttribute("uv", new T.Float32BufferAttribute(shellUv, 2));
  sides.computeVertexNormals();
  return { face, sides };
}
