// How a SWEILLEM vitrified clay pipe is made: from Aswan clay to an installed sewer line.
//
// Every frame is a pure function of time (frameSVG(t) returns an SVG string), so the
// same code plays live on the site and renders frame-exact to MP4 (scripts/render.mjs).
// All captions come from SWEILLEM's own company overview deck and marketing report.

export const W = 1920;
export const H = 1080;

const C = {
  bg: '#f6efe7',
  band: '#efe4d8',
  ink: '#3b3530',
  muted: '#6d625a',
  maroon: '#7a0404',
  grey: '#7f8285',
  line: '#d8c9ba',
  sand: '#e7d3bb',
  soil: '#b98d66',
  soilDark: '#9c7350',
  clay: '#b87a4b',
  clayWet: '#96593a',
  clayDry: '#d7b089',
  glazeWet: '#c9bfb3',
  fired: '#4a2a1c',
  ring: '#cf4a2f',
  steel: '#8d9094',
  steelDark: '#5f6266',
  glow: '#ff8a3d',
  water: '#6b8fa8',
  white: '#fffdfb',
};

// Chapters: [id, start, end, number, title, caption]. Intro and outro carry no number.
export const CHAPTERS = [
  { id: 'intro', start: 0, end: 5, title: 'How a SWEILLEM clay pipe is made', caption: 'Vitrified clay pipes, made in Egypt since 1935.' },
  { id: 'raw', start: 5, end: 13, n: 1, title: 'Raw material', caption: 'The clay begins its journey at the quarry in Aswan. At the factory it is inspected and carefully stored.' },
  { id: 'qc', start: 13, end: 20, n: 2, title: 'Quality control', caption: 'The clay is tested for its percentage of fine minerals, salts and aluminium oxide (Al₂O₃).' },
  { id: 'mould', start: 20, end: 29, n: 3, title: 'Moulding', caption: 'Wet clay is kept in the right atmosphere until it reaches the extruders that shape each pipe. Specialised handling equipment carries it on to the dryers.' },
  { id: 'dry', start: 29, end: 37, n: 4, title: 'Drying', caption: 'The pipe loses most of the water it needed for moulding. The dryers were built under the supervision of Lingl (Germany) and are fully computerised.' },
  { id: 'glaze', start: 37, end: 45, n: 5, title: 'Glazing', caption: 'After a quality check, each pipe is fully immersed in glaze, a thick liquid of natural materials, coating it inside and out.' },
  { id: 'fire', start: 45, end: 56, n: 6, title: 'Final firing', caption: 'Pre-heating removes any remaining humidity. Shuttle kilns then fire each diameter on its own curve, up to 1200 °C over 2 to 4 days, turning the glaze into a glassy cover.' },
  { id: 'joint', start: 56, end: 62, n: 7, title: 'Joints', caption: 'Factory-applied, high-compression joints and couplings make each connection watertight, limiting air and water leakage.' },
  { id: 'deliver', start: 62, end: 69, n: 8, title: 'Delivery', caption: 'Finished pipes go directly from the factory to projects in Egypt, Saudi Arabia and Germany.' },
  { id: 'install', start: 69, end: 81, n: 9, title: 'Installation', caption: 'On site, each spigot is pushed into the next socket, forming a continuous, watertight sewer line underground.' },
  { id: 'outro', start: 81, end: 88, title: 'Built to last', caption: 'Over 100 years of life expectancy, rigid, corrosion resistant and low maintenance.' },
];
export const DURATION = CHAPTERS[CHAPTERS.length - 1].end;
const NUMBERED = CHAPTERS.filter((c) => c.n);

export function chapterAt(t) {
  const tt = Math.min(Math.max(t, 0), DURATION - 1e-6);
  return CHAPTERS.find((c) => tt >= c.start && tt < c.end) || CHAPTERS[CHAPTERS.length - 1];
}

// ---------- maths ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const back = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const rnd = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const f = (n) => Math.round(n * 10) / 10;

function hex(c) { return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); }
function mix(a, b, p) {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(p))).toString(16).padStart(2, '0')).join('');
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, max) {
  const out = []; let line = '';
  for (const w of text.split(' ')) {
    if ((line + ' ' + w).trim().length > max) { out.push(line.trim()); line = w; } else line += ' ' + w;
  }
  if (line.trim()) out.push(line.trim());
  return out;
}

// ---------- primitives ----------
const g = (inner, attrs = '') => `<g ${attrs}>${inner}</g>`;
const tr = (x, y, inner, extra = '') => `<g transform="translate(${f(x)} ${f(y)})${extra}">${inner}</g>`;
function text(x, y, s, { size = 28, weight = 500, fill = C.ink, anchor = 'start', font = 'body', ls = 0, op = 1 } = {}) {
  const fam = font === 'head' ? "'Space Grotesk', Inter, sans-serif" : "Inter, 'Helvetica Neue', Arial, sans-serif";
  return `<text x="${f(x)}" y="${f(y)}" font-family="${fam}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${f(op * 100) / 100}">${esc(s)}</text>`;
}
function label(x, y, s, op = 1, anchor = 'middle') {
  return text(x, y, s.toUpperCase(), { size: 20, weight: 700, fill: C.muted, anchor, ls: 2.5, op });
}

// Side view of a pipe: straight barrel with a socket (bell) at one end, spigot at the other.
function pipe(x, y, len, d, fill, o = {}) {
  const bl = o.bell ?? d * 0.9;
  const bh = d * 1.3;
  const left = o.bellLeft;
  const bx = left ? x : x + len - bl;
  const barrelX = left ? x + bl : x;
  const stroke = `stroke="${mix(fill, '#000000', 0.35)}" stroke-width="2"`;
  let s = `<rect x="${f(barrelX)}" y="${f(y - d / 2)}" width="${f(len - bl)}" height="${f(d)}" fill="${fill}" ${stroke}/>`;
  s += `<rect x="${f(bx)}" y="${f(y - bh / 2)}" width="${f(bl)}" height="${f(bh)}" rx="${f(d * 0.1)}" fill="${fill}" ${stroke}/>`;
  s += `<rect x="${f(barrelX)}" y="${f(y - d / 2)}" width="${f(len - bl)}" height="${f(d)}" fill="url(#hm-shade)"/>`;
  s += `<rect x="${f(bx)}" y="${f(y - bh / 2)}" width="${f(bl)}" height="${f(bh)}" rx="${f(d * 0.1)}" fill="url(#hm-shade)"/>`;
  if (o.gloss) {
    const gl = clamp(o.gloss);
    s += `<rect x="${f(barrelX + 10)}" y="${f(y - d * 0.33)}" width="${f(len - bl - 20)}" height="${f(d * 0.07)}" rx="${f(d * 0.035)}" fill="#ffffff" opacity="${f(0.45 * gl * 100) / 100}"/>`;
    s += `<rect x="${f(bx + 6)}" y="${f(y - bh * 0.36)}" width="${f(bl - 12)}" height="${f(d * 0.06)}" rx="${f(d * 0.03)}" fill="#ffffff" opacity="${f(0.4 * gl * 100) / 100}"/>`;
  }
  if (o.ring) {
    const r = clamp(o.ring);
    const rw = d * 0.16;
    const sx = left ? x + len - rw : x;
    // Compression ring on the spigot end, and the matching seal in the socket mouth.
    s += `<rect x="${f(sx)}" y="${f(y - d / 2 - 3)}" width="${f(rw)}" height="${f((d + 6) * r)}" fill="${C.ring}"/>`;
    const mx = left ? x : x + len - d * 0.08;
    s += `<rect x="${f(mx)}" y="${f(y - bh / 2 + 2)}" width="${f(d * 0.08)}" height="${f((bh - 4) * r)}" fill="${C.ring}"/>`;
  }
  return o.op != null ? `<g opacity="${f(o.op * 100) / 100}">${s}</g>` : s;
}

