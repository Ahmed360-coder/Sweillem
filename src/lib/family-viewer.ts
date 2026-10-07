import { productSpecs, products } from "@content/products";
import type { SpecTable } from "@content/types";
import type { FittingShape } from "./fitting-shapes";
import { explorerHref, type PipeClass } from "./size-finder";
import { cellText, columnHeading, columnUnit, leadingNumber, rowSize, specGroups } from "./specs";

// Data for the size finder's other product families (pipes keep their own
// slider in src/lib/size-finder.ts). For each family: its types (an angle, a
// short-piece code, ...), and for each type the sizes SWEILLEM publishes, with
// the shape to draw, the published row and the parts drawn without a published
// figure. Where a figure is not published the shape uses a stated assumption,
// listed in `drawn`, so the visitor can tell measured from drawn.

export interface ViewerItem {
  /** Size label as published: "300", "300/150", "150/200". */
  size: string;
  /** Leading nominal size, for ordering. */
  dn: number;
  strength: PipeClass | null;
  shape: FittingShape;
  /** The published row: heading (with unit) and cell text. */
  figures: { label: string; value: string }[];
  /** Plain words for each part drawn without a published figure. */
  drawn: string[];
  /** The row in the product explorer, if the product has tables. */
  href: string | null;
  quote: { product: string; size: string; strengthClass?: PipeClass };
}

export interface ViewerType {
  id: string;
  label: string;
  items: ViewerItem[];
  /** Size shown first, when the middle one would not show what the type is. */
  start?: string;
}

export interface ViewerFamily {
  slug: string;
  name: string;
  /** What the drawing shows, one sentence. */
  note: string;
  types: ViewerType[];
  /** No sizes are published: show the shape only, with the published drawing for "To scale". */
  shapeOnly?: { image: string; alt: string; shape: FittingShape };
}

const col = (t: SpecTable, key: string) => t.columns.findIndex((c) => c.key === key);
const cell = (t: SpecTable, r: string[], key: string) => {
  const i = col(t, key);
  return i < 0 ? "" : (r[i] ?? "");
};
/** Leading numbers of a cell that gives two ends, "300 ± 7 / 151 ± 5" -> [300, 151]. */
const pair = (text: string) => text.split("/").map((p) => leadingNumber(p.replace(/^-+/, "")));

/** Length in mm. Lengths are published in m, cm or mm, and some cells headed (CM) hold metres (0.25). */
function lengthMm(t: SpecTable, r: string[]): number | null {
  const i = col(t, "length");
  if (i < 0) return null;
  const v = leadingNumber(r[i]);
  if (v === null) return null;
  const unit = columnUnit(t.columns[i]);
  if (v <= 3) return v * 1000;
  return unit === "cm" ? v * 10 : unit === "m" ? v * 1000 : v;
}

/** The published row, every column but the size, as the explorer shows it. */
function figuresOf(t: SpecTable, r: string[]) {
  return t.columns.flatMap((c, i) => {
    if (c.key === "dn") return [];
    const value = cellText(r[i] ?? "");
    return value === "–" ? [] : [{ label: columnHeading(c), value }];
  });
}

