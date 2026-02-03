import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Share Functionality Audit", () => {
  test.setTimeout(90000);

  test("Should open share modal with social options", async ({ page }) => {
    page.on("console", (msg) => console.log(`[Browser] ${msg.text()}`));
    page.on("pageerror", (err) =>
      console.log(`[Browser Error] ${err.message}`),
    );

    // 1. Setup: Register and create a note
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    // Switch to Register
    const createAccountBtn = page
      .locator("button")
      .filter({ hasText: "Create a new account" });
    await createAccountBtn.waitFor({ state: "visible", timeout: 15000 });
    await createAccountBtn.click();

    // Fill registration
    const usernameInput = page.locator("#reg-username");
    await usernameInput.waitFor({ state: "visible", timeout: 15000 });
    await usernameInput.fill("share_tester_" + Date.now());

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

    // 2. Create a note
    const createNoteBtn = page
      .locator("button")
      .filter({ hasText: "Create New Note" })
      .or(page.locator('button:has-text("New Note")'))
      .first();
    await createNoteBtn.waitFor({ state: "visible", timeout: 15000 });
    await createNoteBtn.click();

    await page.waitForURL("**/app/note/**", { timeout: 20000 });

    // 3. Click Share button
    const shareBtn = page.locator('button:has-text("Share")').first();
    await shareBtn.waitFor({ state: "visible", timeout: 10000 });
    await shareBtn.click();
    console.log("[Share Audit] Clicked Share button");

    // 4. Verify Modal is open
    // Wait for the specific share dialog to be visible
    const dialog = page.locator("dialog").filter({ hasText: "Share Note" });
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const modalTitle = page.locator("h2").filter({ hasText: "Share Note" });
    await expect(modalTitle).toBeVisible();

    // 5. Verify Social Options
    const whatsappLink = page.locator('a:has-text("WhatsApp")');
    const telegramLink = page.locator('a:has-text("Telegram")');
    const twitterLink = page.locator('a:has-text("X (Twitter)")');

    await expect(whatsappLink).toBeVisible();
    await expect(telegramLink).toBeVisible();
    await expect(twitterLink).toBeVisible();

    // Check href format
    const href = await whatsappLink.getAttribute("href");
    expect(href).toContain("wa.me");

    console.log("[Share Audit] Share modal and social links verified");
  });
});
