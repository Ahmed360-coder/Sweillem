import { productSpecs, products } from "@content/products";
import type { ProductSpecs, SpecColumn, SpecColumnKey, SpecTable, StrengthClass } from "@content/types";

// Reading layer over the captured spec tables (content/specs). Cell text is
// never changed here: helpers only group tables, label columns and parse the
// leading number of a cell for drawings. What the visitor reads is the cell.

/** Plain-words column names. The published header text stays in content/specs. */
const columnNames: Record<SpecColumnKey, string> = {
  dn: "Nominal size DN",
  dn2: "Nominal size DN2",
  joint: "Joint",
  angle: "Angle",
  strengthClass: "Strength class",
  crushingStrength: "Crushing strength FN",
  d1: "Inner ø d1",
  d1Dev: "d1 tolerance",
  d3: "Outer ø d3",
  d3Dev: "d3 tolerance",
  wallThickness: "Wall thickness",
  d4: "Socket inner ø d4",
  d7: "Spigot outer ø d7",
  bmr: "B.M.R",
  length: "Length",
  weight: "Weight",
  aMax: "a max",
  eMin: "e min",
  holeDiameter: "Hole ø a",
  mpZ1: "MP holes Z1",
  mpZ2: "MP holes Z2",
  lpZ1: "LP holes Z1",
  lpZ2: "LP holes Z2",
  tpZ1: "TP holes Z1",
  tpZ2: "TP holes Z2",
  rMin: "R min",
  hMin: "H min",
};

const unitMap: Record<string, string> = {
  mm: "mm",
  cm: "cm",
  m: "m",
  "kn/m": "kN/m",
  "kn/pcs": "kN/pc",
  "kg/pcs": "kg/pc",
  kg: "kg",
};

/** Unit from the published header, e.g. "Length I1 (CM)" -> "cm". */
export function columnUnit(col: SpecColumn): string | null {
  if (col.key === "strengthClass" || col.key === "angle") return null;
  const m = /\(\s*([^()]*?)\s*\)\s*$/.exec(col.label);
  if (!m) return null;
  return unitMap[m[1].toLowerCase()] ?? null;
}

export function columnName(col: SpecColumn): string {
  if (col.key === "dn" && /DN1\/DN2/i.test(col.label)) return "Nominal size DN1/DN2";
  if (col.key === "dn" && /^Dn1/.test(col.label)) return "Nominal size DN1";
  return columnNames[col.key];
}

/** Column heading for the site: plain name plus unit. */
export function columnHeading(col: SpecColumn): string {
  const unit = columnUnit(col);
  return unit ? `${columnName(col)} (${unit})` : columnName(col);
}

/** Shown, with NO_CLASS_NOTE as its tooltip, where a pipe size has no strength class. */
export const NO_CLASS = "n/a";
// TODO(factory): confirm the strength class (TKL) of N class DN 125 and DN 150, or that none applies.
export const NO_CLASS_NOTE = "Not applicable to this size: see the crushing strength FN.";

/**
 * Cell text for display. Soft hyphens stand for a dash. The * and ** footnote
 * marks are dropped, because their footnote text is not on the site yet
 * (TODO(factory): footnote text, see docs/factory-todo.md). A strength class
 * cell with no class reads "n/a".
 */
export function cellText(text: string, col?: SpecColumn): string {
  const t = text.replace(/­/g, "-").replace(/\s*\*+/g, "").trim();
  if (col?.key === "strengthClass" && (t === "-" || t === "")) return NO_CLASS;
  return t === "" ? "–" : t;
}

/** Tooltip for a cell, when its value needs one. */
export function cellNote(text: string, col?: SpecColumn): string | undefined {
  return cellText(text, col) === NO_CLASS ? NO_CLASS_NOTE : undefined;
}

/**
 * Rows for display: rows of the same size that differ only in their length are
 * shown as one row, e.g. DN 150 at "1 / 1.25 / 1.5" m.
 */
export function displayRows(table: SpecTable): string[][] {
  const li = table.columns.findIndex((c) => c.key === "length");
  if (li < 0) return table.rows;
  const out: string[][] = [];
  for (const row of table.rows) {
    const prev = out.at(-1);
    if (prev && row.every((c, i) => i === li || c === prev[i]) && !prev[li].split(" / ").includes(row[li])) {
      prev[li] = `${prev[li]} / ${row[li]}`;
    } else {
      out.push([...row]);
    }
  }
  return out;
}

