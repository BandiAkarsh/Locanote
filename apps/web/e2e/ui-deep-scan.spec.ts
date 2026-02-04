// ============================================================================
// UI DEEP SCAN E2E TEST
// ============================================================================
// Methodically tests every button, component, and interaction in the app.

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("UI Deep Scan", () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    // Forward logs
    page.on("console", (msg) => {
      if (msg.type() === "error") console.log("BROWSER ERROR:", msg.text());
      else console.log("BROWSER:", msg.text());
    });

    await page.goto(BASE_URL);

    // Set test flag
    await page.evaluate(() => {
      (window as any).__PW_TEST__ = true;
    });

    // Clear storage
    await page.evaluate(() => {
      indexedDB.deleteDatabase("locanote");
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });

  test("Methodical UI Interaction Scan", async ({ page }) => {
    // ---------------------------------------------------------
    // 1. AUTHENTICATION & ONBOARDING
    // ---------------------------------------------------------
    console.log("Checking Auth Screen...");

    // Toggle Login/Register
    await page.waitForSelector("#switch-to-register", { state: "visible" });
    await page.click("#switch-to-register");
    await expect(
      page.locator('h1:has-text("Materialize Identity")'),
    ).toBeVisible();

    await page.click('button:has-text("Existing Identity?")');
    await expect(page.locator('h1:has-text("Portal Login")')).toBeVisible();

    // Register
    await page.click("#switch-to-register");
    await page.fill("#reg-username", "scan_user_" + Date.now());
    await page.getByText("Password").click();
    await page.fill("#reg-password", "TestPass123!");
    await page.fill("#reg-confirm", "TestPass123!");
    await page.click('button:has-text("Initialize Link")');

    await page.waitForURL("**/app**", { timeout: 30000 });
    await expect(page.locator('h1:has-text("Welcome,")')).toBeVisible();

    // ---------------------------------------------------------
    // 2. DASHBOARD SCAN
    // ---------------------------------------------------------
    console.log("Scanning Dashboard...");

    // Search Bar
    const searchInput = page.locator('input[aria-label="Search notes"]');
    await searchInput.fill("Component Test");
    await page.click('button[aria-label="Clear search"]');
    await expect(searchInput).toHaveValue("");

    // Semantic Scout Button
    await page.click('button[title="AI Semantic Scout"]');

    // Nav Dock
    await page.click('button[aria-label="Settings"]');
    await page.waitForURL("**/app/settings");
    await page.click('button[aria-label="Home"]');
    await page.waitForURL("**/app");

    // Templates Modal
    await page.getByText("Templates").first().click();
    await expect(
      page.locator('h2:has-text("Choose a Template")'),
    ).toBeVisible();

    // Category Tabs in Template Modal
    await page.getByRole("button", { name: /Work/ }).click();
    await page.getByRole("button", { name: /Personal/ }).click();
    await page.getByRole("button", { name: /^All/ }).click();

    // Search in Template Modal
    await page
      .locator('input[placeholder="Search templates..."]')
      .fill("Recipe");
    await expect(page.locator('h3:has-text("Recipe")')).toBeVisible();

    // Select a template
    await page.locator('h3:has-text("Recipe")').click();
    await expect(page.locator('h2:has-text("Create Note")')).toBeVisible();
    await page.click('button:has-text("Back")');
    await page.click('button:has-text("Cancel")');

    // ---------------------------------------------------------
    // 3. EDITOR & TOGGLEBAR SCAN
    // ---------------------------------------------------------
    console.log("Scanning Editor & Toolbar...");

    // Create Blank Note
    await page.getByText("Blank Portal").click();
    await page.waitForURL("**/app/note/**");
    const editor = page.locator(".ProseMirror");
    await editor.waitFor({ state: "visible" });

    // Test Toolbar Buttons
    const toolbarButtons = [
      "Bold",
      "Italic",
      "Highlight",
      "Heading 1",
      "Heading 2",
      "Bullet List",
      "Task List",
      "Code Block",
      "Quote",
      "Undo",
    ];

    for (const label of toolbarButtons) {
      const btn = page.locator(`button[aria-label="${label}"]`).first();
      await expect(btn).toBeVisible();
      await btn.click();
      console.log(`- Clicked ${label}`);
    }

    // Microphone / Voice Button
    const micBtn = page.locator('button[aria-label="Voice Dictation"]');
    await expect(micBtn).toBeVisible();
    await micBtn.click();
    console.log("- Clicked Voice Dictation");
    // It might show loading or request permissions, we just check it exists and is clickable

    // ---------------------------------------------------------
    // 4. INTENT DETECTION (The "Togglebar" dynamic parts)
    // ---------------------------------------------------------
    console.log("Checking Intent Modes...");

    await editor.click();
    // Chef Mode
    console.log("- Triggering Chef Mode...");
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await page.keyboard.type("Ingredients:", { delay: 100 });

    // Wait for internal intent state
    await expect(page.locator("#pw-intent-status")).toHaveText("recipe", {
      timeout: 15000,
    });
    await expect(
      page.locator('span:has-text("Chef Mode Active")'),
    ).toBeVisible();
    await expect(page.locator('button:has-text("5m Timer")')).toBeVisible();

    // Reset Intent
    await page.click('button[title="Reset Interface"]');
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await expect(page.locator("#pw-intent-status")).toHaveText("none", {
      timeout: 10000,
    });
    await expect(
      page.locator('span:has-text("Chef Mode Active")'),
    ).not.toBeVisible();

    // Project Mode
    console.log("- Triggering Project Mode...");
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await page.keyboard.type("TODO: Task List", { delay: 100 });

    await expect(page.locator("#pw-intent-status")).toHaveText("task", {
      timeout: 15000,
    });
    await expect(
      page.locator('span:has-text("Project Mode Active")'),
    ).toBeVisible();
    await expect(page.locator('button:has-text("Priority")')).toBeVisible();

    // Developer Mode
    console.log("- Triggering Developer Mode...");
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await page.keyboard.type("function main() {", { delay: 100 });

    await expect(page.locator("#pw-intent-status")).toHaveText("code", {
      timeout: 15000,
    });
    await expect(
      page.locator('span:has-text("Developer Mode Active")'),
    ).toBeVisible();
    await expect(page.locator('button:has-text("Run")')).toBeVisible();

    // Reset Intent
    await page.click('button[title="Reset Interface"]');
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await expect(async () => {
      await expect(
        page.locator('span:has-text("Chef Mode Active")'),
      ).not.toBeVisible();
    }).toPass({ timeout: 10000 });

    // Project Mode
    console.log("- Triggering Project Mode...");
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await page.keyboard.type("TODO: Task List", { delay: 100 });

    await expect(async () => {
      await expect(
        page.locator('span:has-text("Project Mode Active")'),
      ).toBeVisible();
      await expect(page.locator('button:has-text("Priority")')).toBeVisible();
    }).toPass({ timeout: 15000 });

    // Developer Mode
    console.log("- Triggering Developer Mode...");
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await page.keyboard.type("function main() {", { delay: 100 });

    await expect(async () => {
      await expect(
        page.locator('span:has-text("Developer Mode Active")'),
      ).toBeVisible();
      await expect(page.locator('button:has-text("Run")')).toBeVisible();
    }).toPass({ timeout: 15000 });

    // Reset Intent
    await page.click('button[title="Reset Interface"]');
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await expect(async () => {
      await expect(
        page.locator('span:has-text("Chef Mode Active")'),
      ).not.toBeVisible();
    }).toPass();

    // Project Mode
    console.log("- Triggering Project Mode...");
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await page.keyboard.type("TODO: Refactor components");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Deadline: Tomorrow");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Priority: High");

    await expect(async () => {
      await expect(
        page.locator('span:has-text("Project Mode Active")'),
      ).toBeVisible();
      await expect(page.locator('button:has-text("Priority")')).toBeVisible();
      await expect(page.locator('button:has-text("Timeline")')).toBeVisible();
    }).toPass({ timeout: 10000 });

    // Developer Mode
    console.log("- Triggering Developer Mode...");
    await page.evaluate(() =>
      (window as any).editorInstance?.commands.setContent(""),
    );
    await page.keyboard.type("import { svelte } from 'svelte';");
    await page.keyboard.press("Enter");
    await page.keyboard.type("function initialize() {");
    await page.keyboard.press("Enter");
    await page.keyboard.type("  console.log('portal ready');");
    await page.keyboard.press("Enter");
    await page.keyboard.type("}");

    await expect(async () => {
      await expect(
        page.locator('span:has-text("Developer Mode Active")'),
      ).toBeVisible();
      await expect(page.locator('button:has-text("Prettier")')).toBeVisible();
      await expect(page.locator('button:has-text("Run")')).toBeVisible();
    }).toPass({ timeout: 10000 });

    // ---------------------------------------------------------
    // 5. HEADER ACTIONS & MODALS
    // ---------------------------------------------------------
    console.log("Checking Header & Modals...");

    // Title Edit
    await page.click("button.text-left.group.flex.items-center.gap-3");
    await page
      .locator("input.bg-transparent.border-b-2")
      .fill("Scanned Note Title");
    await page.keyboard.press("Enter");
    await expect(
      page.locator('h1:has-text("Scanned Note Title")'),
    ).toBeVisible();

    // Export Modal
    await page.locator('button:has-text("Export")').click(); // Button in IntentToolbar or Export icon
    // Try to find the export button via SVG/path if text fails, or use first button in right group
    const exportBtn = page
      .locator('button[onclick*="isExportModalOpen"]')
      .first();
    await exportBtn.click();
    await expect(page.locator('h2:has-text("Export Note")')).toBeVisible();

    // Test Format Options
    await page.click('button:has-text("HTML")');
    await page.click('button:has-text("PDF")');
    await page.click('button:has-text("Markdown")');
    await page.click('button:has-text("Cancel")');

    // Secure Modal (Neural Seal)
    const secureBtn = page.locator('button:has-text("Secure")').first();
    await secureBtn.click();
    await expect(page.locator('h2:has-text("Neural Seal")')).toBeVisible();
    await page.fill('input[label="Portal Key"]', "secret");
    await page.fill('input[label="Confirm Key"]', "secret");
    // Close modal
    await page.keyboard.press("Escape");

    // Share Modal
    const shareBtn = page
      .locator('button[onclick*="isShareModalOpen"]')
      .first();
    await shareBtn.click();
    await expect(page.locator('h2:has-text("Share Note")')).toBeVisible();

    // Password Toggle in Share
    const passToggle = page.locator("#password-protection-toggle");
    await passToggle.click();

    // Social Links
    await expect(page.locator('span:has-text("WhatsApp")')).toBeVisible();
    await expect(page.locator('span:has-text("Telegram")')).toBeVisible();

    await page.keyboard.press("Escape");

    // ---------------------------------------------------------
    // 6. SETTINGS SCAN
    // ---------------------------------------------------------
    console.log("Scanning Settings...");

    await page.locator('button[aria-label="Settings"]').click();
    await page.waitForURL("**/app/settings");

    // Tab Switching
    await page.getByText("neural").click();
    await expect(page.locator('h2:has-text("AI Neural Engine")')).toBeVisible();

    await page.getByText("account").click();
    await expect(page.locator('h3:has-text("Neural Identity")')).toBeVisible();

    await page.getByText("appearance").click();

    // Atmospheric Engines
    const engineButtons = ["Nebula", "Crystalline", "Aura", "Static"];
    for (const engine of engineButtons) {
      await page.click(`div:has-text("${engine}")`);
      console.log(`- Switched to ${engine} engine`);
    }

    // Theme Toggle (Material State)
    await page.click('button[title="Frosted Opal"]');
    await page.click('button[title="Obsidian Glass"]');

    // Zero UI Toggle
    await page.click('button[role="switch"]');

    // Back to Hub
    await page.click('button:has-text("Return to Hub")');
    await page.waitForURL("**/app");

    // ---------------------------------------------------------
    // 7. TERMINATE
    // ---------------------------------------------------------
    console.log("Checking Logout...");
    await page.click('button[aria-label="Settings"]');
    await page.getByText("account").click();
    await page.click('button:has-text("Terminate Session")');
    await page.waitForURL(BASE_URL);

    console.log("DEEP SCAN COMPLETE!");
  });
});
