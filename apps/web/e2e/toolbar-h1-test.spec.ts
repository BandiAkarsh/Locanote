import { test, expect, type Page } from "@playwright/test";
import { execSync, spawn } from "child_process";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const SCREENSHOT_DIR = join(process.cwd(), "test-screenshots");
let serverProcess: any = null;

// Setup screenshot directory
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper to take screenshots
async function takeScreenshot(page: Page, name: string) {
  const path = join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`Screenshot saved: ${path}`);
  return path;
}

// Helper to collect console errors
async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
      console.log(`Console error: ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    errors.push(err.message);
    console.log(`Page error: ${err.message}`);
  });
  return errors;
}

// Helper to setup test user authentication
async function setupTestUser(page: Page) {
  // Create a mock session in localStorage
  const session = {
    userId: "test-user-123",
    username: "testuser",
    loggedInAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  await page.addInitScript((sessionData) => {
    localStorage.setItem("locanote_session", JSON.stringify(sessionData));
  }, session);
}

test.beforeAll(async () => {
  // Start the dev server
  console.log("Starting dev server...");
  serverProcess = spawn("pnpm", ["run", "dev"], {
    cwd: process.cwd(),
    stdio: "pipe",
    shell: true,
  });

  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 8000));
  console.log("Dev server started");
});

test.afterAll(async () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

test.describe("Toolbar H1 Button Test", () => {
  test("H1 button formats text correctly", async ({ page }) => {
    const consoleErrors = await collectConsoleErrors(page);
    const testResults: any[] = [];

    try {
      // Step 1: Navigate to app and setup auth
      console.log("Step 1: Setting up test user authentication...");
      await page.goto("http://localhost:5173/app");
      await setupTestUser(page);
      await page.reload();
      await page.waitForTimeout(2000);

      // Step 2: Create a note
      console.log("Step 2: Creating a new note...");
      const createNoteButton = page
        .locator('button:has-text("Create Note")')
        .first();

      if (!(await createNoteButton.isVisible().catch(() => false))) {
        throw new Error(
          "Create Note button not visible - authentication may have failed",
        );
      }

      await createNoteButton.click();
      await page.waitForTimeout(3000);

      // Verify I're on a note page
      const currentUrl = page.url();
      if (!currentUrl.includes("/app/note/")) {
        throw new Error(
          `Expected to be on note page, but URL is: ${currentUrl}`,
        );
      }

      console.log(`Created note at: ${currentUrl}`);
      await takeScreenshot(page, "01_note_created");

      // Step 3: Find and focus the editor
      console.log("Step 3: Focusing the editor...");
      const editorArea = page
        .locator('[contenteditable="true"], .ProseMirror')
        .first();

      if (!(await editorArea.isVisible().catch(() => false))) {
        throw new Error("Editor content area not visible");
      }

      await editorArea.click();
      await page.waitForTimeout(500);

      // Step 4: Type initial text
      console.log("Step 4: Typing initial text...");
      await editorArea.type("This is regular text", { delay: 50 });
      await page.waitForTimeout(1000);
      await takeScreenshot(page, "02_before_h1");

      // Step 5: Click the H1 button
      console.log("Step 5: Clicking H1 button...");
      const h1Button = page.locator('button:has-text("H1")').first();

      if (!(await h1Button.isVisible().catch(() => false))) {
        throw new Error("H1 button not visible");
      }

      // Check if button is active before click
      const h1ButtonBefore = await h1Button.evaluate((el) => {
        return (
          el.classList.contains("bg-indigo-100") ||
          el.classList.contains("dark:bg-indigo-900/50")
        );
      });
      console.log(`H1 button active before click: ${h1ButtonBefore}`);

      await h1Button.click();
      await page.waitForTimeout(500);

      // Check if button is active after click
      const h1ButtonAfter = await h1Button.evaluate((el) => {
        return (
          el.classList.contains("bg-indigo-100") ||
          el.classList.contains("dark:bg-indigo-900/50")
        );
      });
      console.log(`H1 button active after click: ${h1ButtonAfter}`);

      // Step 6: Type heading text
      console.log("Step 6: Typing heading text...");
      await editorArea.type("This is a heading", { delay: 50 });
      await page.waitForTimeout(1000);
      await takeScreenshot(page, "03_after_h1");

      // Step 7: Verify the heading formatting
      console.log("Step 7: Verifying H1 formatting...");

      // Check if there's an h1 element in the editor
      const h1Element = editorArea.locator("h1").first();
      const hasH1 = await h1Element.isVisible().catch(() => false);

      // Get the HTML content to verify
      const editorHTML = await editorArea.evaluate((el) => el.innerHTML);
      console.log("Editor HTML content:", editorHTML);

      // Check for h1 tag in the HTML
      const hasH1Tag =
        editorHTML.includes("<h1") || editorHTML.includes("<h1>");

      // Verify the heading text is present
      const hasHeadingText = editorHTML.includes("This is a heading");

      // Check if H1 button is still active after typing
      const h1ButtonFinal = await h1Button.evaluate((el) => {
        return (
          el.classList.contains("bg-indigo-100") ||
          el.classList.contains("dark:bg-indigo-900/50")
        );
      });
      console.log(`H1 button active after typing: ${h1ButtonFinal}`);

      // Final screenshot
      await takeScreenshot(page, "04_final_result");

      // Report results
      console.log("\n=== TEST RESULTS ===");
      console.log(`H1 button visible: true`);
      console.log(`H1 button clickable: true`);
      console.log(`H1 element found in editor: ${hasH1}`);
      console.log(`H1 tag present in HTML: ${hasH1Tag}`);
      console.log(`Heading text present: ${hasHeadingText}`);
      console.log(`H1 button active state after click: ${h1ButtonAfter}`);
      console.log(`H1 button active state after typing: ${h1ButtonFinal}`);
      console.log(
        `Console errors: ${consoleErrors.length > 0 ? consoleErrors.join(", ") : "None"}`,
      );

      testResults.push({
        step: "H1 Button Test",
        h1ButtonVisible: true,
        h1ButtonClickable: true,
        h1ElementFound: hasH1,
        h1TagPresent: hasH1Tag,
        headingTextPresent: hasHeadingText,
        h1ButtonActiveAfterClick: h1ButtonAfter,
        h1ButtonActiveAfterTyping: h1ButtonFinal,
        consoleErrors: consoleErrors,
        status: hasH1Tag && hasHeadingText ? "PASS" : "FAIL",
      });

      // Assertions
      expect(
        hasH1 || hasH1Tag,
        "H1 element should be present in editor",
      ).toBeTruthy();
      expect(hasHeadingText, "Heading text should be present").toBeTruthy();
      expect(
        h1ButtonAfter || h1ButtonFinal,
        "H1 button should be active after formatting",
      ).toBeTruthy();
      expect(consoleErrors.length, "Should have no console errors").toBe(0);
    } catch (error) {
      console.error("Test failed with error:", error);
      await takeScreenshot(page, "error_state");
      throw error;
    }

    // Print final summary
    console.log("\n=== FINAL TEST SUMMARY ===");
    testResults.forEach((result) => {
      console.log(`\nStatus: ${result.status}`);
      console.log(`H1 Element Found: ${result.h1ElementFound}`);
      console.log(`H1 Tag in HTML: ${result.h1TagPresent}`);
      console.log(`Heading Text Present: ${result.headingTextPresent}`);
      console.log(`H1 Button Active: ${result.h1ButtonActiveAfterTyping}`);
      if (result.consoleErrors && result.consoleErrors.length > 0) {
        console.log(`Console Errors: ${result.consoleErrors.join(", ")}`);
      }
    });
  });
});
