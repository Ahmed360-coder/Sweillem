#!/usr/bin/env node
// Content checks for Milestone 1. Fails (exit 1) on anything that would put
// a broken link, a missing file or a malformed spec table on the site.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const errors = [];
const warnings = [];

// 1. Spec JSON is up to date with the markdown captures.
const before = readdirSync(join(root, "content/specs")).map((f) => [f, readFileSync(join(root, "content/specs", f), "utf8")]);
execFileSync(process.execPath, [join(root, "scripts/build-specs.mjs")], { stdio: "ignore" });
for (const [f, text] of before) {
  if (readFileSync(join(root, "content/specs", f), "utf8") !== text)
    errors.push(`content/specs/${f} was stale; run node scripts/build-specs.mjs and commit the result`);
}

// 2. Every spec table is rectangular and every row has a nominal size.
let rows = 0;
for (const f of readdirSync(join(root, "content/specs"))) {
  const spec = JSON.parse(readFileSync(join(root, "content/specs", f), "utf8"));
  for (const t of spec.tables) {
    if (!t.columns.length || t.columns[0].key !== "dn") errors.push(`${f} ${t.id}: first column must be the nominal size`);
    const ids = new Set();
    t.rows.forEach((r, i) => {
      rows++;
      if (r.length !== t.columns.length) errors.push(`${f} ${t.id} row ${i + 1}: ${r.length} cells for ${t.columns.length} columns`);
      if (!/^\d+(\/\d+)?\**$/.test(r[0])) errors.push(`${f} ${t.id} row ${i + 1}: unexpected nominal size "${r[0]}"`);
      ids.add(r.join("|"));
    });
    if (ids.size !== t.rows.length) warnings.push(`${f} ${t.id}: contains identical rows`);
  }
}

// 3. Every capture says where it came from.
for (const dir of ["content/live-site/pages", "content/live-site/products"]) {
  for (const f of readdirSync(join(root, dir))) {
    const text = readFileSync(join(root, dir, f), "utf8");
    if (!/^---\n[\s\S]*?\nsource: https:\/\/sweillem\.net\/[\s\S]*?\ncaptured: \d{4}-\d{2}-\d{2}\n[\s\S]*?---\n/.test(text))
      errors.push(`${dir}/${f}: missing source or captured date in front matter`);
  }
}

// 4. Asset manifest: in-repo files exist, downloaded files exist, paths are unique.
const manifest = JSON.parse(readFileSync(join(root, "content/assets-manifest.json"), "utf8"));
const seen = new Set();
for (const a of [...manifest.inRepo, ...manifest.liveSite]) {
  if (seen.has(a.path)) errors.push(`assets-manifest: duplicate path ${a.path}`);
  seen.add(a.path);
  if (!a.path.startsWith("public/")) errors.push(`assets-manifest: ${a.path} is outside public/`);
  const onDisk = existsSync(join(root, a.path));
  if ((a.status === "in-repo" || a.status === "downloaded") && !onDisk) errors.push(`assets-manifest: ${a.path} is marked ${a.status} but missing`);
  if (onDisk && statSync(join(root, a.path)).size > 2_500_000) warnings.push(`${a.path} is over 2.5 MB`);
}
const pending = manifest.liveSite.filter((a) => a.status !== "downloaded");
if (pending.length) warnings.push(`${pending.length} live-site assets not yet in the repo (run node scripts/fetch-live-assets.mjs)`);

// 5. Every file under public/images or public/downloads is in the manifest.
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name).slice(root.length)],
  );
}
for (const sub of ["public/images", "public/downloads"]) {
  if (!existsSync(join(root, sub))) continue;
  for (const p of walk(join(root, sub))) if (!seen.has(p)) errors.push(`${p} is not listed in content/assets-manifest.json`);
}

// 6. Every local path referenced from the typed content is in the manifest.
for (const f of ["content/products.ts", "content/certificates.ts", "content/company.ts"]) {
  for (const [, p] of readFileSync(join(root, f), "utf8").matchAll(/"(\/(?:images|downloads)\/[^"]+)"/g)) {
    if (!seen.has(`public${p}`)) errors.push(`${f} references ${p}, which is not in the asset manifest`);
  }
}

for (const w of warnings) console.log(`warning: ${w}`);
for (const e of errors) console.log(`ERROR: ${e}`);
console.log(`${rows} spec rows, ${manifest.inRepo.length} in-repo assets, ${manifest.liveSite.length} live-site assets; ${errors.length} errors, ${warnings.length} warnings`);
process.exitCode = errors.length ? 1 : 0;
