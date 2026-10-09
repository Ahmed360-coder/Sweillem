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

  test("a sideways swipe opens and closes the side menu on phones", async ({ page, isMobile }) => {
    test.skip(!isMobile, "touch swipe");
    await page.goto("/products");
    const burger = page.getByRole("button", { name: "Menu", exact: true });
    const cdp = await page.context().newCDPSession(page);
    // A real touch drag, in steps, so the page sees touchmove as a finger makes it.
    const swipe = async (from: number, to: number, y = 420) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from, y }] });
      for (let i = 1; i <= 8; i++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from + ((to - from) * i) / 8, y }] });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };

    // The swipe listener attaches once the page hydrates, so swipe again until it does.
    await expect(async () => {
      await swipe(40, 260);
      await expect(burger).toHaveAttribute("aria-expanded", "true", { timeout: 1000 });
    }).toPass();
    await expect(page).toHaveURL(/\/products$/);
    await swipe(300, 60);
    await expect(burger).toHaveAttribute("aria-expanded", "false");

    // A mostly vertical drag scrolls the page and leaves the menu shut.
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 60, y: 600 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 90, y: 500 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 140, y: 300 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(burger).toHaveAttribute("aria-expanded", "false");
  });

  test("side menu links to every page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const hrefs = await page.locator("#site-menu a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    // Section links (e.g. /products#size) point into a page that is listed too.
    const pages = hrefs.filter((h) => !h!.includes("#"));
    expect([...pages].sort()).toEqual([...staticRoutes].sort());
    for (const h of hrefs.filter((h) => h!.includes("#"))) expect(staticRoutes).toContain(h!.split("#")[0]);
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

test.describe("light and dark mode", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  const theme = (page: import("@playwright/test").Page) => page.evaluate(() => document.documentElement.dataset.theme);

  test("follows the device until the visitor picks, then remembers the pick", async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: "dark" });
    const page = await ctx.newPage();
    await skipIntro(page);
    await page.goto("/products");
    expect(await theme(page)).toBe("dark");

    const modes = page.getByRole("group", { name: "Colour mode" });
    await expect(modes.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "true");
    await modes.getByRole("button", { name: "Light" }).click();
    expect(await theme(page)).toBe("light");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(242, 242, 239)");
    await page.reload();
    expect(await theme(page)).toBe("light");
    await expect(modes.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
    await expect(modes.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "false");

    // Auto in the side menu hands the choice back to the device.
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.getByRole("dialog", { name: "Site menu" }).getByText("Auto", { exact: true }).click();
    expect(await theme(page)).toBe("dark");
    expect(await page.evaluate(() => localStorage.getItem("sweillem.theme"))).toBeNull();
    await ctx.close();
  });

  test("buttons keep the logo maroon in dark mode", async ({ browser }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      const ctx = await browser.newContext({ colorScheme });
      const page = await ctx.newPage();
      await skipIntro(page);
      await page.goto("/");
      await expect(page.locator(".clay-hero").getByRole("link", { name: "Products", exact: true })).toHaveCSS("background-color", "rgb(122, 4, 4)");
      await ctx.close();
    }
  });

  test("the logo keeps its two colours in both modes", async ({ page }) => {
    await page.goto("/");
    const colours = () =>
      page.locator("header svg[viewBox='0 0 642 217'] path").evaluateAll((paths) => paths.map((p) => getComputedStyle(p).fill));
    const light = await colours();
    await page.getByRole("group", { name: "Colour mode" }).getByRole("button", { name: "Dark" }).click();
    const dark = await colours();
    expect(new Set(light).size).toBe(2);
    expect(new Set(dark).size).toBe(2);
    expect(dark).not.toEqual(light);
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`the switches pass axe (${colorScheme})`, async ({ browser }) => {
      const ctx = await browser.newContext({ colorScheme, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await skipIntro(page);
      await page.goto("/");
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Site menu" })).toBeVisible();
      const axe = await new AxeBuilder({ page })
        .include("[data-theme-toggle]")
        .include("header")
        .include("#site-menu")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
      await ctx.close();
    });
  }

  test("the top bar and header fit a 360 px phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone header");
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
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

  test("ends by itself within six seconds", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#intro")).toBeHidden({ timeout: 6000 });
  });

  test("holds the hero entrance until the intro hands off", async ({ page }) => {
    await page.goto("/");
    const pipe = page.locator('.clay-piece[data-kind="pipe"]').first();
    const playState = () => pipe.evaluate((el) => getComputedStyle(el).animationPlayState);
    await expect(page.locator("html")).toHaveAttribute("data-intro", "play");
    expect(await playState()).toContain("paused");
    await page.keyboard.press("Escape");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "exit");
    expect(await playState()).not.toContain("paused");
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
    await expect(page.locator("#intro")).toBeHidden({ timeout: 2600 });
    await ctx.close();
  });
});