/** Same size, class and type published more than once (another joint, length or system): keep the first row. */
function firstPerSize<T extends { size: string; strength: PipeClass | null }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((i) => {
    const k = `${i.size}|${i.strength}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const bySize = (a: ViewerItem, b: ViewerItem) => a.dn - b.dn || a.size.localeCompare(b.size, "en", { numeric: true });

const strengthOf = (t: SpecTable): PipeClass | null => (t.strength === "N" || t.strength === "H" ? t.strength : null);

// The pipe tables, read for figures a fitting's own table leaves out.
interface PipeRow {
  dn: number;
  strength: PipeClass;
  d1: number;
  d3: number;
  wall: number | null;
  d4: number | null;
  d7: number | null;
  table: SpecTable;
  row: string[];
}
const pipeRows: PipeRow[] = productSpecs.pipes.tables.flatMap((t) =>
  t.rows.flatMap((r) => {
    const dn = leadingNumber(r[0]);
    const d1 = leadingNumber(cell(t, r, "d1"));
    const d3 = leadingNumber(cell(t, r, "d3"));
    const strength = strengthOf(t);
    if (dn === null || d1 === null || d3 === null || !strength) return [];
    return [{ dn, strength, d1, d3, wall: leadingNumber(cell(t, r, "wallThickness")), d4: leadingNumber(cell(t, r, "d4")), d7: leadingNumber(cell(t, r, "d7")), table: t, row: r }];
  }),
);
/** The pipe at a size, preferring a class (N first), and a row with a socket when asked. */
function pipeAt(dn: number, strength?: PipeClass | null) {
  return pipeRows.find((p) => p.dn === dn && (!strength || p.strength === strength)) ?? pipeRows.find((p) => p.dn === dn) ?? null;
}

const pipeGroupId = (t: SpecTable) => specGroups(productSpecs.pipes).find((g) => g.tables.includes(t))!.id;

/** Socket depth and seal thickness are not published: drawn in proportion to the bore. */
const socketDepth = (d1: number) => Math.round(60 + 0.1 * d1);
const SEAL = 8;

function bends(): ViewerType[] {
  const spec = productSpecs.bends;
  const items = spec.tables.flatMap((t) =>
    t.rows.flatMap((r): (ViewerItem & { angle: number })[] => {
      const dn = leadingNumber(r[0]);
      const d1 = leadingNumber(cell(t, r, "d1"));
      const d3 = leadingNumber(cell(t, r, "d3"));
      const angle = leadingNumber(cell(t, r, "angle"));
      const strength = strengthOf(t);
      if (dn === null || d1 === null || d3 === null || angle === null) return [];
      const size = rowSize(t, r);
      return [
        {
          angle,
          size,
          dn,
          strength,
          shape: { kind: "bend", d1, d3, angle, radius: Math.round(1.5 * d3) },
          figures: figuresOf(t, r),
          drawn: ["Bend radius: not published, drawn at 1.5 × the outer ø."],
          href: explorerHref("bends", specGroups(spec).find((g) => g.tables.includes(t))!.id, t.strength, size),
          quote: { product: `Bends, ${angle}°`, size: `DN ${size}`, ...(strength && { strengthClass: strength }) },
        },
      ];
    }),
  );
  const angles = [...new Set(items.map((i) => i.angle))].sort((a, b) => a - b);
  return angles.map((a) => ({ id: `${a}deg`, label: `${a}°`, items: firstPerSize(items.filter((i) => i.angle === a)).sort(bySize) }));
}

function junctions(): ViewerType[] {
  const spec = productSpecs.junctions;
  return specGroups(spec).map((g) => {
    const angle = /90/.test(g.label) ? 90 : 45;
    const items = g.tables.flatMap((t) =>
      t.rows.flatMap((r): ViewerItem[] => {
        const size = rowSize(t, r);
        const [dn = null, dn2 = null] = pair(size);
        const [d1 = null, b1 = null] = pair(cell(t, r, "d1"));
        let [d3 = null, b3 = null] = pair(cell(t, r, "d3"));
        const strength = strengthOf(t);
        if (dn === null || dn2 === null || d1 === null || b1 === null) return [];
        const drawn: string[] = [];
        if (d3 === null) {
          d3 = pipeAt(dn, strength)?.d3 ?? null;
          if (d3 !== null) drawn.push(`Main outer ø: not in this row, taken from the DN ${dn} pipe (${d3} mm).`);
        }
        if (b3 === null) {
          b3 = pipeAt(dn2, "N")?.d3 ?? null;
          if (b3 !== null) drawn.push(`Branch outer ø: not in this row, taken from the DN ${dn2} pipe (${b3} mm).`);
        }
        if (d3 === null || b3 === null) return [];
        const len = lengthMm(t, r) ?? (dn >= 400 ? 1000 : 500);
        if (lengthMm(t, r) === null) drawn.push(`Length: not in this row, drawn ${len / 1000} m.`);
        const branch = Math.round(Math.max(b3 * 0.6, 120));
        drawn.push("Branch length beyond the main pipe: not published.");
        return [
          {
            size,
            dn,
            strength,
            shape: { kind: "junction", d1, d3, len, b1: Math.min(b1, d1), b3: Math.min(b3, d3), angle, branch },
            figures: figuresOf(t, r),
            drawn,
            href: explorerHref("junctions", g.id, t.strength, size),
            quote: { product: `Junctions, ${g.label}`, size: `DN ${size}`, ...(strength && { strengthClass: strength }) },
          },
        ];
      }),
    );
    return { id: g.id, label: g.label.replace(/^Junction /, "").replace(/^Repair junction (.*)$/, "Repair $1"), items: firstPerSize(items).sort(bySize) };
  });
}

function shortPieces(): ViewerType[] {
  const spec = productSpecs["short-pieces"];
  const sections = [...new Set(spec.tables.map((t) => t.section).filter((s): s is string => !!s))];
  return sections.flatMap((code) => {
    const tables = spec.tables.filter((t) => t.section === code);
    const g = specGroups(spec).find((x) => x.tables.includes(tables[0]))!;
    const items = tables.flatMap((t) =>
      t.rows.flatMap((r): ViewerItem[] => {
        const size = rowSize(t, r);
        const [dn = null, dn2 = null] = pair(size);
        const d1 = leadingNumber(cell(t, r, "d1"));
        let d3 = leadingNumber(cell(t, r, "d3"));
        let len = lengthMm(t, r);
        const strength = strengthOf(t);
        if (dn === null || d1 === null || len === null) return [];
        const drawn: string[] = [];
        // The GA tables print 0.75 under B.M.R and 4 to 8.6 under Length: the
        // two columns look swapped, so draw the short length and say so.
        const bmr = leadingNumber(cell(t, r, "bmr"));
        if (len > 1500 && bmr !== null && bmr <= 1.5) {
          drawn.push(`Length: this row prints ${cellText(cell(t, r, "length"))} under Length and ${bmr} under B.M.R; drawn ${bmr} m, like the other short pieces.`);
          len = bmr * 1000;
        }
        if (d3 === null) {
          d3 = pipeAt(dn, strength)?.d3 ?? null;
          if (d3 === null) return [];
          drawn.push(`Outer ø: not in this row, taken from the DN ${dn} pipe (${d3} mm).`);
        }
        const classes: PipeClass[] = t.strength === "N/H" ? ["N", "H"] : strength ? [strength] : [];
        const base = { size, dn, figures: figuresOf(t, r), href: explorerHref("short-pieces", g.id, t.strength, size) };
        // ÜF is a short enlarger: the small end is the DN1 pipe.
        let shape: FittingShape = { kind: "straight", d1, d3, len };
        if (code === "ÜF" && dn2 !== null) {
          const small = pipeAt(dn, "N");
          if (small) {
            shape = { kind: "taper", a1: small.d1, a3: small.d3, b1: d1, b3: d3, len };
            drawn.push(`Small end: the DN ${dn} pipe (inner ø ${small.d1} mm, outer ø ${small.d3} mm). Cone length is not published.`);
          }
        }
        return classes.length
          ? classes.map((c) => ({ ...base, strength: c, shape, drawn, quote: { product: `Short pieces, ${g.label}`, size: `DN ${size}`, strengthClass: c } }))
          : [{ ...base, strength: null, shape, drawn, quote: { product: `Short pieces, ${g.label}`, size: `DN ${size}` } }];
      }),
    );
    return items.length ? [{ id: g.id, label: code, items: firstPerSize(items).sort(bySize) }] : [];
  });
}

/** Pipe rows with a C joint: socket inner ø d4 and spigot outer ø d7 are published. */
function socketRows() {
  return firstPerSize(
    pipeRows
      .filter((p) => p.d4 !== null && p.d7 !== null)
      .map((p) => ({ ...p, size: String(p.dn) })),
  );
}

function jointingSystems(): ViewerType[] {
  const items = socketRows().map((p): ViewerItem => {
    const depth = socketDepth(p.d1);
    const fig = (key: string) => {
      const i = col(p.table, key);
      return { label: columnHeading(p.table.columns[i]), value: cellText(p.row[i]) };
    };
    return {
      size: p.size,
      dn: p.dn,
      strength: p.strength,
      shape: { kind: "joint", d1: p.d1, d3: p.d3, d4: p.d4!, d7: p.d7!, depth, seal: SEAL },
      figures: [fig("joint"), fig("d4"), fig("d7"), fig("d3"), fig("d1")],
      drawn: [`Socket depth: not published, drawn ${depth} mm.`, `Seal thickness: not published, drawn ${SEAL} mm.`],
      href: explorerHref("pipes", pipeGroupId(p.table), p.strength, p.size),
      quote: { product: "Jointing systems, C joint", size: `DN ${p.dn}`, strengthClass: p.strength },
    };
  });
  return [{ id: "c-joint", label: "C joint", items: items.sort(bySize) }];
}

function endPlugs(): ViewerType[] {
  const items = socketRows().map((p): ViewerItem => {
    const depth = socketDepth(p.d1);
    const plug = Math.round(depth * 0.7);
    const i = col(p.table, "d4");
    return {
      size: p.size,
      dn: p.dn,
      strength: p.strength,
      shape: { kind: "plug", d1: p.d1, d3: p.d3, d4: p.d4!, depth, seal: SEAL, plug },
      figures: [{ label: `${columnHeading(p.table.columns[i])}, the plug's seat`, value: cellText(p.row[i]) }],
      drawn: ["No sizes are published for end plugs: drawn to fit the socket of the pipe at this size.", `Plug thickness ${plug} mm and socket depth ${depth} mm are drawn, not published.`],
      href: null,
      quote: { product: "End plug", size: `DN ${p.dn}`, strengthClass: p.strength },
    };
  });
  return [{ id: "end-plug", label: "End plug", items: items.sort(bySize) }];
}

