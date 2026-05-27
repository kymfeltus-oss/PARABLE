import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import {
  GUEST_USER_ID,
  STREAMERS_HUB_PATH,
  STREAMER_CREATOR_HUB_PATH,
  STREAMER_DASHBOARD_PATH,
  fetchGuestSchedule,
  seedGuestScheduleEvent,
  scheduleApiAvailable,
  uniqueTitle,
} from "./fixtures/streamers-hub-helpers";

async function gotoStreamersHub(page: Page) {
  await page.goto(STREAMERS_HUB_PATH, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await expect(page.getByRole("heading", { name: /top live categories/i })).toBeVisible({
    timeout: 60_000,
  });
}

async function gotoCreatorHub(page: Page) {
  await page.goto(STREAMER_CREATOR_HUB_PATH, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await expect(page.getByRole("button", { name: /go live/i }).first()).toBeVisible({
    timeout: 60_000,
  });
}

async function skipIfScheduleApiUnavailable(
  request: APIRequestContext,
  baseURL: string | undefined,
) {
  test.skip(!baseURL, "Playwright baseURL is required.");
  const probe = await fetchGuestSchedule(request, baseURL);
  test.skip(
    !scheduleApiAvailable(probe),
    probe.error ?? "Schedule API unavailable (set SUPABASE_SERVICE_ROLE_KEY).",
  );
}

test.describe.configure({ mode: "serial" });

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("Streamers Hub — discovery (/streamers)", () => {
  test("loads hero carousel, search, and category grid", async ({ page }) => {
    await gotoStreamersHub(page);

    await expect(page.getByRole("button", { name: /watch now/i }).first()).toBeVisible();
    const search = page.getByPlaceholder(/search live streams/i);
    await expect(search).toBeVisible();
    await expect(page.getByText("Worship", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /recommended streams/i })).toBeVisible();

    await search.fill("Zion");
    await expect(page.getByText("Gaming for Ministry")).toBeVisible({ timeout: 10_000 });
  });

  test("category card navigates to gaming hub", async ({ page }) => {
    await gotoStreamersHub(page);
    const gamingCard = page.getByRole("link").filter({ hasText: "Faith gaming" });
    await gamingCard.scrollIntoViewIfNeeded();
    await gamingCard.click();
    await expect(page).toHaveURL(/\/gaming/, { timeout: 15_000 });
  });

  test("recommended stream card opens watch page", async ({ page }) => {
    await gotoStreamersHub(page);
    const card = page.getByRole("button").filter({ hasText: "WORSHIP NIGHT LIVE" }).first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.click();
    await expect(page).toHaveURL(/\/watch\//);
  });

  test("sidebar channel opens watch route", async ({ page }) => {
    await gotoStreamersHub(page);
    await page
      .locator("aside")
      .getByRole("button")
      .filter({ hasText: "Gospel Vibe Collective" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/watch\/lr1/);
  });
});

test.describe("Streamers Hub — creator tools (/streamer-hub)", () => {
  test("teleprompter shortcut opens full page", async ({ page }) => {
    await gotoCreatorHub(page);
    const sermonShortcut = page
      .locator("aside")
      .filter({ hasText: "Creator shortcuts" })
      .getByRole("button", { name: /teleprompter/i });
    await sermonShortcut.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL(/\/teleprompter/), sermonShortcut.click()]);
  });

  test("sermon checker shortcut opens full page", async ({ page }) => {
    await gotoCreatorHub(page);
    const checkerShortcut = page
      .locator("aside")
      .filter({ hasText: "Creator shortcuts" })
      .getByRole("button", { name: /sermon checker/i });
    await checkerShortcut.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/sermon-checker/),
      checkerShortcut.click(),
    ]);
  });

  test("broadcast mode opens Message & Study at The Table", async ({ page }) => {
    await gotoCreatorHub(page);
    const studyBtn = page
      .locator("aside")
      .filter({ hasText: "Broadcast mode" })
      .locator("button")
      .filter({ hasText: "Message & Study" });
    await studyBtn.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL(/\/table/), studyBtn.click()]);
  });

  test("broadcast mode opens Live Interaction in Sanctuary", async ({ page }) => {
    await gotoCreatorHub(page);
    const interactionBtn = page
      .locator("aside")
      .filter({ hasText: "Broadcast mode" })
      .locator("button")
      .filter({ hasText: "Live Interaction" });
    await interactionBtn.scrollIntoViewIfNeeded();
    await Promise.all([page.waitForURL(/\/sanctuary/), interactionBtn.click()]);
  });
});