test.describe("layout rules (design/taste-audit.md)", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop widths");
    await skipIntro(page);
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

test.describe("home hero", () => {
  test.beforeEach(async ({ page }) => skipIntro(page));

  test("fills the first screen with the logo, the pipes and the three buttons", async ({ page }) => {
    await page.goto("/");
    // Measure once the page's own rise-and-fade entrance has ended; mid-rise the hero sits a few px low.
    await page.locator(".view-enter").evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const hero = page.locator(".clay-hero");
    const box = (await hero.boundingBox())!;
    const height = page.viewportSize()!.height;
    expect(Math.abs(box.y + box.height - height)).toBeLessThanOrEqual(2);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Vitrified clay pipes for sewer and drainage, made in Egypt since 1935");
    await expect(hero.getByRole("img", { name: "SWEILLEM Vitrified Clay Pipes Co." })).toBeVisible();
    // The big logo has a real size (Safari once drew it at 0 px), and the whole of it,
    // tagline included, sits above the pipes so no pipe covers the name.
    const logo = (await hero.locator(".clay-hero-logo svg").boundingBox())!;
    expect(logo.width).toBeGreaterThan(Math.min(box.width * 0.38, 480));
    expect(logo.height).toBeGreaterThan(logo.width / 3.2);
    const pipeTop = Math.min(...(await hero.locator('.clay-piece[data-kind="pipe"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top))));
    expect(logo.y + logo.height).toBeLessThanOrEqual(pipeTop);
    await expect(hero.locator('.clay-piece[data-kind="pipe"]')).toHaveCount(3);
    for (const name of ["Products", "Size finder", "Get a quote"]) {
      const link = hero.getByRole("link", { name, exact: true });
      await expect(link).toBeVisible();
      const b = (await link.boundingBox())!;
      expect(b.y + b.height).toBeLessThanOrEqual(height);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("no pipe or fitting covers the tagline on a short phone screen", async ({ browser }) => {
    // An iPhone with Safari's bars showing leaves about 660 px (SE: about 550 px) of page.
    for (const viewport of [
      { width: 393, height: 659 },
      { width: 375, height: 553 },
    ]) {
      const ctx = await browser.newContext({ viewport, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await skipIntro(page);
      await page.goto("/");
      const logo = (await page.locator(".clay-hero-logo svg").boundingBox())!;
      const tops = await page.locator(".clay-piece:visible").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
      expect(Math.min(...tops), `${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(logo.y + logo.height);
      await ctx.close();
    }
  });

  test("looks the same in the light and dark themes", async ({ browser }) => {
    const look = async (colorScheme: "light" | "dark") => {
      const ctx = await browser.newContext({ colorScheme });
      const page = await ctx.newPage();
      await skipIntro(page);
      await page.goto("/");
      const style = await page.locator(".clay-hero").evaluate((el) => {
        const cs = getComputedStyle(el);
        const panel = getComputedStyle(el.querySelector(".clay-hero-panel")!);
        return [cs.backgroundImage, cs.getPropertyValue("--logo-word"), panel.backgroundColor];
      });
      await ctx.close();
      return style;
    };
    expect(await look("dark")).toEqual(await look("light"));
  });

  test("the scroll cue leads to the rest of the page", async ({ page }) => {
    await page.goto("/");
    await page.locator(".clay-hero").getByRole("link", { name: /Scroll/ }).click();
    await expect(page.locator("#after-hero")).toBeInViewport();
  });

  test("stays still with reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await skipIntro(page);
    await page.goto("/");
    const names = await page.locator(".clay-piece").evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(new Set(names)).toEqual(new Set(["none"]));
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
    // The export map from About: its 22 red countries, their routes and the Night / Day switch.
    await expect(map.locator("g.pmap-country")).toHaveCount(22);
    await expect(map.locator("path.pmap-arc")).toHaveCount(22);
    await expect(map.locator(".pmap-place")).toHaveCount(7);
    const views = dialog.getByRole("group", { name: "Map view" });
    await views.getByRole("button", { name: "Day" }).click();
    await expect(map).toHaveAttribute("data-mode", "day");
    await views.getByRole("button", { name: "Night" }).click();
    await expect(map).toHaveAttribute("data-mode", "night");

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
    await expect(flags).toHaveCount(7 + 22);
    for (const img of await flags.all()) {
      await expect(img).toHaveAttribute("alt", "");
      // Flags further down the list load as they scroll into view.
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });

  test("every distribution place shows a picture", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Map", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Projects and distribution" });
    await expect(page.locator("#map-panel .pmap")).toHaveAttribute("data-ready", "");
    await dialog.getByRole("button", { name: "Distribution", exact: true }).click();
    for (const name of [/^Cairo/, /^Brüggen/]) {
      await expect(dialog.getByRole("button", { name }).locator('img:not([src^="/images/flags/"])')).toHaveCount(1);
    }
    await expect(dialog.getByRole("button", { name: /^Jeddah/ }).locator("svg[aria-hidden]")).not.toHaveCount(0);
    await dialog.getByRole("button", { name: /^Jeddah/ }).click();
    await expect(dialog.getByRole("img", { name: /^Drawing of SWEILLEM pipes/ })).toBeVisible();
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
      await page.waitForTimeout(600);
      const axe = await new AxeBuilder({ page })
        .include("#map-panel")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
      await ctx.close();
    });
  }
});