/** Leading number of a cell ("687 ± 12**" -> 687), or null. */
export function leadingNumber(text: string): number | null {
  const m = /^\s*(\d+(?:\.\d+)?)/.exec(text.replace(/­/g, ""));
  return m ? Number(m[1]) : null;
}

export const classNames: Record<StrengthClass, { short: string; long: string }> = {
  N: { short: "N", long: "Normal strength" },
  H: { short: "H", long: "Extra strength" },
  "N/H": { short: "N/H", long: "Normal and extra strength" },
};

const keepUpper = /^(?:[A-ZÜ]{1,2},?|\d+°)$/;

/** "N SHORT LENGTH, GZ NORMAL STRENGTH" -> "Short length, GZ". */
export function groupLabel(table: SpecTable): string {
  let t = table.title.trim();
  if (table.strength) t = t.replace(/^(N H|N|H)\s+/, "");
  t = t.replace(/\s+(NORMAL|EXTRA) STRENGTH$/, "");
  const words = t.split(/\s+/);
  return words
    .map((w, i) => {
      if (keepUpper.test(w)) return w;
      const lower = w.toLowerCase();
      return i === 0 ? lower[0].toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}

/** Readable table title: group plus class. */
export function tableTitle(table: SpecTable): string {
  const g = groupLabel(table);
  if (!table.strength) return g;
  const c = classNames[table.strength];
  return table.strength === "N/H" ? `${g} · N and H class` : `${g} · ${c.short} class, ${c.long.toLowerCase()}`;
}

/** Size label of a row: "300", "300/150" (junctions) or "150/200" (enlarger). */
export function rowSize(table: SpecTable, row: string[]): string {
  const dn = row[0].replace(/\*+/g, "").replace(/\s+/g, "");
  const i = table.columns.findIndex((c) => c.key === "dn2");
  return i >= 0 ? `${dn}/${row[i].trim()}` : dn;
}

export interface SpecGroup {
  id: string;
  label: string;
  /** Tables of this group, one per strength (or a single unclassed table). */
  tables: SpecTable[];
}

export function specGroups(spec: ProductSpecs): SpecGroup[] {
  const groups: SpecGroup[] = [];
  for (const t of spec.tables) {
    const label = groupLabel(t);
    let g = groups.find((x) => x.label === label);
    if (!g) {
      g = { id: label.toLowerCase().replace(/[^a-z0-9ü°]+/g, "-").replace(/°/g, "deg").replace(/^-|-$/g, ""), label, tables: [] };
      groups.push(g);
    }
    g.tables.push(t);
  }
  return groups;
}

/** Distinct sizes in a table, in table order. */
export function sizesOf(table: SpecTable): string[] {
  return [...new Set(table.rows.map((r) => rowSize(table, r)))];
}

/** Columns whose values differ between rows of the same size (e.g. length). */
export function distinguishingColumns(table: SpecTable, rows: string[][]): number[] {
  if (rows.length < 2) return [];
  return table.columns
    .map((_, i) => i)
    .filter((i) => i > 0 && new Set(rows.map((r) => r[i])).size > 1);
}

/** Smallest and largest nominal size across a product's tables. */
export function dnRange(spec: ProductSpecs): [number, number] {
  const all = spec.tables.flatMap((t) => t.rows.map((r) => leadingNumber(r[0]) ?? 0)).filter(Boolean);
  return [Math.min(...all), Math.max(...all)];
}

export function strengthsOf(spec: ProductSpecs): StrengthClass[] {
  return [...new Set(spec.tables.map((t) => t.strength).filter((s): s is StrengthClass => !!s))];
}

/** Joint types used in a product's tables ("F", "C"). */
export function jointsOf(spec: ProductSpecs): string[] {
  const set = new Set<string>();
  for (const t of spec.tables) {
    const i = t.columns.findIndex((c) => c.key === "joint");
    if (i < 0) continue;
    for (const r of t.rows) for (const j of r[i].split("/")) if (/^[A-Z]$/.test(j.trim())) set.add(j.trim());
  }
  return [...set].sort((a, b) => (a === "F" ? -1 : b === "F" ? 1 : a.localeCompare(b)));
}

/** Products that have spec tables, for the explorer. */
export const explorerProducts = products
  .filter((p) => productSpecs[p.slug])
  .map((p) => ({ slug: p.slug, name: p.name, spec: productSpecs[p.slug] }));

export const totalRows = Object.values(productSpecs).reduce((n, s) => n + s.tables.reduce((m, t) => m + t.rows.length, 0), 0);
