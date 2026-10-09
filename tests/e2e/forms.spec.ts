import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { skipIntro } from "./helpers";

// The quote list and the two forms. CI builds without database keys, so the
// forms run in their "not switched on yet" mode here; the API is checked
// directly for its answers.

const seed = [
  { product: "Pipes", size: "DN 300", strengthClass: "H class", qty: 4 },
  { product: "Bends", size: "DN 200 · 45°", qty: 2 },
];

async function seedQuote(page: Page) {
  await page.addInitScript((items) => {
    try {
      if (!window.sessionStorage.getItem("seeded")) {
        window.localStorage.setItem("sweillem.quote.v1", JSON.stringify(items));
        window.sessionStorage.setItem("seeded", "1");
      }
    } catch {}
  }, seed);
}

/** The form's own alert (Next.js also has an empty route announcer with role alert). */
const alertBox = (page: Page) => page.locator("form [role=alert]");

async function axe(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

test.beforeEach(async ({ page }) => skipIntro(page));

test("quote list: change quantities, remove a line, header count follows", async ({ page }) => {
  await seedQuote(page);
  await page.goto("/quote");
  const count = page.locator("[data-quote-count]");
  await expect(count).toHaveText("6");

  await page.getByRole("button", { name: "One more: Pipes, DN 300, H class" }).click();
  await expect(count).toHaveText("7");
  const qty = page.getByRole("spinbutton", { name: "Quantity: Bends, DN 200 · 45°" });
  await qty.fill("10");
  await expect(count).toHaveText("15");

  await page.getByRole("button", { name: "Remove Bends, DN 200 · 45°" }).click();
  await expect(page.getByRole("spinbutton")).toHaveCount(1);
  await expect(count).toHaveText("5");
  await expect(page.getByRole("status").filter({ hasText: "Removed Bends" })).toHaveCount(1);

  // The list survives a reload: it lives on the device until sent.
  await page.reload();
  await expect(page.getByRole("spinbutton", { name: "Quantity: Pipes, DN 300, H class" })).toHaveValue("5");
});

test("quote form: errors are listed, linked and announced", async ({ page }) => {
  await seedQuote(page);
  await page.goto("/quote");
  await page.getByRole("button", { name: /quote request/ }).click();
  const summary = alertBox(page);
  await expect(summary).toContainText("3 things to fix");
  await expect(summary).toBeFocused();
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  await page.waitForTimeout(400);
  expect(await axe(page)).toEqual([]);

  await page.getByLabel("Your name").fill("Test Engineer");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Country of the project").fill("Egypt");
  await page.getByRole("button", { name: /quote request/ }).click();
  await expect(summary).toContainText("One thing to fix");
  await expect(summary).toContainText("looks incomplete");
});

test("quote form without database keys says so and offers an email instead", async ({ page }) => {
  await seedQuote(page);
  await page.goto("/quote");
  await expect(page.getByText("Online sending is being set up")).toBeVisible();
  await page.getByLabel("Your name").fill("Test Engineer");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Country of the project").fill("Egypt");
  await page.getByRole("button", { name: "Prepare quote request" }).click();
  const alert = alertBox(page);
  await expect(alert).toContainText("not switched on yet");
  await expect(alert).toContainText("Nothing has been sent");
  const mail = page.getByRole("link", { name: "Open it in my email app" });
  const href = decodeURIComponent((await mail.getAttribute("href")) ?? "");
  expect(href).toMatch(/^mailto:info@sweillem\.net\?subject=Quote request/);
  expect(href).toContain("4 × Pipes, DN 300, H class");
  // The list is kept: nothing was sent.
  await expect(page.locator("[data-quote-count]")).toHaveText("6");
});

test("empty quote list: the form asks for a description instead", async ({ page }) => {
  await page.goto("/quote");
  await expect(page.getByRole("heading", { name: "Your quote list is empty" })).toBeVisible();
  await page.getByRole("button", { name: /quote request/ }).click();
  await expect(alertBox(page)).toContainText("tell SWEILLEM what you need here");
});

test("contact page: details and form", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: "info@sweillem.net" }).first()).toHaveAttribute("href", "mailto:info@sweillem.net");
  await expect(page.getByRole("link", { name: "+20 100 538 2615" }).first()).toHaveAttribute("href", "tel:+201005382615");
  await expect(page.getByText("Osman Towers, Kornish El Nile")).toBeVisible();

  await page.getByRole("button", { name: "Prepare message" }).click();
  await expect(alertBox(page)).toContainText("3 things to fix");
  await page.getByLabel("Your name").fill("Test Engineer");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("What is it about?").selectOption("Roof tiles");
  await page.getByLabel("Your message").fill("Which colours are in stock?");
  await page.getByRole("button", { name: "Prepare message" }).click();
  await expect(alertBox(page)).toContainText("not switched on yet");
  const href = decodeURIComponent((await page.getByRole("link", { name: "Open it in my email app" }).getAttribute("href")) ?? "");
  expect(href).toContain("subject=Roof tiles");
  expect(href).toContain("Which colours are in stock?");
  expect(await axe(page)).toEqual([]);
});

test.describe("dark mode", () => {
  test.use({ colorScheme: "dark", reducedMotion: "reduce" });
  test("form errors and notices pass axe in dark mode", async ({ page }) => {
    await seedQuote(page);
    await page.goto("/quote");
    await page.getByRole("button", { name: /quote request/ }).click();
    await expect(alertBox(page)).toBeVisible();
    expect(await axe(page)).toEqual([]);
    await page.getByLabel("Your name").fill("Test Engineer");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Country of the project").fill("Egypt");
    await page.getByRole("button", { name: /quote request/ }).click();
    await expect(alertBox(page)).toContainText("not switched on yet");
    expect(await axe(page)).toEqual([]);
  });
});

test.describe("enquiry API", () => {
  const valid = {
    kind: "contact",
    name: "Test Engineer",
    email: "test@example.com",
    message: "Hello",
    startedAt: Date.now() - 10_000,
  };

  test("rejects bad input with field errors", async ({ request }) => {
    const res = await request.post("/api/enquiry", { data: { ...valid, email: "nope", startedAt: Date.now() - 10_000 } });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.fields.email).toBeTruthy();
    expect((await request.post("/api/enquiry", { data: "not json" })).status()).toBe(400);
  });

  test("quietly drops bot posts (honeypot or instant)", async ({ request }) => {
    for (const data of [{ ...valid, website: "spam.example" }, { ...valid, startedAt: Date.now() }]) {
      const res = await request.post("/api/enquiry", { data });
      expect(res.status()).toBe(200);
      expect((await res.json()).ok).toBe(true);
    }
  });

  test("says when the database is not connected", async ({ request }) => {
    test.skip(!!process.env.SUPABASE_URL, "database configured");
    const res = await request.post("/api/enquiry", { data: { ...valid, startedAt: Date.now() - 10_000 } });
    expect(res.status()).toBe(503);
    expect((await res.json()).error).toBe("not-configured");
  });
});

test("the form asks the server whether sending is on", async ({ page, request }) => {
  const res = await request.get("/api/enquiry");
  expect(await res.json()).toEqual({ enabled: !!process.env.SUPABASE_URL });
  await page.route("/api/enquiry", (route) =>
    route.request().method() === "GET" ? route.fulfill({ json: { enabled: true } }) : route.fulfill({ json: { ok: true, reference: "Q-TEST01" } }),
  );
  await page.goto("/contact");
  await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
  await expect(page.getByText("Online sending is being set up")).toHaveCount(0);
});
