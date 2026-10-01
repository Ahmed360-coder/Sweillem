// Pipe assembly for the intro (M00, 0–1.2 s): three glazed pipes fly in and
// snap spigot-into-socket. Ported from the redesign prototype; the drawing
// matches the How-it's-made film (fired glaze #4a2a1c, compression ring #cf4a2f).
// The joint design is illustrative until SWEILLEM confirms its joint system.

const PC = { fired: "#4a2a1c", edge: "#301b12", ring: "#cf4a2f", hot: "#ffb08a" };
const PL = 420;
const PD = 70;
const BL = PD * 0.9;
const BH = PD * 1.3;
const OV = 52;
const PY = 80;
const PX = [20, 20 + PL - OV, 20 + 2 * (PL - OV)];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const backOut = (x: number) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
const r1 = (n: number) => Math.round(n * 10) / 10;

function mixHex(a: string, b: string, p: number) {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = h(a);
  const B = h(b);
  return (
    "#" +
    A.map((v, i) =>
      Math.round(v + (B[i] - v) * clamp(p))
        .toString(16)
        .padStart(2, "0"),
    ).join("")
  );
}

function pipeSide(x: number, y: number, rot: number, ringHeat: number) {
  const barrelX = x + BL;
  const w = PL - BL;
  const g =
    `<rect x="${r1(barrelX)}" y="${y - PD / 2}" width="${w}" height="${PD}" fill="${PC.fired}" stroke="${PC.edge}" stroke-width="2"/>` +
    `<rect x="${r1(x)}" y="${y - BH / 2}" width="${BL}" height="${BH}" rx="${PD * 0.1}" fill="${PC.fired}" stroke="${PC.edge}" stroke-width="2"/>` +
    `<rect x="${r1(barrelX)}" y="${y - PD / 2}" width="${w}" height="${PD}" fill="url(#ip-shade)"/>` +
    `<rect x="${r1(x)}" y="${y - BH / 2}" width="${BL}" height="${BH}" rx="${PD * 0.1}" fill="url(#ip-shade)"/>` +
    `<rect x="${r1(barrelX + 10)}" y="${y - PD * 0.33}" width="${w - 20}" height="${PD * 0.07}" rx="3" fill="#fff" opacity=".45"/>` +
    `<rect x="${r1(x + PL - PD * 0.16)}" y="${y - PD / 2 - 3}" width="${PD * 0.16}" height="${PD + 6}" fill="${
      ringHeat > 0 ? mixHex(PC.ring, PC.hot, ringHeat) : PC.ring
    }"/>` +
    `<rect x="${r1(x)}" y="${y - BH / 2 + 2}" width="${PD * 0.08}" height="${BH - 4}" fill="${PC.ring}"/>`;
  return rot ? `<g transform="rotate(${r1(rot)} ${r1(x + PL / 2)} ${r1(y)})">${g}</g>` : g;
}

function burst(x: number, y: number, p: number) {
  if (p <= 0 || p >= 1) return "";
  let s = "";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const ra = 20 + 90 * easeOut(p) * 0.3;
    const rb = 30 + 110 * easeOut(p);
    s += `<line x1="${r1(x + Math.cos(a) * ra)}" y1="${r1(y + Math.sin(a) * ra)}" x2="${r1(x + Math.cos(a) * rb)}" y2="${r1(
      y + Math.sin(a) * rb,
    )}" stroke="${PC.hot}" stroke-width="${r1(4 * (1 - p))}" stroke-linecap="round" opacity="${r1(1 - p)}"/>`;
  }
  return (
    s +
    `<circle cx="${x}" cy="${y}" r="${r1(18 + 50 * easeOut(p))}" fill="none" stroke="#fff" stroke-width="${r1(
      3 * (1 - p),
    )}" opacity="${r1(0.8 * (1 - p))}"/>`
  );
}

/** The seat times (s) of the two joints, for the screen shake. */
export const jointSeats = [0.68, 0.9] as const;

/** SVG markup for the assembly at time t (seconds). t ≥ 3 is the finished line. */
export function pipesFrame(t: number): string {
  const a0 = backOut(seg(t, 0.05, 0.45));
  const a1 = backOut(seg(t, 0.28, 0.68));
  const a2 = backOut(seg(t, 0.5, 0.9));
  const x0 = -1100 + (PX[0] + 1100) * a0;
  const y1 = -520 + (PY + 520) * a1;
  const x2 = 2300 + (PX[2] - 2300) * a2;
  const rot1 = (1 - a1) * -14;
  const jx = [PX[1] + BL * 0.5, PX[2] + BL * 0.5];
  const sweep = seg(t, 1.5, 2.8);
  const heat = (seat: number) => {
    const p = seg(t, seat, seat + 0.35);
    return p ? 1 - p : 0;
  };

  let s = `<defs><linearGradient id="ip-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient><linearGradient id="ip-sweep" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><clipPath id="ip-clip">${PX.map(
    (x) => `<rect x="${x}" y="${PY - BH / 2}" width="${PL}" height="${BH}"/>`,
  ).join("")}</clipPath></defs>`;
  s += `<ellipse cx="600" cy="${PY + BH / 2 + 14}" rx="${r1(560 * clamp(a0 * 0.4 + a1 * 0.3 + a2 * 0.3))}" ry="8" fill="#000" opacity=".35"/>`;
  s += pipeSide(x0, PY, 0, heat(jointSeats[0]));
  s += pipeSide(PX[1], y1, rot1, heat(jointSeats[1]));
  s += pipeSide(x2, PY, 0, 0);
  if (sweep > 0 && sweep < 1) {
    s += `<rect clip-path="url(#ip-clip)" x="${r1(-200 + 1400 * sweep)}" y="0" width="220" height="160" fill="url(#ip-sweep)"/>`;
  }
  s += burst(jx[0], PY, seg(t, jointSeats[0], jointSeats[0] + 0.32));
  s += burst(jx[1], PY, seg(t, jointSeats[1], jointSeats[1] + 0.32));
  return s;
}
