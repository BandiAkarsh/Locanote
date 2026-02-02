import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Theme Visuals Audit", () => {
  test("Should apply and persist visual styles", async ({ page }) => {
    // 1. Visit landing page
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    // Check if dynamic gradient is present on body container
    const bodyContainer = page.locator(".bg-brand-gradient").first();
    await expect(bodyContainer).toBeVisible();

    // 2. Register/Login to get to settings (using existing logic)
    // We'll skip complex registration and just check the attribute injection

    // Test data-visual-theme injection
    await page.evaluate(() => {
      localStorage.setItem("locanote-style", "cyberpunk");
      window.location.reload();
    });

    await page.waitForLoadState("networkidle");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-visual-theme", "cyberpunk");

    // Check if background fragments are present
    const fragments = page.locator(".glass-fragments");
    await expect(fragments).toBeVisible();

    // Switch to Glass
    await page.evaluate(() => {
      localStorage.setItem("locanote-style", "glass");
      window.location.reload();
    });
    await expect(html).toHaveAttribute("data-visual-theme", "glass");

    // Switch to Inception
    await page.evaluate(() => {
      localStorage.setItem("locanote-style", "inception");
      window.location.reload();
    });
    await expect(html).toHaveAttribute("data-visual-theme", "inception");

    console.log("[Visual Audit] All 3 advanced themes injected successfully");
  });
});
