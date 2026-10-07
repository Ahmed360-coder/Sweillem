import type * as THREE_NS from "three";
import { sectionOf, type FittingShape, type Pt } from "./fitting-shapes";

// 3D models of the size finder's products, built from the same shapes as the
// to-scale drawings (src/lib/fitting-shapes.ts), in metres. Round parts are
// their section turned around the axis; the bend is a part torus; the junction
// is a main barrel with an opening and a branch trimmed to meet it; the half
// channel is its end view pushed along its length.

type Three = typeof THREE_NS;

export interface FittingMaterials {
  glaze: THREE_NS.Material;
  bore: THREE_NS.Material;
  body: THREE_NS.Material;
  seal: THREE_NS.Material;
  hole: THREE_NS.Material;
}

export function fittingMaterials(T: Three): FittingMaterials {
  return {
    glaze: new T.MeshPhysicalMaterial({ color: "#6e3820", roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, side: T.DoubleSide }),
    bore: new T.MeshStandardMaterial({ color: "#2a1610", roughness: 0.55, side: T.DoubleSide }),
    body: new T.MeshStandardMaterial({ color: "#b9744c", roughness: 0.9, side: T.DoubleSide }),
    seal: new T.MeshStandardMaterial({ color: "#a81f24", roughness: 0.6, side: T.DoubleSide }),
    hole: new T.MeshBasicMaterial({ color: "#120806", side: T.DoubleSide }),
  };
}

const MM = 0.001;
const SEG = 96;

/** Size of a shape as it lies on the floor, in metres: widest floor span and height. */
export function extentOf(s: FittingShape): { span: number; height: number } {
  if (s.kind === "utrap") return { span: s.d3 * MM * 9, height: s.d3 * MM * 5.4 };
  const sec = sectionOf(s);
  const pts = [...sec.walls, ...sec.seals].flat();
  const w = (Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0]))) * MM;
  const h = (Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1]))) * MM;
  switch (s.kind) {
    case "bend":
      return { span: Math.max(w, h), height: s.d3 * MM };
    case "channel":
      return { span: Math.max(s.len * MM, w), height: h };
    default:
      return { span: Math.max(w, h), height: h };
  }
}

/**
 * Turns the top half of a section around the x axis. Each edge becomes its own
 * band, so flat faces stay flat: bands facing out are glazed, bands facing the
 * bore are the dark bore, ends and shoulders are bare fired clay.
 */
function lathe(T: Three, polys: Pt[][], m: FittingMaterials, material?: THREE_NS.Material) {
  const g = new T.Group();
  for (const raw of polys) {
    if (Math.max(...raw.map((p) => p[1])) <= 0) continue;
    const poly = raw.map(([x, y]) => [x * MM, Math.max(0, y) * MM] as Pt);
    let area = 0;
    poly.forEach(([x0, y0], i) => {
      const [x1, y1] = poly[(i + 1) % poly.length];
      area += x0 * y1 - x1 * y0;
    });
    const ccw = area > 0;
    poly.forEach(([x0, y0], i) => {
      const [x1, y1] = poly[(i + 1) % poly.length];
      if (y0 === 0 && y1 === 0) return;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1e-7) return;
      // Outward normal's radial part, for a counter-clockwise outline (-dx).
      const ny = ((ccw ? -1 : 1) * (x1 - x0)) / len;
      const mat = material ?? (ny > 0.3 ? m.glaze : ny < -0.3 ? m.bore : m.body);
      const geo = new T.LatheGeometry([new T.Vector2(y0, x0), new T.Vector2(y1, x1)], SEG);
      g.add(new T.Mesh(geo, mat));
    });
  }
  // Lathe turns around y; lay it along x.
  g.rotation.z = -Math.PI / 2;
  const out = new T.Group();
  out.add(g);
  return out;
}

/** A plain ring between two radii, facing +x, at x. */
function endRing(T: Three, r0: number, r1: number, x: number, mat: THREE_NS.Material) {
  const ring = new T.Mesh(new T.RingGeometry(r0, r1, SEG), mat);
  ring.rotation.y = Math.PI / 2;
  ring.position.x = x;
  return ring;
}

