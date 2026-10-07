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
  await page.getByRole("button", { name: "Add to quote: DN 300 Half channels 180°" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Added" }).first()).toBeAttached();
  await page.goto("/quote");
  await expect(page.getByRole("spinbutton", { name: /Quantity: Half Channels, Half channels 180°, DN 300/ })).toHaveValue("1");
});

test("add to quote flies a pipe to the header count, which counts it on landing", async ({ page }) => {
  await page.goto("/products/half-channels");
  await page.getByRole("radio", { name: "300", exact: true }).check({ force: true });
  const count = page.locator("[data-quote-count]");
  await expect(count).toHaveText("0");
  await page.getByRole("button", { name: "Add to quote: DN 300 Half channels 180°" }).click();
  // Saved at once (the link's name says so), but the badge waits for the pipe.
  await expect(page.locator("[data-quote-flyer]")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Quote list, 1 item" })).toBeAttached();
  await expect(count).toHaveText("0");
  await expect(page.locator("[data-quote-flyer]")).toHaveCount(0);
  await expect(count).toHaveText("1");
});

test("add to quote with reduced motion counts straight away and flies nothing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products/half-channels");
  await page.getByRole("radio", { name: "300", exact: true }).check({ force: true });
  await page.getByRole("button", { name: "Add to quote: DN 300 Half channels 180°" }).click();
  await expect(page.locator("[data-quote-count]")).toHaveText("1", { timeout: 300 });
  await expect(page.locator("[data-quote-flyer]")).toHaveCount(0);
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

test("on a phone, a long spec table shows three rows and folds the rest away", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Phones get cards; wider screens get the full table.");
  await page.goto("/products/pipes");
  const table = page.locator("#n-pipes-normal-strength");
  const cards = table.locator("li:visible");
  await expect(cards).toHaveCount(3);
  await table.getByText("Show all 16 rows").click();
  await expect(cards).toHaveCount(16);
  await table.getByText("Show fewer rows").click();
  await expect(cards).toHaveCount(3);
});

test("printing a product page hides the site chrome", async ({ page }) => {
  await page.goto("/products/pipes");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator("#n-pipes-normal-strength table")).toBeVisible();
  await expect(page.getByRole("button", { name: "Print spec sheet" })).toBeHidden();
});

test("size slider redraws the pipe and lists the fittings made at that size", async ({ page }) => {
  await page.goto("/products");
  const slider = page.getByRole("slider", { name: "Drag to choose a size" });
  await expect(slider).toHaveAttribute("aria-valuetext", "DN 300");
  const finder = page.locator("#size");

  await slider.fill("0");
  await expect(slider).toHaveAttribute("aria-valuetext", "DN 125");
  await expect(finder).toContainText("126 ± 4");
  await expect(finder.getByRole("radio", { name: /H class/ })).toBeDisabled();
  await expect(finder.getByRole("img", { name: /DN 125 N class pipe/ })).toBeVisible();
  // The flat drawing is one tap away (and the fallback where WebGL is missing).
  if (await finder.getByRole("button", { name: "To scale" }).isVisible()) await finder.getByRole("button", { name: "To scale" }).click();
  await expect(finder.getByRole("img", { name: /DN 125 N class pipe drawn to scale/ })).toBeVisible();
  await expect(finder.getByRole("link", { name: /^Enlarger 125/ })).toHaveAttribute("href", /product=enlarger-reducer.*dn=125%2F150/);

  // DN 1000 is H class only, and no fitting is published at that size.
  await slider.fill("12");
  await expect(finder).toContainText("1120 ± 15");
  await expect(finder.getByRole("radio", { name: /^H class/ })).toBeChecked();
  await expect(finder).toContainText("publishes no fittings at DN 1000");
});

