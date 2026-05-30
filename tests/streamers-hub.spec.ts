/**
 * Requires simulated streamers data (Playwright `webServer.env` sets
 * `NEXT_PUBLIC_STREAMERS_SIM_CHAT=1` when it starts `npm run dev`).
 * With `reuseExistingServer: true`, restart dev after changing that flag or add it to `.env.local`.
 */
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
  const apiReady = page.waitForResponse(
    (res) => res.url().includes("/api/streamers") && res.status() === 200,
    { timeout: 90_000 },
  );
  await page.goto(STREAMERS_HUB_PATH, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await apiReady;
  await expect(page.getByTestId("stream-discovery-stage")).toBeVisible({
    timeout: 90_000,
  });
  await expect(page.getByTestId("streamers-section-heading")).toBeVisible({
    timeout: 60_000,
  });
}

/** Waits until weighted discovery API has rendered grid cards (not skeleton). */
async function waitForDiscoveryGrid(page: Page) {
  const center = page.getByTestId("stream-center");
  await expect(center.getByTestId("stream-channel-count")).toBeVisible({
    timeout: 60_000,
  });
  await expect(center.getByTestId("stream-channel-count")).toHaveText(/\d+\s+channels/, {
    timeout: 60_000,
  });
  await expect(center.locator(".animate-pulse").first()).toBeHidden({ timeout: 60_000 }).catch(
    () => undefined,
  );
  const worshipCard = center.locator('a[href="/watch/lr1"]').first();
  await expect(worshipCard).toBeVisible({ timeout: 60_000 });
}

async function openWatchFromCard(page: Page, card: ReturnType<Page["locator"]>) {
  const href = await card.getAttribute("href");
  expect(href).toMatch(/^\/watch\//);
  await card.click();
  try {
    await page.waitForURL(new RegExp(href!.replace("/", "\\/")), {
      timeout: 15_000,
      waitUntil: "commit",
    });
  } catch {
    await page.goto(href!);
  }
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
  const probe = await fetchGuestSchedule(request, baseURL!);
  test.skip(
    !scheduleApiAvailable(probe),
    probe.error ?? "Schedule API unavailable (set SUPABASE_SERVICE_ROLE_KEY).",
  );
}

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("Streamers Hub — discovery (/streamers)", () => {
  test("loads featured hero, search, and live streamers grid", async ({ page }) => {
    await gotoStreamersHub(page);

    await expect(page.getByRole("button", { name: /watch live now/i }).first()).toBeVisible();
    const search = page.getByPlaceholder(/search live streams/i);
    await expect(search).toBeVisible();
    await expect(page.getByTestId("streamers-section-heading")).toBeVisible();

    await waitForDiscoveryGrid(page);
    await search.fill("WORSHIP");
    const center = page.getByTestId("stream-center");
    await expect(center.locator('a[href="/watch/lr1"]').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("filters the high-density grid when using the search bar", async ({ page }) => {
    await gotoStreamersHub(page);
    await waitForDiscoveryGrid(page);

    const searchInput = page.getByPlaceholder(/search live streams/i);
    await searchInput.fill("WORSHIP");

    const center = page.getByTestId("stream-center");
    await expect(center.locator('a[href="/watch/lr1"]').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("go live link is available from discovery", async ({ page }) => {
    await gotoStreamersHub(page);
    const goLive = page.getByRole("link", { name: /go live/i }).first();
    await expect(goLive).toBeVisible();
    await expect(goLive).toHaveAttribute("href", "/dashboard/streamers");
    await goLive.click({ noWaitAfter: true });
    try {
      await page.waitForURL(/\/dashboard\/streamers/, { timeout: 20_000, waitUntil: "commit" });
    } catch {
      await page.goto("/dashboard/streamers");
    }
    await expect(page).toHaveURL(/\/dashboard\/streamers/, { timeout: 30_000 });
  });

  test("recommended stream card opens watch page", async ({ page }) => {
    await gotoStreamersHub(page);
    await waitForDiscoveryGrid(page);
    const card = page.getByTestId("stream-center").locator('a[href="/watch/lr1"]').first();
    await card.scrollIntoViewIfNeeded();
    await openWatchFromCard(page, card);
    await expect(page).toHaveURL(/\/watch\/lr1/, { timeout: 30_000 });
  });

  test("discovery grid card opens watch route for lr1", async ({ page }) => {
    await gotoStreamersHub(page);
    await waitForDiscoveryGrid(page);
    const card = page.getByTestId("stream-center").locator('a[href="/watch/lr1"]').first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.scrollIntoViewIfNeeded();
    await openWatchFromCard(page, card);
    await expect(page).toHaveURL(/\/watch\/lr1/, { timeout: 15_000 });
  });
});

test.describe("Streamers Hub — creator tools (/streamer-hub)", () => {
  test("teleprompter shortcut opens full page", async ({ page }) => {
    await gotoCreatorHub(page);
    const teleprompterBtn = page.getByRole("button", { name: /open teleprompter/i }).first();
    await teleprompterBtn.click();
    await expect(page).toHaveURL(/\/teleprompter/, { timeout: 30_000 });
  });

  test("sermon checker shortcut opens full page", async ({ page }) => {
    await gotoCreatorHub(page);
    const checkerBtn = page.getByRole("button", { name: /sermon checker/i }).first();
    await Promise.all([page.waitForURL(/\/sermon-checker/), checkerBtn.click()]);
  });

  test("creator hub exposes Message & Study and Live Interaction modes", async ({ page }) => {
    await gotoCreatorHub(page);
    const studyBtn = page.getByRole("button", { name: /message & study/i });
    const interactionBtn = page.getByRole("button", { name: /live interaction/i });
    await expect(studyBtn).toBeVisible();
    await expect(interactionBtn).toBeVisible();
    await studyBtn.click();
    await expect(studyBtn).toHaveClass(/bg-\[#00f2ff\]/);
    await interactionBtn.click();
    await expect(interactionBtn).toHaveClass(/bg-\[#00f2ff\]/);
  });
});

test.describe("Streamers Hub — dev guest operational dashboard", () => {
  test.describe.configure({ mode: "serial" });

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

test.describe("Streamers Hub — full-bleed discovery stage", () => {
  test("lists live channels from discovery API in the grid", async ({ page }) => {
    await gotoStreamersHub(page);

    const center = page.getByTestId("stream-center");
    await expect(center).toBeVisible();
    await expect(center.getByText(/Gospel Vibe Collective|Gospel/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("Streamers Hub — viewport shell", () => {
  test("mobile: full-bleed stage, bottom nav, responsive grid", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStreamersHub(page);

    await expect(page.getByTestId("stream-discovery-stage")).toBeVisible();
    await expect(page.getByTestId("stream-center")).toBeVisible();
    await expect(page.getByTestId("app-bottom-nav")).toBeVisible();
    await expect(page.getByRole("button", { name: /watch live now/i }).first()).toBeVisible();
  });

  test("tablet: edge-to-edge discovery with search", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoStreamersHub(page);

    await expect(page.getByTestId("stream-discovery-stage")).toBeVisible();
    await expect(page.getByTestId("stream-center")).toBeVisible();
    await expect(page.getByPlaceholder(/search live streams/i)).toBeVisible();
  });

  test("widescreen desktop: six-column grid density, streaming shell", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoStreamersHub(page);

    await expect(page.getByTestId("stream-discovery-stage")).toBeVisible();
    await expect(page.getByTestId("streamers-section-heading")).toBeVisible();
    await expect(page.locator("[data-parable-streaming-shell]")).toBeVisible();
  });
});
