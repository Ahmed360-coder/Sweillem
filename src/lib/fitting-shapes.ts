// Shapes of the products in the size finder, in millimetres, and their
// to-scale drawing: a section through the centre (or an end view for the
// half channel), the same way the product cards are drawn. The 3D models in
// src/lib/fitting-model.ts are built from the same shapes. Which figures are
// published and which are drawn is decided in src/lib/family-viewer.ts.

export type FittingShape =
  /** A straight barrel: short pieces, perforated pipe (with its holes). */
  | { kind: "straight"; d1: number; d3: number; len: number; holes?: Holes }
  /** A bend of `angle` degrees around a centre line of radius `radius`. */
  | { kind: "bend"; d1: number; d3: number; angle: number; radius: number }
  /** A main barrel with a branch of bore b1 and outer ø b3 at `angle` degrees. */
  | { kind: "junction"; d1: number; d3: number; len: number; b1: number; b3: number; angle: number; branch: number }
  /** A spigot pushed home into a socket, both with their seal (jointing systems). */
  | { kind: "joint"; d1: number; d3: number; d4: number; d7: number; depth: number; seal: number }
  /** A socket closed by an end plug. */
  | { kind: "plug"; d1: number; d3: number; d4: number; depth: number; seal: number; plug: number }
  /** A cone from one size (a) to another (b): enlarger, reducer, ÜF short piece. */
  | { kind: "taper"; a1: number; a3: number; b1: number; b3: number; len: number }
  /** A half channel: inner ø dn, depth h, wall, length. */
  | { kind: "channel"; dn: number; h: number; wall: number; len: number }
  /** The U-trap: shape only, no sizes are published. */
  | { kind: "utrap"; d1: number; d3: number };

export interface Holes {
  /** Hole ø (mm). */
  dia: number;
  /** Holes around the pipe (Z1) and along it (Z2). */
  around: number;
  along: number;
  /** Arc the holes around the pipe spread over, in degrees from the top. */
  arc: number;
}

export type Pt = [number, number];

export interface Section {
  /** Fired clay walls, cut (hatched). Overlapping polygons merge into one outline. */
  walls: Pt[][];
  /** Seals (polyurethane), cut. */
  seals: Pt[][];
  /** Holes seen on the far wall: x, y, radius. */
  dots: [number, number, number][];
  /** Centre lines. */
  axes: Pt[][];
  /** "section" through the centre, or an "end" view. */
  view: "section" | "end";
}

const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** Mirror a polygon of the top half into the bottom half. */
const mirror = (poly: Pt[]): Pt[] => poly.map(([x, y]) => [x, -y]);

/** Points of an arc: centre, radius, start and end angle (radians), using (sin, -cos) from straight down. */
function arc(cx: number, cy: number, r: number, a0: number, a1: number, steps = 32): Pt[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = a0 + ((a1 - a0) * i) / steps;
    return [cx + r * Math.sin(t), cy - r * Math.cos(t)];
  });
}

/** Socket bell on the left of x = 0, open towards +x, for joints and plugs. Returns the outer radius of the bell. */
function socketHalf(d1: number, d3: number, d4: number, depth: number, seal: number) {
  const wall = (d3 - d1) / 2;
  const sIn = d4 / 2 + seal;
  const sOut = sIn + wall;
  const barrel = Math.max(depth * 1.6, d3 * 0.6);
  const walls = [
    // pipe barrel, the shoulder, then the bell
    rect(-barrel, d1 / 2, 0, d3 / 2),
    [
      [-wall * 1.4, d1 / 2],
      [0, d1 / 2],
      [0, sIn],
      [-wall * 0.3, sOut],
      [-wall * 1.4, d3 / 2],
    ] as Pt[],
    rect(0, sIn, depth, sOut),
  ];
  return { walls, lining: rect(0, d4 / 2, depth, sIn), barrel, sOut };
}

