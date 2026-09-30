// How a SWEILLEM vitrified clay pipe is made: from Aswan clay to an installed sewer line.
//
// Every frame is a pure function of time (frameSVG(t) returns an SVG string), so the
// same code plays live on the site and renders frame-exact to MP4 (scripts/render.mjs).
// Captions come from SWEILLEM's company deck, its marketing report and the live site's
// Joint Performance page. Colours and fonts follow the redesign tokens (design/tokens.css).

export const W = 1920;
export const H = 1080;
const BAND = 810; // top of the caption band

const C = {
  bg: '#f2f2ef', // --paper
  band: '#e8e7e3', // --sunk
  surface: '#ffffff',
  ink: '#1c1818',
  muted: '#5d5f62',
  line: '#d6d4cf',
  maroon: '#7a0404',
  slate: '#7f8285',
  ground: '#e2ddd4',
  soil: '#b48a66',
  soilDark: '#8f6a4c',
  clay: '#c07a4a', // --clay
  clayWet: '#9a5a36',
  clayDry: '#d9b48c',
  glazeWet: '#cdb6ae',
  fired: '#3b2119', // --glaze
  ring: '#d24a2c',
  steel: '#8a8d90',
  steelDark: '#55585c',
  fire: '#e4572e', // --fire
  heat: '#f39a5b',
  water: '#5f87a3',
  glass: '#9fb6c6',
  loader: '#e0a526',
};

const FONT = {
  en: { head: "Jost, 'IBM Plex Sans', sans-serif", body: "'IBM Plex Sans', sans-serif", data: "'IBM Plex Mono', 'IBM Plex Sans', monospace" },
  ar: { head: "'IBM Plex Sans Arabic', 'IBM Plex Sans', sans-serif", body: "'IBM Plex Sans Arabic', 'IBM Plex Sans', sans-serif", data: "'IBM Plex Sans Arabic', 'IBM Plex Mono', monospace" },
};

// ---------- words ----------
const I18N = {
  en: {
    chapters: {
      intro: ['How a SWEILLEM clay pipe is made', 'Vitrified clay pipes, made in Egypt since 1935.'],
      raw: ['Raw material', 'The clay begins its journey at the quarry in Aswan. At the factory it is inspected and carefully stored.'],
      qc: ['Quality control', 'The clay is tested for its percentage of fine minerals, salts and aluminium oxide (Al₂O₃).'],
      mould: ['Moulding', 'Wet clay is kept in the right atmosphere until it reaches the extruders that shape each pipe. Specialised handling equipment carries it on to the dryers.'],
      dry: ['Drying', 'The pipe loses most of the water it needed for moulding. The dryers were built under the supervision of Lingl (Germany) and are fully computerised.'],
      glaze: ['Glazing', 'After a quality check, each pipe is fully immersed in glaze, a thick liquid of natural materials, coating it inside and out.'],
      fire: ['Final firing', 'Pre-heating removes any remaining humidity. Shuttle kilns then fire each diameter on its own curve, up to 1200 °C over 2 to 4 days, turning the glaze into a glassy cover.'],
      joint: ['Joints', 'Factory-applied polyurethane joints seal each spigot in its socket. They stay watertight at 0.5, 1 and 2.4 bar, internal or external, and keep roots out.'],
      deliver: ['Delivery', "Finished pipes go directly from the factory, or from SWEILLEM's warehouses abroad, to projects in Egypt, Saudi Arabia, Germany and beyond."],
      install: ['Installation', 'On site, each spigot is pushed into the next socket, forming a continuous, watertight sewer line underground.'],
      outro: ['Built to last', 'Over 100 years of life expectancy, rigid, corrosion resistant and low maintenance.'],
    },
    l: {
      subtitle: 'From Aswan clay to an installed sewer line',
      photo: 'SWEILLEM photo',
      stepOf: (n, total) => `Step ${String(n).padStart(2, '0')} of ${String(total).padStart(2, '0')}`,
      quarry: 'Aswan quarry', factory: 'Factory', brand: 'SWEILLEM', stored: 'Inspected & stored',
      aswan: 'Aswan', cairo: 'Greater Cairo',
      minerals: 'Fine minerals', salts: 'Salts', alumina: 'Aluminium oxide (Al₂O₃)',
      extruder: 'Extruder', wetClay: 'Wet clay', toDryers: 'To the dryers', handling: 'Handling equipment',
      dryer: 'Dryer · computer controlled', moisture: 'Moisture', lingl: 'Built under Lingl supervision',
      tank: 'Glaze tank', qcPassed: 'QC passed', glazeOut: 'Glaze outside', glazeIn: 'Glaze inside',
      preheat: 'Pre-heating', noHumidity: 'No humidity left', kiln: 'Shuttle kiln', kilnTemp: 'Kiln temperature',
      curve: 'Firing curve over 2–4 days', deg: '°C',
      jointSpigot: 'Polyurethane joint on the spigot', jointSocket: 'Polyurethane joint in the socket', watertight: 'Watertight',
      bar: (v) => `${v} bar`, pressure: 'Internal or external pressure', roots: 'Keeps roots out',
      egypt: 'Egypt', ksa: 'Saudi Arabia', germany: 'Germany',
      flow: 'Wastewater flows through a watertight line', spigotSocket: 'Spigot into socket',
      benefits: [['100+ years', 'Life expectancy'], ['Rigid', 'Does not deflect under load'], ['Corrosion resistant', 'Acids, industrial waste, aggressive soils'], ['Low maintenance', 'Tight joints limit leakage']],
      since: 'Leading in the clay pipes industry since 1935',
    },
    ui: {
      label: 'Animation: how a SWEILLEM vitrified clay pipe is made, from Aswan clay to an installed sewer line',
      play: 'Play', pause: 'Pause', seek: 'Seek', step: (n) => `Step ${n}: `,
    },
  },
  ar: {
    chapters: {
      intro: ['كيف تُصنع ماسورة سويلم من الفخار المزجج', 'مواسير الفخار المزجج، صناعة مصرية منذ 1935.'],
      raw: ['المواد الخام', 'تبدأ رحلة الطين من محجر أسوان. وعند وصوله إلى المصنع يُفحص ويُخزن بعناية.'],
      qc: ['ضبط الجودة', 'يُختبر الطين لقياس نسبة المعادن الدقيقة والأملاح وأكسيد الألومنيوم (Al₂O₃).'],
      mould: ['التشكيل', 'يُحفظ الطين الرطب في الظروف المناسبة حتى يصل إلى ماكينات البثق التي تشكّل كل ماسورة، ثم تنقلها معدات مناولة متخصصة إلى المجففات.'],
      dry: ['التجفيف', 'تفقد الماسورة معظم الماء الذي احتاجته للتشكيل. أُنشئت المجففات تحت إشراف شركة لينجل الألمانية، والتحكم فيها محوسب بالكامل.'],
      glaze: ['التزجيج', 'بعد فحص الجودة، تُغمس كل ماسورة بالكامل في مادة التزجيج، وهي سائل كثيف من مواد طبيعية، فتُكسى من الداخل والخارج.'],
      fire: ['الحرق النهائي', 'يزيل التسخين المبدئي أي رطوبة متبقية، ثم تحرق الأفران المكوكية كل قطر وفق منحنى خاص به حتى 1200 درجة مئوية على مدى 2 إلى 4 أيام، فيتحول التزجيج إلى طبقة زجاجية.'],
      joint: ['الوصلات', 'وصلات البولي يوريثان المركّبة في المصنع تُحكم كل ذيل داخل جرسه، فتبقى محكمة ضد التسرب عند 0.5 و1 و2.4 بار داخليًا أو خارجيًا، وتمنع تسلل الجذور.'],
      deliver: ['التوريد', 'تنطلق المواسير النهائية مباشرة من المصنع، أو من مخازن سويلم في الخارج، إلى المشروعات في مصر والسعودية وألمانيا وغيرها.'],
      install: ['التركيب', 'في الموقع، يُدفع ذيل كل ماسورة داخل جرس الماسورة التالية، فيتكوّن خط صرف متصل ومحكم تحت الأرض.'],
      outro: ['صُنعت لتدوم', 'عمر افتراضي يتجاوز 100 عام، وصلابة، ومقاومة للتآكل، وصيانة قليلة.'],
    },
    l: {
      subtitle: 'من طين أسوان إلى خط صرف مُركّب',
      photo: 'صورة من سويلم',
      stepOf: (n, total) => `المرحلة ${n} من ${total}`,
      quarry: 'محجر أسوان', factory: 'المصنع', brand: 'سويلم', stored: 'فحص وتخزين',
      aswan: 'أسوان', cairo: 'القاهرة الكبرى',
      minerals: 'المعادن الدقيقة', salts: 'الأملاح', alumina: 'أكسيد الألومنيوم (Al₂O₃)',
      extruder: 'ماكينة البثق', wetClay: 'طين رطب', toDryers: 'إلى المجففات', handling: 'معدات المناولة',
      dryer: 'مجفف · تحكم بالحاسب', moisture: 'الرطوبة', lingl: 'أُنشئ بإشراف لينجل',
      tank: 'حوض التزجيج', qcPassed: 'اجتاز الفحص', glazeOut: 'تزجيج خارجي', glazeIn: 'تزجيج داخلي',
      preheat: 'التسخين المبدئي', noHumidity: 'لا رطوبة متبقية', kiln: 'فرن مكوكي', kilnTemp: 'حرارة الفرن',
      curve: 'منحنى الحرق على مدى 2–4 أيام', deg: '°م',
      jointSpigot: 'وصلة بولي يوريثان على الذيل', jointSocket: 'وصلة بولي يوريثان داخل الجرس', watertight: 'محكمة ضد التسرب',
      bar: (v) => `${v} بار`, pressure: 'ضغط داخلي أو خارجي', roots: 'تمنع تسلل الجذور',
      egypt: 'مصر', ksa: 'السعودية', germany: 'ألمانيا',
      flow: 'تتدفق مياه الصرف في خط محكم', spigotSocket: 'الذيل داخل الجرس',
      benefits: [['أكثر من 100 عام', 'العمر الافتراضي'], ['صلابة', 'لا تنحني تحت الأحمال'], ['مقاومة للتآكل', 'الأحماض والمخلفات الصناعية والتربة الأكّالة'], ['صيانة قليلة', 'وصلات محكمة تحد من التسرب']],
      since: 'رائدة صناعة المواسير الفخارية منذ 1935',
    },
    ui: {
      label: 'رسوم متحركة: كيف تُصنع ماسورة سويلم من الفخار المزجج، من طين أسوان إلى خط صرف مُركّب',
      play: 'تشغيل', pause: 'إيقاف مؤقت', seek: 'موضع التشغيل', step: (n) => `المرحلة ${n}: `,
    },
  },
};
export const LANGS = Object.keys(I18N);