function perforated(): ViewerType[] {
  const spec = productSpecs["perforated-pipe"];
  const t = spec.tables[0];
  const g = specGroups(spec)[0];
  // Holes per piece around the pipe (Z1) and along it (Z2), per system. The MP
  // drawing shows the holes over the top of the pipe; the arcs for LP and TP are drawn.
  const systems = [
    ["MP", "mpZ1", "mpZ2", 70],
    ["LP", "lpZ1", "lpZ2", 180],
    ["TP", "tpZ1", "tpZ2", 210],
  ] as const;
  return systems.map(([code, z1, z2, arcDeg]) => ({
    id: code.toLowerCase(),
    label: `${code} system`,
    items: firstPerSize(
      t.rows.flatMap((r): ViewerItem[] => {
        const size = rowSize(t, r);
        const dn = leadingNumber(r[0]);
        const d1 = leadingNumber(cell(t, r, "d1"));
        const d3 = leadingNumber(cell(t, r, "d3"));
        const len = lengthMm(t, r);
        const dia = leadingNumber(cell(t, r, "holeDiameter"));
        const around = leadingNumber(cell(t, r, z1));
        const along = leadingNumber(cell(t, r, z2));
        if (dn === null || d1 === null || d3 === null || len === null || dia === null || around === null || along === null) return [];
        // The joint: this table gives no socket sizes, so the socket and seal are the
        // N class pipe's at this size (same d1 and d3 as the perforated pipe).
        const pipe = pipeRows.find((p) => p.dn === dn && p.strength === "N" && p.d4 !== null && p.d7 !== null);
        const depth = socketDepth(d1);
        const joint = pipe ? { d4: pipe.d4!, d7: pipe.d7!, depth, seal: SEAL, next: Math.round(Math.max(250, d3 * 0.6)) } : undefined;
        const socketFigures = pipe
          ? (["d4", "d7"] as const).map((key) => {
              const i = col(pipe.table, key);
              return { label: `${columnHeading(pipe.table.columns[i])}, from the DN ${dn} N pipe`, value: cellText(pipe.row[i]) };
            })
          : [];
        return [
          {
            size,
            dn,
            strength: null,
            shape: { kind: "straight", d1, d3, len, holes: { dia, around, along, arc: arcDeg }, joint },
            figures: [...figuresOf(t, r).filter((f) => !/holes Z/.test(f.label) || f.label.startsWith(code)), ...socketFigures],
            drawn: [
              `Hole positions: ${around} around and ${along} along, as published; their spacing is drawn even.`,
              ...(joint
                ? [
                    `Joint: the perforated pipe table gives no socket sizes, so the socket (d4) and seal (d7) are the DN ${dn} N pipe's. Socket depth ${depth} mm and seal thickness ${SEAL} mm are drawn, not published.`,
                    "On the right, the next pipe's spigot is pushed home into the socket.",
                  ]
                : []),
            ],
            href: explorerHref("perforated-pipe", g.id, null, size),
            quote: { product: `Perforated pipe, ${code} system`, size: `DN ${size}` },
          },
        ];
      }),
    ).sort(bySize),
  }));
}

