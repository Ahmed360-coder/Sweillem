import { expect, test } from "@playwright/test";
import { productSpecs } from "../../content/products";
import { skipIntro } from "./helpers";

test.beforeEach(async ({ page }) => skipIntro(page));

test("every published spec row is on its product page", async ({ page }) => {
  for (const [slug, spec] of Object.entries(productSpecs)) {
    await page.goto(`/products/${slug}`);
    for (const t of spec.tables) {
      const rows = page.locator(`#${t.id} table tbody tr`);
      await expect(rows, `${slug} ${t.id}`).toHaveCount(t.rows.length);
      // Spot-check the last row cell for cell (soft hyphens render as "-").
      const last = t.rows.at(-1)!.map((c) => c.replace(/­/g, "-").trim() || "–");
      const cells = await rows.last().locator("th, td").allInnerTexts();
      expect(cells.slice(0, last.length).map((c) => c.trim())).toEqual(last);
    }
  }
});

test("explorer finds an H class pipe and keeps the choice in the link", async ({ page }) => {
  await page.goto("/products/explorer");
  await page.getByRole("radio", { name: /^H class/ }).check({ force: true });
  await page.getByRole("radio", { name: "1000", exact: true }).check({ force: true });
  const result = page.getByRole("region", { name: /DN/ }).or(page.locator("section[aria-live]")).first();
  await expect(result).toContainText("990 ± 15");
  await expect(result).toContainText("1120 ± 15");
  await expect(page).toHaveURL(/product=pipes.*dn=1000.*class=H|class=H.*dn=1000/);

  await page.goto("/products/explorer?product=junctions&dn=300%2F150");
  await expect(page.locator("section[aria-live]").first()).toContainText("300/150");
});

test("add to quote counts up in the quote list", async ({ page }) => {
  await page.goto("/products/half-channels");
  await page.getByRole("radio", { name: "300", exact: true }).check({ force: true });
  await page.getByRole("button", { name: "Add DN 300 Half channels 180° to quote" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Added" }).first()).toBeAttached();
  await page.goto("/quote");
  await expect(page.getByRole("spinbutton", { name: /Quantity: Half Channels, Half channels 180°, DN 300/ })).toHaveValue("1");
});

test("compare shows both classes for a shared size and says when a class is missing", async ({ page }) => {
  await page.goto("/products/compare");
  await page.locator("label", { hasText: /^400/ }).click();
  await expect(page.locator("section[aria-live]")).toContainText("486 ± 8**");
  await expect(page.locator("section[aria-live]")).toContainText("492 ± 8**");
  await page.locator("label", { hasText: /^900/ }).click();
  await expect(page.locator("section[aria-live]")).toContainText("does not publish DN 900 in N class");
});

test("roof tile viewer switches colour and view", async ({ page }) => {
  await page.goto("/roof-tiles");
  await page.getByText("Blue", { exact: true }).click();
  await expect(page.getByRole("img", { name: /roof tile in blue/ })).toBeVisible();
  await page.getByText("On a roof").click();
  await expect(page.getByRole("img", { name: /roof laid with blue/ })).toBeVisible();
  await expect(page.getByText("Step 01 of 09")).toBeAttached();
});

test("printing a product page hides the site chrome", async ({ page }) => {
  await page.goto("/products/pipes");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator("#n-pipes-normal-strength table")).toBeVisible();
  await expect(page.getByRole("button", { name: "Print spec sheet" })).toBeHidden();
});
