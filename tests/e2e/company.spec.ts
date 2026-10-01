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
      // The section pins; scroll to its end so the last card is current.
      await page.evaluate(() => {
        const el = document.querySelector("#heritage-title")!.closest("section")!.querySelector<HTMLElement>("div.relative")!;
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight);
      });
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

  test("the film has captions, chapters and loads nothing until played", async ({ page, request }) => {
    await page.goto("/process");
    const video = page.locator("#film video");
    await expect(video).toHaveAttribute("preload", "none");
    await expect(video.locator('track[kind="captions"]')).toHaveCount(1);
    await expect(page.getByRole("group", { name: "Jump to a chapter" }).getByRole("button")).toHaveCount(9);
    for (const src of ["/video/how-its-made.mp4", "/video/how-its-made.en.vtt", "/video/how-its-made-poster.png"]) {
      expect((await request.get(src)).status(), src).toBe(200);
    }
  });

  test("home film card opens the player in a dialog and Escape closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Watch the film/ }).click();
    const dialog = page.getByRole("dialog", { name: "How it’s made film" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
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
    await ctx.close();
  });
});