function wheel(x, y, r, rot = 0) {
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#2f2b28"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.45)}" fill="${C.steel}"/>` +
    `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + Math.cos(rot) * r * 0.45)}" y2="${f(y + Math.sin(rot) * r * 0.45)}" stroke="#2f2b28" stroke-width="4"/>`;
}

// Cab-over truck facing right; trailer extends left of the cab. (x, ground) = rear of the trailer.
function truck(x, ground, len, load = '', rot = 0) {
  const cabX = x + len;
  let s = `<rect x="${f(x)}" y="${f(ground - 92)}" width="${len}" height="20" fill="${C.steelDark}"/>`;
  s += load;
  s += `<rect x="${f(cabX)}" y="${f(ground - 210)}" width="150" height="150" rx="14" fill="${C.white}" stroke="${C.line}" stroke-width="3"/>`;
  s += `<rect x="${f(cabX + 78)}" y="${f(ground - 190)}" width="58" height="56" rx="6" fill="#9fb6c6"/>`;
  s += `<rect x="${f(cabX)}" y="${f(ground - 100)}" width="150" height="16" fill="${C.maroon}"/>`;
  s += `<rect x="${f(cabX + 140)}" y="${f(ground - 80)}" width="14" height="14" rx="3" fill="#f2c14e"/>`;
  s += wheel(x + 60, ground - 34, 34, rot) + wheel(x + 140, ground - 34, 34, rot) + wheel(cabX + 90, ground - 34, 34, rot);
  if (len > 500) s += wheel(x + len - 120, ground - 34, 34, rot);
  return s;
}

function checkBadge(x, y, s = 1, op = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * 100) / 100})" opacity="${f(op * 100) / 100}"><circle r="26" fill="${C.maroon}"/><path d="M-11 1 L-3 9 L12 -8" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

function ground(y, fill = C.sand) {
  return `<rect x="0" y="${y}" width="${W}" height="${810 - y}" fill="${fill}"/><line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.line}" stroke-width="3"/>`;
}

// ---------- scenes (lt = local seconds, d = duration) ----------

function sceneIntro(lt) {
  const a = eOut(seg(lt, 0.2, 1.4));
  const b = eOut(seg(lt, 0.9, 2.1));
  const p = ease(seg(lt, 1.2, 3.6));
  let s = `<image href="${ASSET_BASE}logo.png" x="${f(W / 2 - 330)}" y="${f(170 - 30 * (1 - a))}" width="660" height="224" opacity="${f(a * 100) / 100}"/>`;
  s += text(W / 2, 520, 'How a SWEILLEM clay pipe is made', { size: 64, weight: 700, font: 'head', anchor: 'middle', op: b });
  s += text(W / 2, 580, 'From Aswan clay to an installed sewer line', { size: 32, weight: 500, fill: C.muted, anchor: 'middle', op: b });
  s += pipe(lerp(-900, W / 2 - 450, p), 720, 900, 90, C.fired, { gloss: 1, ring: 1 });
  return s;
}

function sceneRaw(lt) {
  const gy = 690;
  let s = ground(gy);
  // Quarry: terraced clay hill.
  const hill = [[80, gy], [140, 520], [260, 520], [300, 430], [430, 430], [470, 350], [540, 350], [600, gy]];
  s += `<polygon points="${hill.map((p) => p.join(',')).join(' ')}" fill="${C.clay}"/>`;
  s += `<polygon points="140,520 260,520 300,430 430,430 470,350 480,350 440,440 310,440 270,530 150,530" fill="${C.clayWet}" opacity=".5"/>`;
  s += label(340, 740, 'Aswan quarry');
  // Factory.
  const fx = 1380;
  s += `<rect x="${fx}" y="440" width="420" height="${gy - 440}" fill="${C.white}" stroke="${C.line}" stroke-width="3"/>`;
  s += `<polygon points="${fx},440 ${fx + 70},380 ${fx + 140},440 ${fx + 210},380 ${fx + 280},440 ${fx + 350},380 ${fx + 420},440" fill="${C.grey}"/>`;
  s += `<rect x="${fx + 330}" y="300" width="40" height="120" fill="${C.grey}"/>`;
  s += `<rect x="${fx + 40}" y="520" width="120" height="${gy - 520}" fill="${C.band}" stroke="${C.line}" stroke-width="3"/>`;
  s += text(fx + 290, 560, 'SWEILLEM', { size: 30, weight: 700, fill: C.maroon, anchor: 'middle', font: 'head' });
  s += label(fx + 210, 740, 'Factory');
  // Stockpile grows after unloading.
  const pile = eOut(seg(lt, 5.0, 6.6));
  const pileX = 790;
  if (pile > 0) {
    const ph = 110 * pile;
    s += `<path d="M ${pileX - 110} ${gy} Q ${pileX} ${f(gy - ph * 2)} ${pileX + 110} ${gy} Z" fill="${C.clay}"/>`;
  }
  const insp = seg(lt, 6.4, 7.0);
  if (insp > 0) s += checkBadge(pileX - 60, gy - 290, back(insp), insp) + label(pileX - 60, gy - 336, 'Inspected & stored', insp);
  // Dump truck drives in, then tips.
  const drive = ease(seg(lt, 0.6, 4.6));
  const tx = lerp(260, 900, drive);
  const tip = ease(seg(lt, 4.8, 5.8)) * (1 - ease(seg(lt, 6.6, 7.4)));
  const len = 300;
  const bedPivotX = tx + 20, bedPivotY = gy - 92;
  const heap = 1 - eOut(seg(lt, 5.0, 6.2));
  let bed = `<path d="M 0 0 L ${len - 20} 0 L ${len - 10} -90 L -10 -90 Z" fill="${C.maroon}"/>`;
  if (heap > 0.02) bed += `<path d="M 10 -88 Q ${len / 2} ${-88 - 90 * heap} ${len - 30} -88 Z" fill="${C.clay}"/>`;
  let body = `<g transform="translate(${f(bedPivotX)} ${f(bedPivotY)}) rotate(${f(-38 * tip)})">${bed}</g>`;
  s += truck(tx, gy, len, '', drive * 22);
  s += body;
  // Clay stream while tipping.
  if (tip > 0.5 && heap > 0.05) {
    for (let i = 0; i < 10; i++) {
      const k = (lt * 2.2 + rnd(i)) % 1;
      s += `<circle cx="${f(tx - 20 - k * 60 - rnd(i + 9) * 20)}" cy="${f(gy - 110 + k * 100)}" r="${f(6 + rnd(i + 3) * 6)}" fill="${C.clay}"/>`;
    }
  }
  // Nile route inset.
  const ins = eOut(seg(lt, 0.2, 1.0));
  const dot = ease(seg(lt, 0.8, 4.6));
  const nile = 'M 150 330 C 180 290 120 250 150 210 C 175 170 130 140 150 100';
  let m = `<rect x="60" y="60" width="300" height="300" rx="18" fill="${C.white}" stroke="${C.line}" stroke-width="2"/>`;
  m += `<path d="${nile}" fill="none" stroke="#9fb6c6" stroke-width="8" stroke-linecap="round"/>`;
  m += `<path d="${nile}" fill="none" stroke="${C.maroon}" stroke-width="4" stroke-dasharray="${f(300 * dot)} 400" stroke-linecap="round"/>`;
  m += `<circle cx="150" cy="330" r="10" fill="${C.clay}"/><circle cx="150" cy="100" r="10" fill="${C.maroon}"/>`;
  m += text(172, 338, 'Aswan', { size: 22, weight: 600 }) + text(172, 108, 'Greater Cairo', { size: 22, weight: 600 });
  m += text(172, 134, 'Factory', { size: 18, weight: 500, fill: C.muted });
  s += `<g transform="translate(0 ${f(-20 * (1 - ins))})" opacity="${f(ins * 100) / 100}">${m}</g>`;
  return s;
}

