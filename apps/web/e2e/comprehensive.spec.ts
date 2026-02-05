// ============================================================================
// COMPREHENSIVE E2E TEST (v2)
// ============================================================================
// Tests all major features: Registration, Templates, Search, Export, Keybindings, GenUI.

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Comprehensive App Test", () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    // Forward logs
    page.on("console", (msg) => {
      if (msg.type() === "error") console.log("BROWSER ERROR:", msg.text());
      else console.log("BROWSER:", msg.text());
    });

    await page.goto(BASE_URL);

    // Set test flag to disable problematic transitions
    await page.evaluate(() => {
      (window as any).__PW_TEST__ = true;
    });

    // Clear storage to start fresh
    await page.evaluate(() => {
      indexedDB.deleteDatabase("locanote");
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();

    // Re-set flag after reload
    await page.evaluate(() => {
      (window as any).__PW_TEST__ = true;
    });
  });

  test("User lifecycle: Register -> Create -> GenUI -> Search -> Export", async ({
    page,
  }) => {
    // 1. REGISTRATION
    await page.waitForSelector("#switch-to-register", {
      state: "visible",
      timeout: 20000,
    });
    await page.click("#switch-to-register", { force: true });

    // Wait for RegisterCard elements
    await page.waitForSelector("#reg-username", {
      state: "visible",
      timeout: 30000,
    });
    await page.fill("#reg-username", "full_user_" + Date.now());

    // Select Password method
    await page.getByText("Password").click();

    await page.waitForSelector("#reg-password", {
      state: "visible",
      timeout: 15000,
    });
    await page.fill("#reg-password", "TestPass123!");
    await page.fill("#reg-confirm", "TestPass123!");

    await page.getByText("Initialize Link").click();

    // Wait for Dashboard
    await page.waitForURL("**/app**", { timeout: 40000 });
    await expect(page.locator('h1:has-text("Welcome,")')).toBeVisible({
      timeout: 20000,
    });

    // 2. CREATE FROM TEMPLATE
    await page.getByText("Templates").first().click();
    await page.getByText("Meeting Notes").click();
    const templateTitleInput = page.locator(
      'input[placeholder="Meeting Notes"]',
    );
    await templateTitleInput.waitFor({ state: "visible" });
    await templateTitleInput.fill("Board Meeting");
    await page.keyboard.press("Enter");

    await page.waitForURL("**/app/note/**", { timeout: 30000 });

    // Verify template content
    const editor = page.locator(".ProseMirror");
    await editor.waitFor({ state: "visible", timeout: 20000 });
    await expect(editor).toContainText("Meeting Notes", { timeout: 20000 });

    // 3. TEST GenUI INTENT DETECTION
    await editor.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Backspace");

    // Type Recipe Intent
    await page.keyboard.type(
      "Ingredients:\n- 2 cups flour\n- 1 tsp sugar\nInstructions:",
    );

    // Check for Chef Mode
    await expect(page.locator('span:has-text("Chef Mode Active")')).toBeVisible(
      { timeout: 20000 },
    );
    await expect(page.locator('button:has-text("5m Timer")')).toBeVisible();

    // 4. NAVIGATION & SEARCH
    // Go back via Home icon in dock
    await page.locator('button[aria-label="Home"]').click();
    await page.waitForURL("**/app", { timeout: 20000 });

    const searchInput = page.locator('input[aria-label="Search notes"]');
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill("Board");
    await page.waitForTimeout(2000); // Debounce
    await expect(page.locator('h3:has-text("Board Meeting")')).toBeVisible();

    // 5. KEYBINDINGS
    await page.keyboard.press("Escape");
    await expect(searchInput).toHaveValue("");
    await searchInput.blur();

    // Ctrl+N for new note
    await page.keyboard.press("Control+n");
    await page.waitForURL("**/app/note/**", { timeout: 30000 });

    // 6. EXPORT
    await page.locator('button:has-text("Export")').click();
    await expect(page.locator('h2:has-text("Export Note")')).toBeVisible();

    // Close modal with Escape
    await page.keyboard.press("Escape");
    await expect(page.locator('h2:has-text("Export Note")')).not.toBeVisible({
      timeout: 20000,
    });

    // 7. TOOLBAR GLOW TEST
    await editor.click();
    await page.waitForTimeout(1000);

    const boldBtn = page.locator('button[aria-label="Bold"]').first();
    await boldBtn.click();
    await page.waitForTimeout(2000);

    await expect(boldBtn).toHaveClass(/toolbar-btn-active/, { timeout: 20000 });
  });
});