// ---------- timeline ----------
// Chapters with a SWEILLEM photo open on that photo for PHOTO_LEAD seconds before the diagram.
const PHOTO_LEAD = 2;
const PLAN = [
  { id: 'intro', d: 5 },
  { id: 'raw', d: 8, photo: 'raw' },
  { id: 'qc', d: 7 },
  { id: 'mould', d: 9, photo: 'mould' },
  { id: 'dry', d: 8, photo: 'dry' },
  { id: 'glaze', d: 8, photo: 'glaze' },
  { id: 'fire', d: 11, photo: 'fire' },
  { id: 'joint', d: 9 },
  { id: 'deliver', d: 7, photo: 'deliver' },
  { id: 'install', d: 12, photo: 'install' },
  { id: 'outro', d: 7 },
];
const TIMES = (() => {
  let t = 0, n = 0;
  return PLAN.map((p) => {
    const lead = p.photo ? PHOTO_LEAD : 0;
    const c = { ...p, lead, start: t, end: t + p.d + lead, n: p.id === 'intro' || p.id === 'outro' ? undefined : ++n };
    t = c.end;
    return c;
  });
})();
export const DURATION = TIMES[TIMES.length - 1].end;
const STEPS = TIMES.filter((c) => c.n).length;

const CHAPTER_CACHE = {};
export function getChapters(lang = 'en') {
  const key = I18N[lang] ? lang : 'en';
  const L = I18N[key];
  return (CHAPTER_CACHE[key] ||= TIMES.map((c) => ({ ...c, title: L.chapters[c.id][0], caption: L.chapters[c.id][1] })));
}
export const CHAPTERS = getChapters('en');

export function chapterAt(t, lang = 'en') {
  const tt = Math.min(Math.max(t, 0), DURATION - 1e-6);
  const list = getChapters(lang);
  return list.find((c) => tt >= c.start && tt < c.end) || list[list.length - 1];
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
const o = (n) => Math.round(clamp(n) * 100) / 100;

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

// Per-frame render context (frameSVG is synchronous, so a module-level context is safe).
let LANG = 'en';
let UID = 'hm';
const rtl = () => LANG === 'ar';
const L = () => (I18N[LANG] || I18N.en).l;
// Pick the left- or right-hand position and anchor for text inside a box, by reading direction.
const side = (left, right) => (rtl() ? right : left);
const lead = () => (rtl() ? 'end' : 'start');

// ---------- primitives ----------
const tr = (x, y, inner) => `<g transform="translate(${f(x)} ${f(y)})">${inner}</g>`;

// `anchor` is visual: 'start' means the text box begins at x, 'end' that it ends at x.
// For right-to-left text the SVG anchor is flipped so the box lands in the same place.
function text(x, y, s, { size = 28, weight = 500, fill = C.ink, anchor = 'start', font = 'body', ls = 0, op = 1, caps = false } = {}) {
  const R = rtl();
  const fam = FONT[R ? 'ar' : 'en'][font];
  const a = R && anchor !== 'middle' ? (anchor === 'start' ? 'end' : 'start') : anchor;
  const str = caps && !R ? String(s).toUpperCase() : s;
  return `<text x="${f(x)}" y="${f(y)}" font-family="${fam}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${a}"${R ? ' direction="rtl"' : ''} letter-spacing="${R ? 0 : ls}" opacity="${o(op)}">${esc(str)}</text>`;
}
const label = (x, y, s, op = 1, anchor = 'middle') => text(x, y, s, { size: 19, weight: 500, font: 'data', fill: C.muted, anchor, ls: 2.2, op, caps: true });

// Side view of a pipe: straight barrel with a socket (bell) at one end, spigot at the other.
function pipe(x, y, len, d, fill, opt = {}) {
  const bl = opt.bell ?? d * 0.9;
  const bh = d * 1.3;
  const left = opt.bellLeft;
  const bx = left ? x : x + len - bl;
  const barrelX = left ? x + bl : x;
  const stroke = `stroke="${mix(fill, '#000000', 0.35)}" stroke-width="2"`;
  let s = `<rect x="${f(barrelX)}" y="${f(y - d / 2)}" width="${f(len - bl)}" height="${f(d)}" fill="${fill}" ${stroke}/>`;
  s += `<rect x="${f(bx)}" y="${f(y - bh / 2)}" width="${f(bl)}" height="${f(bh)}" rx="${f(d * 0.1)}" fill="${fill}" ${stroke}/>`;
  s += `<rect x="${f(barrelX)}" y="${f(y - d / 2)}" width="${f(len - bl)}" height="${f(d)}" fill="url(#${UID}-shade)"/>`;
  s += `<rect x="${f(bx)}" y="${f(y - bh / 2)}" width="${f(bl)}" height="${f(bh)}" rx="${f(d * 0.1)}" fill="url(#${UID}-shade)"/>`;
  if (opt.gloss) {
    const gl = clamp(opt.gloss);
    s += `<rect x="${f(barrelX + 10)}" y="${f(y - d * 0.33)}" width="${f(len - bl - 20)}" height="${f(d * 0.07)}" rx="${f(d * 0.035)}" fill="#ffffff" opacity="${o(0.45 * gl)}"/>`;
    s += `<rect x="${f(bx + 6)}" y="${f(y - bh * 0.36)}" width="${f(bl - 12)}" height="${f(d * 0.06)}" rx="${f(d * 0.03)}" fill="#ffffff" opacity="${o(0.4 * gl)}"/>`;
  }
  if (opt.ring) {
    const r = clamp(opt.ring);
    const rw = d * 0.16;
    const sx = left ? x + len - rw : x;
    // Polyurethane joint on the spigot end, and its partner in the socket mouth.
    s += `<rect x="${f(sx)}" y="${f(y - d / 2 - 3)}" width="${f(rw)}" height="${f((d + 6) * r)}" fill="${C.ring}"/>`;
    const mx = left ? x : x + len - d * 0.08;
    s += `<rect x="${f(mx)}" y="${f(y - bh / 2 + 2)}" width="${f(d * 0.08)}" height="${f((bh - 4) * r)}" fill="${C.ring}"/>`;
  }
  return opt.op != null ? `<g opacity="${o(opt.op)}">${s}</g>` : s;
}

function wheel(x, y, r, rot = 0) {
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#2a2626"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.45)}" fill="${C.steel}"/>` +
    `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + Math.cos(rot) * r * 0.45)}" y2="${f(y + Math.sin(rot) * r * 0.45)}" stroke="#2a2626" stroke-width="4"/>`;
}

// Cab-over truck facing right; trailer extends left of the cab. (x, ground) = rear of the trailer.
function truck(x, ground, len, load = '', rot = 0) {
  const cabX = x + len;
  let s = `<rect x="${f(x)}" y="${f(ground - 92)}" width="${len}" height="20" fill="${C.steelDark}"/>`;
  s += load;
  s += `<rect x="${f(cabX)}" y="${f(ground - 210)}" width="150" height="150" rx="14" fill="${C.surface}" stroke="${C.line}" stroke-width="3"/>`;
  s += `<rect x="${f(cabX + 78)}" y="${f(ground - 190)}" width="58" height="56" rx="6" fill="${C.glass}"/>`;
  s += `<rect x="${f(cabX)}" y="${f(ground - 100)}" width="150" height="16" fill="${C.maroon}"/>`;
  s += `<rect x="${f(cabX + 140)}" y="${f(ground - 80)}" width="14" height="14" rx="3" fill="#f2c14e"/>`;
  s += wheel(x + 60, ground - 34, 34, rot) + wheel(x + 140, ground - 34, 34, rot) + wheel(cabX + 90, ground - 34, 34, rot);
  if (len > 500) s += wheel(x + len - 120, ground - 34, 34, rot);
  return s;
}

function checkBadge(x, y, s = 1, op = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${o(Math.max(s, 0))})" opacity="${o(op)}"><circle r="26" fill="${C.maroon}"/><path d="M-11 1 L-3 9 L12 -8" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

function chip(x, y, s, op = 1, { fill = C.surface, color = C.ink, stroke = C.line, size = 26, dot = false } = {}) {
  // Width is estimated from the string length; good enough for short labels.
  const w = Math.max(120, s.length * size * (rtl() ? 0.5 : 0.56) + (dot ? 74 : 48));
  let c = `<rect x="${f(-w / 2)}" y="-30" width="${f(w)}" height="60" rx="30" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  if (dot) c += `<circle cx="${f(rtl() ? w / 2 - 34 : -w / 2 + 34)}" cy="0" r="9" fill="${C.maroon}"/>`;
  c += text(dot ? (rtl() ? -13 : 13) : 0, size * 0.36, s, { size, weight: 600, fill: color, anchor: 'middle' });
  return `<g transform="translate(${f(x)} ${f(y)})" opacity="${o(op)}">${c}</g>`;
}

function ground(y, fill = C.ground) {
  return `<rect x="0" y="${y}" width="${W}" height="${BAND - y}" fill="${fill}"/><line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.line}" stroke-width="3"/>`;
}

