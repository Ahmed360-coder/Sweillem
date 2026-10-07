import { expect, test, type Page } from "@playwright/test";
import { skipIntro } from "./helpers";

/** Push the slider all the way home. Keys pressed before hydration are lost when React takes over, so repeat until it seals. */
async function pushHome(page: Page) {
  const demo = page.locator("figure.joint-demo");
  await expect(async () => {
    await demo.getByRole("slider", { name: "Push the pipes together" }).focus();
    await page.keyboard.press("End");
    await expect(demo).toHaveAttribute("data-stage", "sealed", { timeout: 500 });
  }).toPass();
}

test.beforeEach(async ({ page }) => skipIntro(page));

test.describe("joint demo", () => {
  test("pushing the pipes together seals the joint, and it holds at every published pressure", async ({ page }) => {
    await page.goto("/joint-performance");
    const demo = page.locator("figure.joint-demo");
    const push = demo.getByRole("slider", { name: "Push the pipes together" });
    const verdict = demo.getByText(/bar (inside the pipe|from outside):/);

    await expect(demo).toHaveAttribute("data-stage", "apart");
    await expect(verdict).toContainText("Leaks");

    await pushHome(page);
    await expect(push).toHaveAttribute("aria-valuetext", /Sealed/);

    for (const bar of ["0.5", "1", "2.4"]) {
      for (const side of ["Inside", "Outside"]) {
        await demo.getByRole("radiogroup", { name: "Water pressure" }).getByText(bar, { exact: false }).click();
        await demo.getByRole("radiogroup", { name: "Pressure from" }).getByText(side).click();
        await expect(verdict).toContainText(`${bar} bar`);
        await expect(verdict).toContainText("Watertight, no leak");
      }
    }

    await demo.getByRole("button", { name: "Pull apart" }).click();
    await expect(demo).toHaveAttribute("data-stage", "apart");
    await expect(verdict).toContainText("Leaks");
  });

  test("letting go near the end finishes the push", async ({ page }) => {
    await page.goto("/joint-performance");
    const demo = page.locator("figure.joint-demo");
    const push = demo.getByRole("slider", { name: "Push the pipes together" });
    await pushHome(page);
    // Set the slider straight to 80% (in the snap zone). Twenty arrow presses
    // raced the snap: each key-up glides back home, and on a slow runner the
    // glide won before the next press.
    await push.fill("80");
    await expect(demo).toHaveAttribute("data-stage", "entering");
    await push.blur();
    await expect(demo).toHaveAttribute("data-stage", "sealed");
  });

  test("the Jointing systems page has the demo", async ({ page }) => {
    await page.goto("/products/jointing-systems");
    await expect(page.getByRole("heading", { name: "Push a joint home" })).toBeVisible();
    await expect(page.locator("figure.joint-demo")).toBeVisible();
  });
});
