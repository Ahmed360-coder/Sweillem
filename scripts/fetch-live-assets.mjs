#!/usr/bin/env node
// Downloads every "pending-download" asset in content/assets-manifest.json
// from the live site into the repo, so the new site never hotlinks
// sweillem.net. Re-running is safe: files already downloaded are skipped
// unless --force is passed.
//
//   node scripts/fetch-live-assets.mjs            # fetch what is missing
//   node scripts/fetch-live-assets.mjs --force    # fetch everything again
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";

const root = new URL("..", import.meta.url).pathname;
const manifestPath = join(root, "content/assets-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const force = process.argv.includes("--force");

let ok = 0;
let failed = 0;
let skipped = 0;

for (const asset of manifest.liveSite) {
  const target = join(root, asset.path);
  if (!force && asset.status === "downloaded" && existsSync(target)) {
    skipped++;
    continue;
  }
  try {
    // Arabic file names must be percent-encoded; encodeURI leaves the rest intact.
    const res = await fetch(encodeURI(asset.url), {
      headers: { "user-agent": "sweillem-rebuild-asset-fetch/1.0" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
    asset.status = "downloaded";
    asset.bytes = bytes.length;
    asset.sha256 = createHash("sha256").update(bytes).digest("hex");
    asset.contentType = res.headers.get("content-type") ?? undefined;
    delete asset.error;
    ok++;
    console.log(`ok     ${asset.path} (${Math.round(bytes.length / 1024)} KB)`);
  } catch (err) {
    asset.status = "failed";
    asset.error = String(err.message ?? err);
    failed++;
    console.log(`FAILED ${asset.url}: ${asset.error}`);
  }
}

manifest.lastFetch = new Date().toISOString();
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${ok} downloaded, ${skipped} already present, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
