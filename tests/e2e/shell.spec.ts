import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { staticRoutes } from "../../src/lib/site";
import { skipIntro } from "./helpers";

test.describe("header", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  test("marks the current page and condenses on scroll", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation");
    await page.goto("/about");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
    const header = page.locator("header").first();
    await expect(header).not.toHaveAttribute("data-stuck");
    // Scroll with the pointer over the page, as a visitor does; Playwright's
    // pointer otherwise sits on the corner pixel of the header. A wheel event
    // sent before the page can scroll is dropped (seen on slow CI runners), so
    // scroll again until the header condenses. Checking scrollY first tells a
    // page that did not scroll apart from a header that did not condense.
    await page.mouse.move(640, 400);
    await expect(async () => {
      await page.mouse.wheel(0, 400);
      await expect.poll(() => page.evaluate(() => window.scrollY), { message: "the page scrolls", timeout: 1000 }).toBeGreaterThan(24);
      await expect(header).toHaveAttribute("data-stuck", "", { timeout: 1000 });
    }).toPass();
  });

  test("every page lights up a main nav item", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const [path, item] of [
      ["/services", "About"],
      ["/sustainability", "About"],
      ["/euro-sweillem", "About"],
      ["/quality", "About"],
      ["/joint-performance", "About"],
      ["/certificates", "Downloads"],
    ]) {
      await page.goto(path);
      await expect(nav.getByRole("link", { name: item })).toHaveAttribute("aria-current", "true");
    }
    await page.goto("/quote");
    await expect(page.locator("header").getByRole("link", { name: /^Quote list/ })).toHaveAttribute("aria-current", "page");
  });

  test("footer links are 44 px tall on phones", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone tap targets");
    await page.goto("/");
    const heights = await page.locator("footer nav a").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
  });

  test("side menu opens, closes on Escape and after navigating", async ({ page }) => {
    await page.goto("/");
    const burger = page.getByRole("button", { name: "Menu", exact: true });
    const menu = page.locator("#site-menu");
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toHaveAttribute("inert", "");

    await burger.click();
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await expect(menu).not.toHaveAttribute("inert");
    await expect(page.locator("#main")).toHaveAttribute("inert", "");
    await page.keyboard.press("Escape");
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await expect(burger).toBeFocused();

    await burger.click();
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(burger).toHaveAttribute("aria-expanded", "false");

    await burger.click();
    await menu.getByRole("link", { name: "Certificates" }).click();
    await expect(page).toHaveURL(/\/certificates$/);
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await burger.click();
    await expect(menu.getByRole("link", { name: "Certificates" })).toHaveAttribute("aria-current", "page");
  });

  test("side menu links to every page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const hrefs = await page.locator("#site-menu a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect([...hrefs].sort()).toEqual([...staticRoutes].sort());
  });

  test("home-screen icon and name", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute("content", "SWEILLEM");
    const touchIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
    expect((await request.get(touchIcon!)).headers()["content-type"]).toBe("image/png");
    const manifest = await (await request.get((await page.locator('link[rel="manifest"]').getAttribute("href"))!)).json();
    expect(manifest.short_name).toBe("SWEILLEM");
    for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBe(true);
  });

  test("quote button shows the list count", async ({ page }) => {
    await page.goto("/quote");
    await expect(page.getByRole("heading", { name: "Your quote list is empty" })).toBeVisible();
    await page.evaluate(() => {
      localStorage.setItem("sweillem.quote.v1", JSON.stringify([{ product: "Pipes", size: "DN 200", strengthClass: "N", qty: 3 }]));
      window.dispatchEvent(new Event("sweillem:quote"));
    });
    await expect(page.locator("[data-quote-count]")).toHaveText("3");
    await expect(page.getByRole("spinbutton", { name: "Quantity: Pipes, DN 200, N" })).toHaveValue("3");
  });
});

test.describe("intro", () => {
  test("plays once per session on the home page and can be skipped", async ({ page }) => {
    await page.goto("/");
    const intro = page.locator("#intro");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "play");
    await expect(intro).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done", { timeout: 2000 });
    await expect(intro).toBeHidden();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    await expect(intro).toBeHidden();
  });

  test("ends by itself within four seconds", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#intro")).toBeHidden({ timeout: 4500 });
  });

  test("holds the hero entrance until the intro hands off", async ({ page }) => {
    await page.goto("/");
    const word = page.locator(".rise-word > span").first();
    const playState = () => word.evaluate((el) => getComputedStyle(el).animationPlayState);
    await expect(page.locator("html")).toHaveAttribute("data-intro", "play");
    expect(await playState()).toBe("paused");
    await page.keyboard.press("Escape");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "exit");
    expect(await playState()).toBe("running");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done", { timeout: 2000 });
  });

  test("never shows on deep links", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    await expect(page.locator("#intro")).toBeHidden();
  });

  test("reduced motion shows it still and briefly", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("#intro")).toBeHidden({ timeout: 1800 });
    await ctx.close();
  });
});

