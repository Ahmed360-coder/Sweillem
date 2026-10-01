#!/usr/bin/env node
// Turns the verbatim spec-table captures in content/live-site/products/*.md
// into typed JSON in content/specs/. Cell text is copied as-is: no rounding,
// no unit fixes. Corrections belong in the markdown capture, with a note.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const srcDir = join(root, "content/live-site/products");
const outDir = join(root, "content/specs");

const COLUMN_KEYS = [
  [/^Nominal size DN1\/DN2/i, "dn"],
  [/^Nominal size DN/i, "dn"],
  // Enlarger and reducer tables give the two ends as separate columns.
  [/^Dn1 \(/, "dn"],
  [/^Dn2 \(/, "dn2"],
  [/^DN$|^Dn \(/, "dn"],
  [/^Joint spigot/i, "d7"],
  [/^Joint/i, "joint"],
  [/^System$/, "joint"],
  [/^Angle/i, "angle"],
  [/^Strength class/i, "strengthClass"],
  [/^Class$/, "strengthClass"],
  [/^Crushing strength/i, "crushingStrength"],
  [/^FN \(/, "crushingStrength"],
  [/^INNER/i, "d1"],
  [/^d1 \(/, "d1"],
  [/^OUTER/i, "d3"],
  [/^d3 \(/, "d3"],
  [/^Wall ?thickness/i, "wallThickness"],
  [/^Socket inner/i, "d4"],
  [/^B\.M\.R/i, "bmr"],
  [/^Length/i, "length"],
  [/^L \(/, "length"],
  [/^Weight/i, "weight"],
  [/^Measurement a ?max/i, "aMax"],
  [/^Measurement e ?min/i, "eMin"],
  [/^a$/, "holeDiameter"],
  [/^R\. min/, "rMin"],
  [/^H\. min/, "hMin"],
];

// Perforated pipe hole counts: "System MP Z1" -> "mpZ1".
const HOLES = /^System (MP|LP|TP) (Z[12])$/;

function columnKey(label, previous) {
  const l = label.trim();
  // "max. dev." is the tolerance of the column before it (d1 or d3).
  if (/^max\. dev/.test(l) && previous) return `${previous}Dev`;
  const holes = HOLES.exec(l);
  if (holes) return `${holes[1].toLowerCase()}${holes[2]}`;
  for (const [re, key] of COLUMN_KEYS) if (re.test(l)) return key;
  throw new Error(`No column key for header "${label}"`);
}

function strengthFromTitle(title) {
  if (/^N H /.test(title)) return "N/H";
  if (/^N /.test(title)) return "N";
  if (/^H /.test(title)) return "H";
  return null;
}

function slugify(s) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/°/g, "deg")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Split a markdown table row, keeping empty cells.
function cells(line) {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((c) => c.trim());
}

function parse(file) {
  const text = readFileSync(file, "utf8");
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(text);
  const meta = Object.fromEntries(
    fm[1].split("\n").map((l) => {
      const i = l.indexOf(":");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
  );
  const body = text.slice(fm[0].length);
  const tables = [];
  let current = null;
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      current = { title: line.slice(3).trim(), section: null, notes: [], columns: null, rows: [] };
      tables.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith("Section: ")) {
      current.section = line.slice(9).trim();
    } else if (line.startsWith("|")) {
      if (!current.columns) {
        current.columns = [];
        for (const label of cells(line)) current.columns.push({ key: columnKey(label, current.columns.at(-1)?.key), label });
        i++; // skip |---| separator
      } else {
        const row = cells(line);
        if (row.length !== current.columns.length)
          throw new Error(`${basename(file)} "${current.title}": row has ${row.length} cells, expected ${current.columns.length}: ${line}`);
        current.rows.push(row);
      }
    } else if (line.trim()) {
      current.notes.push(line.trim());
    }
  }
  return {
    product: basename(file, ".md"),
    title: meta.title,
    source: meta.source,
    captured: meta.captured,
    tables: tables
      .filter((t) => t.columns)
      .map((t) => ({
        id: slugify(t.title),
        title: t.title,
        strength: strengthFromTitle(t.title),
        section: t.section,
        notes: t.notes,
        columns: t.columns,
        rows: t.rows,
      })),
  };
}

mkdirSync(outDir, { recursive: true });
const written = [];
for (const f of readdirSync(srcDir).filter((f) => f.endsWith(".md")).sort()) {
  const spec = parse(join(srcDir, f));
  if (!spec.tables.length) continue;
  const out = join(outDir, `${spec.product}.json`);
  writeFileSync(out, JSON.stringify(spec, null, 2) + "\n");
  const rows = spec.tables.reduce((n, t) => n + t.rows.length, 0);
  written.push(`${spec.product}: ${spec.tables.length} tables, ${rows} rows`);
}
console.log(written.join("\n"));
