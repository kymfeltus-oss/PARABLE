// tests/monetization-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("PARABLE End-to-End Monetization & Interface Verification", () => {
  test("User can load financial tiers and execute dynamic view toggling actions", async ({
    page,
  }) => {
    // 1. Navigate to the monetization tier catalog dashboard screen
    await page.goto("/contribution-tiers");
    await expect(page.locator("h1")).toContainText("Support the PARABLE Community");

    // 2. Validate that core premium tier cards are loaded from your Supabase migrations database
    const selectButtons = page.locator('button:has-text("Select level")');
    await expect(selectButtons.first()).toBeVisible();

    // 3. Move directly to a test live-stream room workspace view configuration
    await page.goto("/stream/test_broadcaster_4k");

    // 4. Confirm default Clean Mode layout is interactive and readable for non-gamers
    const toggleButton = page.locator('button:has-text("Switch to")');
    await expect(toggleButton).toBeVisible();
    await expect(page.locator("text=Welcome to the secure stream chat.")).toBeVisible();

    // 5. Click the toggle to switch into Gamer Mode and confirm high-energy gaming wrappers activate
    await toggleButton.click();
    await expect(toggleButton).toContainText("Clean Mode"); // Button text swaps options automatically
  });
});
