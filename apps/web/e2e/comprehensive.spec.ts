// ============================================================================
// COMPREHENSIVE E2E TEST (v2)
// ============================================================================
// Tests all major features: Registration, Templates, Search, Export, Keybindings, GenUI.

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Comprehensive App Test", () => {
  test.beforeEach(async ({ page }) => {
    // Forward logs
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

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
    const switchToRegisterBtn = page.locator('button:has-text("Create one")');
    await switchToRegisterBtn.waitFor({ state: "visible", timeout: 15000 });
    await switchToRegisterBtn.click();
    
    await page.locator("#reg-username").fill("full_user_" + Date.now());
    
    // Select Password method
    const passwordMethodBtn = page.locator('button:has-text("Password")').filter({ hasText: "Traditional credentials" });
    await passwordMethodBtn.click();
    
    await page.locator("#reg-password").fill("TestPass123!");
    await page.locator("#reg-confirm-password").fill("TestPass123!");
    
    const submitBtn = page.locator('button:has-text("Create Account")').filter({ hasText: /^Create Account$/ });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    
    // Wait for Dashboard
    await page.waitForURL("**/app**", { timeout: 25000 });
    // Use the specific header on the app page
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible({ timeout: 15000 });

    // 2. CREATE FROM TEMPLATE
    await page.locator('button:has-text("Template")').first().click();
    await page.locator('button:has-text("Meeting Notes")').click();
    await page.locator('input[placeholder="Meeting Notes"]').fill("Board Meeting");
    await page.keyboard.press("Enter");
    
    // View Transitions make navigation feel smooth, but we wait for URL
    await page.waitForURL("**/app/note/**", { timeout: 20000 });
    
    // Verify template content
    const editor = page.locator(".ProseMirror");
    await editor.waitFor({ state: "visible", timeout: 10000 });
    await expect(editor).toContainText("Meeting Notes", { timeout: 10000 });
    
    // 3. TEST GenUI INTENT DETECTION
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    
    // Type Recipe Intent
    await page.keyboard.type("Ingredients:\n- 2 cups flour\n- 1 tsp sugar\nInstructions:");
    await page.waitForTimeout(2000); // Wait for intent engine
    
    // Check for Chef Mode
    await expect(page.locator('span:has-text("Chef Mode Active")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("5m Timer")')).toBeVisible();

    // 4. NAVIGATION & SEARCH
    // Go back via dock
    await page.locator('button[aria-label="Home"]').click();
    await page.waitForURL("**/app", { timeout: 15000 });
    
    const searchInput = page.locator('input[aria-label="Search notes"]');
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill("Board");
    await page.waitForTimeout(1000); // Debounce
    await expect(page.locator('h3:has-text("Board Meeting")')).toBeVisible();
    
    // 5. KEYBINDINGS
    // Escape to clear search
    await page.keyboard.press("Escape");
    await expect(searchInput).toHaveValue("");
    
    // Ctrl+N for new note
    await page.keyboard.press("Control+n");
    await page.waitForURL("**/app/note/**", { timeout: 15000 });
    
    // 6. EXPORT
    await page.locator('button:has-text("Export")').click();
    await expect(page.locator('h2:has-text("Export Note")')).toBeVisible();
    
    // Close modal with Escape
    await page.keyboard.press("Escape");
    await expect(page.locator('h2:has-text("Export Note")')).not.toBeVisible();
  });
});
