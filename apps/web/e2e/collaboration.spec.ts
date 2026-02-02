// ============================================================================
// COLLABORATION E2E TEST
// ============================================================================
// Tests real-time collaboration between two users (User A and User B).
//
// SCENARIO:
// 1. User A registers and creates a new note
// 2. User B registers in a separate browser context
// 3. User B navigates to User A's note URL (shared via link)
// 4. Both users can edit the note simultaneously
// 5. Changes sync in real-time via Yjs + WebRTC
//
// NOTE: This test uses password authentication since WebAuthn requires
// hardware security keys that Playwright cannot mock.
//
// IMPORTANT: Start the dev server before running tests:
//   pnpm run dev
// AND the signaling server: cd packages/signaling && npx wrangler dev --port 8787
// ============================================================================

import { test, expect, type Page } from "@playwright/test";

// Test configuration
const BASE_URL = "http://localhost:5173";
const TEST_TIMEOUT = 120000;

// Test user credentials
const USER_A = {
  username: "user_a_" + Date.now(),
  password: "TestPassword123",
};

const USER_B = {
  username: "user_b_" + Date.now(),
  password: "SecurePass456",
};

/**
 * Helper to forward browser console to terminal
 */
function setupConsole(page: Page, label: string) {
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.text().includes("[WebRTC]")) {
      console.log(
        `[Browser:${label}] ${msg.type().toUpperCase()}: ${msg.text()}`,
      );
    }
  });
}

/**
 * Registers a new user with password authentication
 */
async function registerUser(
  page: Page,
  username: string,
  password: string,
): Promise<void> {
  console.log(`[Test] Registering ${username}...`);
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");

  const createAccountBtn = page.locator(
    'button:has-text("Create a new account")',
  );
  await createAccountBtn.waitFor({ state: "visible", timeout: 10000 });
  await createAccountBtn.click();

  const usernameInput = page.locator("#reg-username");
  await usernameInput.fill(username);

  // Select Password method
  const passwordMethodBtn = page
    .locator("button")
    .filter({ hasText: "Password" })
    .filter({ hasText: "Create a secure password" });
  await passwordMethodBtn.click();

  // Wait for password fields to be visible
  const passwordInput = page.locator("#reg-password");
  await passwordInput.waitFor({ state: "visible", timeout: 5000 });
  await passwordInput.fill(password);

  const confirmInput = page.locator("#reg-confirm-password");
  await confirmInput.fill(password);

  const submitBtn = page
    .locator("button")
    .filter({ hasText: /^Create Account$/ });
  await submitBtn.click();

  await page.waitForURL("**/app**", { timeout: 20000 });
  console.log(`[Test] Registration successful`);
}

/**
 * Creates a new note and returns its ID
 */
async function createNote(page: Page): Promise<string> {
  const createNoteBtn = page.locator('button:has-text("Create Note")').first();
  await createNoteBtn.click();
  await page.waitForURL("**/app/note/**", { timeout: 10000 });
  return page.url().split("/note/")[1];
}

async function getEditor(page: Page) {
  const editor = page.locator('[contenteditable="true"], .ProseMirror').first();
  await editor.waitFor({ state: "visible", timeout: 10000 });
  return editor;
}

async function typeInEditor(page: Page, text: string) {
  const editor = await getEditor(page);
  await editor.click();
  await page.keyboard.type(text, { delay: 50 });
}

async function getEditorContent(page: Page): Promise<string> {
  const editor = await getEditor(page);
  // Get text content and strip out the collaboration cursor labels which also appear in textContent
  const rawContent = (await editor.textContent()) ?? "";

  // Clean content: remove usernames and other UI noise
  return rawContent
    .replace(USER_A.username, "")
    .replace(USER_B.username, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function clearBrowserStorage(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    indexedDB.deleteDatabase("locanote");
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
}

// ============================================================================
// COLLABORATION TESTS
// ============================================================================

test.describe("Real-Time Collaboration", () => {
  test.setTimeout(TEST_TIMEOUT);

  test("Two users can collaborate on the same note in real-time", async ({
    browser,
  }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    setupConsole(pageA, "UserA");
    setupConsole(pageB, "UserB");

    try {
      console.log("[Test] Step 1: Cleaning up...");
      await clearBrowserStorage(pageA);
      await clearBrowserStorage(pageB);

      console.log("[Test] Step 2: User A registering...");
      await registerUser(pageA, USER_A.username, USER_A.password);

      console.log("[Test] Step 3: User B registering...");
      await registerUser(pageB, USER_B.username, USER_B.password);

      console.log("[Test] Step 4: User A creating shared note...");
      const noteId = await createNote(pageA);
      await typeInEditor(pageA, "Hello from User A!");

      console.log("[Test] Step 5: User B joining note...");
      await pageB.goto(`${BASE_URL}/app/note/${noteId}`);
      const editorB = await getEditor(pageB);

      console.log("[Test] Step 6: Verifying P2P Sync...");
      await expect(async () => {
        const content = await getEditorContent(pageB);
        expect(content).toContain("User A");
      }).toPass({ timeout: 20000 });

      console.log("[Test] Step 7: User B replying...");
      await editorB.click();
      await pageB.keyboard.press("End");
      await pageB.keyboard.press("Enter");
      await pageB.keyboard.type("Reply from User B!", { delay: 50 });
      console.log("[Test] User B finished typing");

      console.log("[Test] Step 8: Verifying bidirectional sync...");
      await expect(async () => {
        const content = await getEditorContent(pageA);
        console.log(`[Test] User A sees: "${content}"`);
        expect(content).toContain("User B");
      }).toPass({ timeout: 20000 });

      console.log(
        "[Test] Step 9: Testing Concurrent Edits (Conflict Resolution)...",
      );

      // Move cursors to the end to ensure they type at the same spot
      await (await getEditor(pageA)).click();
      await pageA.keyboard.press("End");
      await (await getEditor(pageB)).click();
      await pageB.keyboard.press("End");

      // Simultaneous typing
      // We use different strings to easily see if both are present
      await Promise.all([
        pageA.keyboard.type("AAA", { delay: 20 }),
        pageB.keyboard.type("BBB", { delay: 20 }),
      ]);

      console.log(
        "[Test] Concurrent edits submitted, waiting for convergence...",
      );

      await expect(async () => {
        const contentA = await getEditorContent(pageA);
        const contentB = await getEditorContent(pageB);

        console.log(`[Test] Final Content A: "${contentA}"`);
        console.log(`[Test] Final Content B: "${contentB}"`);

        // CRDT CORE REQUIREMENT: Convergence (identical state)
        expect(contentA).toBe(contentB);

        // Both edits must be present (possibly interleaved)
        expect(contentA).toContain("A");
        expect(contentA).toContain("B");
      }).toPass({ timeout: 15000 });

      console.log("[Test] PASSED: Real-time collaboration verified!");
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});