function sceneQC(lt) {
  let s = ground(640);
  // Bench and sample.
  s += `<rect x="160" y="560" width="620" height="24" rx="6" fill="${C.grey}"/>`;
  s += `<rect x="190" y="584" width="20" height="56" fill="${C.grey}"/><rect x="730" y="584" width="20" height="56" fill="${C.grey}"/>`;
  s += `<rect x="260" y="520" width="200" height="40" rx="6" fill="${C.steel}"/>`;
  s += `<path d="M 290 520 Q 300 430 360 430 Q 430 430 430 520 Z" fill="${C.clay}"/>`;
  s += `<rect x="560" y="430" width="70" height="130" rx="10" fill="#e9eef2" stroke="${C.line}" stroke-width="3"/>`;
  s += `<rect x="568" y="${f(560 - 90 * eOut(seg(lt, 0.4, 1.6)))}" width="54" height="${f(90 * eOut(seg(lt, 0.4, 1.6)) - 8)}" rx="6" fill="${C.clayDry}" opacity=".8"/>`;
  // Magnifier sweeping over the sample.
  const mx = 360 + Math.sin(lt * 1.6) * 60, my = 420 + Math.cos(lt * 2.1) * 20;
  s += `<g transform="translate(${f(mx)} ${f(my)})"><circle r="56" fill="#ffffff" opacity=".35" stroke="${C.ink}" stroke-width="10"/><line x1="40" y1="40" x2="95" y2="95" stroke="${C.ink}" stroke-width="16" stroke-linecap="round"/></g>`;
  // Three tests.
  const tests = ['Fine minerals', 'Salts', 'Aluminium oxide (Al₂O₃)'];
  tests.forEach((name, i) => {
    const y = 250 + i * 150;
    const t0 = 1.0 + i * 1.6;
    const a = eOut(seg(lt, t0 - 0.4, t0));
    const p = ease(seg(lt, t0, t0 + 1.3));
    const ok = seg(lt, t0 + 1.3, t0 + 1.7);
    let r = text(0, -22, name, { size: 30, weight: 600, font: 'head' });
    r += `<rect x="0" y="0" width="760" height="34" rx="17" fill="${C.white}" stroke="${C.line}" stroke-width="2"/>`;
    const fill = 480 + i * 60;
    r += `<rect x="0" y="0" width="${f(fill * p)}" height="34" rx="17" fill="${C.clay}"/>`;
    if (ok > 0) r += checkBadge(820, 17, back(ok), ok);
    s += `<g transform="translate(${900 + 30 * (1 - a)} ${y})" opacity="${f(a * 100) / 100}">${r}</g>`;
  });
  return s;
}

