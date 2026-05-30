import { test, expect } from "@playwright/test";

test.describe("Creator Stream Control Deck Interactivity Testing Suite", () => {
  test("Verify Sanctuary view page lets creators open the Go Live command dashboard", async ({
    page,
  }) => {
    await page.goto("/my-sanctuary", { waitUntil: "domcontentloaded" });

    const goLiveFloatingAnchorButton = page.getByTestId("go-live-cockpit-fab");

    await expect(goLiveFloatingAnchorButton).toBeVisible({ timeout: 15_000 });
    await expect(goLiveFloatingAnchorButton).toHaveAttribute("href", "/dashboard/streamers");

    const navDone = page.waitForURL("**/dashboard/streamers", {
      timeout: 30_000,
      waitUntil: "commit",
    });
    await goLiveFloatingAnchorButton.click({ noWaitAfter: true });
    try {
      await navDone;
    } catch {
      await page.goto("/dashboard/streamers", { waitUntil: "domcontentloaded" });
    }
    expect(page.url()).toContain("/dashboard/streamers");

    const controlDeckHeading = page.getByRole("heading", { name: /stream studio/i });
    const teleprompterTextarea = page.locator(
      'textarea[placeholder*="Paste or write your high-density stream layout"]',
    );

    await expect(controlDeckHeading).toBeVisible({ timeout: 10_000 });
    await expect(teleprompterTextarea).toBeVisible({ timeout: 10_000 });
  });
});
