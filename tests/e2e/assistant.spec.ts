import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { crawlSite, KNOWLEDGE_FILE } from "../../scripts/assistant-knowledge.mjs";
import { skipIntro } from "./helpers";

// The Sweillem assistant. CI builds without ANTHROPIC_API_KEY, so the chat
// runs in its "not switched on yet" mode here; answers are tested by hand
// against a stand-in API (docs/assistant.md).

test.beforeEach(async ({ page }) => skipIntro(page));

test("assistant knowledge matches the pages", async ({ browser, baseURL }, info) => {
  test.skip(info.project.name !== "desktop", "Pages are read once, at desktop width");
  test.setTimeout(240_000);
  const saved = JSON.parse(readFileSync(KNOWLEDGE_FILE, "utf8"));
  const now = await crawlSite(baseURL!, browser);
  expect(now, "Page text changed: run `npm run build && npm run assistant:knowledge` and commit src/lib/assistant/site-text.json").toEqual(saved);
});

test("the Sweillem button is on every page and clear of the header", async ({ page }) => {
  for (const path of ["/", "/products/pipes", "/quote"]) {
    await page.goto(path);
    const button = page.getByRole("button", { name: "Ask Sweillem" });
    await expect(button).toBeVisible();
    const b = (await button.boundingBox())!;
    const header = (await page.locator("header.site-header").boundingBox())!;
    expect(b.y, `${path}: button below the header`).toBeGreaterThan(header.y + header.height);
    const vp = page.viewportSize()!;
    expect(b.x + b.width).toBeLessThanOrEqual(vp.width);
    expect(b.y + b.height).toBeLessThanOrEqual(vp.height);
  }
});

test("without a key the chat says it is not switched on, and closes with Escape", async ({ page }) => {
  await page.goto("/products");
  const button = page.getByRole("button", { name: "Ask Sweillem" });
  await button.click();
  const panel = page.getByRole("dialog", { name: "Sweillem" });
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Sweillem is not switched on yet")).toBeVisible();
  await expect(panel.getByRole("link", { name: "contact SWEILLEM" })).toHaveAttribute("href", "/contact");
  await expect(panel.getByLabel("Your question for Sweillem")).toBeDisabled();

  const r = await new AxeBuilder({ page }).include(".assistant-panel").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(button).toBeFocused();
});

test("the API refuses politely without a key", async ({ request }) => {
  expect(await (await request.get("/api/assistant")).json()).toEqual({ enabled: false });
  const res = await request.post("/api/assistant", { data: { messages: [{ role: "user", text: "Hello" }] } });
  expect(res.status()).toBe(503);
  expect(await res.json()).toEqual({ type: "error", error: "not-configured" });
});