function sceneMould(lt) {
  const gy = 690;
  let s = ground(gy);
  // Extruder with hopper, auger window and die.
  const ex = 180, ey = 380, ew = 560, eh = 180;
  s += `<polygon points="${ex + 120},${ey} ${ex + 320},${ey} ${ex + 380},${ey - 150} ${ex + 60},${ey - 150}" fill="${C.grey}"/>`;
  s += `<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" rx="16" fill="${C.steel}"/>`;
  s += `<rect x="${ex + 60}" y="${ey + 50}" width="${ew - 120}" height="80" rx="10" fill="#2f2b28"/>`;
  // Auger: moving zigzag.
  const ph = (lt * 90) % 60;
  let aug = '';
  for (let x = -60; x < ew - 120 + 60; x += 60) aug += `M ${f(x + ph)} 0 L ${f(x + ph + 30)} 80 `;
  s += `<svg x="${ex + 60}" y="${ey + 50}" width="${ew - 120}" height="80" overflow="hidden"><rect width="100%" height="100%" fill="${C.clayWet}"/><path d="${aug}" stroke="#d8c3ae" stroke-width="10" fill="none"/></svg>`;
  s += `<rect x="${ex + 60}" y="${ey + 50}" width="${ew - 120}" height="80" rx="10" fill="none" stroke="${C.steelDark}" stroke-width="6"/>`;
  s += `<rect x="${ex + ew}" y="${ey + 20}" width="60" height="${eh - 40}" rx="8" fill="${C.steelDark}"/>`;
  s += `<rect x="${ex}" y="${ey + eh}" width="${ew}" height="${gy - ey - eh}" fill="${C.grey}" opacity=".6"/>`;
  s += label(ex + ew / 2, 740, 'Extruder');
  // Wet clay falling into the hopper.
  for (let i = 0; i < 12; i++) {
    const k = (lt * 0.9 + rnd(i)) % 1;
    const x = ex + 150 + rnd(i + 20) * 140;
    const y = ey - 260 + k * 250;
    if (lt < 6) s += `<rect x="${f(x)}" y="${f(y)}" width="${f(16 + rnd(i) * 14)}" height="${f(14 + rnd(i + 5) * 12)}" rx="5" fill="${C.clayWet}" opacity="${f((1 - k * 0.3) * 100) / 100}"/>`;
  }
  s += text(ex + 220, ey - 170, 'Wet clay', { size: 22, weight: 600, fill: C.muted, anchor: 'middle', op: 1 - seg(lt, 5.5, 6.5) });
  // Pipe emerges from the die, is cut, then carried away.
  const dieX = ex + ew + 60, py = ey + eh / 2, dia = 110, full = 760;
  const grow = ease(seg(lt, 1.0, 5.2));
  const carry = ease(seg(lt, 6.0, 8.6));
  const L = full * grow;
  const px = dieX + carry * 1300;
  // Handling carriage under the pipe.
  const cy = py + dia * 0.65;
  const cartX = dieX + 120 + carry * 1300;
  s += `<rect x="${f(cartX)}" y="${f(cy)}" width="520" height="22" rx="6" fill="${C.maroon}" opacity="${f(seg(lt, 4.4, 5.2) * 100) / 100}"/>`;
  s += `<rect x="${f(cartX + 60)}" y="${f(cy + 22)}" width="16" height="${f(gy - cy - 50)}" fill="${C.steelDark}"/><rect x="${f(cartX + 440)}" y="${f(cy + 22)}" width="16" height="${f(gy - cy - 50)}" fill="${C.steelDark}"/>`;
  s += wheel(cartX + 68, gy - 22, 22, carry * 40) + wheel(cartX + 448, gy - 22, 22, carry * 40);
  if (L > 4) s += pipe(px, py, Math.max(L, dia), dia, C.clayWet, { bell: L > dia * 1.4 ? dia * 0.9 : 0.01 });
  const cut = seg(lt, 5.3, 5.9);
  if (cut > 0 && cut < 1) s += `<line x1="${dieX + 4}" y1="${py - 90}" x2="${dieX + 4}" y2="${py + 90}" stroke="#ffffff" stroke-width="${f(8 * Math.sin(cut * Math.PI))}"/>`;
  const arrow = seg(lt, 6.6, 7.4);
  if (arrow > 0) s += `<g opacity="${f(arrow * 100) / 100}">${text(1560, 330, 'To the dryers', { size: 30, weight: 600, font: 'head', anchor: 'middle' })}<path d="M 1480 360 L 1640 360 M 1620 345 L 1642 360 L 1620 375" stroke="${C.maroon}" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
  s += label(dieX + 400, 740, 'Handling equipment', seg(lt, 4.6, 5.4));
  return s;
}

function sceneDry(lt) {
  const gy = 700;
  let s = ground(gy);
  const dx = 240, dy = 170, dw = 1100, dh = gy - dy;
  const dry = ease(seg(lt, 0.8, 6.2));
  s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="12" fill="${C.white}" stroke="${C.line}" stroke-width="4"/>`;
  s += `<rect x="${dx}" y="${dy}" width="${dw}" height="60" rx="12" fill="${C.grey}"/>`;
  s += text(dx + 30, dy + 40, 'DRYER · COMPUTER CONTROLLED', { size: 24, weight: 700, fill: '#fff', ls: 2 });
  // Warm air waves.
  for (let i = 0; i < 5; i++) {
    const y = dy + 110 + i * 100;
    const ph = (lt * 120 + i * 50) % 200;
    s += `<path d="M ${dx + 20 + ph} ${y} q 25 -14 50 0 t 50 0 t 50 0" fill="none" stroke="${C.glow}" stroke-width="4" opacity=".35"/>`;
  }
  // Pipes standing upright, socket at the bottom.
  const col = mix(C.clayWet, C.clayDry, dry);
  for (let i = 0; i < 5; i++) {
    const cx = dx + 170 + i * 190;
    s += `<g transform="translate(${cx} ${gy - 10}) rotate(-90)">${pipe(0, 0, 400, 100, col, { bellLeft: true })}</g>`;
  }
  // Moisture leaving.
  for (let i = 0; i < 26; i++) {
    const k = (lt * 0.55 + rnd(i)) % 1;
    const x = dx + 150 + (i % 5) * 190 + (rnd(i + 3) - 0.5) * 60;
    const y = gy - 120 - k * 420;
    const op = (1 - k) * (1 - dry * 0.85);
    s += `<path d="M ${f(x)} ${f(y - 14)} Q ${f(x + 10)} ${f(y)} ${f(x)} ${f(y + 6)} Q ${f(x - 10)} ${f(y)} ${f(x)} ${f(y - 14)} Z" fill="${C.water}" opacity="${f(op * 100) / 100}"/>`;
  }
  // Control panel.
  const px = 1440, py = 230;
  s += `<rect x="${px}" y="${py}" width="380" height="380" rx="18" fill="${C.ink}"/>`;
  s += `<rect x="${px + 24}" y="${py + 24}" width="332" height="230" rx="10" fill="#1f1b18"/>`;
  s += text(px + 44, py + 64, 'MOISTURE', { size: 20, weight: 700, fill: '#b9aea6', ls: 2 });
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const k = i / 40; if (k > dry + 0.02) break;
    pts.push(`${f(px + 44 + k * 290)},${f(py + 100 + Math.pow(k, 0.7) * 120)}`);
  }
  if (pts.length > 1) s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${C.glow}" stroke-width="5" stroke-linejoin="round"/>`;
  s += `<rect x="${px + 44}" y="${py + 280}" width="290" height="24" rx="12" fill="#1f1b18"/>`;
  s += `<rect x="${px + 44}" y="${py + 280}" width="${f(290 * (1 - dry * 0.85))}" height="24" rx="12" fill="${C.water}"/>`;
  s += text(px + 44, py + 344, 'Built under Lingl supervision', { size: 20, weight: 500, fill: '#d8c9ba' });
  return s;
}

