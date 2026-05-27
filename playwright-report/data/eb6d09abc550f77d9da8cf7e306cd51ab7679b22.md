# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: streamers-hub.spec.ts >> Streamers Hub — creator tools (/streamer-hub) >> teleprompter shortcut opens full page
- Location: tests\streamers-hub.spec.ts:102:7

# Error details

```
TimeoutError: locator.scrollIntoViewIfNeeded: Timeout 20000ms exceeded.
Call log:
  - waiting for locator('aside').filter({ hasText: 'Creator shortcuts' }).getByRole('button', { name: /teleprompter/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - img [ref=e7]
            - generic [ref=e9]: Global Pulse
          - generic [ref=e11]:
            - generic [ref=e12]: "\"PRAISE\""
            - generic [ref=e13]: "\"SANCTUARY\""
            - generic [ref=e14]: "\"HOPE\""
            - generic [ref=e15]: "\"AMEN\""
            - generic [ref=e16]: "\"WORSHIP\""
            - generic [ref=e17]: "\"PRAISE\""
            - generic [ref=e18]: "\"SANCTUARY\""
            - generic [ref=e19]: "\"HOPE\""
            - generic [ref=e20]: "\"AMEN\""
            - generic [ref=e21]: "\"WORSHIP\""
        - banner [ref=e22]:
          - generic [ref=e23]:
            - link "PARABLE" [ref=e25] [cursor=pointer]:
              - /url: /
            - link "Sign in" [ref=e27] [cursor=pointer]:
              - /url: /login
      - main [ref=e28]:
        - generic [ref=e31]:
          - navigation [ref=e32]:
            - generic [ref=e33]:
              - generic [ref=e34]:
                - link "Parable" [ref=e35] [cursor=pointer]:
                  - /url: /
                  - img "Parable" [ref=e36]
                - generic [ref=e40]: KYMFELTUS
              - generic [ref=e42]:
                - link "Home" [ref=e43] [cursor=pointer]:
                  - /url: /
                - link "Play" [ref=e44] [cursor=pointer]:
                  - /url: /play
                - link "Hubs" [ref=e45] [cursor=pointer]:
                  - /url: /hubs
                - link "Streamers" [ref=e46] [cursor=pointer]:
                  - /url: /streamers
                - link "Sanctuary" [ref=e47] [cursor=pointer]:
                  - /url: /sanctuary
          - main [ref=e48]:
            - generic [ref=e50]:
              - generic [ref=e51]:
                - generic [ref=e52]:
                  - img [ref=e55]
                  - generic [ref=e60]:
                    - generic [ref=e61]: kymfeltus
                    - generic [ref=e62]: Premium Creator • Authorized
                - generic [ref=e63]:
                  - generic [ref=e64]:
                    - generic [ref=e66]: STATUS
                    - generic [ref=e67]: READY
                  - button "Settings" [ref=e68]:
                    - generic [ref=e69]:
                      - text: Settings
                      - img [ref=e70]
              - generic [ref=e72]:
                - button "AI Studio" [ref=e73]
                - button "Community" [ref=e74]
            - generic [ref=e76]:
              - img [ref=e77]
              - textbox "Search streams, creators, categories…" [ref=e80]
              - button "Clear" [ref=e81]
            - generic [ref=e82]:
              - button "For You" [ref=e83]
              - button "Trending" [ref=e84]
              - button "New" [ref=e85]
              - button "Following" [ref=e86]
            - generic [ref=e87]:
              - generic [ref=e88]:
                - generic [ref=e89]:
                  - img [ref=e90]
                  - generic [ref=e91]: Mode
                - button "Go Live" [ref=e92]:
                  - generic [ref=e93]:
                    - img [ref=e94]
                    - text: Go Live
              - generic [ref=e97]:
                - button "Live Broadcast" [ref=e98]:
                  - generic [ref=e99]:
                    - img [ref=e100]
                    - generic [ref=e106]: Live Broadcast
                - button "Message & Study" [ref=e107]:
                  - generic [ref=e108]:
                    - img [ref=e109]
                    - generic [ref=e111]: Message & Study
                - button "Live Interaction" [ref=e112]:
                  - generic [ref=e113]:
                    - img [ref=e114]
                    - generic [ref=e116]: Live Interaction
            - generic [ref=e118]:
              - paragraph [ref=e119]: Featured
              - heading "Sanctuary Live Window" [level=2] [ref=e120]
              - paragraph [ref=e121]: Clean discovery + creator tools. Not crowded. Built to feel premium.
              - generic [ref=e122]:
                - generic [ref=e124]: STANDBY MODE
                - img [ref=e126]
                - generic [ref=e128]:
                  - button "Teleprompter" [ref=e129]
                  - button "Checker" [ref=e130]
              - generic [ref=e131]:
                - button "Open Teleprompter" [ref=e132]
                - button "Sermon Checker" [ref=e133]
            - generic [ref=e134]:
              - generic [ref=e135]:
                - generic [ref=e136]:
                  - img [ref=e137]
                  - paragraph [ref=e140]: For You
                - generic [ref=e141]: "4"
              - generic [ref=e143]:
                - button "Worship LIVE • 2.4k Kingdom Night Live Alpha Creator Watch 12k 940" [ref=e144]:
                  - generic [ref=e145]:
                    - generic [ref=e146]:
                      - generic [ref=e147]: Worship
                      - generic [ref=e148]: LIVE • 2.4k
                    - img [ref=e150]
                    - paragraph [ref=e152]: Kingdom Night Live
                    - paragraph [ref=e153]: Alpha Creator
                    - generic [ref=e154]:
                      - generic [ref=e155]: Watch
                      - generic [ref=e156]:
                        - generic [ref=e157]:
                          - img [ref=e158]
                          - text: 12k
                        - generic [ref=e160]:
                          - img [ref=e161]
                          - text: "940"
                - button "Study REPLAY Sermon Studio Beta Artist Watch 12k 940" [ref=e163]:
                  - generic [ref=e164]:
                    - generic [ref=e165]:
                      - generic [ref=e166]: Study
                      - generic [ref=e167]: REPLAY
                    - img [ref=e169]
                    - paragraph [ref=e171]: Sermon Studio
                    - paragraph [ref=e172]: Beta Artist
                    - generic [ref=e173]:
                      - generic [ref=e174]: Watch
                      - generic [ref=e175]:
                        - generic [ref=e176]:
                          - img [ref=e177]
                          - text: 12k
                        - generic [ref=e179]:
                          - img [ref=e180]
                          - text: "940"
                - button "Gaming LIVE • 980 Gaming for Ministry Zion Streamer Watch 12k 940" [ref=e182]:
                  - generic [ref=e183]:
                    - generic [ref=e184]:
                      - generic [ref=e185]: Gaming
                      - generic [ref=e186]: LIVE • 980
                    - img [ref=e188]
                    - paragraph [ref=e190]: Gaming for Ministry
                    - paragraph [ref=e191]: Zion Streamer
                    - generic [ref=e192]:
                      - generic [ref=e193]: Watch
                      - generic [ref=e194]:
                        - generic [ref=e195]:
                          - img [ref=e196]
                          - text: 12k
                        - generic [ref=e198]:
                          - img [ref=e199]
                          - text: "940"
                - button "Prayer REPLAY Prayer & Peace Sanctuary Host Watch 12k 940" [ref=e201]:
                  - generic [ref=e202]:
                    - generic [ref=e203]:
                      - generic [ref=e204]: Prayer
                      - generic [ref=e205]: REPLAY
                    - img [ref=e207]
                    - paragraph [ref=e209]: Prayer & Peace
                    - paragraph [ref=e210]: Sanctuary Host
                    - generic [ref=e211]:
                      - generic [ref=e212]: Watch
                      - generic [ref=e213]:
                        - generic [ref=e214]:
                          - img [ref=e215]
                          - text: 12k
                        - generic [ref=e217]:
                          - img [ref=e218]
                          - text: "940"
            - generic [ref=e220]:
              - paragraph [ref=e221]:
                - img [ref=e222]
                - text: Stewardship Analytics
              - generic [ref=e224]:
                - generic [ref=e225]:
                  - paragraph [ref=e226]: Support
                  - paragraph [ref=e227]: $2,450
                - generic [ref=e228]:
                  - paragraph [ref=e229]: Active
                  - paragraph [ref=e230]: 1.2k
            - generic [ref=e231]:
              - generic [ref=e232]:
                - paragraph [ref=e233]:
                  - img [ref=e234]
                  - text: Contribution Engine
                - button "View" [ref=e236]
              - generic [ref=e237]:
                - button "Entry Layer Free" [ref=e238]:
                  - generic [ref=e239]:
                    - img [ref=e241]
                    - generic [ref=e246]: Entry Layer
                  - generic [ref=e247]: Free
                - button "Mid Tier $9.99" [ref=e248]:
                  - generic [ref=e249]:
                    - img [ref=e251]
                    - generic [ref=e253]: Mid Tier
                  - generic [ref=e254]: $9.99
                - button "High Tier $24.99" [ref=e255]:
                  - generic [ref=e256]:
                    - img [ref=e258]
                    - generic [ref=e260]: High Tier
                  - generic [ref=e261]: $24.99
              - button "Sanctuary Growth Open giving & support controls." [ref=e262]:
                - img [ref=e264]
                - generic [ref=e266]:
                  - paragraph [ref=e267]: Sanctuary Growth
                  - paragraph [ref=e268]: Open giving & support controls.
    - navigation [ref=e272]:
      - link "Sanctuary" [ref=e273] [cursor=pointer]:
        - /url: /my-sanctuary
        - img [ref=e275]
        - generic [ref=e277]: Sanctuary
      - link "Streamers" [ref=e278] [cursor=pointer]:
        - /url: /streamers
        - img [ref=e280]
        - generic [ref=e282]: Streamers
      - link "Play" [ref=e283] [cursor=pointer]:
        - /url: /play
        - img [ref=e285]
        - generic [ref=e289]: Play
      - link "Parables" [ref=e290] [cursor=pointer]:
        - /url: /parables
        - img [ref=e292]
        - generic [ref=e294]: Parables
      - link "Artists" [ref=e295] [cursor=pointer]:
        - /url: /music-hub
        - img [ref=e297]
        - generic [ref=e301]: Artists
      - link "Fellow" [ref=e302] [cursor=pointer]:
        - /url: /fellowship
        - img [ref=e304]
        - generic [ref=e307]: Fellow
      - link "Profile" [ref=e308] [cursor=pointer]:
        - /url: /profile
        - img [ref=e310]
        - generic [ref=e313]: Profile
  - button "Open Next.js Dev Tools" [ref=e319] [cursor=pointer]:
    - img [ref=e320]
  - alert [ref=e323]
```