// ---------- photo intro ----------
// The chapter opens on SWEILLEM's own photo of that step, revealed through a hexagon (the S mark's shape).
function photoCard(ch, lt) {
  const R = rtl();
  const fw = 940, fh = 731, fy = 40;
  const fx = R ? 100 : W - 100 - fw;
  const cx = fx + fw / 2, cy = fy + fh / 2;
  const reveal = eOut(seg(lt, 0.05, 1.0));
  const rad = (Math.hypot(fw, fh) / 2) * 1.18 * reveal;
  const hexPts = [0, 1, 2, 3, 4, 5].map((i) => { const a = (-90 + i * 60) * Math.PI / 180; return `${f(cx + rad * Math.cos(a))},${f(cy + rad * Math.sin(a))}`; }).join(' ');
  const cut = [[0, 0], [0.82, 0], [1, 0.18], [1, 1], [0.18, 1], [0, 0.82]].map(([a, b]) => `${f(fx + a * fw)},${f(fy + b * fh)}`).join(' ');
  const kb = 1.1 - 0.1 * ease(seg(lt, 0, ch.lead));
  let s = `<rect width="${W}" height="${BAND}" fill="${C.bg}"/>`;
  s += `<defs><clipPath id="${UID}-cut"><polygon points="${cut}"/></clipPath><clipPath id="${UID}-hex"><polygon points="${hexPts}"/></clipPath></defs>`;
  s += `<g clip-path="url(#${UID}-cut)"><g clip-path="url(#${UID}-hex)"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="${C.fired}"/>`;
  s += `<image href="${ASSET_BASE}photos/${ch.photo}.webp" x="${fx}" y="${fy}" width="${fw}" height="${fh}" preserveAspectRatio="xMidYMid slice" transform="translate(${f(cx)} ${f(cy)}) scale(${f(kb * 1000) / 1000}) translate(${f(-cx)} ${f(-cy)})"/></g></g>`;
  // Tag so viewers know this frame is a real photo and what follows is a diagram.
  const tagW = rtl() ? 170 : 236;
  const tagX = fx + fw - 28 - tagW;
  s += `<g opacity="${o(seg(lt, 0.5, 0.9))}"><rect x="${f(tagX)}" y="${fy + fh - 74}" width="${tagW}" height="42" rx="21" fill="#1c1818" opacity=".72"/>${text(tagX + tagW / 2, fy + fh - 46, L().photo, { size: 17, weight: 500, font: 'data', fill: '#fff', anchor: 'middle', ls: 1.6, caps: true })}</g>`;
  // Step number and title.
  const a = eOut(seg(lt, 0.1, 0.7));
  const tx = R ? W - 120 : 120;
  const anchor = R ? 'end' : 'start';
  const dx = (R ? 30 : -30) * (1 - a);
  let tb = text(tx, 250, L().stepOf(ch.n, STEPS), { size: 22, weight: 500, font: 'data', fill: C.maroon, anchor, ls: 2.4, caps: true });
  tb += text(tx, 470, String(ch.n).padStart(2, '0'), { size: 230, weight: 600, font: 'head', fill: C.maroon, anchor });
  tb += text(tx, 580, ch.title, { size: 72, weight: 600, font: 'head', anchor });
  tb += `<rect x="${R ? tx - 120 : tx}" y="612" width="120" height="6" fill="${C.maroon}"/>`;
  s += `<g transform="translate(${f(dx)} 0)" opacity="${o(a)}">${tb}</g>`;
  return s;
}

// ---------- scenes (lt = local seconds, d = duration) ----------

function sceneIntro(lt) {
  const a = eOut(seg(lt, 0.2, 1.4));
  const b = eOut(seg(lt, 0.9, 2.1));
  const p = ease(seg(lt, 1.2, 3.6));
  const title = (I18N[LANG] || I18N.en).chapters.intro[0];
  let s = `<image href="${ASSET_BASE}logo.svg" x="${f(W / 2 - 330)}" y="${f(150 - 30 * (1 - a))}" width="660" height="224" opacity="${o(a)}"/>`;
  s += text(W / 2, 500, title, { size: 64, weight: 600, font: 'head', anchor: 'middle', op: b });
  s += text(W / 2, 562, L().subtitle, { size: 32, weight: 400, fill: C.muted, anchor: 'middle', op: b });
  if (p > 0) s += pipe(lerp(-900, W / 2 - 450, p), 700, 900, 90, C.fired, { gloss: 1, ring: 1 });
  return s;
}