test.describe("Streamers Hub — dev guest operational dashboard", () => {
  test("guest dashboard loads schedule form and agenda", async ({ page, request, baseURL }) => {
    await skipIfScheduleApiUnavailable(request, baseURL);

    await page.goto(STREAMER_DASHBOARD_PATH, { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: /streamer operational hub/i }),
    ).toBeVisible({ timeout: 60_000 });
    await expect(page.getByPlaceholder(/wednesday night bible study/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /publish event card/i })).toBeVisible();
  });

  test("creates a scheduled broadcast via API and shows it in the agenda", async ({
    page,
    request,
    baseURL,
  }) => {
    await skipIfScheduleApiUnavailable(request, baseURL);

    const title = uniqueTitle("Playwright Schedule");
    const seeded = await seedGuestScheduleEvent(request, baseURL!, title);
    expect(seeded.event?.title).toBe(title);

    await page.goto(STREAMER_DASHBOARD_PATH, { waitUntil: "domcontentloaded" });

    const row = page.locator(".divide-y > div").filter({ hasText: title });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row).toContainText(/starts:/i);
    await expect(row).toContainText(/min session/i);
  });

  test("amen reaction on stream increments dashboard counter", async ({
    browser,
    request,
    baseURL,
  }) => {
    await skipIfScheduleApiUnavailable(request, baseURL);

    const seed = await seedGuestScheduleEvent(
      request,
      baseURL!,
      uniqueTitle("Amen pulse setup"),
    );
    expect(seed.event?.id).toBeTruthy();

    const dashboard = await browser.newPage();
    const stream = await browser.newPage();

    await dashboard.goto(STREAMER_DASHBOARD_PATH, { waitUntil: "domcontentloaded" });
    const counter = dashboard.locator(".font-mono.text-5xl").first();
    await expect(counter).toHaveText("0", { timeout: 60_000 });

    await stream.goto(`/stream/${GUEST_USER_ID}`, { waitUntil: "domcontentloaded" });

    const amenBtn = stream.getByRole("button", {
      name: /trigger global community amen reaction/i,
    });
    const amenReady = await amenBtn
      .isVisible({ timeout: 45_000 })
      .catch(() => false);

    if (!amenReady) {
      test.skip(
        true,
        "Stream workspace did not load (LiveKit viewer token or profile required).",
      );
    }

    await amenBtn.click();
    await expect(counter).toHaveText("1", { timeout: 20_000 });

    await dashboard.close();
    await stream.close();
  });
});

test.describe("Streamers Hub — go-live gate", () => {
  test("start stream shows login redirect or live studio feedback", async ({ page }) => {
    const guestEnabled = await page.request
      .get("/api/auth/guest-preview")
      .then((r) => r.json())
      .then((j: { guest?: boolean }) => j.guest === true)
      .catch(() => false);

    test.skip(
      guestEnabled,
      "Dev guest profile is active in e2e; use a real unauthenticated session to assert /login redirect.",
    );

    await gotoCreatorHub(page);
    await page.getByRole("button", { name: "Start stream" }).first().click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});

test.describe("Streamers Hub — recommended sidebar", () => {
  test("lists live channels from discovery API", async ({ page }) => {
    await gotoStreamersHub(page);

    const sidebar = page.locator("aside").filter({ hasText: "Recommended Channels" });
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText("Gospel Vibe Collective")).toBeVisible({ timeout: 15_000 });
    await expect(sidebar.getByText("WORSHIP")).toBeVisible();
  });
});
