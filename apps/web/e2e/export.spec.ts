// ============================================================================
// EXPORT E2E TEST
// ============================================================================
// Tests note exporting.

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Note Export", () => {
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
    await page.locator("#reg-username").fill("export_user_" + Date.now());
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

  test("can open export modal and see formats", async ({ page }) => {
    // Create a note
    await page
      .locator('button:has-text("New Note")')
      .or(page.locator('button:has-text("New")'))
      .first()
      .click();
    await page.waitForURL("**/app/note/**");

    // Wait for editor to be ready
    await page.locator(".ProseMirror").waitFor({ state: "visible" });

    // Click Export
    await page.locator('button:has-text("Export")').click();

    // Verify Modal
    await expect(page.locator('h2:has-text("Export Note")')).toBeVisible();

    // Verify formats
    const markdownOption = page.locator(
      'button.format-option:has-text("Markdown")',
    );
    await expect(markdownOption).toBeVisible();
    await expect(
      page.locator('button.format-option:has-text("HTML")'),
    ).toBeVisible();
    await expect(
      page.locator('button.format-option:has-text("PDF")'),
    ).toBeVisible();

    // Select Markdown
    await markdownOption.click();

    // Verify Preview
    await expect(page.locator("pre")).toBeVisible();
  });
});