function sceneGlaze(lt) {
  const gy = 720;
  let s = ground(gy);
  // Overhead hoist rail.
  s += `<rect x="120" y="110" width="1400" height="18" fill="${C.steelDark}"/>`;
  const tank = { x: 420, y: 470, w: 900, h: gy - 470 };
  const liquidTop = tank.y + 50;
  const down = ease(seg(lt, 1.6, 3.4));
  const up = ease(seg(lt, 4.8, 6.4));
  const py = lerp(300, 620, down) - lerp(0, 320, up);
  const px = 570, len = 600, dia = 110;
  const coated = seg(lt, 3.2, 4.6);
  const col = mix(C.clayDry, C.glazeWet, coated);
  // Hook and slings.
  s += `<rect x="${px + len / 2 - 40}" y="118" width="80" height="30" rx="6" fill="${C.maroon}"/>`;
  s += `<line x1="${px + len / 2}" y1="148" x2="${px + len / 2}" y2="${f(py - 150)}" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<line x1="${px + len / 2}" y1="${f(py - 150)}" x2="${px + 110}" y2="${f(py - dia / 2)}" stroke="${C.ink}" stroke-width="4"/>`;
  s += `<line x1="${px + len / 2}" y1="${f(py - 150)}" x2="${px + len - 160}" y2="${f(py - dia / 2)}" stroke="${C.ink}" stroke-width="4"/>`;
  // Tank back wall.
  s += `<rect x="${tank.x}" y="${tank.y}" width="${tank.w}" height="${tank.h}" fill="${C.steel}"/>`;
  s += pipe(px, py, len, dia, col, { gloss: coated * 0.8 });
  // Drips after lifting.
  if (up > 0.2) {
    for (let i = 0; i < 9; i++) {
      const k = (lt * 1.3 + rnd(i)) % 1;
      const x = px + 40 + rnd(i + 4) * (len - 80);
      s += `<ellipse cx="${f(x)}" cy="${f(py + dia / 2 + 6 + k * 120)}" rx="5" ry="8" fill="${C.glazeWet}" opacity="${f((1 - k) * 100) / 100}"/>`;
    }
  }
  // Glaze liquid in front (hides the submerged part).
  const wob = Math.sin(lt * 6) * 6 * seg(lt, 3, 3.4) * (1 - seg(lt, 4.2, 5));
  s += `<path d="M ${tank.x + 10} ${liquidTop} Q ${tank.x + tank.w / 4} ${f(liquidTop - wob)} ${tank.x + tank.w / 2} ${liquidTop} T ${tank.x + tank.w - 10} ${liquidTop} L ${tank.x + tank.w - 10} ${gy} L ${tank.x + 10} ${gy} Z" fill="${C.glazeWet}" opacity=".94"/>`;
  s += `<rect x="${tank.x - 10}" y="${tank.y}" width="20" height="${tank.h}" fill="${C.steelDark}"/><rect x="${tank.x + tank.w - 10}" y="${tank.y}" width="20" height="${tank.h}" fill="${C.steelDark}"/>`;
  s += label(tank.x + tank.w / 2, 770, 'Glaze tank');
  // QC stamp at the start.
  const qc = seg(lt, 0.3, 0.9) * (1 - seg(lt, 1.4, 1.8));
  if (qc > 0) s += checkBadge(px + len + 70, 300, back(qc), qc) + label(px + len + 70, 260, 'QC passed', qc);
  // Cross-section inset: glaze inside and out.
  const ins = eOut(seg(lt, 5.8, 6.6));
  if (ins > 0) {
    let c = `<circle r="120" fill="${C.glazeWet}"/><circle r="110" fill="${C.clayDry}"/><circle r="84" fill="${C.glazeWet}"/><circle r="76" fill="${C.bg}"/>`;
    c += `<line x1="116" y1="-30" x2="190" y2="-80" stroke="${C.ink}" stroke-width="3"/>` + text(196, -74, 'Glaze outside', { size: 24, weight: 600 });
    c += `<line x1="70" y1="30" x2="190" y2="80" stroke="${C.ink}" stroke-width="3"/>` + text(196, 88, 'Glaze inside', { size: 24, weight: 600 });
    s += `<g transform="translate(1500 460) scale(${f(ins * 100) / 100})" opacity="${f(ins * 100) / 100}">${c}</g>`;
  }
  return s;
}

