import { expect, test } from "@playwright/test";
import { skipIntro } from "./helpers";

test.beforeEach(async ({ page }) => skipIntro(page));

test.describe("company pages (Milestone 3)", () => {
  test("heritage track counts the year and lights markets as it scrolls", async ({ page, isMobile }) => {
    await page.goto("/about");
    const markets = page.getByRole("list", { name: "Markets reached" });
    await expect(markets.getByText("(reached)")).toHaveCount(1);

    const last = page.getByRole("heading", { name: "Euro Sweillem, Germany" });
    if (isMobile) {
      await last.scrollIntoViewIfNeeded();
    } else {
      // The section pins; scroll to its end so the last card is current. The
      // section only grows to its pinned height after hydration, so a scroll
      // made earlier lands short: repeat it until the end is reached.
      await expect(async () => {
        await page.evaluate(() => {
          const el = document.querySelector("#heritage-title")!.closest("section")!.querySelector<HTMLElement>("div.relative")!;
          window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight);
        });
        await expect(markets.getByText("(reached)")).toHaveCount(4, { timeout: 1000 });
      }).toPass();
    }
    await expect(markets.getByText("(reached)")).toHaveCount(4);
    await expect(page.locator('li[data-current]')).toContainText("Euro Sweillem");
  });

  test("process journey follows the step in view and heats the kiln dial", async ({ page, isMobile }) => {
    test.skip(isMobile, "the sticky photo and dial are desktop only");
    await page.goto("/process");
    const firing = page.locator('[data-step="4"]');
    await page.evaluate(() => {
      const el = document.querySelector('[data-step="4"]')!;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + 100);
    });
    await expect(firing).toHaveAttribute("aria-current", "step");
    await expect(page.locator("[data-hot]")).toContainText("1200", { timeout: 4000 });
  });

  test("scrolling drives the journey, and it holds still when scrolling stops", async ({ page }) => {
    await page.goto("/process");
    const journey = page.locator("#journey");
    await expect(journey).toHaveAttribute("data-chapter", "intro");
    const scrollTo = (f: number) =>
      page.evaluate((f) => {
        const s = document.getElementById("journey")!;
        window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY + f * (s.offsetHeight - window.innerHeight));
      }, f);

    await scrollTo(0.55);
    await expect(journey).toHaveAttribute("data-chapter", "fire");
    await expect(page.getByRole("button", { name: /Final firing/ })).toHaveAttribute("aria-current", "step");

    // Once the scroll settles, the frame stops changing.
    await page.waitForTimeout(1500);
    const frame = () => journey.locator("svg").first().evaluate((el) => el.innerHTML);
    const before = await frame();
    await page.waitForTimeout(800);
    expect(await frame()).toBe(before);

    // Scrolling back runs the journey backwards.
    await scrollTo(0.15);
    await expect(journey).toHaveAttribute("data-chapter", "qc");
  });

  test("the step buttons move the journey to that step", async ({ page }) => {
    await page.goto("/process");
    await page.getByRole("button", { name: /Delivery/ }).click();
    await expect(page.locator("#journey")).toHaveAttribute("data-chapter", "deliver");
  });

  test("home journey card links to the scroll journey", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Scroll the journey/ }).click();
    await expect(page).toHaveURL(/\/process#journey$/);
    await expect(page.locator("#journey")).toBeVisible();
  });

  test("export map draws the routes and picks out a country", async ({ page }) => {
    await page.goto("/about");
    const map = page.locator("#reach-map");
    await map.scrollIntoViewIfNeeded();
    await expect(map).toHaveAttribute("data-play", "");
    // The 14 markets named on About Us and the 8 more SWEILLEM's own map fills red.
    await expect(map.locator(".reach-country")).toHaveCount(22);
    await expect(map.locator(".reach-name")).toHaveCount(22);

    // Picking a name pins its country, route and name until it is picked again.
    const chip = page.getByRole("button", { name: "Hong Kong" });
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(map.locator('path.reach-arc[data-id="344"]')).toHaveAttribute("data-on", "");
    await expect(map.locator('.reach-country[data-id="344"]')).toHaveAttribute("data-on", "");
    await expect(map.locator('.reach-name[data-id="344"]')).toHaveAttribute("data-on", "");
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  test("export map switches between the night and day views", async ({ page }) => {
    await page.goto("/about");
    const map = page.locator("#reach-map");
    const views = map.getByRole("group", { name: "Map view" });
    const night = views.getByRole("button", { name: "Night" });
    const day = views.getByRole("button", { name: "Day" });
    await map.scrollIntoViewIfNeeded();
    await expect(map).toHaveAttribute("data-mode", "night");
    await expect(night).toHaveAttribute("aria-pressed", "true");

    await day.click();
    await expect(map).toHaveAttribute("data-mode", "day");
    await expect(day).toHaveAttribute("aria-pressed", "true");
    await expect(night).toHaveAttribute("aria-pressed", "false");
    await expect(map.locator(".reach-photo-day")).toHaveCSS("opacity", "1");

    // The choice is kept for the next visit.
    await page.reload();
    await expect(page.locator("#reach-map")).toHaveAttribute("data-mode", "day");
  });

  test("every certificate file and image opens", async ({ page, request }) => {
    await page.goto("/certificates");
    const hrefs = await page
      .locator("main a[href^='/downloads/'], main a[href^='/images/']")
      .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")!))]);
    expect(hrefs.length).toBeGreaterThanOrEqual(12);
    for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
  });

  test("reduced motion shows revealed content without waiting for scroll", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await skipIntro(page);
    await page.goto("/quality");
    const card = page.locator(".reveal").last();
    await expect(card).toHaveCSS("opacity", "1");

    // The journey is not pinned: every step shows its finished drawing.
    await page.goto("/process");
    await expect(page.locator("#journey li > svg")).toHaveCount(9);

    // The export map is drawn in full, with no shipments moving.
    await page.goto("/about");
    await expect(page.locator(".reach-arc").first()).toHaveCSS("stroke-dashoffset", "0px");
    await expect(page.locator(".reach-ships")).toBeHidden();
    await ctx.close();
  });
});
