import type { Page } from "@playwright/test";

/** Mark the intro as already played so page tests see the page itself. */
export async function skipIntro(page: Page) {
  await page.addInitScript(() => {
    try {
      window.sessionStorage.setItem("sweillem.intro", "1");
    } catch {}
  });
}
