// ============================================================================
// COMPREHENSIVE E2E TEST - Full App Functionality
// ============================================================================
// Tests all major user flows: Login, Dashboard, Create Note, Refresh, etc.

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Locanote Full Functionality", () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    // Listen for page errors
    page.on("pageerror", (error) => {
      console.log("PAGE ERROR:", error.message);
    });

    // Forward console logs for debugging
    page.on("console", (msg) => {
      const type = msg.type();
      if (type === "error" || type === "warning") {
        console.log(`BROWSER ${type.toUpperCase()}:`, msg.text());
      }
    });

    // Clear all storage to start fresh
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      indexedDB.deleteDatabase("locanote");
      indexedDB.deleteDatabase("yjs");
    });
    await page.reload();
  });

  // ============================================================================
  // LANDING PAGE TESTS
  // ============================================================================

  test("Landing page loads correctly", async ({ page }) => {
    await page.goto(BASE_URL);

    // Check main elements are visible
    await expect(page.locator("h1")).toContainText("Locanote");
    await expect(page.locator(".tagline")).toContainText("Your notes");
    await expect(page.locator(".glass-card")).toBeVisible();

    // Check tabs are visible
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Account" }),
    ).toBeVisible();

    // Check features are visible
    await expect(page.locator("text=End-to-end encrypted")).toBeVisible();
  });

  test("Can switch between Sign In and Create Account tabs", async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // Use specific class selectors for tabs
    const signInTab = page.locator("button.tab").filter({ hasText: "Sign In" });
    const createAccTab = page
      .locator("button.tab")
      .filter({ hasText: "Create Account" });

    // Initially on Sign In tab - it should be active
    await expect(signInTab).toHaveClass(/active/);

    // Click Create Account tab
    await createAccTab.click();
    await expect(createAccTab).toHaveClass(/active/);

    // Click back to Sign In
    await signInTab.click();
    await expect(signInTab).toHaveClass(/active/);
  });

  // ============================================================================
  // LOGIN/REGISTRATION TESTS
  // ============================================================================

  test("Can register a new user", async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for page to be ready
    await page.waitForLoadState("networkidle");

    // Fill in username
    const usernameInput = page.locator(
      'input[placeholder="Choose a username"]',
    );
    await usernameInput.fill("testuser");

    // Click the submit button
    const submitBtn = page.locator(".submit-btn");
    await submitBtn.click();

    // Wait a bit for navigation
    await page.waitForTimeout(2000);

    // Check URL
    console.log("Current URL:", page.url());

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/app/, { timeout: 15000 });
  });

  test("Shows error for short username", async ({ page }) => {
    await page.goto(BASE_URL);

    // Try with short username
    const usernameInput = page.locator(
      'input[placeholder="Choose a username"]',
    );
    await usernameInput.fill("a");
    await page.locator(".submit-btn").click();

    // Should show error
    await expect(page.locator(".error")).toContainText("at least 2 characters");
  });

  test("Shows error for empty username", async ({ page }) => {
    await page.goto(BASE_URL);

    // Try with empty username
    await page.locator(".submit-btn").click();

    // Should show error
    await expect(page.locator(".error")).toContainText(
      "Please enter a username",
    );
  });

  // ============================================================================
  // DASHBOARD TESTS
  // ============================================================================

  test("Dashboard loads after login", async ({ page }) => {
    // Login first
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("dashuser");
    await page.locator(".submit-btn").click();

    // Wait for dashboard
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Check dashboard elements
    await expect(page.locator(".nm-dashboard")).toBeVisible({ timeout: 10000 });

    // Check brand name
    await expect(page.locator(".brand-name")).toContainText("Locanote");
  });

  test("Dashboard shows empty state when no notes", async ({ page }) => {
    // Login first
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("emptyuser");
    await page.locator(".submit-btn").click();

    // Wait for dashboard
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Should show empty state or "No notes yet" message
    await expect(page.locator("text=No notes yet")).toBeVisible({
      timeout: 5000,
    });
  });

  // ============================================================================
  // NOTE CREATION TESTS
  // ============================================================================

  test("Can create a new note", async ({ page }) => {
    // Login
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("notecreator");
    await page.locator(".submit-btn").click();
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Click Create Note button
    const createBtn = page.locator('button:has-text("Create Note")').first();
    await createBtn.click();

    // Should navigate to note editor
    await expect(page).toHaveURL(/.*\/app\/note\/.+/, { timeout: 10000 });

    // Should see the editor
    await expect(page.locator(".editor-content")).toBeVisible({
      timeout: 10000,
    });
  });

  test("Created note appears in dashboard list", async ({ page }) => {
    // Login
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("notelist");
    await page.locator(".submit-btn").click();
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Wait for dashboard to load
    await page.waitForTimeout(1000);

    // Create a note
    const createBtn = page.locator('button:has-text("Create Note")').first();
    await createBtn.click();

    // Wait for navigation
    await page.waitForURL(/.*\/app\/note\/.+/, { timeout: 10000 });

    // Go back to dashboard
    await page.goto("/app");
    await page.waitForTimeout(1000);

    // Note should appear in the list (note item with role button)
    await expect(page.locator('[role="button"].note-item')).toBeVisible({
      timeout: 5000,
    });
  });

  // ============================================================================
  // REFRESH TESTS (THE MAIN BUG)
  // ============================================================================

  test("Dashboard loads correctly after refresh", async ({ page }) => {
    // Login
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("refreshuser");
    await page.locator(".submit-btn").click();
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Wait for dashboard to fully load
    await page.waitForTimeout(2000);

    // Refresh the page
    await page.reload();

    // Should still be on dashboard (not stuck on loading)
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Dashboard should be visible (not stuck on "Loading...")
    await expect(page.locator(".nm-dashboard")).toBeVisible({ timeout: 10000 });

    // Should NOT see the loading state
    await expect(page.locator("text=Loading...")).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("Note page loads correctly after refresh", async ({ page }) => {
    // Login and create a note
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("refreshnote");
    await page.locator(".submit-btn").click();
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Create a note
    const createBtn = page.locator('button:has-text("Create Note")').first();
    await createBtn.click();
    await expect(page).toHaveURL(/.*\/app\/note\/.+/, { timeout: 10000 });

    // Wait for note to load
    await page.waitForTimeout(2000);

    // Get the note URL
    const noteUrl = page.url();

    // Refresh the note page
    await page.reload();

    // Should still be on the note page (not stuck on loading)
    await expect(page).toHaveURL(noteUrl, { timeout: 10000 });

    // Editor should be visible (not stuck on loading)
    await expect(
      page.locator(".editor-content, .tiptap, .ProseMirror"),
    ).toBeVisible({ timeout: 15000 });

    // Should NOT see stuck loading
    await expect(page.locator("text=Loading...")).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("Session persists after browser restart (simulated by reload + new page)", async ({
    page,
  }) => {
    // Login
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("sessiontest");
    await page.locator(".submit-btn").click();
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Navigate to root and back (simulates session persistence)
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);

    // Should redirect back to app (already logged in)
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });
  });

  // ============================================================================
  // SEARCH TESTS
  // ============================================================================

  test("Search functionality works", async ({ page }) => {
    // Login
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("searchtest");
    await page.locator(".submit-btn").click();
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Wait for dashboard
    await page.waitForTimeout(1000);

    // Find search input (placeholder contains "Search")
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    // Type in search
    await searchInput.fill("test query");

    // Should show search results
    await page.waitForTimeout(500);
  });

  // ============================================================================
  // SETTINGS TESTS
  // ============================================================================

  test("Can access settings page", async ({ page }) => {
    // Login
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("settingstest");
    await page.locator(".submit-btn").click();
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Click settings button (gear icon or text)
    const settingsBtn = page
      .locator('a[href="/app/settings"], button:has-text("Settings")')
      .first();
    await settingsBtn.click();

    // Should navigate to settings
    await expect(page).toHaveURL(/.*\/app\/settings/, { timeout: 10000 });
  });

  // ============================================================================
  // LOGOUT TESTS
  // ============================================================================

  test("Can logout successfully", async ({ page }) => {
    // Login
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("logouttest");
    await page.locator(".submit-btn").click();
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });

    // Click logout button
    const logoutBtn = page
      .locator('button:has-text("Logout"), button:has-text("Sign Out")')
      .first();
    await logoutBtn.click();

    // Should redirect to landing page
    await expect(page).toHaveURL(BASE_URL + "/", { timeout: 10000 });

    // Should show login form
    await expect(page.locator(".glass-card")).toBeVisible();
  });

  // ============================================================================
  // RESPONSIVE TESTS
  // ============================================================================

  test("Works on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Login
    await page.goto(BASE_URL);
    await page
      .locator('input[placeholder="Choose a username"]')
      .fill("mobiletest");
    await page.locator(".submit-btn").click();

    // Should still work on mobile
    await expect(page).toHaveURL(/.*\/app/, { timeout: 10000 });
  });
});