function sceneRaw(lt) {
  const gy = 690;
  let s = ground(gy);
  // Quarry: terraced clay hill.
  const hill = [[80, gy], [140, 520], [260, 520], [300, 430], [430, 430], [470, 350], [540, 350], [600, gy]];
  s += `<polygon points="${hill.map((p) => p.join(',')).join(' ')}" fill="${C.clay}"/>`;
  s += `<polygon points="140,520 260,520 300,430 430,430 470,350 480,350 440,440 310,440 270,530 150,530" fill="${C.clayWet}" opacity=".5"/>`;
  s += label(340, 740, L().quarry);
  // Factory.
  const fx = 1380;
  s += `<rect x="${fx}" y="440" width="420" height="${gy - 440}" fill="${C.surface}" stroke="${C.line}" stroke-width="3"/>`;
  s += `<polygon points="${fx},440 ${fx + 70},380 ${fx + 140},440 ${fx + 210},380 ${fx + 280},440 ${fx + 350},380 ${fx + 420},440" fill="${C.slate}"/>`;
  s += `<rect x="${fx + 330}" y="300" width="40" height="120" fill="${C.slate}"/>`;
  s += `<rect x="${fx + 40}" y="520" width="120" height="${gy - 520}" fill="${C.band}" stroke="${C.line}" stroke-width="3"/>`;
  s += text(fx + 290, 562, L().brand, { size: 32, weight: 600, fill: C.maroon, anchor: 'middle', font: 'head', ls: 1 });
  s += label(fx + 210, 740, L().factory);
  // Stockpile grows after unloading.
  const pile = eOut(seg(lt, 5.0, 6.6));
  const pileX = 790;
  if (pile > 0) s += `<path d="M ${pileX - 110} ${gy} Q ${pileX} ${f(gy - 220 * pile)} ${pileX + 110} ${gy} Z" fill="${C.clay}"/>`;
  const insp = seg(lt, 6.4, 7.0);
  if (insp > 0) s += checkBadge(pileX - 60, gy - 290, back(insp), insp) + label(pileX - 60, gy - 336, L().stored, insp);
  // Dump truck drives in, then tips.
  const drive = ease(seg(lt, 0.6, 4.6));
  const tx = lerp(260, 900, drive);
  const tip = ease(seg(lt, 4.8, 5.8)) * (1 - ease(seg(lt, 6.6, 7.4)));
  const len = 300;
  const heap = 1 - eOut(seg(lt, 5.0, 6.2));
  let bed = `<path d="M 0 0 L ${len - 20} 0 L ${len - 10} -90 L -10 -90 Z" fill="${C.maroon}"/>`;
  if (heap > 0.02) bed += `<path d="M 10 -88 Q ${len / 2} ${f(-88 - 90 * heap)} ${len - 30} -88 Z" fill="${C.clay}"/>`;
  s += truck(tx, gy, len, '', drive * 22);
  s += `<g transform="translate(${f(tx + 20)} ${f(gy - 92)}) rotate(${f(-38 * tip)})">${bed}</g>`;
  if (tip > 0.5 && heap > 0.05) {
    for (let i = 0; i < 10; i++) {
      const k = (lt * 2.2 + rnd(i)) % 1;
      s += `<circle cx="${f(tx - 20 - k * 60 - rnd(i + 9) * 20)}" cy="${f(gy - 110 + k * 100)}" r="${f(6 + rnd(i + 3) * 6)}" fill="${C.clay}"/>`;
    }
  }
  // Nile route inset: Aswan to the factory in Greater Cairo.
  const ins = eOut(seg(lt, 0.2, 1.0));
  const dot = ease(seg(lt, 0.8, 4.6));
  const nile = 'M 150 330 C 180 290 120 250 150 210 C 175 170 130 140 150 100';
  let m = `<rect x="60" y="60" width="320" height="300" rx="16" fill="${C.surface}" stroke="${C.line}" stroke-width="2"/>`;
  m += `<path d="${nile}" fill="none" stroke="${C.glass}" stroke-width="8" stroke-linecap="round"/>`;
  m += `<path d="${nile}" fill="none" stroke="${C.maroon}" stroke-width="4" stroke-dasharray="${f(300 * dot)} 400" stroke-linecap="round"/>`;
  m += `<circle cx="150" cy="330" r="10" fill="${C.clay}"/><circle cx="150" cy="100" r="10" fill="${C.maroon}"/>`;
  m += text(174, 338, L().aswan, { size: 22, weight: 600 }) + text(174, 108, L().cairo, { size: 22, weight: 600 });
  m += text(174, 136, L().factory, { size: 18, weight: 500, fill: C.muted });
  s += `<g transform="translate(0 ${f(-20 * (1 - ins))})" opacity="${o(ins)}">${m}</g>`;
  return s;
}

function sceneQC(lt) {
  let s = ground(640);
  // Bench and sample.
  s += `<rect x="160" y="560" width="620" height="24" rx="6" fill="${C.slate}"/>`;
  s += `<rect x="190" y="584" width="20" height="56" fill="${C.slate}"/><rect x="730" y="584" width="20" height="56" fill="${C.slate}"/>`;
  s += `<rect x="260" y="520" width="200" height="40" rx="6" fill="${C.steel}"/>`;
  s += `<path d="M 290 520 Q 300 430 360 430 Q 430 430 430 520 Z" fill="${C.clay}"/>`;
  const fillP = eOut(seg(lt, 0.4, 1.6));
  s += `<rect x="560" y="430" width="70" height="130" rx="10" fill="#e9eef2" stroke="${C.line}" stroke-width="3"/>`;
  if (fillP > 0) s += `<rect x="568" y="${f(560 - 90 * fillP)}" width="54" height="${f(Math.max(90 * fillP - 8, 0))}" rx="6" fill="${C.clayDry}" opacity=".8"/>`;
  // Magnifier sweeping over the sample.
  const mx = 360 + Math.sin(lt * 1.6) * 60, my = 420 + Math.cos(lt * 2.1) * 20;
  s += `<g transform="translate(${f(mx)} ${f(my)})"><circle r="56" fill="#ffffff" opacity=".35" stroke="${C.ink}" stroke-width="10"/><line x1="40" y1="40" x2="95" y2="95" stroke="${C.ink}" stroke-width="16" stroke-linecap="round"/></g>`;
  // Three tests.
  [L().minerals, L().salts, L().alumina].forEach((name, i) => {
    const y = 250 + i * 150;
    const t0 = 1.0 + i * 1.6;
    const a = eOut(seg(lt, t0 - 0.4, t0));
    const p = ease(seg(lt, t0, t0 + 1.3));
    const ok = seg(lt, t0 + 1.3, t0 + 1.7);
    const fill = 480 + i * 60;
    let r = text(side(0, 760), -22, name, { size: 30, weight: 600, font: 'head', anchor: lead() });
    r += `<rect x="0" y="0" width="760" height="34" rx="17" fill="${C.surface}" stroke="${C.line}" stroke-width="2"/>`;
    if (p > 0) r += `<rect x="${f(side(0, 760 - fill * p))}" y="0" width="${f(fill * p)}" height="34" rx="17" fill="${C.clay}"/>`;
    if (ok > 0) r += checkBadge(side(820, -60), 17, back(ok), ok);
    s += `<g transform="translate(${f(900 + 30 * (1 - a))} ${y})" opacity="${o(a)}">${r}</g>`;
  });
  return s;
}

