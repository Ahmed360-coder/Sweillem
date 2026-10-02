import { expect, test } from "@playwright/test";
import { pageRedirects, uploadRedirects } from "../../src/lib/redirects";
import { staticRoutes } from "../../src/lib/site";

// Metadata, redirects and links don't depend on the screen size.
test.skip(({ isMobile }) => isMobile, "desktop only");

// Words that mean a page still carries template or unfinished text.
const placeholder = /lorem ipsum|hello world|company name|clientwebsite|xtra theme|\bUSD XX\b|\bTODO\b|\bTBD\b|coming soon|being rebuilt/i;

for (const path of staticRoutes) {
  test(`${path} has its own title, description, canonical and share picture`, async ({ page, request }) => {
    await page.goto(path);
    const head = await page.evaluate(() => {
      const meta = (sel: string) => document.querySelector(sel)?.getAttribute("content") ?? null;
      return {
        title: document.title,
        description: meta('meta[name="description"]'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        ogTitle: meta('meta[property="og:title"]'),
        ogImage: meta('meta[property="og:image"]'),
        ogUrl: meta('meta[property="og:url"]'),
        twitterCard: meta('meta[name="twitter:card"]'),
        text: document.querySelector("main")?.innerText ?? "",
      };
    });
    expect(head.title).toMatch(/SWEILLEM/);
    expect(head.description?.length ?? 0).toBeGreaterThan(50);
    expect(head.description?.length ?? 0).toBeLessThanOrEqual(160);
    expect(new URL(head.canonical!).pathname.replace(/\/$/, "") || "/").toBe(path);
    expect(head.ogUrl).toBe(head.canonical);
    expect(head.ogTitle).toBeTruthy();
    expect(head.twitterCard).toBe("summary_large_image");
    expect(head.text).not.toMatch(placeholder);

    // The share picture is a real 1200 × 630 PNG served by this site.
    const og = await request.get(new URL(head.ogImage!).pathname);
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toBe("image/png");
  });
}

test("titles and descriptions are unique", async ({ request }) => {
  const seen = { title: new Map<string, string>(), description: new Map<string, string>() };
  for (const path of staticRoutes) {
    const html = await (await request.get(path)).text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
    for (const [key, value] of [["title", title], ["description", description]] as const) {
      expect(seen[key].get(value), `${path} repeats the ${key} of ${seen[key].get(value)}`).toBeUndefined();
      seen[key].set(value, path);
    }
  }
});

test("home page carries Organization structured data", async ({ page }) => {
  await page.goto("/");
  const json = await page.locator('script[type="application/ld+json"]').first().textContent();
  const graph = JSON.parse(json!)["@graph"] as { "@type": string; name: string; foundingDate?: string }[];
  const org = graph.find((n) => n["@type"] === "Organization");
  expect(org?.name).toBe("SWEILLEM Vitrified Clay Pipes Co.");
  expect(org?.foundingDate).toBe("1935");
});

test("sitemap lists every page and robots.txt points to it", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/(.)\/$/, "$1"));
  expect(locs.sort()).toEqual([...staticRoutes].sort());
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/User-Agent: \*/i);
});

test.describe("old sweillem.net addresses", () => {
  for (const [from, to] of Object.entries(pageRedirects)) {
    for (const old of [from, `${from}/`]) {
      test(`${old} → ${to}`, async ({ request }) => {
        const res = await request.get(old, { maxRedirects: 0 });
        expect(res.status()).toBe(308);
        expect(res.headers().location).toBe(to);
      });
    }
  }

  test("every #section a redirect points at exists", async ({ page }) => {
    for (const to of new Set(Object.values(pageRedirects).filter((t) => t.includes("#")))) {
      const [path, id] = to.split("#");
      await page.goto(path);
      await expect(page.locator(`[id="${id}"]`), to).toHaveCount(1);
    }
  });

  test("WordPress ?page_id= links reach the page", async ({ request }) => {
    const res = await request.get("/?page_id=8", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(new URL(res.headers().location, "http://x").pathname).toBe("/about");
  });

  test("archive pages go to the closest page", async ({ request }) => {
    for (const [old, to] of [["/category/uncategorized/", "/"], ["/projects/cat/europe/", "/projects#germany"], ["/author/admin/", "/"]]) {
      const res = await request.get(old, { maxRedirects: 0 });
      expect(res.status(), old).toBe(308);
      expect(res.headers().location, old).toBe(to);
    }
  });

  test("uploaded files land on the copy in this site", async ({ request }) => {
    for (const [from, to] of Object.entries(uploadRedirects())) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(308);
      expect(decodeURI(res.headers().location), from).toBe(to);
      expect((await request.head(to)).status(), to).toBe(200);
    }
  });
});

test("no page links to a missing page or file", async ({ page, request }) => {
  test.setTimeout(180_000);
  const checked = new Map<string, number>();
  const broken: string[] = [];
  for (const path of staticRoutes) {
    await page.goto(path);
    const refs = await page.evaluate(() =>
      [
        ...[...document.querySelectorAll("a[href]")].map((a) => (a as HTMLAnchorElement).href),
        ...[...document.querySelectorAll("img[src]")].map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src),
        ...[...document.querySelectorAll("source[src], video[src], track[src], video[poster]")].map(
          (e) => e.getAttribute("src") ?? e.getAttribute("poster") ?? "",
        ),
      ].filter(Boolean),
    );
    for (const ref of refs) {
      const url = new URL(ref, page.url());
      if (url.origin !== new URL(page.url()).origin) continue;
      const key = url.pathname + url.search;
      if (!checked.has(key)) checked.set(key, (await request.get(key)).status());
      if (checked.get(key) !== 200) broken.push(`${path} → ${key} (${checked.get(key)})`);

      // Same-page and cross-page #anchors must exist.
      if (url.hash.length > 1 && url.pathname === new URL(page.url()).pathname) {
        const id = decodeURIComponent(url.hash.slice(1));
        if ((await page.locator(`[id="${id}"]`).count()) === 0) broken.push(`${path} → ${url.hash} (no such anchor)`);
      }
    }
  }
  expect(broken).toEqual([]);
});