# Test source

```ts
  8   |   seedGuestScheduleEvent,
  9   |   scheduleApiAvailable,
  10  |   uniqueTitle,
  11  | } from "./fixtures/streamers-hub-helpers";
  12  | 
  13  | async function gotoStreamersHub(page: Page) {
  14  |   await page.goto(STREAMERS_HUB_PATH, { waitUntil: "domcontentloaded", timeout: 90_000 });
  15  |   await expect(page.getByRole("heading", { name: /top live categories/i })).toBeVisible({
  16  |     timeout: 60_000,
  17  |   });
  18  | }
  19  | 
  20  | async function gotoCreatorHub(page: Page) {
  21  |   await page.goto(STREAMER_CREATOR_HUB_PATH, { waitUntil: "domcontentloaded", timeout: 90_000 });
  22  |   await expect(page.getByRole("button", { name: /go live/i }).first()).toBeVisible({
  23  |     timeout: 60_000,
  24  |   });
  25  | }
  26  | 
  27  | async function skipIfScheduleApiUnavailable(
  28  |   request: APIRequestContext,
  29  |   baseURL: string | undefined,
  30  | ) {
  31  |   test.skip(!baseURL, "Playwright baseURL is required.");
  32  |   const probe = await fetchGuestSchedule(request, baseURL!);
  33  |   test.skip(
  34  |     !scheduleApiAvailable(probe),
  35  |     probe.error ?? "Schedule API unavailable (set SUPABASE_SERVICE_ROLE_KEY).",
  36  |   );
  37  | }
  38  | 
  39  | test.use({ viewport: { width: 1440, height: 900 } });
  40  | 
  41  | test.describe("Streamers Hub — discovery (/streamers)", () => {
  42  |   test("loads hero carousel, search, and category grid", async ({ page }) => {
  43  |     await gotoStreamersHub(page);
  44  | 
  45  |     await expect(page.getByRole("button", { name: /watch now/i }).first()).toBeVisible();
  46  |     const search = page.getByPlaceholder(/search live streams/i);
  47  |     await expect(search).toBeVisible();
  48  |     await expect(page.getByText("Worship", { exact: true }).first()).toBeVisible();
  49  |     await expect(page.getByRole("heading", { name: /recommended streams/i })).toBeVisible();
  50  | 
  51  |     await search.fill("Kingdom");
  52  |     const center = page.getByTestId("stream-center");
  53  |     await expect(
  54  |       center.getByRole("link", { name: /Gaming for Ministry/i }),
  55  |     ).toBeVisible({ timeout: 10_000 });
  56  |     await expect(
  57  |       center.getByRole("link", { name: /Gaming for Ministry/i }).getByText("Kingdom Gamer"),
  58  |     ).toBeVisible({ timeout: 10_000 });
  59  |   });
  60  | 
  61  |   test("filters the high-density grid when using the search bar", async ({ page }) => {
  62  |     await gotoStreamersHub(page);
  63  | 
  64  |     const searchInput = page.getByPlaceholder(/search live streams/i);
  65  |     await searchInput.fill("Kingdom");
  66  | 
  67  |     const center = page.getByTestId("stream-center");
  68  |     const channelCard = center.getByRole("link", { name: /Gaming for Ministry/i });
  69  |     await expect(channelCard).toBeVisible({ timeout: 10_000 });
  70  |     await expect(channelCard.getByText("Kingdom Gamer")).toBeVisible();
  71  |   });
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
> 108 |     await sermonShortcut.scrollIntoViewIfNeeded();
      |                          ^ TimeoutError: locator.scrollIntoViewIfNeeded: Timeout 20000ms exceeded.
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
  172 |     expect(seeded.event?.title).toBe(title);
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
```