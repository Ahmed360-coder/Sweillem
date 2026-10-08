// Builds what the Sweillem assistant knows: the text of every page as a
// visitor reads it, taken from a running build of the site. The assistant
// answers only from this file (src/lib/assistant/site-text.json), so it never
// says more than the site does.
//
//   npm run build && npm run assistant:knowledge
//
// Run it again whenever page text changes; the e2e test "assistant knowledge
// matches the pages" fails until you do.
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

export const KNOWLEDGE_FILE = fileURLToPath(new URL("../src/lib/assistant/site-text.json", import.meta.url));

/** Every page in the sitemap, as paths ("/", "/products/pipes", ...). */
export async function sitePaths(baseURL) {
  const xml = await (await fetch(new URL("/sitemap.xml", baseURL))).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/\/$/, "") || "/");
  return [...new Set(paths)].sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));
}

/** Text of one page's <main>, tidied: headings marked, table cells split by " | ", buttons dropped. */
export async function pageText(page, baseURL, path) {
  await page.goto(new URL(path, baseURL).href, { waitUntil: "networkidle" });
  return page
    .evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return { title: document.title, text: "" };
      const copy = main.cloneNode(true);
      // Controls, drawings and screen-reader-only status lines are not content.
      copy.querySelectorAll("button, svg, canvas, script, style, noscript, [role=status], [aria-hidden=true], .sr-only, form").forEach((el) => el.remove());
      copy.querySelectorAll("details").forEach((d) => d.setAttribute("open", ""));
      copy.querySelectorAll("h1, h2, h3, h4").forEach((h) => h.prepend(`${"#".repeat(Number(h.tagName[1]))} `));
      copy.querySelectorAll("li").forEach((li) => li.prepend("- "));
      copy.querySelectorAll("th, td").forEach((c) => c.append(" | "));
      copy.querySelectorAll("a[href^='/']").forEach((a) => {
        const href = a.getAttribute("href");
        if (a.textContent?.trim() && href !== "#main") a.append(` (${href})`);
      });
      // innerText needs the copy in the document to lay out lines.
      copy.style.cssText = "position:absolute;left:-99999px;top:0;width:1200px";
      document.body.append(copy);
      const text = copy.innerText;
      copy.remove();
      return { title: document.title, text };
    })
    .then(({ title, text }) => ({
      path,
      title: title.replace(/\s*·\s*SWEILLEM$/, ""),
      text: text
        .split("\n")
        .map((l) =>
          l
            .replace(/[ \t]+/g, " ")
            .replace(/\s*\|\s*$/, "")
            .trim(),
        )
        .filter((l, i, a) => l && !(l === a[i - 1]))
        .join("\n"),
    }));
}

/** All pages, in sitemap order. */
export async function crawlSite(baseURL, browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await context.addInitScript(() => {
    try {
      window.sessionStorage.setItem("sweillem.intro", "1");
    } catch {}
  });
  const page = await context.newPage();
  const pages = [];
  for (const path of await sitePaths(baseURL)) pages.push(await pageText(page, baseURL, path));
  await context.close();
  return pages;
}

async function waitFor(url, ms = 60_000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not start`);
}

async function main() {
  let baseURL = process.env.BASE_URL;
  let server;
  if (!baseURL) {
    const port = 3199;
    baseURL = `http://localhost:${port}`;
    server = spawn("npx", ["next", "start", "-p", String(port)], { stdio: "ignore" });
    await waitFor(`${baseURL}/sitemap.xml`);
  }
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
  try {
    const pages = await crawlSite(baseURL, browser);
    await writeFile(KNOWLEDGE_FILE, `${JSON.stringify(pages, null, 1)}\n`);
    const chars = pages.reduce((n, p) => n + p.text.length, 0);
    console.log(`Wrote ${pages.length} pages (${Math.round(chars / 1000)}k characters) to src/lib/assistant/site-text.json`);
  } finally {
    await browser.close();
    server?.kill();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