export function sectionOf(s: FittingShape): Section {
  const out: Section = { walls: [], seals: [], dots: [], axes: [], view: "section" };
  const both = (polys: Pt[][], into: Pt[][]) => polys.forEach((p) => into.push(p, mirror(p)));

  switch (s.kind) {
    case "straight": {
      both([rect(0, s.d1 / 2, s.len, s.d3 / 2)], out.walls);
      out.axes.push([
        [-20, 0],
        [s.len + 20, 0],
      ]);
      if (s.holes) {
        // Holes on the far half of the wall, seen through the bore.
        const h = s.holes;
        const step = s.len / h.along;
        for (let j = 0; j < h.around; j++) {
          const phi = h.around === 1 ? 0 : (-h.arc / 2 + (h.arc * j) / (h.around - 1)) * (Math.PI / 180);
          const y = (s.d1 / 2) * Math.cos(phi);
          for (let i = 0; i < h.along; i++) out.dots.push([step * (i + 0.5), y, h.dia / 2]);
        }
      }
      return out;
    }
    case "bend": {
      // Starts at the origin heading +x and turns up around (0, radius).
      const a = (s.angle * Math.PI) / 180;
      const R = s.radius;
      // A point at angle t on radius rho is (rho·sin t, R − rho·cos t): arc() from 0 to a.
      const band = (r0: number, r1: number): Pt[] => [...arc(0, R, r0, 0, a), ...arc(0, R, r1, a, 0)];
      out.walls.push(band(R - s.d3 / 2, R - s.d1 / 2), band(R + s.d1 / 2, R + s.d3 / 2));
      out.axes.push(arc(0, R, R, 0, a));
      return out;
    }
    case "junction": {
      const a = (s.angle * Math.PI) / 180;
      const x0 = s.angle >= 90 ? s.len / 2 : s.len * 0.42;
      const r1 = s.d1 / 2;
      const r3 = s.d3 / 2;
      const [c, sn] = [Math.cos(a), Math.sin(a)];
      // A line parallel to the branch axis, offset k·rho (k = +1 on the near-end side).
      const at = (k: number, rho: number, y: number): Pt => {
        const t = (y - k * rho * c) / sn;
        return [x0 + t * c - k * rho * sn, y];
      };
      const along = (k: number, rho: number, t: number): Pt => [x0 + t * c - k * rho * sn, t * sn + k * rho * c];
      const end = r3 / sn + s.branch;
      out.walls.push(mirror(rect(0, r1, s.len, r3)));
      out.walls.push([[0, r1], at(1, s.b1 / 2, r1), at(1, s.b1 / 2, r3), [0, r3]]);
      out.walls.push([at(-1, s.b1 / 2, r1), [s.len, r1], [s.len, r3], at(-1, s.b1 / 2, r3)]);
      for (const k of [1, -1]) out.walls.push([at(k, s.b1 / 2, r1), along(k, s.b1 / 2, end), along(k, s.b3 / 2, end), at(k, s.b3 / 2, r1)]);
      out.axes.push(
        [
          [-20, 0],
          [s.len + 20, 0],
        ],
        [[x0, 0], along(0, 0, end + 20)],
      );
      return out;
    }
    case "joint": {
      const sock = socketHalf(s.d1, s.d3, s.d4, s.depth, s.seal);
      const gap = Math.max(6, s.depth * 0.06);
      const spigot = sock.barrel + s.depth;
      both(sock.walls, out.walls);
      both([rect(gap, s.d1 / 2, spigot, s.d3 / 2)], out.walls);
      // The spigot's seal ring is a touch larger than the socket's lining (d7 > d4): that squeeze is the seal.
      both([sock.lining, rect(gap + s.depth * 0.08, s.d3 / 2, s.depth - s.depth * 0.04, s.d7 / 2)], out.seals);
      out.axes.push([
        [-sock.barrel - 20, 0],
        [spigot + 20, 0],
      ]);
      return out;
    }
    case "plug": {
      const sock = socketHalf(s.d1, s.d3, s.d4, s.depth, s.seal);
      both(sock.walls, out.walls);
      out.walls.push(rect(s.depth - s.plug, -s.d4 / 2, s.depth, s.d4 / 2));
      both([sock.lining], out.seals);
      out.axes.push([
        [-sock.barrel - 20, 0],
        [s.depth + 20, 0],
      ]);
      return out;
    }
    case "taper": {
      const [p, q] = [s.len * 0.3, s.len * 0.7];
      both(
        [
          [
            [0, s.a1 / 2],
            [p, s.a1 / 2],
            [q, s.b1 / 2],
            [s.len, s.b1 / 2],
            [s.len, s.b3 / 2],
            [q, s.b3 / 2],
            [p, s.a3 / 2],
            [0, s.a3 / 2],
          ],
        ],
        out.walls,
      );
      out.axes.push([
        [-20, 0],
        [s.len + 20, 0],
      ]);
      return out;
    }
    case "channel": {
      // End view: the inner arc of ø dn, cut flat at depth h; the wall around it.
      const r = s.dn / 2;
      const R = r + s.wall;
      const rim = -r + s.h;
      const ti = Math.acos(Math.min(1, (r - s.h) / r));
      const to = Math.acos(Math.min(1, (r - s.h) / R));
      out.walls.push([...arc(0, 0, r, -ti, ti), ...arc(0, 0, R, to, -to)]);
      out.axes.push([
        [0, rim + 30],
        [0, -R - 30],
      ]);
      out.view = "end";
      return out;
    }
    case "utrap":
      return out;
  }
}

/** Bounding box of a section: [minX, minY, maxX, maxY]. */
export function sectionBox(sec: Section): [number, number, number, number] {
  const pts = [...sec.walls, ...sec.seals].flat();
  if (!pts.length) return [0, 0, 1, 1];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
