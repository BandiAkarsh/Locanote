// ============================================================================
// TEMPLATES E2E TEST
// ============================================================================
// Tests note creation from templates.

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Note Templates", () => {
  test.beforeEach(async ({ page }) => {
    // Register or login
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    
    // Clear storage to start fresh
    await page.evaluate(() => {
      indexedDB.deleteDatabase("locanote");
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    
    // Register
    const createAccountBtn = page.locator('button:has-text("Create a new account")');
    await createAccountBtn.click();
    await page.locator("#reg-username").fill("template_user_" + Date.now());
    await page.locator("button").filter({ hasText: "Password" }).first().click();
    await page.locator("#reg-password").fill("TestPass123!");
    await page.locator("#reg-confirm-password").fill("TestPass123!");
    await page.locator("button").filter({ hasText: /^Create Account$/ }).click();
    await page.waitForURL("**/app**");
  });

  test("can create a note from Meeting Notes template", async ({ page }) => {
    // Click "From Template" button
    const fromTemplateBtn = page.locator('button:has-text("From Template")').or(page.locator('button:has-text("Template")')).first();
    await fromTemplateBtn.click();
    
    // Select Meeting Notes
    const meetingNotesCard = page.locator('button:has-text("Meeting Notes")');
    await meetingNotesCard.waitFor({ state: 'visible' });
    await meetingNotesCard.click();
    
    // Customize title
    const titleInput = page.locator('input[placeholder="Meeting Notes"]');
    await titleInput.fill("Team Sync Meeting");
    
    // Click Create
    await page.locator('button:has-text("Create Note")').click();
    
    // Verify navigation
    await page.waitForURL("**/app/note/**");
    
    // Verify content
    const editor = page.locator('.ProseMirror');
    await expect(editor).toContainText("Meeting Notes");
    await expect(editor).toContainText("Attendees");
    await expect(editor).toContainText("Agenda");
    await expect(editor).toContainText("Action Items");
  });

  test("can create a note from Daily Journal template", async ({ page }) => {
    // Click "From Template" button
    const fromTemplateBtn = page.locator('button:has-text("From Template")').or(page.locator('button:has-text("Template")')).first();
    await fromTemplateBtn.click();
    
    // Select Daily Journal
    const journalCard = page.locator('button:has-text("Daily Journal")');
    await journalCard.waitFor({ state: 'visible' });
    await journalCard.click();
    
    // Customize title
    const titleInput = page.locator('input[placeholder="Daily Journal"]');
    await titleInput.fill("My Awesome Day");
    
    // Click Create
    await page.locator('button:has-text("Create Note")').click();
    
    // Verify navigation
    await page.waitForURL("**/app/note/**");
    
    // Verify content
    const editor = page.locator('.ProseMirror');
    await expect(editor).toContainText("Daily Journal");
    await expect(editor).toContainText("Morning Intention");
    await expect(editor).toContainText("Gratitude");
    await expect(editor).toContainText("Today's Highlights");
  });
});