function enlargerReducer(): ViewerType[] {
  const spec = productSpecs["enlarger-reducer"];
  const LEN = 250;
  return specGroups(spec).map((g) => {
    const t = g.tables[0];
    const rows = (size: string) => t.rows.filter((r) => rowSize(t, r) === size);
    const items = [...new Set(t.rows.map((r) => rowSize(t, r)))].flatMap((size): ViewerItem[] => {
      const [dn = null, dn2 = null] = pair(size);
      const a = dn === null ? null : pipeAt(dn, "N");
      const b = dn2 === null ? null : pipeAt(dn2, "N");
      if (dn === null || !a || !b) return [];
      const rs = rows(size);
      // One size can be published with several joint systems: list each.
      const figures = t.columns.flatMap((c, i) => {
        if (c.key === "dn" || c.key === "dn2") return [];
        const v = [...new Set(rs.map((r) => cellText(r[i])))].join(" · ");
        return [{ label: columnHeading(c), value: v }];
      });
      return [
        {
          size,
          dn,
          strength: null,
          shape: { kind: "taper", a1: a.d1, a3: a.d3, b1: b.d1, b3: b.d3, len: LEN },
          figures,
          drawn: [`Diameters: from the DN ${dn} and DN ${dn2} pipes; this table gives sizes only.`, `Length: not published, drawn ${LEN} mm like the ÜF short piece.`],
          href: explorerHref("enlarger-reducer", g.id, null, size),
          quote: { product: g.label, size: `DN ${size}` },
        },
      ];
    });
    // Open on a size that changes ø (some sizes keep DN and change only the class).
    const changing = items.filter((i) => i.shape.kind === "taper" && i.shape.a3 !== i.shape.b3);
    return { id: g.id, label: g.label, items: items.sort(bySize), start: changing[Math.floor((changing.length - 1) / 2)]?.size };
  });
}

