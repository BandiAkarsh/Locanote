// ============================================================================
// SEARCH E2E TEST
// ============================================================================
// Tests search and filtering.

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Note Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      indexedDB.deleteDatabase("locanote");
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();

    // Register
    const createAccountBtn = page.locator(
      'button:has-text("Create a new account")',
    );
    await createAccountBtn.click();
    await page.locator("#reg-username").fill("search_user_" + Date.now());
    await page
      .locator("button")
      .filter({ hasText: "Password" })
      .first()
      .click();
    await page.locator("#reg-password").fill("TestPass123!");
    await page.locator("#reg-confirm-password").fill("TestPass123!");
    await page
      .locator("button")
      .filter({ hasText: /^Create Account$/ })
      .click();
    await page.waitForURL("**/app**");
  });

  test("can search for notes by title", async ({ page }) => {
    // Create two notes
    const createBtn = page
      .locator('button:has-text("New Note")')
      .or(page.locator('button:has-text("New")'))
      .first();
    await createBtn.click();
    await page.waitForURL("**/app/note/**");
    await page.goBack();

    await createBtn.click();
    await page.waitForURL("**/app/note/**");
    await page.goBack();

    // Search
    const searchInput = page.locator('input[aria-label="Search notes"]');
    await searchInput.fill("Untitled");

    // Verify results
    // Wait for debounce and search execution
    await page.waitForTimeout(1000);

    const noteCards = page.locator('div[role="button"]:has(h3)');
    await expect(noteCards).toHaveCount(2);
  });
});