function sceneFire(lt) {
  const gy = 710;
  let s = ground(gy);
  // Pre-heating chamber (left), then the shuttle kiln.
  const pre = 1 - seg(lt, 3.4, 4.0);
  if (pre > 0) {
    let p = `<rect x="140" y="300" width="560" height="${gy - 300}" rx="12" fill="${C.white}" stroke="${C.line}" stroke-width="4"/>`;
    p += `<rect x="140" y="300" width="560" height="54" rx="12" fill="${C.grey}"/>` + text(170, 337, 'PRE-HEATING', { size: 24, weight: 700, fill: '#fff', ls: 2 });
    p += pipe(200, 560, 440, 100, C.glazeWet);
    for (let i = 0; i < 4; i++) {
      const ph = (lt * 160 + i * 70) % 300;
      p += `<path d="M ${170 + ph} ${410 + i * 22} q 20 -10 40 0 t 40 0" fill="none" stroke="${C.glow}" stroke-width="4" opacity=".5"/>`;
    }
    for (let i = 0; i < 10; i++) {
      const k = (lt * 0.7 + rnd(i)) % 1;
      p += `<circle cx="${f(230 + rnd(i + 2) * 380)}" cy="${f(500 - k * 150)}" r="5" fill="${C.water}" opacity="${f((1 - k) * (1 - seg(lt, 0.5, 3)) * 100) / 100}"/>`;
    }
    const dry = seg(lt, 2.4, 3.0);
    if (dry > 0) p += checkBadge(640, 420, back(dry), dry) + text(420, 460, 'No humidity left', { size: 26, weight: 600, anchor: 'middle', op: dry });
    s += `<g opacity="${f(pre * 100) / 100}">${p}</g>`;
  }
  const kin = seg(lt, 3.4, 4.2);
  if (kin > 0) {
    const kx = 640, ky = 200, kw = 700, kh = gy - ky;
    const heat = ease(seg(lt, 6.2, 9.2)) * (1 - ease(seg(lt, 9.6, 10.8)));
    const doorClosed = ease(seg(lt, 5.6, 6.1)) * (1 - ease(seg(lt, 9.4, 9.9)));
    let k = `<rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" rx="16" fill="${C.grey}"/>`;
    k += `<rect x="${kx + 40}" y="${ky + 90}" width="${kw - 80}" height="${kh - 90}" fill="${mix('#3a2d27', C.glow, heat * 0.85)}"/>`;
    k += text(kx + kw / 2, ky + 60, 'SHUTTLE KILN', { size: 28, weight: 700, fill: '#fff', anchor: 'middle', ls: 3 });
    // Kiln car with three pipes; rolls in, then out fired.
    const inP = ease(seg(lt, 4.0, 5.6));
    const outP = ease(seg(lt, 9.9, 11));
    const carX = lerp(-640, kx + 70, inP) - outP * 620;
    const firedP = seg(lt, 7.0, 9.4);
    const pc = mix(C.glazeWet, C.fired, firedP);
    const hot = heat * 0.7;
    let car = `<rect x="0" y="${gy - 60}" width="560" height="26" rx="6" fill="${C.steelDark}"/>` + wheel(70, gy - 20, 20, carX / 40) + wheel(490, gy - 20, 20, carX / 40);
    for (let i = 0; i < 3; i++) car += pipe(20, gy - 110 - i * 104, 520, 96, mix(pc, C.glow, hot), { gloss: firedP, bellLeft: i === 1 });
    k += tr(carX, 0, car);
    // Sliding door.
    k += `<rect x="${kx + 40}" y="${ky + 90}" width="${kw - 80}" height="${f((kh - 90) * doorClosed)}" fill="${C.steelDark}"/>`;
    if (doorClosed > 0.9) k += `<rect x="${kx + 40}" y="${ky + 90}" width="${kw - 80}" height="${kh - 90}" fill="${C.glow}" opacity="${f(heat * 0.25 * 100) / 100}"/>`;
    // Thermometer and firing curve.
    const tx = 1450, ty = 190;
    const temp = Math.round(1200 * ease(seg(lt, 6.2, 9.2)) * (1 - ease(seg(lt, 9.8, 10.8)) * 0.85) / 10) * 10;
    k += `<rect x="${tx}" y="${ty}" width="400" height="430" rx="18" fill="${C.white}" stroke="${C.line}" stroke-width="3"/>`;
    k += text(tx + 32, ty + 52, 'KILN TEMPERATURE', { size: 20, weight: 700, fill: C.muted, ls: 2 });
    k += text(tx + 32, ty + 132, `${temp.toLocaleString('en-US')} °C`, { size: 70, weight: 700, font: 'head', fill: temp >= 1200 ? C.maroon : C.ink });
    const cp = seg(lt, 6.2, 10.8), pts = [];
    for (let i = 0; i <= 50; i++) {
      const u = i / 50; if (u > cp) break;
      const tv = u < 0.65 ? ease(u / 0.65) : 1 - ease((u - 0.65) / 0.35) * 0.85;
      pts.push(`${f(tx + 32 + u * 336)},${f(ty + 360 - tv * 170)}`);
    }
    k += `<line x1="${tx + 32}" y1="${ty + 360}" x2="${tx + 368}" y2="${ty + 360}" stroke="${C.line}" stroke-width="3"/>`;
    k += `<line x1="${tx + 32}" y1="${ty + 190}" x2="${tx + 368}" y2="${ty + 190}" stroke="${C.line}" stroke-width="2" stroke-dasharray="8 8"/>`;
    if (pts.length > 1) k += `<polyline points="${pts.join(' ')}" fill="none" stroke="${C.glow}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
    k += text(tx + 32, ty + 404, 'Firing curve over 2–4 days', { size: 22, weight: 600, fill: C.ink });
    s += `<g opacity="${f(eOut(kin) * 100) / 100}">${k}</g>`;
  }
  return s;
}

function sceneJoint(lt) {
  let s = ground(700);
  const y = 430, dia = 200;
  const ringP = ease(seg(lt, 0.5, 2.0));
  const slide = ease(seg(lt, 2.4, 4.2));
  // Pipe A (spigot on its right end) slides into pipe B's socket.
  const aLen = 900, bX = 1000;
  const aX = lerp(-40, 150, slide);
  // Pipe A: socket at left, spigot at right, with ring on the spigot.
  let a = pipe(aX, y, aLen, dia, C.fired, { gloss: 1, bellLeft: true });
  const rw = dia * 0.16;
  a += `<rect x="${f(aX + aLen - rw - 10)}" y="${f(y - dia / 2 - 4)}" width="${f(rw)}" height="${f((dia + 8) * ringP)}" fill="${C.ring}"/>`;
  s += a;
  // Pipe B: socket on its left end, drawn on top so the spigot sits inside it.
  s += pipe(bX, y, 900, dia, C.fired, { gloss: 1 , bellLeft: true});
  s += `<rect x="${bX}" y="${f(y - dia * 0.65 + 2)}" width="${f(dia * 0.1)}" height="${f((dia * 1.3 - 4) * ringP)}" fill="${C.ring}"/>`;
  const l1 = seg(lt, 1.0, 1.6);
  s += `<g opacity="${f(l1 * 100) / 100}"><line x1="${f(aX + aLen - 40)}" y1="${y - dia / 2 - 10}" x2="${f(aX + aLen - 120)}" y2="${y - 210}" stroke="${C.ink}" stroke-width="3"/>${text(aX + aLen - 130, y - 222, 'Compression joint on the spigot', { size: 26, weight: 600, anchor: 'end' })}</g>`;
  s += `<g opacity="${f(l1 * 100) / 100}"><line x1="${bX + 20}" y1="${y + dia * 0.65 + 6}" x2="${bX + 90}" y2="${y + 210}" stroke="${C.ink}" stroke-width="3"/>${text(bX + 100, y + 222, 'Seal in the socket', { size: 26, weight: 600 })}</g>`;
  // Pressure arrows and watertight badge.
  const push = seg(lt, 2.4, 4.2) * (1 - seg(lt, 4.3, 4.8));
  if (push > 0) s += `<path d="M ${f(aX + 250)} ${y} l 120 0 m -24 -18 l 26 18 l -26 18" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="${f(push * 100) / 100}"/>`;
  const ok = seg(lt, 4.3, 4.9);
  if (ok > 0) s += checkBadge(bX + 60, y - 230, back(ok), ok) + text(bX + 100, y - 220, 'Watertight', { size: 34, weight: 700, font: 'head', fill: C.maroon, op: ok });
  return s;
}

function sceneDeliver(lt) {
  const gy = 690;
  let s = ground(gy, '#d9cfc4');
  for (let x = -((lt * 400) % 160); x < W; x += 160) s += `<rect x="${f(x)}" y="${gy + 50}" width="80" height="8" fill="#fff" opacity=".7"/>`;
  // Skyline.
  for (let i = 0; i < 14; i++) {
    const h = 80 + rnd(i) * 180, w = 90 + rnd(i + 7) * 60;
    s += `<rect x="${f(i * 140 - 20)}" y="${f(gy - h)}" width="${f(w)}" height="${f(h)}" fill="#e8ddd1"/>`;
  }
  // Destinations.
  const dests = ['Egypt', 'Saudi Arabia', 'Germany'];
  dests.forEach((d, i) => {
    const a = back(seg(lt, 1.8 + i * 0.7, 2.4 + i * 0.7));
    const op = seg(lt, 1.8 + i * 0.7, 2.2 + i * 0.7);
    const x = 560 + i * 400;
    s += `<g transform="translate(${x} 170) scale(${f(Math.max(a, 0) * 100) / 100})" opacity="${f(op * 100) / 100}"><rect x="-150" y="-44" width="300" height="88" rx="44" fill="${C.white}" stroke="${C.line}" stroke-width="3"/><circle cx="-100" cy="0" r="14" fill="${C.maroon}"/>${text(-70, 11, d, { size: 32, weight: 700, font: 'head' })}</g>`;
  });
  if (seg(lt, 2.0, 4.2) > 0) {
    const dash = seg(lt, 2.0, 4.2);
    s += `<path d="M 710 170 L 810 170 M 1110 170 L 1210 170" stroke="${C.maroon}" stroke-width="4" stroke-dasharray="10 10" opacity="${f(dash * 100) / 100}"/>`;
  }
  // Flatbed with pipes stacked socket-to-spigot, as in the delivery photos.
  const drive = lt < 3.6 ? eOut(seg(lt, 0, 3.6)) * 0.5 : 0.5 + ease(seg(lt, 4.6, 7)) * 0.5;
  const len = 820;
  const x = lerp(-len - 200, W + 60, drive);
  let load = '';
  for (let r = 0; r < 3; r++) for (let c2 = 0; c2 < 2; c2++) {
    const lx = x + 20 + c2 * 400, ly = gy - 132 - r * 72;
    load += pipe(lx, ly, 390, 64, C.fired, { gloss: 1, bellLeft: (r + c2) % 2 === 1 });
  }
  load += `<rect x="${f(x + 210)}" y="${gy - 350}" width="12" height="260" fill="${C.ring}" opacity=".9"/><rect x="${f(x + 610)}" y="${gy - 350}" width="12" height="260" fill="${C.ring}" opacity=".9"/>`;
  s += truck(x, gy, len, load, drive * 60);
  return s;
}

function sceneInstall(lt) {
  const sy = 360, ty = 720; // surface, trench bottom
  let s = `<rect x="0" y="${sy}" width="${W}" height="${810 - sy}" fill="${C.soil}"/>`;
  s += `<rect x="0" y="${sy}" width="${W}" height="16" fill="#8e9a5b"/>`;
  // Trench.
  const tx0 = 180, tx1 = 1740;
  s += `<rect x="${tx0}" y="${sy}" width="${tx1 - tx0}" height="${ty - sy}" fill="#e6d4bf"/>`;
  s += `<rect x="${tx0}" y="${ty}" width="${tx1 - tx0}" height="${810 - ty}" fill="${C.soilDark}"/>`;
  // Backfill rises after the line is joined.
  const fill = ease(seg(lt, 7.8, 9.6));
  if (fill > 0) s += `<rect x="${tx0}" y="${f(ty - (ty - sy) * fill)}" width="${tx1 - tx0}" height="${f((ty - sy) * fill)}" fill="${C.soilDark}" opacity=".9"/>`;
  const py = ty - 52, dia = 88, len = 500, ov = 40;
  const pos = [240, 240 + len - ov, 240 + 2 * (len - ov)];
  // Placement timing for pipe 2 and pipe 3: lower, then push the spigot home.
  const place = (t0) => ({ low: ease(seg(lt, t0, t0 + 2)), push: ease(seg(lt, t0 + 2.1, t0 + 3)) });
  const p2 = place(0.4), p3 = place(3.8);
  const pipes = [
    { x: pos[0], y: py },
    { x: pos[1] + 70 * (1 - p2.push), y: lerp(170, py, p2.low), show: true },
    { x: pos[2] + 70 * (1 - p3.push), y: lerp(170, py, p3.low), show: lt > 3.4 },
  ];
  // Flow through the finished line.
  const flow = seg(lt, 9.6, 10.2);
  pipes.forEach((p, i) => { if (i === 0 || p.show) s += pipe(p.x, p.y, len, dia, C.fired, { gloss: 1, ring: 1 }); });
  if (flow > 0) {
    const ph = (lt * 160) % 80;
    s += `<svg x="${pos[0]}" y="${py - 14}" width="${pos[2] + len - pos[0]}" height="28" overflow="hidden" opacity="${f(flow * 100) / 100}"><path d="M ${f(-80 + ph)} 14 ${Array.from({ length: 22 }, (_, i) => `M ${f(-80 + ph + i * 80)} 14 l 40 0`).join(' ')}" stroke="${C.water}" stroke-width="10" stroke-linecap="round"/></svg>`;
    s += text(pos[0] + 20, py - 80, 'Wastewater flows through a watertight line', { size: 28, weight: 700, font: 'head', fill: '#fff', op: flow });
  }
  // Excavator on the surface to the right, lifting the pipe being placed.
  const active = lt < 3.9 ? pipes[1] : pipes[2];
  const lifting = lt < 7.4;
  const exit = ease(seg(lt, 7.2, 8.4));
  const bx = 1500 + exit * 600, by = sy;
  let e = `<rect x="${bx}" y="${by - 50}" width="300" height="50" rx="25" fill="#2f2b28"/>`;
  e += `<rect x="${bx + 20}" y="${by - 170}" width="260" height="120" rx="12" fill="#e0a526"/>`;
  e += `<rect x="${bx + 170}" y="${by - 240}" width="100" height="80" rx="8" fill="#e0a526"/><rect x="${bx + 185}" y="${by - 228}" width="70" height="50" rx="4" fill="#9fb6c6"/>`;
  const hx = lifting ? active.x + len / 2 : bx - 160, hy = lifting ? 150 : 220;
  const pvx = bx + 60, pvy = by - 150;
  const elx = (pvx + hx) / 2 + 40, ely = Math.min(pvy, hy) - 80;
  e += `<path d="M ${pvx} ${pvy} L ${f(elx)} ${f(ely)} L ${f(hx)} ${hy}" stroke="#e0a526" stroke-width="30" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (lifting) {
    e += `<line x1="${f(hx)}" y1="${hy}" x2="${f(hx)}" y2="${f(active.y - 110)}" stroke="${C.ink}" stroke-width="4"/>`;
    e += `<path d="M ${f(active.x + 100)} ${f(active.y - dia / 2)} L ${f(hx)} ${f(active.y - 110)} L ${f(active.x + len - 150)} ${f(active.y - dia / 2)}" stroke="${C.ink}" stroke-width="4" fill="none"/>`;
  }
  s += e;
  // Joint call-outs.
  const j = seg(lt, 2.6, 3.1) * (1 - seg(lt, 7.6, 8));
  if (j > 0) s += text(pos[1] + 10, py + 90, 'Spigot into socket', { size: 26, weight: 700, anchor: 'middle', op: j });
  return s;
}

function sceneOutro(lt) {
  const pts = [
    ['100+ years', 'Life expectancy'],
    ['Rigid', 'Does not deflect under load'],
    ['Corrosion resistant', 'Acids, industrial waste, aggressive soils'],
    ['Low maintenance', 'Tight joints limit leakage'],
  ];
  let s = '';
  pts.forEach(([h, b], i) => {
    const a = eOut(seg(lt, 0.3 + i * 0.35, 1.0 + i * 0.35));
    const x = 120 + i * 430;
    s += `<g transform="translate(${x} ${f(180 + 40 * (1 - a))})" opacity="${f(a * 100) / 100}"><rect width="390" height="220" rx="20" fill="${C.white}" stroke="${C.line}" stroke-width="3"/><rect width="8" height="220" fill="${C.maroon}"/>${text(36, 90, h, { size: 40, weight: 700, font: 'head', fill: C.maroon })}${wrap(b, 26).map((l, k) => text(36, 140 + k * 34, l, { size: 24, weight: 500, fill: C.muted })).join('')}</g>`;
  });
  const lg = eOut(seg(lt, 2.2, 3.2));
  s += `<image href="${ASSET_BASE}logo.png" x="${W / 2 - 280}" y="${f(500 + 20 * (1 - lg))}" width="560" height="190" opacity="${f(lg * 100) / 100}"/>`;
  s += text(W / 2, 760, 'Leading in the clay pipes industry since 1935', { size: 30, weight: 600, fill: C.ink, anchor: 'middle', op: seg(lt, 2.8, 3.6) });
  return s;
}

const SCENES = { intro: sceneIntro, raw: sceneRaw, qc: sceneQC, mould: sceneMould, dry: sceneDry, glaze: sceneGlaze, fire: sceneFire, joint: sceneJoint, deliver: sceneDeliver, install: sceneInstall, outro: sceneOutro };

// ---------- chrome: caption band, progress, logo ----------
function chrome(t, ch) {
  const lt = t - ch.start;
  let s = '';
  if (ch.n) {
    s += `<image href="${ASSET_BASE}logo.png" x="1580" y="40" width="290" height="98"/>`;
  }
  s += `<rect x="0" y="810" width="${W}" height="${H - 810}" fill="${C.band}"/>`;
  const a = eOut(seg(lt, 0.1, 0.7));
  const out = 1 - seg(lt, ch.end - ch.start - 0.35, ch.end - ch.start);
  const op = a * out;
  const dy = 16 * (1 - a);
  let cap = '';
  if (ch.n) cap += text(90, 902, String(ch.n).padStart(2, '0'), { size: 76, weight: 700, font: 'head', fill: C.maroon });
  const x0 = ch.n ? 230 : 90;
  cap += text(x0, 880, ch.title, { size: 44, weight: 700, font: 'head' });
  wrap(ch.caption, 100).slice(0, 2).forEach((l, i) => { cap += text(x0, 930 + i * 40, l, { size: 29, weight: 500, fill: C.muted }); });
  s += `<g transform="translate(0 ${f(dy)})" opacity="${f(op * 100) / 100}">${cap}</g>`;
  // Progress: one segment per numbered chapter.
  const gap = 10, x = 90, w = W - 180, sw = (w - gap * (NUMBERED.length - 1)) / NUMBERED.length;
  NUMBERED.forEach((c, i) => {
    const p = seg(t, c.start, c.end);
    const sx = x + i * (sw + gap);
    s += `<rect x="${f(sx)}" y="1030" width="${f(sw)}" height="8" rx="4" fill="${C.line}"/>`;
    if (p > 0) s += `<rect x="${f(sx)}" y="1030" width="${f(sw * p)}" height="8" rx="4" fill="${C.maroon}"/>`;
  });
  return s;
}

function compactChrome(ch) {
  return ch.n ? `<image href="${ASSET_BASE}logo.png" x="1520" y="40" width="350" height="118"/>` : '';
}

const DEFS = `<defs><linearGradient id="hm-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient></defs>`;

let ASSET_BASE = new URL('./assets/', import.meta.url).href;
export function setAssetBase(url) { ASSET_BASE = url.endsWith('/') ? url : url + '/'; }

// One complete frame as SVG markup (without the outer <svg>). `compact` drops the caption band
// (for narrow screens, where the player shows the caption as HTML text instead).
export const COMPACT_H = 810;
export function frameSVG(t, { compact = false } = {}) {
  const tt = clamp(t, 0, DURATION);
  const ch = chapterAt(tt);
  const lt = tt - ch.start;
  const d = ch.end - ch.start;
  // Fade each scene in and out so chapters dissolve into one another.
  const fadeIn = ch.id === 'intro' ? 1 : seg(lt, 0, 0.45);
  const fadeOut = ch.id === 'outro' ? 1 : 1 - seg(lt, d - 0.45, d);
  const sceneOp = Math.min(fadeIn, fadeOut);
  return `${DEFS}<rect width="${W}" height="${H}" fill="${C.bg}"/><g opacity="${f(sceneOp * 100) / 100}">${SCENES[ch.id](lt, d)}</g>${compact ? compactChrome(ch) : chrome(tt, ch)}`;
}

// ---------- player ----------
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function mount(el, { autoplay = true, loop = false, controls = true, startAt = 0 } = {}) {
  const reduce = reducedMotion();
  el.classList.add('hm');
  el.innerHTML = `
    <div class="hm-stage">
      <svg class="hm-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Animation: how a SWEILLEM vitrified clay pipe is made, from Aswan clay to an installed sewer line"></svg>
    </div>
    <p class="hm-caption" aria-hidden="true"><b></b><strong></strong><span></span></p>
    <p class="hm-sr" aria-live="polite"></p>
    ${controls ? `
    <div class="hm-controls">
      <button type="button" class="hm-play" aria-label="Play"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="hm-icon" d="M8 5v14l11-7z"/></svg></button>
      <input class="hm-seek" type="range" min="0" max="${DURATION}" step="0.1" value="0" aria-label="Seek">
      <span class="hm-time" aria-hidden="true">0:00 / ${fmt(DURATION)}</span>
    </div>
    <ol class="hm-chapters">${NUMBERED.map((c) => `<li><button type="button" data-id="${c.id}"><span>${String(c.n).padStart(2, '0')}</span>${esc(c.title)}</button></li>`).join('')}</ol>` : ''}`;
  const svg = el.querySelector('.hm-svg');
  const sr = el.querySelector('.hm-sr');
  const playBtn = el.querySelector('.hm-play');
  const seek = el.querySelector('.hm-seek');
  const time = el.querySelector('.hm-time');
  const chapterBtns = [...el.querySelectorAll('.hm-chapters button')];
  const [capNum, capTitle, capText] = el.querySelectorAll('.hm-caption > *');
  let compact = false;
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    const c = el.clientWidth < 720;
    if (c !== compact) { compact = c; el.classList.toggle('hm-compact', c); svg.setAttribute('viewBox', `0 0 ${W} ${c ? COMPACT_H : H}`); draw(); }
  }) : null;
  ro?.observe(el);

  let t = startAt, playing = false, last = 0, raf = 0, userPaused = false, lastCh = null;

  function draw() {
    svg.innerHTML = frameSVG(t, { compact });
    const ch = chapterAt(t);
    if (ch !== lastCh) {
      lastCh = ch;
      sr.textContent = `${ch.n ? `Step ${ch.n}: ` : ''}${ch.title}. ${ch.caption}`;
      capNum.textContent = ch.n ? String(ch.n).padStart(2, '0') : '';
      capTitle.textContent = ch.title;
      capText.textContent = ch.caption;
      chapterBtns.forEach((b) => b.toggleAttribute('aria-current', b.dataset.id === ch.id));
    }
    if (seek) seek.value = String(t);
    if (time) time.textContent = `${fmt(t)} / ${fmt(DURATION)}`;
  }
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    t += dt;
    if (t >= DURATION) {
      if (loop) t = 0; else { t = DURATION; pause(); draw(); return; }
    }
    draw();
    raf = requestAnimationFrame(tick);
  }
  function setIcon() {
    if (!playBtn) return;
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    playBtn.querySelector('.hm-icon').setAttribute('d', playing ? 'M7 5h4v14H7zM13 5h4v14h-4z' : 'M8 5v14l11-7z');
  }
  function play() {
    if (playing) return;
    if (t >= DURATION) t = 0;
    playing = true; last = performance.now(); raf = requestAnimationFrame(tick); setIcon();
  }
  function pause() { playing = false; cancelAnimationFrame(raf); setIcon(); }
  function seekTo(s) { t = clamp(s, 0, DURATION); draw(); }
  function goTo(id) {
    const c = CHAPTERS.find((x) => x.id === id);
    if (!c) return;
    // With reduced motion, jump to the chapter's finished state instead of playing it.
    seekTo(reduce && !playing ? c.end - 0.6 : c.start);
  }

  playBtn?.addEventListener('click', () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } });
  seek?.addEventListener('input', () => seekTo(parseFloat(seek.value)));
  chapterBtns.forEach((b) => b.addEventListener('click', () => goTo(b.dataset.id)));

  let io;
  if (autoplay && !reduce && typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.4) { if (!userPaused) play(); } else pause();
    }, { threshold: [0, 0.4] });
    io.observe(el);
  }
  if (reduce && startAt === 0) t = CHAPTERS[0].end - 0.6;
  draw();

  return {
    play, pause, seek: seekTo, goTo,
    get time() { return t; },
    get playing() { return playing; },
    destroy() { pause(); io?.disconnect(); ro?.disconnect(); el.innerHTML = ''; el.classList.remove('hm'); },
  };
}
