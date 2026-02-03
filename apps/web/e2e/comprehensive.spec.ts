// ============================================================================
// COMPREHENSIVE E2E TEST
// ============================================================================
// Tests all major features: Registration, Templates, Search, Export, Keybindings.

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

  test("User lifecycle: Register -> Create -> Search -> Export", async ({ page }) => {
    // 1. REGISTRATION
    const switchToRegisterBtn = page.locator('button:has-text("Create one")');
    await switchToRegisterBtn.waitFor({ state: "visible", timeout: 10000 });
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
    await page.waitForURL("**/app**", { timeout: 20000 });
    await expect(page.locator("h1")).toContainText("Welcome back", { timeout: 10000 });

    // 2. CREATE FROM TEMPLATE
    await page.locator('button:has-text("Template")').first().click();
    await page.locator('button:has-text("Meeting Notes")').click();
    await page.locator('input[placeholder="Meeting Notes"]').fill("Board Meeting");
    // Test Enter key to submit template modal
    await page.keyboard.press("Enter");
    await page.waitForURL("**/app/note/**");
    
    // Verify template content
    const editor = page.locator(".ProseMirror");
    await expect(editor).toContainText("Meeting Notes");
    await expect(editor).toContainText("Agenda");
    
    // 3. EDIT AND TAG
    await editor.focus();
    await page.keyboard.type(" Important discussion today.");
    
    // Go back to dashboard
    await page.locator('button[aria-label="Back to dashboard"]').click();
    await page.waitForURL("**/app**");
    
    // 4. SEARCH
    const searchInput = page.locator('input[aria-label="Search notes"]');
    await searchInput.fill("Board");
    await page.waitForTimeout(500); // Debounce
    await expect(page.locator('h3:has-text("Board Meeting")')).toBeVisible();
    
    // Test Escape to clear search
    await page.keyboard.press("Escape");
    await expect(searchInput).toHaveValue("");
    await searchInput.blur();
    
    // 5. KEYBINDINGS
    // Ctrl+N for new note
    await page.keyboard.press("Control+n");
    await page.waitForURL("**/app/note/**", { timeout: 20000 });
    
    // Wait for editor and toolbar to be fully loaded
    await page.waitForLoadState("networkidle");
    const editorHeader = page.locator('header').last(); // Use last() to get the app header
    await expect(editorHeader).toBeVisible();
    
    // Check for Voice button and toggle
    const voiceBtn = page.locator('button[aria-label="Voice Dictation"]');
    await voiceBtn.waitFor({ state: "visible", timeout: 10000 });
    await expect(voiceBtn).toBeVisible();
    await voiceBtn.click();
    // It might show an alert if not supported in headless mode, but we just check visibility
    
    // Go back using button
    await page.locator('button[aria-label="Back to dashboard"]').click();
    await page.waitForURL("**/app**", { timeout: 10000 });
    
    // 6. SETTINGS & CLEAN MODE
    await page.goto(BASE_URL + "/app/settings");
    await expect(page.locator('h1')).toContainText("Settings");
    
    // Toggle Clean Mode
    const cleanModeToggle = page.locator('button[role="switch"]');
    await cleanModeToggle.click();
    
    // Go back to app
    await page.locator('button:has-text("Back to Dashboard")').click();
    await page.waitForURL("**/app**");
    
    // Verify Stats grid is hidden in Clean Mode
    await expect(page.locator('div:has-text("Notes")').filter({ hasText: /^[0-9]+$/ })).not.toBeVisible();
    
    // 7. EXPORT
    const firstNote = page.locator('h3:has-text("Untitled Note")').first();
    await firstNote.click();
    await page.waitForURL("**/app/note/**");
    await page.locator('button:has-text("Export")').click();
    await expect(page.locator('h2:has-text("Export Note")')).toBeVisible();
    
    // Select HTML
    await page.locator('button.format-option:has-text("HTML")').click();
    await expect(page.locator("pre")).toBeVisible();
    
    // Close modal with Escape
    await page.keyboard.press("Escape");
    await expect(page.locator('h2:has-text("Export Note")')).not.toBeVisible();
  });
});