test.describe("layout rules (design/taste-audit.md)", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop widths");
    await skipIntro(page);
  });

  test("hero headline takes at most three lines at 1280 px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const lines = await page.locator("h1").evaluate((h) => {
      const lh = parseFloat(getComputedStyle(h).lineHeight);
      return Math.round(h.getBoundingClientRect().height / lh);
    });
    expect(lines).toBeLessThanOrEqual(3);
  });

  for (const width of [980, 1100, 1280, 1440]) {
    test(`navigation stays on one line at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const nav = page.getByRole("navigation", { name: "Main" });
      await expect(nav).toBeVisible();
      const tops = await nav.getByRole("link").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
      expect(new Set(tops).size).toBe(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("home hero slideshow", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  test("moves to the next photo by itself and can be paused", async ({ page }) => {
    await page.goto("/");
    const caption = page.locator(".hero-caption strong");
    await expect(caption).toHaveText("Germany · Euro Sweillem");
    await expect(caption).toHaveText("Makkah, Saudi Arabia", { timeout: 8000 });

    await page.getByRole("button", { name: "Pause slideshow" }).click();
    await page.getByRole("button", { name: /^Photo 3 of 5/ }).click();
    await expect(caption).toHaveText("New Alamein City, Egypt");
    await page.waitForTimeout(6500);
    await expect(caption).toHaveText("New Alamein City, Egypt");
    await expect(page.getByRole("button", { name: "Play slideshow" })).toBeVisible();
  });

  test("a tap on the photo shows the next one, and after the last the first", async ({ page }) => {
    await page.goto("/");
    const current = page.locator('[aria-current="true"][aria-label^="Photo "]');
    const photo = page.getByRole("button", { name: /^Next photo/ });
    await expect(current).toHaveAttribute("aria-label", /^Photo 1 of 5/);
    await expect(photo).toHaveAccessibleName("Next photo: Makkah, Saudi Arabia");
    for (const n of [2, 3, 4, 5, 1]) {
      await photo.click();
      await expect(current).toHaveAttribute("aria-label", new RegExp(`^Photo ${n} of 5`));
    }
    // The caption sits on the photo; a tap on it goes through to the photo.
    const box = (await page.locator(".hero-caption").boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(current).toHaveAttribute("aria-label", /^Photo 2 of 5/);
    await photo.press("Enter");
    await expect(current).toHaveAttribute("aria-label", /^Photo 3 of 5/);
  });

  test("stays still with reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await skipIntro(page);
    await page.goto("/");
    const caption = page.locator(".hero-caption strong");
    await page.waitForTimeout(6500);
    await expect(caption).toHaveText("Germany · Euro Sweillem");
    await ctx.close();
  });
});

test.describe("projects map", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  test("opens from the header, zooms to a pick and closes on Escape", async ({ page }) => {
    await page.goto("/about");
    const button = page.locator("header").getByRole("button", { name: "Map", exact: true });
    const panel = page.locator("#map-panel");
    await expect(panel).toHaveAttribute("inert", "");

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(panel).not.toHaveAttribute("inert");
    await expect(page.locator("#main")).toHaveAttribute("inert", "");
    const dialog = page.getByRole("dialog", { name: "Projects and distribution" });
    await expect(dialog).toBeVisible();
    const map = panel.locator(".pmap");
    await expect(map).toHaveAttribute("data-ready", "");
    await expect(map.locator("path.pmap-country")).toHaveCount(14);
    await expect(map.locator(".pmap-place")).toHaveCount(7);

    await dialog.getByRole("button", { name: /^Haram central area/ }).click();
    await expect(map).toHaveAttribute("data-view", "middle-east");
    await expect(dialog.getByRole("heading", { name: "Haram central area" })).toBeVisible();
    await expect(map.locator('[data-pick="place:haram-central-area-makkah"] .pmap-label')).toHaveCSS("opacity", "1");

    await dialog.getByRole("group", { name: "Zoom to" }).getByRole("button", { name: "Far East" }).click();
    await expect(map).toHaveAttribute("data-view", "far-east");
    await expect(dialog.getByRole("heading", { name: "Haram central area" })).toBeHidden();
    await dialog.getByRole("button", { name: "Hong Kong" }).click();
    await expect(map.locator("path.pmap-arc").nth(12)).toHaveAttribute("data-on", "");

    await dialog.getByRole("group", { name: "Show" }).getByRole("button", { name: "Projects" }).click();
    await expect(dialog.getByRole("heading", { name: "Distribution", exact: true })).toBeHidden();
    await expect(map.locator('[data-pick="place:jeddah"]')).toHaveCSS("opacity", "0");

    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toHaveAttribute("inert", "");
    await expect(button).toBeFocused();
  });

  test("a click picks the pin under it, even where pins crowd", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Map", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Projects and distribution" });
    const map = page.locator(".pmap");
    await expect(map).toHaveAttribute("data-ready", "");
    for (const [region, id, heading] of [
      ["Middle East", "haram-central-area-makkah", "Haram central area"],
      ["Middle East", "jeddah", "Jeddah"],
      ["World", "new-alamein-city", "New Alamein City"],
      ["World", "cairo", "Cairo"],
    ] as const) {
      await dialog.getByRole("group", { name: "Zoom to" }).getByRole("button", { name: region }).click();
      await page.waitForTimeout(1100);
      const box = await map.locator(`[data-pick="place:${id}"] .pmap-mark`).boundingBox();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await expect(dialog.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    }
  });

  test("keeps keyboard focus inside while open", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard");
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Map", exact: true }).click();
    await expect(page.getByRole("button", { name: "Close map" })).toBeFocused();
    // Back from the first control, focus leaves for the browser itself (as with a native modal),
    // never for the skip link or the page behind.
    for (const key of ["Shift+Tab", "Shift+Tab", "Tab", "Tab"]) {
      await page.keyboard.press(key);
      const where = await page.evaluate(() => {
        const a = document.activeElement;
        return a === document.body || !a ? "outside the page" : a.closest("#map-panel") ? "panel" : a.outerHTML.slice(0, 80);
      });
      expect(["panel", "outside the page"]).toContain(where);
    }
  });

  test("opens from the side menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.getByRole("button", { name: /^Map of projects and distribution/ }).click();
    await expect(page.locator("#site-menu")).toHaveAttribute("inert", "");
    await expect(page.getByRole("dialog", { name: "Projects and distribution" })).toBeVisible();
    await page.getByRole("button", { name: "Close map" }).click();
    await expect(page.locator("#map-panel")).toHaveAttribute("inert", "");
    await expect(page.locator("#main")).not.toHaveAttribute("inert");
  });

  test("every place and country shows its flag", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Map", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Projects and distribution" });
    await expect(page.locator("#map-panel .pmap")).toHaveAttribute("data-ready", "");
    for (const name of [/^Haram central area/, /^Cairo/, /^Jeddah/, "Belgium", "Hong Kong"]) {
      await expect(dialog.getByRole("button", { name }).locator('img[src^="/images/flags/"]')).toHaveCount(1);
    }
    const flags = dialog.locator('img[src^="/images/flags/"]');
    await expect(flags).toHaveCount(7 + 14);
    for (const img of await flags.all()) {
      await expect(img).toHaveAttribute("alt", "");
      expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });

  test("its links close it", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Map", exact: true }).click();
    await page.getByRole("link", { name: "The export map on About" }).click();
    await expect(page).toHaveURL(/\/about#reach$/);
    await expect(page.locator("#map-panel")).toHaveAttribute("inert", "");
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`passes axe when open (${colorScheme})`, async ({ browser, isMobile }) => {
      const ctx = await browser.newContext({
        colorScheme,
        reducedMotion: "reduce",
        viewport: isMobile ? { width: 360, height: 780 } : { width: 1280, height: 860 },
      });
      const page = await ctx.newPage();
      await skipIntro(page);
      await page.goto("/");
      await page.locator("header").getByRole("button", { name: "Map", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Projects and distribution" });
      await expect(page.locator(".pmap")).toHaveAttribute("data-ready", "");
      await dialog.getByRole("button", { name: /^New Alamein City/ }).click();
      await expect(dialog.getByRole("heading", { name: "New Alamein City" })).toBeVisible();
      const axe = await new AxeBuilder({ page })
        .include("#map-panel")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
      await ctx.close();
    });
  }
});
