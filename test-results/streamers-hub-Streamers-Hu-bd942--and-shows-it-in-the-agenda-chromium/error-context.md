# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: streamers-hub.spec.ts >> Streamers Hub — dev guest operational dashboard >> creates a scheduled broadcast via API and shows it in the agenda
- Location: tests\streamers-hub.spec.ts:163:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Playwright Schedule 1779913523762"
Received: undefined
```

# Test source

```ts
  72  | 
  73  |   test("category card navigates to gaming hub", async ({ page }) => {
  74  |     await gotoStreamersHub(page);
  75  |     const gamingCard = page.getByRole("link").filter({ hasText: "Faith gaming" });
  76  |     await gamingCard.scrollIntoViewIfNeeded();
  77  |     await gamingCard.click();
  78  |     await expect(page).toHaveURL(/\/gaming/, { timeout: 15_000 });
  79  |   });
  80  | 
  81  |   test("recommended stream card opens watch page", async ({ page }) => {
  82  |     await gotoStreamersHub(page);
  83  |     const card = page.getByRole("link").filter({ hasText: "WORSHIP NIGHT LIVE" }).first();
  84  |     await expect(card).toBeVisible({ timeout: 15_000 });
  85  |     await card.click();
  86  |     await expect(page).toHaveURL(/\/watch\//);
  87  |   });
  88  | 
  89  |   test("sidebar channel opens watch route", async ({ page }) => {
  90  |     await gotoStreamersHub(page);
  91  |     await page
  92  |       .locator("aside")
  93  |       .getByRole("link")
  94  |       .filter({ hasText: "Gospel Vibe Collective" })
  95  |       .first()
  96  |       .click();
  97  |     await expect(page).toHaveURL(/\/watch\/lr1/);
  98  |   });
  99  | });
  100 | 
  101 | test.describe("Streamers Hub — creator tools (/streamer-hub)", () => {
  102 |   test("teleprompter shortcut opens full page", async ({ page }) => {
  103 |     await gotoCreatorHub(page);
  104 |     const sermonShortcut = page
  105 |       .locator("aside")
  106 |       .filter({ hasText: "Creator shortcuts" })
  107 |       .getByRole("button", { name: /teleprompter/i });
  108 |     await sermonShortcut.scrollIntoViewIfNeeded();
  109 |     await Promise.all([page.waitForURL(/\/teleprompter/), sermonShortcut.click()]);
  110 |   });
  111 | 
  112 |   test("sermon checker shortcut opens full page", async ({ page }) => {
  113 |     await gotoCreatorHub(page);
  114 |     const checkerShortcut = page
  115 |       .locator("aside")
  116 |       .filter({ hasText: "Creator shortcuts" })
  117 |       .getByRole("button", { name: /sermon checker/i });
  118 |     await checkerShortcut.scrollIntoViewIfNeeded();
  119 |     await Promise.all([
  120 |       page.waitForURL(/\/sermon-checker/),
  121 |       checkerShortcut.click(),
  122 |     ]);
  123 |   });
  124 | 
  125 |   test("broadcast mode opens Message & Study at The Table", async ({ page }) => {
  126 |     await gotoCreatorHub(page);
  127 |     const studyBtn = page
  128 |       .locator("aside")
  129 |       .filter({ hasText: "Broadcast mode" })
  130 |       .locator("button")
  131 |       .filter({ hasText: "Message & Study" });
  132 |     await studyBtn.scrollIntoViewIfNeeded();
  133 |     await Promise.all([page.waitForURL(/\/table/), studyBtn.click()]);
  134 |   });
  135 | 
  136 |   test("broadcast mode opens Live Interaction in Sanctuary", async ({ page }) => {
  137 |     await gotoCreatorHub(page);
  138 |     const interactionBtn = page
  139 |       .locator("aside")
  140 |       .filter({ hasText: "Broadcast mode" })
  141 |       .locator("button")
  142 |       .filter({ hasText: "Live Interaction" });
  143 |     await interactionBtn.scrollIntoViewIfNeeded();
  144 |     await Promise.all([page.waitForURL(/\/sanctuary/), interactionBtn.click()]);
  145 |   });
  146 | });
  147 | 
  148 | test.describe("Streamers Hub — dev guest operational dashboard", () => {
  149 |   test.describe.configure({ mode: "serial" });
  150 | 
  151 |   test("guest dashboard loads schedule form and agenda", async ({ page, request, baseURL }) => {
  152 |     await skipIfScheduleApiUnavailable(request, baseURL);
  153 | 
  154 |     await page.goto(STREAMER_DASHBOARD_PATH, { waitUntil: "domcontentloaded" });
  155 | 
  156 |     await expect(
  157 |       page.getByRole("heading", { name: /streamer operational hub/i }),
  158 |     ).toBeVisible({ timeout: 60_000 });
  159 |     await expect(page.getByPlaceholder(/wednesday night bible study/i)).toBeVisible();
  160 |     await expect(page.getByRole("button", { name: /publish event card/i })).toBeVisible();
  161 |   });
  162 | 
  163 |   test("creates a scheduled broadcast via API and shows it in the agenda", async ({
  164 |     page,
  165 |     request,
  166 |     baseURL,
  167 |   }) => {
  168 |     await skipIfScheduleApiUnavailable(request, baseURL);
  169 | 
  170 |     const title = uniqueTitle("Playwright Schedule");
  171 |     const seeded = await seedGuestScheduleEvent(request, baseURL!, title);
> 172 |     expect(seeded.event?.title).toBe(title);
      |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  173 | 
  174 |     await page.goto(STREAMER_DASHBOARD_PATH, { waitUntil: "domcontentloaded" });
  175 | 
  176 |     const row = page.locator(".divide-y > div").filter({ hasText: title });
  177 |     await expect(row).toBeVisible({ timeout: 15_000 });
  178 |     await expect(row).toContainText(/starts:/i);
  179 |     await expect(row).toContainText(/min session/i);
  180 |   });
  181 | 
  182 |   test("amen reaction on stream increments dashboard counter", async ({
  183 |     browser,
  184 |     request,
  185 |     baseURL,
  186 |   }) => {
  187 |     await skipIfScheduleApiUnavailable(request, baseURL);
  188 | 
  189 |     const seed = await seedGuestScheduleEvent(
  190 |       request,
  191 |       baseURL!,
  192 |       uniqueTitle("Amen pulse setup"),
  193 |     );
  194 |     expect(seed.event?.id).toBeTruthy();
  195 | 
  196 |     const dashboard = await browser.newPage();
  197 |     const stream = await browser.newPage();
  198 | 
  199 |     await dashboard.goto(STREAMER_DASHBOARD_PATH, { waitUntil: "domcontentloaded" });
  200 |     const counter = dashboard.locator(".font-mono.text-5xl").first();
  201 |     await expect(counter).toHaveText("0", { timeout: 60_000 });
  202 | 
  203 |     await stream.goto(`/stream/${GUEST_USER_ID}`, { waitUntil: "domcontentloaded" });
  204 | 
  205 |     const amenBtn = stream.getByRole("button", {
  206 |       name: /trigger global community amen reaction/i,
  207 |     });
  208 |     const amenReady = await amenBtn
  209 |       .isVisible({ timeout: 45_000 })
  210 |       .catch(() => false);
  211 | 
  212 |     if (!amenReady) {
  213 |       test.skip(
  214 |         true,
  215 |         "Stream workspace did not load (LiveKit viewer token or profile required).",
  216 |       );
  217 |     }
  218 | 
  219 |     await amenBtn.click();
  220 |     await expect(counter).toHaveText("1", { timeout: 20_000 });
  221 | 
  222 |     await dashboard.close();
  223 |     await stream.close();
  224 |   });
  225 | });
  226 | 
  227 | test.describe("Streamers Hub — go-live gate", () => {
  228 |   test("start stream shows login redirect or live studio feedback", async ({ page }) => {
  229 |     const guestEnabled = await page.request
  230 |       .get("/api/auth/guest-preview")
  231 |       .then((r) => r.json())
  232 |       .then((j: { guest?: boolean }) => j.guest === true)
  233 |       .catch(() => false);
  234 | 
  235 |     test.skip(
  236 |       guestEnabled,
  237 |       "Dev guest profile is active in e2e; use a real unauthenticated session to assert /login redirect.",
  238 |     );
  239 | 
  240 |     await gotoCreatorHub(page);
  241 |     await page.getByRole("button", { name: "Start stream" }).first().click();
  242 |     await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  243 |   });
  244 | });
  245 | 
  246 | test.describe("Streamers Hub — recommended sidebar", () => {
  247 |   test("lists live channels from discovery API", async ({ page }) => {
  248 |     await gotoStreamersHub(page);
  249 | 
  250 |     const sidebar = page.getByTestId("stream-sidebar");
  251 |     await expect(sidebar).toBeVisible();
  252 |     await expect(sidebar.getByText("Recommended")).toBeVisible();
  253 |     await expect(sidebar.getByText("Gospel Vibe Collective")).toBeVisible({ timeout: 15_000 });
  254 |     await expect(sidebar.getByText("WORSHIP")).toBeVisible();
  255 |   });
  256 | });
  257 | 
  258 | test.describe("Streamers Hub — viewport shell", () => {
  259 |   test("mobile: full-bleed workspace, bottom nav, sidebar off-canvas", async ({ page }) => {
  260 |     await page.setViewportSize({ width: 390, height: 844 });
  261 |     await gotoStreamersHub(page);
  262 | 
  263 |     await expect(page.getByTestId("stream-workspace")).toBeVisible();
  264 |     await expect(page.getByTestId("stream-center")).toBeVisible();
  265 |     await expect(page.getByTestId("stream-sidebar")).toBeHidden();
  266 |     await expect(page.getByTestId("app-bottom-nav")).toBeVisible();
  267 |     await expect(page.getByTestId("stream-hero-carousel")).toBeVisible();
  268 |   });
  269 | 
  270 |   test("tablet: workspace visible with collapsible sidebar rail", async ({ page }) => {
  271 |     await page.setViewportSize({ width: 768, height: 1024 });
  272 |     await gotoStreamersHub(page);
```