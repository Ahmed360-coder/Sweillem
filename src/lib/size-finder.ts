import { productSpecs, products } from "@content/products";
import type { SpecTable, StrengthClass } from "@content/types";
import { cellText, columnUnit, leadingNumber, rowSize, specGroups, tableTitle } from "./specs";

// Data for the pipe size slider on /products. One stop per nominal size the
// pipe tables publish (DN 125 to 1000). At each stop: the pipe in each class
// made at that size, and every fitting whose table has a row for that size.
// Values stay the published cell text; numbers are parsed only for drawing.

export type PipeClass = Exclude<StrengthClass, "N/H">;

export interface PipeAtSize {
  strength: PipeClass;
  /** Readable table title, as the explorer and quote list use it. */
  title: string;
  /** Leading numbers for the drawing (mm). */
  d1: number;
  d3: number;
  /** Longest published length (m), for the 3D model. */
  length: number;
  /** Published figures, label plus cell text (unit in the label). */
  figures: { key: string; label: string; value: string }[];
  /** The full row in the product explorer. */
  href: string;
}

export interface FittingGroupAtSize {
  label: string;
  classes: PipeClass[];
  /** Published sizes of this group that start at the stop, e.g. "300/150". */
  sizes: string[];
  href: string;
}

export interface FittingAtSize {
  slug: string;
  name: string;
  groups: FittingGroupAtSize[];
}

export interface SizeStop {
  dn: number;
  pipes: PipeAtSize[];
  fittings: FittingAtSize[];
}

const FIGURES = [
  ["d1", "Inner ø d1"],
  ["d3", "Outer ø d3"],
  ["wallThickness", "Wall"],
  ["crushingStrength", "Crushing strength FN"],
  ["length", "Lengths"],
] as const;

/** Nominal size a row starts from: "300" for 300/150, 125 for the 125 to 150 enlarger. */
const mainDn = (row: string[]) => leadingNumber(row[0]);

function values(table: SpecTable, rows: string[][], key: string) {
  const i = table.columns.findIndex((c) => c.key === key);
  if (i < 0) return null;
  return [...new Set(rows.map((r) => cellText(r[i])))].join(" · ");
}

function pipeAt(table: SpecTable, group: string, dn: number): PipeAtSize | null {
  const rows = table.rows.filter((r) => mainDn(r) === dn);
  if (!rows.length || (table.strength !== "N" && table.strength !== "H")) return null;
  const num = (key: string) => {
    const i = table.columns.findIndex((c) => c.key === key);
    return i < 0 ? null : leadingNumber(rows[0][i]);
  };
  const d1 = num("d1");
  const d3 = num("d3");
  // Length cells list one or more lengths in metres ("2.0, 2.5").
  const li = table.columns.findIndex((c) => c.key === "length");
  const lengths = li < 0 ? [] : rows.flatMap((r) => (r[li].match(/\d+(?:\.\d+)?/g) ?? []).map(Number));
  if (d1 === null || d3 === null || !lengths.length) return null;
  const figures = FIGURES.flatMap(([key, label]) => {
    const value = values(table, rows, key);
    const col = table.columns.find((c) => c.key === key);
    if (value === null || !col) return [];
    const unit = columnUnit(col);
    return [{ key, label: unit ? `${label} (${unit})` : label, value }];
  });
  return { strength: table.strength, title: tableTitle(table), d1, d3, length: Math.max(...lengths), figures, href: explorerHref("pipes", group, table.strength, String(dn)) };
}

export function explorerHref(slug: string, group: string, strength: StrengthClass | null, size: string) {
  const q = new URLSearchParams({ product: slug, type: group, dn: size });
  if (strength) q.set("class", strength);
  return `/products/explorer?${q}`;
}

function fittingsAt(dn: number): FittingAtSize[] {
  return products.flatMap((p) => {
    const spec = productSpecs[p.slug];
    if (!spec || p.slug === "pipes") return [];
    const groups = specGroups(spec).flatMap((g): FittingGroupAtSize[] => {
      const tables = g.tables.filter((t) => t.rows.some((r) => mainDn(r) === dn));
      if (!tables.length) return [];
      const sizes = [...new Set(tables.flatMap((t) => t.rows.filter((r) => mainDn(r) === dn).map((r) => rowSize(t, r))))];
      const classes = [...new Set(tables.flatMap((t) => (t.strength === "N/H" ? ["N", "H"] : t.strength ? [t.strength] : [])))] as PipeClass[];
      const first = tables[0];
      return [{ label: g.label, classes, sizes, href: explorerHref(p.slug, g.id, first.strength, sizes[0]) }];
    });
    return groups.length ? [{ slug: p.slug, name: p.name, groups }] : [];
  });
}

/** Every nominal size the pipe tables publish, smallest first. */
export function sizeStops(): SizeStop[] {
  const pipeTables = productSpecs.pipes.tables;
  const group = (t: SpecTable) => specGroups(productSpecs.pipes).find((g) => g.tables.includes(t))!.id;
  const sizes = [...new Set(pipeTables.flatMap((t) => t.rows.map(mainDn)).filter((n): n is number => n !== null))].sort((a, b) => a - b);
  return sizes.map((dn) => ({
    dn,
    pipes: pipeTables.map((t) => pipeAt(t, group(t), dn)).filter((p): p is PipeAtSize => p !== null),
    fittings: fittingsAt(dn),
  }));
}
