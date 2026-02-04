// ============================================================================
// COMPREHENSIVE E2E TEST (v2)
// ============================================================================
// Tests all major features: Registration, Templates, Search, Export, Keybindings, GenUI.

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Comprehensive App Test", () => {
  test.setTimeout(90000); // Massive timeout for CI/slow environments

  test.beforeEach(async ({ page }) => {
    // Forward logs
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
      else console.log('BROWSER:', msg.text());
    });

    await page.goto(BASE_URL);
    // Clear storage to start fresh
    await page.evaluate(() => {
      indexedDB.deleteDatabase("locanote");
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });

  test("User lifecycle: Register -> Create -> GenUI -> Search -> Export", async ({ page }) => {
    // 1. REGISTRATION
    await page.waitForSelector('#switch-to-register', { state: "visible", timeout: 20000 });
    await page.click('#switch-to-register');
    
    await page.waitForSelector("#reg-username", { state: "visible", timeout: 20000 });
    await page.fill("#reg-username", "full_user_" + Date.now());
    
    // Select Password method
    await page.click('button:has-text("Password")');
    
    await page.waitForSelector("#reg-password", { state: "visible", timeout: 15000 });
    await page.fill("#reg-password", "TestPass123!");
    await page.fill("#reg-confirm", "TestPass123!");
    
    await page.click('button:has-text("Initialize Link")');
    
    // Wait for Dashboard
    await page.waitForURL("**/app**", { timeout: 30000 });
    await expect(page.locator('h1:has-text("Welcome,")')).toBeVisible({ timeout: 20000 });

    // 2. CREATE FROM TEMPLATE
    await page.locator('button:has-text("Templates")').first().click();
    await page.locator('button:has-text("Meeting Notes")').click();
    await page.locator('input[placeholder="Meeting Notes"]').fill("Board Meeting");
    await page.keyboard.press("Enter");
    
    await page.waitForURL("**/app/note/**", { timeout: 20000 });
    
    // Verify template content
    const editor = page.locator(".ProseMirror");
    await editor.waitFor({ state: "visible", timeout: 15000 });
    await expect(editor).toContainText("Meeting Notes", { timeout: 15000 });
    
    // 3. TEST GenUI INTENT DETECTION
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    
    // Type Recipe Intent
    await page.keyboard.type("Ingredients:\n- 2 cups flour\n- 1 tsp sugar\nInstructions:");
    
    // Check for Chef Mode
    await expect(page.locator('span:has-text("Chef Mode Active")')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button:has-text("5m Timer")')).toBeVisible();
    
    // 4. NAVIGATION & SEARCH
    // Go back via Home icon in dock
    await page.locator('button[aria-label="Home"]').click();
    await page.waitForURL("**/app", { timeout: 15000 });
    
    const searchInput = page.locator('input[aria-label="Search notes"]');
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill("Board");
    await page.waitForTimeout(1500); // Debounce
    await expect(page.locator('h3:has-text("Board Meeting")')).toBeVisible();
    
    // 5. KEYBINDINGS
    await page.keyboard.press("Escape");
    await expect(searchInput).toHaveValue("");
    await searchInput.blur();
    
    // Ctrl+N for new note
    await page.keyboard.press("Control+n");
    await page.waitForURL("**/app/note/**", { timeout: 20000 });
    
    // 6. EXPORT
    await page.locator('button:has-text("Export")').click();
    await expect(page.locator('h2:has-text("Export Note")')).toBeVisible();
    
    // Close modal with Escape
    await page.keyboard.press("Escape");
    await expect(page.locator('h2:has-text("Export Note")')).not.toBeVisible({ timeout: 15000 });
    
    // 7. TOOLBAR GLOW TEST
    const boldBtn = page.locator('button[aria-label="Bold"]').first();
    await boldBtn.click();
    await page.waitForTimeout(1000); 
    
    await expect(boldBtn).toHaveClass(/toolbar-btn-active/, { timeout: 15000 });
  });
});