function sceneMould(lt) {
  const gy = 690;
  let s = ground(gy);
  const ex = 180, ey = 380, ew = 560, eh = 180;
  s += `<polygon points="${ex + 120},${ey} ${ex + 320},${ey} ${ex + 380},${ey - 150} ${ex + 60},${ey - 150}" fill="${C.slate}"/>`;
  s += `<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" rx="16" fill="${C.steel}"/>`;
  const ph = (lt * 90) % 60;
  let aug = '';
  for (let x = -60; x < ew - 120 + 60; x += 60) aug += `M ${f(x + ph)} 0 L ${f(x + ph + 30)} 80 `;
  s += `<svg x="${ex + 60}" y="${ey + 50}" width="${ew - 120}" height="80" overflow="hidden"><rect width="100%" height="100%" fill="${C.clayWet}"/><path d="${aug}" stroke="#dcc6b0" stroke-width="10" fill="none"/></svg>`;
  s += `<rect x="${ex + 60}" y="${ey + 50}" width="${ew - 120}" height="80" rx="10" fill="none" stroke="${C.steelDark}" stroke-width="6"/>`;
  s += `<rect x="${ex + ew}" y="${ey + 20}" width="60" height="${eh - 40}" rx="8" fill="${C.steelDark}"/>`;
  s += `<rect x="${ex}" y="${ey + eh}" width="${ew}" height="${gy - ey - eh}" fill="${C.slate}" opacity=".6"/>`;
  s += label(ex + ew / 2, 740, L().extruder);
  if (lt < 6) {
    for (let i = 0; i < 12; i++) {
      const k = (lt * 0.9 + rnd(i)) % 1;
      const x = ex + 150 + rnd(i + 20) * 140;
      const y = ey - 260 + k * 250;
      s += `<rect x="${f(x)}" y="${f(y)}" width="${f(16 + rnd(i) * 14)}" height="${f(14 + rnd(i + 5) * 12)}" rx="5" fill="${C.clayWet}" opacity="${o(1 - k * 0.3)}"/>`;
    }
  }
  s += text(ex + 410, ey - 90, L().wetClay, { size: 24, weight: 600, fill: C.muted, op: 1 - seg(lt, 5.5, 6.5) });
  // Pipe emerges from the die, is cut, then carried away.
  const dieX = ex + ew + 60, py = ey + eh / 2, dia = 110, full = 760;
  const grow = ease(seg(lt, 1.0, 5.2));
  const carry = ease(seg(lt, 6.0, 8.6));
  const Lp = full * grow;
  const px = dieX + carry * 1300;
  const cy = py + dia * 0.65;
  const cartX = dieX + 120 + carry * 1300;
  s += `<rect x="${f(cartX)}" y="${f(cy)}" width="520" height="22" rx="6" fill="${C.maroon}" opacity="${o(seg(lt, 4.4, 5.2))}"/>`;
  s += `<rect x="${f(cartX + 60)}" y="${f(cy + 22)}" width="16" height="${f(gy - cy - 50)}" fill="${C.steelDark}"/><rect x="${f(cartX + 440)}" y="${f(cy + 22)}" width="16" height="${f(gy - cy - 50)}" fill="${C.steelDark}"/>`;
  s += wheel(cartX + 68, gy - 22, 22, carry * 40) + wheel(cartX + 448, gy - 22, 22, carry * 40);
  if (Lp > 4) s += pipe(px, py, Math.max(Lp, dia), dia, C.clayWet, { bell: Lp > dia * 1.4 ? dia * 0.9 : 0.01 });
  const cut = seg(lt, 5.3, 5.9);
  if (cut > 0 && cut < 1) s += `<line x1="${dieX + 4}" y1="${py - 90}" x2="${dieX + 4}" y2="${py + 90}" stroke="#ffffff" stroke-width="${f(8 * Math.sin(cut * Math.PI))}"/>`;
  const arrow = seg(lt, 6.6, 7.4);
  if (arrow > 0) s += `<g opacity="${o(arrow)}">${text(1560, 330, L().toDryers, { size: 30, weight: 600, font: 'head', anchor: 'middle' })}<path d="M 1480 360 L 1640 360 M 1620 345 L 1642 360 L 1620 375" stroke="${C.maroon}" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
  s += label(dieX + 400, 740, L().handling, seg(lt, 4.6, 5.4));
  return s;
}

function sceneDry(lt) {
  const gy = 700;
  let s = ground(gy);
  const dx = 240, dy = 170, dw = 1100;
  const dry = ease(seg(lt, 0.8, 6.2));
  s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${gy - dy}" rx="12" fill="${C.surface}" stroke="${C.line}" stroke-width="4"/>`;
  s += `<rect x="${dx}" y="${dy}" width="${dw}" height="60" rx="12" fill="${C.slate}"/>`;
  s += text(side(dx + 30, dx + dw - 30), dy + 40, L().dryer, { size: 22, weight: 500, font: 'data', fill: '#fff', ls: 2, caps: true, anchor: lead() });
  for (let i = 0; i < 5; i++) {
    const y = dy + 110 + i * 100;
    const ph = (lt * 120 + i * 50) % 200;
    s += `<path d="M ${dx + 20 + ph} ${y} q 25 -14 50 0 t 50 0 t 50 0" fill="none" stroke="${C.fire}" stroke-width="4" opacity=".3"/>`;
  }
  // Pipes standing upright, socket down, as on SWEILLEM's drying cars.
  const col = mix(C.clayWet, C.clayDry, dry);
  for (let i = 0; i < 5; i++) s += `<g transform="translate(${dx + 170 + i * 190} ${gy - 10}) rotate(-90)">${pipe(0, 0, 400, 100, col, { bellLeft: true })}</g>`;
  for (let i = 0; i < 26; i++) {
    const k = (lt * 0.55 + rnd(i)) % 1;
    const x = dx + 150 + (i % 5) * 190 + (rnd(i + 3) - 0.5) * 60;
    const y = gy - 120 - k * 420;
    const op = (1 - k) * (1 - dry * 0.85);
    s += `<path d="M ${f(x)} ${f(y - 14)} Q ${f(x + 10)} ${f(y)} ${f(x)} ${f(y + 6)} Q ${f(x - 10)} ${f(y)} ${f(x)} ${f(y - 14)} Z" fill="${C.water}" opacity="${o(op)}"/>`;
  }
  // Control panel.
  const px = 1440, py = 230;
  s += `<rect x="${px}" y="${py}" width="380" height="380" rx="18" fill="${C.ink}"/>`;
  s += `<rect x="${px + 24}" y="${py + 24}" width="332" height="230" rx="10" fill="#0f0c0c"/>`;
  s += text(side(px + 44, px + 334), py + 64, L().moisture, { size: 19, weight: 500, font: 'data', fill: '#b9b4ae', ls: 2, caps: true, anchor: lead() });
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const k = i / 40; if (k > dry + 0.02) break;
    pts.push(`${f(px + 44 + k * 290)},${f(py + 100 + Math.pow(k, 0.7) * 120)}`);
  }
  if (pts.length > 1) s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${C.heat}" stroke-width="5" stroke-linejoin="round"/>`;
  s += `<rect x="${px + 44}" y="${py + 280}" width="290" height="24" rx="12" fill="#0f0c0c"/>`;
  s += `<rect x="${px + 44}" y="${py + 280}" width="${f(290 * (1 - dry * 0.85))}" height="24" rx="12" fill="${C.water}"/>`;
  s += text(side(px + 44, px + 334), py + 344, L().lingl, { size: 20, weight: 500, fill: '#d6d4cf', anchor: lead() });
  return s;
}

function sceneGlaze(lt) {
  const gy = 720;
  let s = ground(gy);
  s += `<rect x="120" y="110" width="1400" height="18" fill="${C.steelDark}"/>`;
  const tank = { x: 420, y: 470, w: 900, h: gy - 470 };
  const liquidTop = tank.y + 50;
  const down = ease(seg(lt, 1.6, 3.4));
  const up = ease(seg(lt, 4.8, 6.4));
  const py = lerp(300, 620, down) - lerp(0, 320, up);
  const px = 570, len = 600, dia = 110;
  const coated = seg(lt, 3.2, 4.6);
  const col = mix(C.clayDry, C.glazeWet, coated);
  s += `<rect x="${px + len / 2 - 40}" y="118" width="80" height="30" rx="6" fill="${C.maroon}"/>`;
  s += `<line x1="${px + len / 2}" y1="148" x2="${px + len / 2}" y2="${f(py - 150)}" stroke="${C.ink}" stroke-width="5"/>`;
  s += `<line x1="${px + len / 2}" y1="${f(py - 150)}" x2="${px + 110}" y2="${f(py - dia / 2)}" stroke="${C.ink}" stroke-width="4"/>`;
  s += `<line x1="${px + len / 2}" y1="${f(py - 150)}" x2="${px + len - 160}" y2="${f(py - dia / 2)}" stroke="${C.ink}" stroke-width="4"/>`;
  s += `<rect x="${tank.x}" y="${tank.y}" width="${tank.w}" height="${tank.h}" fill="${C.steel}"/>`;
  s += pipe(px, py, len, dia, col, { gloss: coated * 0.8 });
  if (up > 0.2) {
    for (let i = 0; i < 9; i++) {
      const k = (lt * 1.3 + rnd(i)) % 1;
      const x = px + 40 + rnd(i + 4) * (len - 80);
      s += `<ellipse cx="${f(x)}" cy="${f(py + dia / 2 + 6 + k * 120)}" rx="5" ry="8" fill="${C.glazeWet}" opacity="${o(1 - k)}"/>`;
    }
  }
  const wob = Math.sin(lt * 6) * 6 * seg(lt, 3, 3.4) * (1 - seg(lt, 4.2, 5));
  s += `<path d="M ${tank.x + 10} ${liquidTop} Q ${tank.x + tank.w / 4} ${f(liquidTop - wob)} ${tank.x + tank.w / 2} ${liquidTop} T ${tank.x + tank.w - 10} ${liquidTop} L ${tank.x + tank.w - 10} ${gy} L ${tank.x + 10} ${gy} Z" fill="${C.glazeWet}" opacity=".94"/>`;
  s += `<rect x="${tank.x - 10}" y="${tank.y}" width="20" height="${tank.h}" fill="${C.steelDark}"/><rect x="${tank.x + tank.w - 10}" y="${tank.y}" width="20" height="${tank.h}" fill="${C.steelDark}"/>`;
  s += label(tank.x + tank.w / 2, 770, L().tank);
  const qc = seg(lt, 0.3, 0.9) * (1 - seg(lt, 1.4, 1.8));
  if (qc > 0) s += checkBadge(px + len + 70, 300, back(qc), qc) + label(px + len + 70, 260, L().qcPassed, qc);
  const ins = eOut(seg(lt, 5.8, 6.6));
  if (ins > 0) {
    let c = `<circle r="120" fill="${C.glazeWet}"/><circle r="110" fill="${C.clayDry}"/><circle r="84" fill="${C.glazeWet}"/><circle r="76" fill="${C.bg}"/>`;
    c += `<line x1="116" y1="-30" x2="190" y2="-80" stroke="${C.ink}" stroke-width="3"/>` + text(196, -74, L().glazeOut, { size: 24, weight: 600 });
    c += `<line x1="70" y1="30" x2="190" y2="80" stroke="${C.ink}" stroke-width="3"/>` + text(196, 88, L().glazeIn, { size: 24, weight: 600 });
    s += `<g transform="translate(1480 460) scale(${o(ins)})" opacity="${o(ins)}">${c}</g>`;
  }
  return s;
}

