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
    await page.mouse.wheel(0, 400);
    await expect(header).toHaveAttribute("data-stuck", "");
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

  test("quote button shows the list count", async ({ page }) => {
    await page.goto("/quote");
    await expect(page.getByRole("heading", { name: "Your quote list is empty" })).toBeVisible();
    await page.evaluate(() => {
      localStorage.setItem("sweillem.quote.v1", JSON.stringify([{ product: "Pipes", size: "DN 200", strengthClass: "N", qty: 3 }]));
      window.dispatchEvent(new Event("sweillem:quote"));
    });
    await expect(page.locator("[data-quote-count]")).toHaveText("3");
    await expect(page.getByText("Pipes · DN 200 · N")).toBeVisible();
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