/** An open barrel along x from 0 to len, without the triangles `cut` returns true for. */
function barrel(T: Three, r: number, len: number, mat: THREE_NS.Material, cut: (c: THREE_NS.Vector3) => boolean) {
  const g = new T.CylinderGeometry(r, r, len, SEG, Math.max(8, Math.round(len / 0.008)), true);
  g.rotateZ(-Math.PI / 2);
  g.translate(len / 2, 0, 0);
  const flat = g.toNonIndexed();
  g.dispose();
  const pos = flat.getAttribute("position");
  const nor = flat.getAttribute("normal");
  const keepP: number[] = [];
  const keepN: number[] = [];
  const c = new T.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    c.set(
      (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3,
      (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3,
      (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3,
    );
    if (cut(c)) continue;
    for (let k = i; k < i + 3; k++) {
      keepP.push(pos.getX(k), pos.getY(k), pos.getZ(k));
      keepN.push(nor.getX(k), nor.getY(k), nor.getZ(k));
    }
  }
  flat.dispose();
  const out = new T.BufferGeometry();
  out.setAttribute("position", new T.Float32BufferAttribute(keepP, 3));
  out.setAttribute("normal", new T.Float32BufferAttribute(keepN, 3));
  return new T.Mesh(out, mat);
}

/**
 * A branch tube of radius rho leaving the main axis at O in direction u (in the
 * x-y plane), starting where it meets the main cylinder of radius main and
 * ending at distance end along u.
 */
function branchTube(T: Three, rho: number, main: number, x0: number, a: number, end: number, mat: THREE_NS.Material) {
  const [c, s] = [Math.cos(a), Math.sin(a)];
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= SEG; i++) {
    const phi = (i / SEG) * Math.PI * 2;
    const [cp, sp] = [Math.cos(phi), Math.sin(phi)];
    // Radial direction: cos·v + sin·w, with v = (-s, c, 0) and w = (0, 0, 1).
    const n = [-s * cp, c * cp, sp];
    const start = (Math.sqrt(Math.max(0, main * main - rho * rho * sp * sp)) - rho * cp * c) / s;
    for (const t of [start, end]) {
      pos.push(x0 + t * c + rho * n[0], t * s + rho * n[1], rho * n[2]);
      nor.push(...n);
    }
    if (i < SEG) {
      const k = i * 2;
      idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return new T.Mesh(g, mat);
}

function junction(T: Three, s: Extract<FittingShape, { kind: "junction" }>, m: FittingMaterials) {
  const [r1, r3, b1, b3, len] = [s.d1 / 2, s.d3 / 2, s.b1 / 2, s.b3 / 2, s.len].map((v) => v * MM);
  const a = (s.angle * Math.PI) / 180;
  const x0 = (s.angle >= 90 ? s.len / 2 : s.len * 0.42) * MM;
  const u = new T.Vector3(Math.cos(a), Math.sin(a), 0);
  const O = new T.Vector3(x0, 0, 0);
  const rel = new T.Vector3();
  // Cut the opening where the branch bore passes through the main wall.
  const inOpening = (c: THREE_NS.Vector3) => {
    rel.subVectors(c, O);
    const t = rel.dot(u);
    return t > 0 && rel.addScaledVector(u, -t).length() < b1;
  };
  const end = r3 / Math.sin(a) + s.branch * MM;
  const g = new T.Group();
  g.add(
    barrel(T, r3, len, m.glaze, inOpening),
    barrel(T, r1, len, m.bore, inOpening),
    endRing(T, r1, r3, 0, m.body),
    endRing(T, r1, r3, len, m.body),
    branchTube(T, b3, r3, x0, a, end, m.glaze),
    branchTube(T, b1, r1, x0, a, end, m.bore),
  );
  const ring = new T.Mesh(new T.RingGeometry(b1, b3, SEG), m.body);
  ring.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), u);
  ring.position.copy(O).addScaledVector(u, end);
  g.add(ring);
  return g;
}

function bend(T: Three, s: Extract<FittingShape, { kind: "bend" }>, m: FittingMaterials) {
  const [r1, r3, R] = [s.d1 / 2, s.d3 / 2, s.radius].map((v) => v * MM);
  const a = (s.angle * Math.PI) / 180;
  const tubular = Math.max(12, Math.round(s.angle / 2));
  const g = new T.Group();
  g.add(new T.Mesh(new T.TorusGeometry(R, r3, SEG / 2, tubular, a), m.glaze));
  g.add(new T.Mesh(new T.TorusGeometry(R, r1, SEG / 2, tubular, a), m.bore));
  for (const t of [0, a]) {
    const holder = new T.Group();
    holder.rotation.z = t;
    const ring = new T.Mesh(new T.RingGeometry(r1, r3, SEG), m.body);
    ring.rotation.x = Math.PI / 2;
    ring.position.x = R;
    holder.add(ring);
    g.add(holder);
  }
  // Lay the bend flat on the floor.
  g.rotation.x = -Math.PI / 2;
  const out = new T.Group();
  out.add(g);
  return out;
}

function channel(T: Three, s: Extract<FittingShape, { kind: "channel" }>, m: FittingMaterials) {
  const outline = sectionOf(s).walls[0];
  const shape = new T.Shape(outline.map(([x, y]) => new T.Vector2(x * MM, y * MM)));
  const geo = new T.ExtrudeGeometry(shape, { depth: s.len * MM, bevelEnabled: false, curveSegments: 48 });
  geo.rotateY(-Math.PI / 2);
  return new T.Mesh(geo, [m.body, m.glaze]);
}

function holes(T: Three, s: Extract<FittingShape, { kind: "straight" }>, m: FittingMaterials) {
  const h = s.holes!;
  const r = (s.d3 / 2) * MM + 0.0006;
  const mesh = new T.InstancedMesh(new T.CircleGeometry((h.dia / 2) * MM, 16), m.hole, h.around * h.along);
  const dummy = new T.Object3D();
  const step = (s.len * MM) / h.along;
  let n = 0;
  for (let j = 0; j < h.around; j++) {
    const phi = h.around === 1 ? 0 : (-h.arc / 2 + (h.arc * j) / (h.around - 1)) * (Math.PI / 180);
    const [y, z] = [Math.cos(phi), Math.sin(phi)];
    for (let i = 0; i < h.along; i++) {
      dummy.position.set(step * (i + 0.5), r * y, r * z);
      dummy.lookAt(dummy.position.x, 2 * r * y, 2 * r * z);
      dummy.updateMatrix();
      mesh.setMatrixAt(n++, dummy.matrix);
    }
  }
  return mesh;
}

/** The U-trap's shape, after SWEILLEM's drawing: in and out at the same height, a U below, a riser over each leg. */
function utrap(T: Three, s: Extract<FittingShape, { kind: "utrap" }>, m: FittingMaterials) {
  const [r1, r3, d] = [s.d1 / 2, s.d3 / 2, s.d3].map((v) => v * MM);
  const a = d * 1.15;
  const k = d * 0.7;
  const drop = d * 1.6;
  const stub = d * 1.2;
  const pts: THREE_NS.Vector3[] = [];
  const line = (x0: number, y0: number, x1: number, y1: number, n = 6) => {
    for (let i = 0; i < n; i++) pts.push(new T.Vector3(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, 0));
  };
  const arcAt = (cx: number, cy: number, r: number, t0: number, t1: number, n = 16) => {
    for (let i = 0; i < n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      pts.push(new T.Vector3(cx + r * Math.cos(t), cy + r * Math.sin(t), 0));
    }
  };
  line(-a - k - stub, 0, -a - k, 0);
  arcAt(-a - k, -k, k, Math.PI / 2, 0);
  line(-a, -k, -a, -drop);
  arcAt(0, -drop, a, Math.PI, 2 * Math.PI, 32);
  line(a, -drop, a, -k);
  arcAt(a + k, -k, k, Math.PI, Math.PI / 2);
  line(a + k, 0, a + k + stub, 0, 1);
  pts.push(new T.Vector3(a + k + stub, 0, 0));
  const curve = new T.CatmullRomCurve3(pts, false, "centripetal");
  const g = new T.Group();
  g.add(new T.Mesh(new T.TubeGeometry(curve, 240, r3, SEG / 2), m.glaze));
  g.add(new T.Mesh(new T.TubeGeometry(curve, 240, r1, SEG / 2), m.bore));
  g.add(endRing(T, r1, r3, -a - k - stub, m.body), endRing(T, r1, r3, a + k + stub, m.body));
  // Risers with a socket on top, over each leg.
  for (const x of [-a, a]) {
    const riser = lathe(
      T,
      [
        [
          [-k * 0.4 / MM, r1 / MM],
          [d * 1.4 / MM, r1 / MM],
          [d * 1.4 / MM, (r3 + d * 0.12) / MM],
          [d * 1.9 / MM, (r3 + d * 0.12) / MM],
          [d * 1.9 / MM, (r3 + d * 0.28) / MM],
          [d * 1.1 / MM, (r3 + d * 0.28) / MM],
          [d * 0.9 / MM, r3 / MM],
          [-k * 0.4 / MM, r3 / MM],
        ],
      ],
      m,
    );
    riser.rotation.z = Math.PI / 2;
    riser.position.x = x;
    g.add(riser);
  }
  return g;
}

/** Builds a shape's model, centred over the origin and resting on the floor (y = 0). */
export function buildFitting(T: Three, s: FittingShape, m: FittingMaterials): THREE_NS.Group {
  let model: THREE_NS.Object3D;
  switch (s.kind) {
    case "bend":
      model = bend(T, s, m);
      break;
    case "junction":
      model = junction(T, s, m);
      break;
    case "channel":
      model = channel(T, s, m);
      break;
    case "utrap":
      model = utrap(T, s, m);
      break;
    default: {
      const sec = sectionOf(s);
      const g = lathe(T, sec.walls, m);
      g.add(...lathe(T, sec.seals, m, m.seal).children);
      if (s.kind === "straight" && s.holes) g.add(holes(T, s, m));
      model = g;
    }
  }
  const wrap = new T.Group();
  wrap.add(model);
  wrap.updateMatrixWorld(true);
  const box = new T.Box3().setFromObject(model);
  const c = box.getCenter(new T.Vector3());
  model.position.set(-c.x, -box.min.y, -c.z);
  return wrap;
}

export function disposeTree(o: THREE_NS.Object3D) {
  o.traverse((x) => (x as THREE_NS.Mesh).geometry?.dispose());
}