function sceneFire(lt) {
  const gy = 710;
  let s = ground(gy);
  const pre = 1 - seg(lt, 3.4, 4.0);
  if (pre > 0) {
    let p = `<rect x="140" y="300" width="560" height="${gy - 300}" rx="12" fill="${C.surface}" stroke="${C.line}" stroke-width="4"/>`;
    p += `<rect x="140" y="300" width="560" height="54" rx="12" fill="${C.slate}"/>` + text(side(170, 670), 336, L().preheat, { size: 22, weight: 500, font: 'data', fill: '#fff', ls: 2, caps: true, anchor: lead() });
    p += pipe(200, 560, 440, 100, C.glazeWet);
    for (let i = 0; i < 4; i++) {
      const ph = (lt * 160 + i * 70) % 300;
      p += `<path d="M ${170 + ph} ${410 + i * 22} q 20 -10 40 0 t 40 0" fill="none" stroke="${C.fire}" stroke-width="4" opacity=".45"/>`;
    }
    for (let i = 0; i < 10; i++) {
      const k = (lt * 0.7 + rnd(i)) % 1;
      p += `<circle cx="${f(230 + rnd(i + 2) * 380)}" cy="${f(500 - k * 150)}" r="5" fill="${C.water}" opacity="${o((1 - k) * (1 - seg(lt, 0.5, 3)))}"/>`;
    }
    const dry = seg(lt, 2.4, 3.0);
    if (dry > 0) p += checkBadge(640, 420, back(dry), dry) + text(420, 460, L().noHumidity, { size: 26, weight: 600, anchor: 'middle', op: dry });
    s += `<g opacity="${o(pre)}">${p}</g>`;
  }
  const kin = seg(lt, 3.4, 4.2);
  if (kin > 0) {
    const kx = 640, ky = 200, kw = 700, kh = gy - ky;
    const heat = ease(seg(lt, 5.8, 8.2)) * (1 - ease(seg(lt, 8.4, 9.6)));
    const doorClosed = ease(seg(lt, 5.4, 5.9)) * (1 - ease(seg(lt, 8.3, 8.8)));
    let k = `<rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" rx="16" fill="${C.slate}"/>`;
    k += `<rect x="${kx + 40}" y="${ky + 90}" width="${kw - 80}" height="${kh - 90}" fill="${mix('#2d2322', C.heat, heat * 0.85)}"/>`;
    k += text(kx + kw / 2, ky + 58, L().kiln, { size: 26, weight: 500, font: 'data', fill: '#fff', anchor: 'middle', ls: 3, caps: true });
    const inP = ease(seg(lt, 4.0, 5.4));
    const outP = ease(seg(lt, 8.8, 10.0));
    const carX = lerp(-640, kx + 70, inP) - outP * 620;
    const firedP = seg(lt, 6.6, 8.4);
    const pc = mix(C.glazeWet, C.fired, firedP);
    let car = `<rect x="0" y="${gy - 60}" width="560" height="26" rx="6" fill="${C.steelDark}"/>` + wheel(70, gy - 20, 20, carX / 40) + wheel(490, gy - 20, 20, carX / 40);
    for (let i = 0; i < 3; i++) car += pipe(20, gy - 110 - i * 104, 520, 96, mix(pc, C.heat, heat * 0.7), { gloss: firedP, bellLeft: i === 1 });
    k += tr(carX, 0, car);
    k += `<rect x="${kx + 40}" y="${ky + 90}" width="${kw - 80}" height="${f((kh - 90) * doorClosed)}" fill="${C.steelDark}"/>`;
    if (doorClosed > 0.9) k += `<rect x="${kx + 40}" y="${ky + 90}" width="${kw - 80}" height="${kh - 90}" fill="${C.fire}" opacity="${o(heat * 0.25)}"/>`;
    // Temperature card and firing curve.
    const tx = 1450, ty = 190;
    const temp = Math.round(1200 * ease(seg(lt, 5.8, 8.2)) * (1 - ease(seg(lt, 8.8, 9.8)) * 0.85) / 10) * 10;
    const card = seg(lt, 5.3, 5.8);
    let t = `<rect x="${tx}" y="${ty}" width="400" height="430" rx="16" fill="${C.surface}" stroke="${C.line}" stroke-width="3"/>`;
    t += text(side(tx + 32, tx + 368), ty + 52, L().kilnTemp, { size: 19, weight: 500, font: 'data', fill: C.muted, ls: 2, caps: true, anchor: lead() });
    const tempStr = `${rtl() ? temp : temp.toLocaleString('en-US')} ${L().deg}`;
    t += text(side(tx + 32, tx + 368), ty + 132, tempStr, { size: 68, weight: 600, font: 'head', fill: temp >= 1200 ? C.maroon : C.ink, anchor: lead() });
    const cp = seg(lt, 5.8, 9.8), pts = [];
    for (let i = 0; i <= 50; i++) {
      const u = i / 50; if (u > cp) break;
      const tv = u < 0.65 ? ease(u / 0.65) : 1 - ease((u - 0.65) / 0.35) * 0.85;
      pts.push(`${f(tx + 32 + u * 336)},${f(ty + 360 - tv * 170)}`);
    }
    t += `<line x1="${tx + 32}" y1="${ty + 360}" x2="${tx + 368}" y2="${ty + 360}" stroke="${C.line}" stroke-width="3"/>`;
    t += `<line x1="${tx + 32}" y1="${ty + 190}" x2="${tx + 368}" y2="${ty + 190}" stroke="${C.line}" stroke-width="2" stroke-dasharray="8 8"/>`;
    if (pts.length > 1) t += `<polyline points="${pts.join(' ')}" fill="none" stroke="${C.fire}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
    t += text(side(tx + 32, tx + 368), ty + 404, L().curve, { size: 21, weight: 600, fill: C.ink, anchor: lead() });
    k += `<g opacity="${o(card)}">${t}</g>`;
    s += `<g opacity="${o(eOut(kin))}">${k}</g>`;
  }
  return s;
}

function sceneJoint(lt) {
  let s = ground(700);
  const y = 460, dia = 200;
  const ringP = ease(seg(lt, 0.5, 2.0));
  const slide = ease(seg(lt, 2.4, 4.2));
  const aLen = 900, bX = 1000;
  const aX = lerp(-40, 150, slide);
  // Pipe A (spigot on its right end, with its polyurethane joint) slides into pipe B's socket.
  s += pipe(aX, y, aLen, dia, C.fired, { gloss: 1, bellLeft: true });
  const rw = dia * 0.16;
  s += `<rect x="${f(aX + aLen - rw - 10)}" y="${f(y - dia / 2 - 4)}" width="${f(rw)}" height="${f((dia + 8) * ringP)}" fill="${C.ring}"/>`;
  s += pipe(bX, y, 900, dia, C.fired, { gloss: 1, bellLeft: true });
  s += `<rect x="${bX}" y="${f(y - dia * 0.65 + 2)}" width="${f(dia * 0.1)}" height="${f((dia * 1.3 - 4) * ringP)}" fill="${C.ring}"/>`;
  const l1 = seg(lt, 1.0, 1.6) * (1 - seg(lt, 4.4, 4.9));
  s += `<g opacity="${o(l1)}"><line x1="${f(aX + aLen - 40)}" y1="${y - dia / 2 - 10}" x2="${f(aX + aLen - 120)}" y2="${y - 190}" stroke="${C.ink}" stroke-width="3"/>${text(aX + aLen - 130, y - 202, L().jointSpigot, { size: 26, weight: 600, anchor: 'end' })}</g>`;
  s += `<g opacity="${o(l1)}"><line x1="${bX + 20}" y1="${y + dia * 0.65 + 6}" x2="${bX + 90}" y2="${y + 200}" stroke="${C.ink}" stroke-width="3"/>${text(bX + 100, y + 212, L().jointSocket, { size: 26, weight: 600 })}</g>`;
  const push = seg(lt, 2.4, 4.2) * (1 - seg(lt, 4.3, 4.8));
  if (push > 0) s += `<path d="M ${f(aX + 250)} ${y} l 120 0 m -24 -18 l 26 18 l -26 18" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="${o(push)}"/>`;
  // Watertight, then the pressures from the live site's Joint Performance page.
  const ok = seg(lt, 4.3, 4.9);
  if (ok > 0) s += checkBadge(side(W / 2 - 150, W / 2 + 150), 150, back(ok), ok) + text(side(W / 2 - 110, W / 2 + 110), 163, L().watertight, { size: 40, weight: 600, font: 'head', fill: C.maroon, anchor: lead(), op: ok });
  ['0.5', '1', '2.4'].forEach((v, i) => {
    const a = seg(lt, 5.0 + i * 0.3, 5.4 + i * 0.3);
    if (a > 0) s += chip(W / 2 - 300 + (rtl() ? 2 - i : i) * 300, 255, L().bar(v), a, { fill: C.fired, color: '#fff', stroke: C.fired, size: 26 });
  });
  const pr = seg(lt, 5.9, 6.4);
  if (pr > 0) s += text(W / 2, 640, L().pressure, { size: 24, weight: 500, fill: C.muted, anchor: 'middle', op: pr }) + chip(W / 2, 730, L().roots, pr, { dot: true, size: 24 });
  return s;
}

function sceneDeliver(lt) {
  const gy = 690;
  let s = ground(gy, '#d9d6cf');
  for (let x = -((lt * 400) % 160); x < W; x += 160) s += `<rect x="${f(x)}" y="${gy + 50}" width="80" height="8" fill="#fff" opacity=".7"/>`;
  for (let i = 0; i < 14; i++) {
    const h = 80 + rnd(i) * 180, w = 90 + rnd(i + 7) * 60;
    s += `<rect x="${f(i * 140 - 20)}" y="${f(gy - h)}" width="${f(w)}" height="${f(h)}" fill="#e6e4df"/>`;
  }
  const dests = [L().egypt, L().ksa, L().germany];
  const order = rtl() ? [2, 1, 0] : [0, 1, 2];
  dests.forEach((d, i) => {
    const a = back(seg(lt, 1.8 + i * 0.7, 2.4 + i * 0.7));
    const op = seg(lt, 1.8 + i * 0.7, 2.2 + i * 0.7);
    const x = 560 + order[i] * 400;
    if (op > 0) s += `<g transform="translate(${x} 170) scale(${o(Math.max(a, 0))})">${chip(0, 0, d, op, { dot: true, size: 32 })}</g>`;
  });
  const dash = seg(lt, 2.0, 4.2);
  if (dash > 0) s += `<path d="M 715 170 L 805 170 M 1115 170 L 1205 170" stroke="${C.maroon}" stroke-width="4" stroke-dasharray="10 10" opacity="${o(dash)}"/>`;
  // Flatbed with pipes stacked socket-to-spigot, as in SWEILLEM's delivery photo.
  const drive = lt < 3.6 ? eOut(seg(lt, 0, 3.6)) * 0.5 : 0.5 + ease(seg(lt, 4.6, 7)) * 0.5;
  const len = 820;
  const x = lerp(-len - 200, W + 60, drive);
  let load = '';
  for (let r = 0; r < 3; r++) for (let c2 = 0; c2 < 2; c2++) load += pipe(x + 20 + c2 * 400, gy - 132 - r * 72, 390, 64, C.fired, { gloss: 1, bellLeft: (r + c2) % 2 === 1 });
  load += `<rect x="${f(x + 210)}" y="${gy - 350}" width="12" height="260" fill="${C.fire}" opacity=".9"/><rect x="${f(x + 610)}" y="${gy - 350}" width="12" height="260" fill="${C.fire}" opacity=".9"/>`;
  s += truck(x, gy, len, load, drive * 60);
  return s;
}

function sceneInstall(lt) {
  const sy = 360, ty = 720; // surface, trench bottom
  let s = `<rect x="0" y="${sy}" width="${W}" height="${BAND - sy}" fill="${C.soil}"/>`;
  s += `<rect x="0" y="${sy}" width="${W}" height="16" fill="#8e9a5b"/>`;
  const tx0 = 180, tx1 = 1740;
  s += `<rect x="${tx0}" y="${sy}" width="${tx1 - tx0}" height="${ty - sy}" fill="#e6d8c6"/>`;
  s += `<rect x="${tx0}" y="${ty}" width="${tx1 - tx0}" height="${BAND - ty}" fill="${C.soilDark}"/>`;
  const fill = ease(seg(lt, 7.8, 9.6));
  if (fill > 0) s += `<rect x="${tx0}" y="${f(ty - (ty - sy) * fill)}" width="${tx1 - tx0}" height="${f((ty - sy) * fill)}" fill="${C.soilDark}" opacity=".9"/>`;
  const py = ty - 52, dia = 88, len = 500, ov = 40;
  const pos = [240, 240 + len - ov, 240 + 2 * (len - ov)];
  const place = (t0) => ({ low: ease(seg(lt, t0, t0 + 2)), push: ease(seg(lt, t0 + 2.1, t0 + 3)) });
  const p2 = place(0.4), p3 = place(3.8);
  const pipes = [
    { x: pos[0], y: py, show: true },
    { x: pos[1] + 70 * (1 - p2.push), y: lerp(170, py, p2.low), show: true },
    { x: pos[2] + 70 * (1 - p3.push), y: lerp(170, py, p3.low), show: lt > 3.4 },
  ];
  pipes.forEach((p) => { if (p.show) s += pipe(p.x, p.y, len, dia, C.fired, { gloss: 1, ring: 1 }); });
  const flow = seg(lt, 9.6, 10.2);
  if (flow > 0) {
    const ph = (lt * 160) % 80;
    s += `<svg x="${pos[0]}" y="${py - 14}" width="${pos[2] + len - pos[0]}" height="28" overflow="hidden" opacity="${o(flow)}"><path d="${Array.from({ length: 22 }, (_, i) => `M ${f(-80 + ph + i * 80)} 14 l 40 0`).join(' ')}" stroke="${C.water}" stroke-width="10" stroke-linecap="round"/></svg>`;
    s += text(side(pos[0] + 20, pos[2] + len - 20), py - 80, L().flow, { size: 28, weight: 600, font: 'head', fill: '#fff', anchor: lead(), op: flow });
  }
  // Excavator on the surface to the right, lifting the pipe being placed.
  const active = lt < 3.9 ? pipes[1] : pipes[2];
  const lifting = lt < 7.4;
  const exit = ease(seg(lt, 7.2, 8.4));
  const bx = 1500 + exit * 900, by = sy;
  let e = `<rect x="${bx}" y="${by - 50}" width="300" height="50" rx="25" fill="#2a2626"/>`;
  e += `<rect x="${bx + 20}" y="${by - 170}" width="260" height="120" rx="12" fill="${C.loader}"/>`;
  e += `<rect x="${bx + 170}" y="${by - 240}" width="100" height="80" rx="8" fill="${C.loader}"/><rect x="${bx + 185}" y="${by - 228}" width="70" height="50" rx="4" fill="${C.glass}"/>`;
  const hx = lifting ? active.x + len / 2 : bx - 160, hy = lifting ? 150 : 220;
  const pvx = bx + 60, pvy = by - 150;
  const elx = (pvx + hx) / 2 + 40, ely = Math.min(pvy, hy) - 80;
  e += `<path d="M ${pvx} ${pvy} L ${f(elx)} ${f(ely)} L ${f(hx)} ${hy}" stroke="${C.loader}" stroke-width="30" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (lifting) {
    e += `<line x1="${f(hx)}" y1="${hy}" x2="${f(hx)}" y2="${f(active.y - 110)}" stroke="${C.ink}" stroke-width="4"/>`;
    e += `<path d="M ${f(active.x + 100)} ${f(active.y - dia / 2)} L ${f(hx)} ${f(active.y - 110)} L ${f(active.x + len - 150)} ${f(active.y - dia / 2)}" stroke="${C.ink}" stroke-width="4" fill="none"/>`;
  }
  s += e;
  const j = seg(lt, 2.6, 3.1) * (1 - seg(lt, 7.6, 8));
  if (j > 0) s += text(pos[1] + 10, py + 90, L().spigotSocket, { size: 26, weight: 600, anchor: 'middle', op: j });
  return s;
}

function sceneOutro(lt) {
  let s = '';
  const cards = L().benefits;
  cards.forEach(([h, b], i) => {
    const a = eOut(seg(lt, 0.3 + i * 0.35, 1.0 + i * 0.35));
    const slot = rtl() ? cards.length - 1 - i : i;
    const x = 120 + slot * 430;
    const tx = rtl() ? 354 : 36, anchor = rtl() ? 'end' : 'start';
    let c = `<rect width="390" height="220" rx="16" fill="${C.surface}" stroke="${C.line}" stroke-width="3"/><rect x="${rtl() ? 382 : 0}" width="8" height="220" fill="${C.maroon}"/>`;
    c += text(tx, 90, h, { size: 38, weight: 600, font: 'head', fill: C.maroon, anchor });
    c += wrap(b, rtl() ? 30 : 26).map((l, k) => text(tx, 140 + k * 34, l, { size: 24, weight: 400, fill: C.muted, anchor })).join('');
    s += `<g transform="translate(${x} ${f(160 + 40 * (1 - a))})" opacity="${o(a)}">${c}</g>`;
  });
  const lg = eOut(seg(lt, 2.2, 3.2));
  s += `<image href="${ASSET_BASE}logo.svg" x="${W / 2 - 280}" y="${f(480 + 20 * (1 - lg))}" width="560" height="190" opacity="${o(lg)}"/>`;
  s += text(W / 2, 740, L().since, { size: 30, weight: 500, fill: C.ink, anchor: 'middle', op: seg(lt, 2.8, 3.6) });
  return s;
}

const SCENES = { intro: sceneIntro, raw: sceneRaw, qc: sceneQC, mould: sceneMould, dry: sceneDry, glaze: sceneGlaze, fire: sceneFire, joint: sceneJoint, deliver: sceneDeliver, install: sceneInstall, outro: sceneOutro };

// ---------- chrome: caption band, progress, mark ----------
function chrome(t, ch) {
  const R = rtl();
  const lt = t - ch.start;
  let s = `<rect x="0" y="${BAND}" width="${W}" height="${H - BAND}" fill="${C.band}"/>`;
  const a = eOut(seg(lt, 0.1, 0.7));
  const op = a * (1 - seg(lt, ch.end - ch.start - 0.35, ch.end - ch.start));
  const side = (x) => (R ? W - x : x);
  const anchor = R ? 'end' : 'start';
  let cap = '';
  if (ch.n) cap += text(side(90), 902, String(ch.n).padStart(2, '0'), { size: 76, weight: 600, font: 'head', fill: C.maroon, anchor });
  const x0 = side(ch.n ? 230 : 90);
  cap += text(x0, 878, ch.title, { size: 44, weight: 600, font: 'head', anchor });
  wrap(ch.caption, R ? 104 : 96).slice(0, 2).forEach((l, i) => { cap += text(x0, 930 + i * 40, l, { size: 28, weight: 400, fill: C.muted, anchor }); });
  s += `<g transform="translate(0 ${f(16 * (1 - a))})" opacity="${o(op)}">${cap}</g>`;
  s += `<image href="${ASSET_BASE}mark.svg" x="${R ? 90 : W - 90 - 44}" y="846" width="44" height="64" opacity=".85"/>`;
  // Progress: one segment per numbered chapter, in reading order.
  const list = getChapters(LANG).filter((c) => c.n);
  const gap = 10, x = 90, w = W - 180, sw = (w - gap * (list.length - 1)) / list.length;
  list.forEach((c, i) => {
    const p = seg(t, c.start, c.end);
    const sx = R ? W - x - (i + 1) * sw - i * gap : x + i * (sw + gap);
    s += `<rect x="${f(sx)}" y="1030" width="${f(sw)}" height="8" rx="4" fill="${C.line}"/>`;
    if (p > 0) s += `<rect x="${f(R ? sx + sw * (1 - p) : sx)}" y="1030" width="${f(sw * p)}" height="8" rx="4" fill="${C.maroon}"/>`;
  });
  return s;
}

let ASSET_BASE = new URL('./assets/', import.meta.url).href;
export function setAssetBase(url) { ASSET_BASE = url.endsWith('/') ? url : url + '/'; }
export const PHOTOS = TIMES.filter((c) => c.photo).map((c) => c.photo);
export const assetUrls = () => ['logo.svg', 'mark.svg', ...PHOTOS.map((p) => `photos/${p}.webp`)].map((p) => ASSET_BASE + p);

// One complete frame as SVG markup (without the outer <svg>).
//   compact: drop the caption band (narrow screens, where the player shows the caption as HTML).
//   lang: 'en' or 'ar'.  uid: prefix for the frame's ids when several players share a page.
export const COMPACT_H = BAND;
export function frameSVG(t, { compact = false, lang = 'en', uid = 'hm' } = {}) {
  LANG = I18N[lang] ? lang : 'en';
  UID = uid;
  const tt = clamp(t, 0, DURATION);
  const ch = chapterAt(tt, LANG);
  const lt = tt - ch.start;
  const d = ch.end - ch.start;
  const fadeIn = ch.id === 'intro' ? 1 : seg(lt, 0, 0.45);
  const fadeOut = ch.id === 'outro' ? 1 : 1 - seg(lt, d - 0.45, d);
  const slt = Math.max(0, lt - ch.lead);
  let art = SCENES[ch.id](slt, d - ch.lead);
  if (ch.photo) {
    const po = 1 - seg(lt, ch.lead - 0.5, ch.lead);
    if (po > 0) art += `<g opacity="${o(po)}">${photoCard(ch, lt)}</g>`;
  }
  const defs = `<defs><linearGradient id="${UID}-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient></defs>`;
  return `${defs}<rect width="${W}" height="${H}" fill="${C.bg}"/><g opacity="${o(Math.min(fadeIn, fadeOut))}">${art}</g>${compact ? '' : chrome(tt, ch)}`;
}

// ---------- player ----------
// A host page can force reduced motion with window.__hmReduced (e.g. its own motion switch).
const reducedMotion = () => (typeof window !== 'undefined' && window.__hmReduced === true) || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
let instances = 0;

export function mount(el, { autoplay = true, loop = false, controls = true, startAt = 0, lang } = {}) {
  const lg = lang || ((el.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en');
  const UI = I18N[lg].ui;
  const list = getChapters(lg);
  const uid = `hm${++instances}`;
  const reduce = reducedMotion();
  el.classList.add('hm');
  el.setAttribute('dir', lg === 'ar' ? 'rtl' : 'ltr');
  el.setAttribute('lang', lg);
  el.innerHTML = `
    <div class="hm-stage">
      <svg class="hm-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(UI.label)}"></svg>
    </div>
    <p class="hm-caption" aria-hidden="true"><b></b><strong></strong><span></span></p>
    <p class="hm-sr" aria-live="polite"></p>
    ${controls ? `
    <div class="hm-controls">
      <button type="button" class="hm-play" aria-label="${esc(UI.play)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="hm-icon" d="M8 5v14l11-7z"/></svg></button>
      <input class="hm-seek" type="range" min="0" max="${DURATION}" step="0.1" value="0" aria-label="${esc(UI.seek)}">
      <span class="hm-time" dir="ltr" aria-hidden="true">0:00 / ${fmt(DURATION)}</span>
    </div>
    <ol class="hm-chapters">${list.filter((c) => c.n).map((c) => `<li><button type="button" data-id="${c.id}"><span>${String(c.n).padStart(2, '0')}</span>${esc(c.title)}</button></li>`).join('')}</ol>` : ''}`;
  const svg = el.querySelector('.hm-svg');
  const sr = el.querySelector('.hm-sr');
  const playBtn = el.querySelector('.hm-play');
  const seek = el.querySelector('.hm-seek');
  const time = el.querySelector('.hm-time');
  const chapterBtns = [...el.querySelectorAll('.hm-chapters button')];
  const [capNum, capTitle, capText] = el.querySelectorAll('.hm-caption > *');

  let t = startAt, playing = false, last = 0, raf = 0, userPaused = false, lastCh = null, compact = false, preloaded = false;

  function preload() {
    if (preloaded || typeof Image !== 'function') return;
    preloaded = true;
    assetUrls().forEach((u) => { const i = new Image(); i.src = u; });
  }
  function draw() {
    svg.innerHTML = frameSVG(t, { compact, lang: lg, uid });
    const ch = chapterAt(t, lg);
    if (ch.id !== lastCh) {
      lastCh = ch.id;
      sr.textContent = `${ch.n ? UI.step(ch.n) : ''}${ch.title}. ${ch.caption}`;
      capNum.textContent = ch.n ? String(ch.n).padStart(2, '0') : '';
      capTitle.textContent = ch.title;
      capText.textContent = ch.caption;
      chapterBtns.forEach((b) => b.toggleAttribute('aria-current', b.dataset.id === ch.id));
    }
    if (seek) seek.value = String(t);
    if (time) time.textContent = `${fmt(t)} / ${fmt(DURATION)}`;
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
    const c = el.clientWidth < 720;
    if (c !== compact) { compact = c; el.classList.toggle('hm-compact', c); svg.setAttribute('viewBox', `0 0 ${W} ${c ? COMPACT_H : H}`); draw(); }
  }) : null;
  ro?.observe(el);

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
    playBtn.setAttribute('aria-label', playing ? UI.pause : UI.play);
    playBtn.querySelector('.hm-icon').setAttribute('d', playing ? 'M7 5h4v14H7zM13 5h4v14h-4z' : 'M8 5v14l11-7z');
  }
  function play() {
    if (playing) return;
    preload();
    if (t >= DURATION) t = 0;
    playing = true; last = performance.now(); raf = requestAnimationFrame(tick); setIcon();
  }
  function pause() { playing = false; cancelAnimationFrame(raf); setIcon(); }
  function seekTo(s) { t = clamp(s, 0, DURATION); draw(); }
  function goTo(id) {
    const c = list.find((x) => x.id === id);
    if (!c) return;
    // With reduced motion, jump to the chapter's finished diagram instead of playing it.
    seekTo(reduce && !playing ? c.end - 0.6 : c.start);
  }

  playBtn?.addEventListener('click', () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } });
  seek?.addEventListener('input', () => seekTo(parseFloat(seek.value)));
  chapterBtns.forEach((b) => b.addEventListener('click', () => { preload(); goTo(b.dataset.id); }));

  let io;
  if (typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) preload();
      if (!autoplay || reduce) return;
      if (e.isIntersecting && e.intersectionRatio >= 0.4) { if (!userPaused) play(); } else pause();
    }, { threshold: [0, 0.4] });
    io.observe(el);
  }
  if (reduce && startAt === 0) t = list[0].end - 0.6;
  draw();

  return {
    play, pause, seek: seekTo, goTo,
    get time() { return t; },
    get playing() { return playing; },
    get lang() { return lg; },
    destroy() { pause(); io?.disconnect(); ro?.disconnect(); el.innerHTML = ''; el.classList.remove('hm', 'hm-compact'); },
  };
}