test("the size finder shows every product family in 3D and to scale", async ({ page }) => {
  // Software WebGL in headless Chromium is slow: draw only on change.
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products");
  const finder = page.locator("#size");
  const families = finder.getByRole("group", { name: "Product family" });
  for (const name of ["Pipes", "Bends", "Junctions", "Jointing Systems", "Short Pieces", "Input clutch & End plugs", "Perforated Pipe", "U-Trap", "Enlarger and Reducer", "Half Channels"]) {
    await expect(families.getByRole("button", { name, exact: true })).toBeVisible();
  }

  // Bends: pick an angle, then a size; the published row follows.
  await families.getByRole("button", { name: "Bends", exact: true }).click();
  await finder.getByRole("button", { name: "90°", exact: true }).click();
  const slider = finder.getByRole("slider", { name: "Drag to choose a size" });
  await slider.fill("0");
  await expect(slider).toHaveAttribute("aria-valuetext", "DN 125");
  await expect(finder).toContainText("90° ± 5°");
  await expect(finder).toContainText("Bend radius: not published");
  await expect(finder.getByRole("img", { name: /3D model of the Bends, 90°, DN 125 N class/ })).toBeVisible();
  await finder.getByRole("button", { name: "To scale" }).click();
  await expect(finder.getByRole("img", { name: /Bends, 90°, DN 125 N class, drawn to scale/ })).toBeVisible();

  // Junctions: the class chips say where a class is not made.
  await families.getByRole("button", { name: "Junctions", exact: true }).click();
  await slider.fill("0");
  await expect(slider).toHaveAttribute("aria-valuetext", "DN 125/125");
  await expect(finder.getByRole("button", { name: /^H class/ })).toBeDisabled();
  await expect(finder.getByRole("link", { name: "Full row in the explorer" })).toHaveAttribute("href", /product=junctions.*dn=125%2F125/);

  // Jointing systems: socket and spigot figures from the pipe table.
  await families.getByRole("button", { name: "Jointing Systems", exact: true }).click();
  await slider.fill("0");
  await expect(finder).toContainText("260.0 ± 0.5");
  await expect(finder).toContainText("263.0 ± 0.5");

  // Perforated pipe: drawn with its socket joint, the socket sizes taken from the pipe table.
  await families.getByRole("button", { name: "Perforated Pipe", exact: true }).click();
  await expect(finder).toContainText("Socket inner ø d4 (mm), from the DN 300 N pipe");
  await finder.getByRole("button", { name: "To scale" }).click();
  await expect(finder.getByRole("img", { name: /Close-up of the socket joint of the Perforated Pipe, MP system, DN 300/ })).toBeVisible();

  // The U-trap has no published sizes: shape only, with SWEILLEM's drawing.
  await families.getByRole("button", { name: "U-Trap", exact: true }).click();
  await expect(finder).toContainText("publishes no sizes");
  await expect(slider).toHaveCount(0);
  await finder.getByRole("button", { name: "To scale" }).click();
  await expect(finder.getByRole("img", { name: /dimension drawing of the U-trap/ })).toBeVisible();

  // Back to pipes: the pipe slider and its fittings list.
  await families.getByRole("button", { name: "Pipes", exact: true }).click();
  await expect(finder.getByRole("heading", { name: /Fittings made at DN/ })).toBeVisible();
});

test("the side menu's Size finder link opens the slider, from another page and from /products", async ({ page }) => {
  const burger = page.getByRole("button", { name: "Menu", exact: true });
  const menu = page.locator("#site-menu");
  const heading = page.getByRole("heading", { name: "Slide to your size" });
  for (const start of ["/about", "/products"]) {
    await page.goto(start);
    await burger.click();
    await menu.getByRole("link", { name: "Size finder" }).click();
    await expect(page).toHaveURL(/\/products#size$/);
    await expect(menu).toHaveAttribute("inert", "");
    await expect(heading).toBeInViewport();
  }
});

test("the pipe and the tiled roof can be turned in 3D on /products", async ({ page }) => {
  // Software WebGL in headless Chromium draws the roof slowly.
  test.setTimeout(90_000);
  await page.goto("/products");
  const pipe = page.locator("#size").getByRole("img", { name: /3D model of the DN 300 N class pipe/ });
  await pipe.scrollIntoViewIfNeeded();
  await expect(pipe).toBeVisible();
  // Arrow keys turn the model; the hint goes once the visitor has used it.
  await pipe.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#size").getByText("Drag to turn")).toHaveClass(/opacity-0/);

  // With reduced motion the roof only draws when something changes (software WebGL in CI is slow).
  await page.emulateMedia({ reducedMotion: "reduce" });
  const tiles = page.locator("#tile-3d");
  await tiles.scrollIntoViewIfNeeded();
  await tiles.getByText("Blue", { exact: true }).click();
  await expect(tiles.getByRole("img", { name: /piece of roof laid with SWEILLEM clay roof tiles, colour blue/ })).toBeVisible();
  await expect(tiles.getByRole("button", { name: "Add to quote: blue roof tiles" })).toBeVisible();
  // A tile lifts out to show its stamp, and goes back.
  await tiles.getByRole("button", { name: "Lift a tile out" }).click();
  await expect(tiles.getByRole("img", { name: /One tile is lifted out/ })).toBeVisible();
  await tiles.getByRole("button", { name: "Put the tile back" }).click();
  await expect(tiles.getByRole("img", { name: /One tile is lifted out/ })).toHaveCount(0);
});