function halfChannels(): ViewerType[] {
  const spec = productSpecs["half-channels"];
  const t = spec.tables[0];
  const g = specGroups(spec)[0];
  const items = t.rows.flatMap((r): ViewerItem[] => {
    const dn = leadingNumber(r[0]);
    const h = leadingNumber(cell(t, r, "hMin"));
    const len = lengthMm(t, r);
    if (dn === null || h === null || len === null) return [];
    const p = pipeAt(dn, "N");
    const wall = p?.wall ?? (p ? (p.d3 - p.d1) / 2 : Math.round(dn * 0.08));
    const size = rowSize(t, r);
    return [
      {
        size,
        dn,
        strength: null,
        shape: { kind: "channel", dn, h, wall, len },
        figures: figuresOf(t, r),
        drawn: [p ? `Wall: not published, drawn ${wall} mm like the DN ${dn} pipe.` : `Wall: not published, drawn ${wall} mm.`],
        href: explorerHref("half-channels", g.id, null, size),
        quote: { product: "Half channels 180°", size: `DN ${size}` },
      },
    ];
  });
  return [{ id: g.id, label: "180°", items: items.sort(bySize) }];
}

const build: Record<string, { note: string; types: () => ViewerType[] }> = {
  bends: { note: "Section through the centre, to scale.", types: bends },
  junctions: { note: "Section through the centre, to scale.", types: junctions },
  "jointing-systems": { note: "A spigot pushed home into the next pipe's socket, in section, to scale.", types: jointingSystems },
  "short-pieces": { note: "Section through the centre, to scale.", types: shortPieces },
  "input-clutch-end-plugs": { note: "A socket closed by its end plug, in section, to scale.", types: endPlugs },
  "perforated-pipe": { note: "Section through the centre, to scale, with the socket joint to the next pipe. Dots: the holes in the far wall.", types: perforated },
  "enlarger-reducer": { note: "Section through the centre, to scale.", types: enlargerReducer },
  "half-channels": { note: "End view, to scale.", types: halfChannels },
};

/** Every product family but pipes, in the order of the product list. */
export function viewerFamilies(): ViewerFamily[] {
  return products.flatMap((p): ViewerFamily[] => {
    if (p.slug === "pipes") return [];
    if (p.slug === "u-trap") {
      const pipe = pipeAt(150, "N")!;
      return [
        {
          slug: p.slug,
          name: p.name,
          note: "Shape only: SWEILLEM publishes no U-trap sizes.",
          types: [],
          shapeOnly: { image: p.images[0], alt: "SWEILLEM's dimension drawing of the U-trap (DN2 d8, d4, d3, A, B, M1), with no values", shape: { kind: "utrap", d1: pipe.d1, d3: pipe.d3 } },
        },
      ];
    }
    const b = build[p.slug];
    if (!b) return [];
    const types = b.types().filter((t) => t.items.length);
    return types.length ? [{ slug: p.slug, name: p.name, note: b.note, types }] : [];
  });
}
