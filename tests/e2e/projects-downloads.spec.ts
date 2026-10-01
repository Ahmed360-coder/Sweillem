import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { skipIntro } from "./helpers";

test.beforeEach(async ({ page }) => skipIntro(page));

test.describe("projects page", () => {
  test("the map on the page picks a project and links to its photos", async ({ page }) => {
    await page.goto("/projects");
    const map = page.locator("#map .pmap");
    await expect(map).toHaveAttribute("data-ready", "");
    await expect(map).toHaveAttribute("data-layer", "projects");
    const section = page.locator("#map");
    await section.getByRole("button", { name: /^Sharurah drainage project/ }).click();
    await expect(map).toHaveAttribute("data-view", "middle-east");
    await section.getByRole("link", { name: "Photos of this project" }).click();
    await expect(page).toHaveURL(/#sharurah-drainage$/);
    await expect(page.locator("#sharurah-drainage")).toBeInViewport();
  });

  test("every gallery photo loads", async ({ page, request }) => {
    await page.goto("/projects");
    const srcs = await page.locator("#galleries li[id]").evaluateAll((items) => items.map((li) => li.id));
    expect(srcs).toEqual(["haram-central-area-makkah", "sharurah-drainage", "new-alamein-city", "germany", "more-from-egypt"]);
    const { projectStories } = await import("../../src/lib/project-galleries");
    for (const s of projectStories) {
      for (const p of s.photos) expect((await request.get(p.src)).status(), p.src).toBe(200);
    }
  });

  test("the photo viewer steps through a gallery and closes on Escape", async ({ page, isMobile }) => {
    await page.goto("/projects#new-alamein-city");
    const card = page.locator("#new-alamein-city");
    await card.getByRole("button", { name: "Open the 2 photos of New Alamein City" }).click();
    const viewer = page.getByRole("dialog", { name: "Photos of New Alamein City" });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText("1 of 2")).toBeVisible();
    await expect(viewer.getByRole("button", { name: "Close photos" })).toBeFocused();
    if (isMobile) await viewer.getByRole("button", { name: "Next photo" }).click();
    else await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText("2 of 2")).toBeVisible();
    await viewer.getByRole("button", { name: "Next photo" }).click();
    await expect(viewer.getByText("1 of 2")).toBeVisible();
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("the header map links to a project's photos", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Map", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Projects and distribution" });
    await expect(page.locator("#map-panel .pmap")).toHaveAttribute("data-ready", "");
    await dialog.getByRole("button", { name: /^Sites in Germany/ }).click();
    await dialog.getByRole("link", { name: "Photos of this project" }).click();
    await expect(page).toHaveURL(/\/projects#germany$/);
    await expect(page.locator("#map-panel")).toHaveAttribute("inert", "");
  });
});

test.describe("downloads page", () => {
  test("search and filters narrow the list and keep it in the address", async ({ page }) => {
    await page.goto("/downloads");
    const count = page.getByText(/^\d+( of \d+)? entries$/);
    await expect(count).toHaveText("24 entries");

    await page.getByLabel("Search downloads").fill("saso");
    await expect(count).toHaveText("1 of 24 entries");
    await expect(page.getByRole("heading", { name: "SASO GSO EN 295-1/2008" })).toBeVisible();
    await expect(page).toHaveURL(/\?q=saso$/);

    await page.getByLabel("Search downloads").fill("");
    await page.getByRole("group", { name: "Show" }).getByRole("button", { name: "Spec sheets" }).click();
    await expect(count).toHaveText("7 of 24 entries");
    await expect(page).toHaveURL(/\?type=spec-sheet$/);

    await page.getByLabel("Search downloads").fill("no such thing");
    await expect(page.getByRole("heading", { name: "Nothing matches “no such thing”" })).toBeVisible();
    await page.getByRole("button", { name: "Show everything" }).click();
    await expect(count).toHaveText("24 entries");
  });

  test("a shared address opens with its search", async ({ page }) => {
    await page.goto("/downloads?type=certificate&q=germany");
    await expect(page.getByLabel("Search downloads")).toHaveValue("germany");
    await expect(page.getByText(/^\d+ of \d+ entries$/)).toHaveText("1 of 24 entries");
    await expect(page.getByRole("heading", { name: "DIN plus, EN 295-1 and EN 295-4" })).toBeVisible();
  });

  test("the six broken certificates have no link, and every link opens", async ({ page, request }) => {
    await page.goto("/downloads");
    for (const name of ["BENOR", "CERTIFIKA'T", "NOPWASD", "NF CSTB 108", "NL BSB", "TUV"]) {
      const row = page.locator("li", { has: page.getByRole("heading", { name, exact: true }) });
      await expect(row.getByText("Not available yet")).toBeVisible();
      await expect(row.getByRole("link")).toHaveText(["Ask SWEILLEM for a copy"]);
    }
    await page.getByLabel("Only what can be opened now").check();
    await expect(page.getByText("Not available yet")).toHaveCount(0);
    const hrefs = await page.locator("#main li a[href^='/']").evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThan(15);
    for (const href of new Set(hrefs)) expect((await request.get(href.split("#")[0])).status(), href).toBe(200);
  });
});
