import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { staticRoutes } from "../../src/lib/site";
import { skipIntro } from "./helpers";

test.beforeEach(async ({ page }) => skipIntro(page));

for (const path of staticRoutes) {
  test(`${path} renders, passes axe and fits the screen`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/SWEILLEM/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(path === "/" ? 0 : 1);

    // Let entrance animations settle before measuring contrast.
    await page.waitForTimeout(1200);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

// Dark mode follows the device, so every page must pass contrast there too.
// Reduced motion shows every scroll-reveal element at once, so axe can measure
// text that would otherwise still be waiting below the fold.
test.describe("dark mode", () => {
  test.use({ colorScheme: "dark", reducedMotion: "reduce" });
  for (const path of staticRoutes) {
    test(`${path} passes axe in dark mode`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(1200);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }
});

test("unknown pages get the 404 page", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This pipe doesn’t connect to anything");
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations).toEqual([]);
});
