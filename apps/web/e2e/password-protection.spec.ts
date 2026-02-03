import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Password Protection Audit", () => {
  test.setTimeout(120000);

  test("Should allow protecting a note and prompt for password on join", async ({
    page,
    browser,
  }) => {
    // 1. User A registers and creates a note
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    const userA = "user_a_" + Date.now();
    console.log(`[Test] Registering User A: ${userA}`);

    // Switch to Register
    const createBtn = page
      .locator("button")
      .filter({ hasText: "Create a new account" });
    await createBtn.waitFor({ state: "visible", timeout: 15000 });
    await createBtn.click();

    // Fill registration
    await page.locator("#reg-username").waitFor({ state: "visible" });
    await page.locator("#reg-username").fill(userA);

    await page
      .locator("button")
      .filter({ hasText: "Password" })
      .filter({ hasText: "Create a secure password" })
      .click();

    await page.locator("#reg-password").fill("TestPass123");
    await page.locator("#reg-confirm-password").fill("TestPass123");
    await page
      .locator("button")
      .filter({ hasText: /^Create Account$/ })
      .click();

    // Wait for dashboard
    await page.waitForURL("**/app**", { timeout: 30000 });
    console.log("[Test] User A on dashboard");

    // Create a note
    const createBtnDash = page
      .locator("button")
      .filter({ hasText: "Create New Note" })
      .or(page.locator('button:has-text("New Note")'))
      .first();
    await createBtnDash.waitFor({ state: "visible", timeout: 15000 });
    await createBtnDash.click();
    await page.waitForURL("**/app/note/**", { timeout: 20000 });
    console.log(`[Test] Note created`);

    // 2. User A sets a password
    await page.locator("button").filter({ hasText: "Share" }).click();
    console.log("[Test] Share modal opened");

    // Click the toggle using the label "Enable"
    const toggle = page.locator('label:has-text("Enable")');
    await toggle.waitFor({ state: "visible" });
    await toggle.click();
    console.log("[Test] Password protection toggled");

    // Wait for input to appear
    const passwordInput = page.locator(
      'input[placeholder="Set a secret password"]',
    );
    await passwordInput.waitFor({ state: "visible", timeout: 5000 });
    await passwordInput.fill("Secret123");

    // Ensure Apply button is enabled
    const applyBtn = page.locator('button:has-text("Apply")');
    await expect(applyBtn).toBeEnabled({ timeout: 10000 });
    await applyBtn.click();
    console.log("[Test] Apply clicked");

    // Verify protection state
    await expect(
      page.locator("text=Password Protected (Secure Link)"),
    ).toBeVisible({ timeout: 15000 });
    console.log("[Test] Password protection confirmed in UI");

    // GET THE SECURE URL FROM THE INPUT
    const shareUrlInput = page.locator("input[readonly]");
    const secureShareUrl = await shareUrlInput.inputValue();
    console.log(`[Test] Secure Share URL retrieved: ${secureShareUrl}`);

    // Close modal
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);

    // 3. User B joins (different context)
    console.log("[Test] User B joining...");
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    // User B must register first
    await pageB.goto(BASE_URL);
    await pageB.waitForLoadState("networkidle");

    await pageB
      .locator("button")
      .filter({ hasText: "Create a new account" })
      .click();
    await pageB.locator("#reg-username").waitFor({ state: "visible" });
    await pageB.locator("#reg-username").fill("user_b_" + Date.now());
    await pageB
      .locator("button")
      .filter({ hasText: "Password" })
      .filter({ hasText: "Create a secure password" })
      .click();
    await pageB.locator("#reg-password").fill("TestPass123");
    await pageB.locator("#reg-confirm-password").fill("TestPass123");
    await pageB
      .locator("button")
      .filter({ hasText: /^Create Account$/ })
      .click();
    await pageB.waitForURL("**/app**", { timeout: 30000 });
    console.log("[Test] User B registered");

    // Go to shared note using the SECURE URL (which has salt but no key)
    console.log(`[Test] User B navigating to: ${secureShareUrl}`);
    await pageB.goto(secureShareUrl);

    // 4. Verify password prompt
    // Wait for the specific "Encrypted Note" title in the modal
    const modalTitle = pageB
      .locator("h2")
      .filter({ hasText: "Encrypted Note" });
    await modalTitle.waitFor({ state: "visible", timeout: 20000 });
    console.log("[Test] User B sees security gate");

    await pageB.locator('input[type="password"]').fill("Secret123");
    await pageB.locator('button:has-text("Unlock Note")').click();
    console.log("[Test] User B entered password and clicked unlock");

    // 5. Verify editor loads
    await expect(
      pageB.locator('[contenteditable="true"], .ProseMirror'),
    ).toBeVisible({ timeout: 30000 });
    console.log(
      "[Password Audit] Password protection and unlocking verified successfully",
    );

    await contextB.close();
  });
});
