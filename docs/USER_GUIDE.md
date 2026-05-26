# PARABLE — User guide

How to use the app, what the main features are, and practical workflows.

---

## 1. Getting started

1. **Open the app**  
   - Local dev default: **http://localhost:3003** (see `package.json`).  
   - Production: your deployed URL (e.g. AWS Amplify / Vercel).

2. **First screen**  
   - **`/`** is a short “flash” entry. If you’re **signed in** (Supabase), you’re sent to **`/my-sanctuary`**. If not, you go to **`/welcome`**, then **Login** or **Create account**.

3. **Account**  
   - Sign up / sign in sets your session; **Profile** and some features (groups, saved state) depend on Supabase being configured.

4. **Developers / operators**  
   - For full AI and groups: set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `OPENAI_API_KEY` (see `.env.example` and `README.md`). Live video needs LiveKit env vars if you use **`/live-studio`**.

---

## 2. Two experiences: main PARABLE vs Study AI

- **Default PARABLE**  
  Bottom nav: **Sanctuary** (`/my-sanctuary`), **Streamers**, **Play**, **Parables**, **Testify**, **Artists**, **Fellow**, **Profile** (the bar may show four icons at once—scroll if needed).

- **Study AI variant** (only if `NEXT_PUBLIC_APP_VARIANT=parable-study-ai`)  
  Accent becomes **amber**, landing uses Study AI flash, bottom nav becomes: **Sanctuary** → **`/sanctuary-reader`**, **Table**, **Lab**, **Dashboard**—focused on **reader + groups + lab**, not the full creator/play rail.

The rest of this guide assumes **default PARABLE** unless noted.

---

## 3. Global UI

- **Phone-style column**  
  Main app content is centered in a **~430px** column with a fixed **Header** on top and **BottomNav** on the bottom, aligned to that column.

- **Top Header**  
  Logo, avatar/identity, and a **horizontal link rail**: **Home**, **Play**, **Hubs**, **Streamers**, **Sanctuary** (`/my-sanctuary`). Use it when you need a quick jump and the bottom tab doesn’t match where you are.

- **Bottom nav**  
  Primary day-to-day navigation for the main app variant.

---

## 4. Core areas

### Sanctuary — `/my-sanctuary` (Bottom: “Sanctuary”)

Your **creator / personal hub**:

- Command-style header and entry points.  
- **Bio & Quick info** — editable **location, ministry/brand, mantra, mission**, optional **social URLs**; **Save** keeps **local storage** and syncs **Supabase `profiles`** when possible (mantra + mission map to **`bio`**).  
- Category / utility blocks.  
- **Testimony wall** — your testimonies (local storage tied to your identity where implemented).  
- Following / discovery for sanctuary-style channels.  
- **Live status** card.

**Tip:** Use this as your **home base**—keep bio and mission current, then branch to Streamers, Testify, or Play.

---

### Streamers — `/streamers`

**Going live and browsing channels:**

- **Go live** (top) → **`/live-studio`** (LiveKit when env is configured).  
- **Prep teleprompter** → **`/teleprompter`**.  
- Live **chips** and **Live rolodex** → **`/watch/[id]`**.  
- **AI Sanctuary** → **`/ai-sanctuary`**.  
- Featured spotlight, **Director Mode** (`/sunday`), **Open studio**.  
- **Flight deck** — links to Lab, Teleprompter, Sermon checker, Testify, Tiers, Browse.  
- Search and rows: For you / Trending / New / Following; **Browse by mood**.  
- Side areas: **AI Studio**, **Tools** drawer, **Broadcast mode**, **Creator shortcuts**.

**Tip:** Treat Streamers as **“I broadcast or discover live content.”**

---

### Play — `/play` (Bottom: “Play”)

**Unified game launcher:**

- Kingdom XP, squad, controller status, inventory strip.  
- Links to **`/streamer-hub`**, **`/play/engine`** (WebGPU / Three lab), **`/imago`**, **`/gaming`**, etc.  
- Game tiles from the play catalog.

**Tip:** **`/play`** = lobby; **Engine lab** for 3D experiments; **gaming** routes for faith-gaming content.

---

### Parables — `/parables`

Cinematic, story-style browsing (long-scroll experience).

---

### Testify — `/testify`

Community **testimony feed**, posts, reactions; related routes like **`/testify/[postId]`**, **`/testify/praise-breaks`** where present.

**Tip:** Pairs with **Streamers** and **Sanctuary** for live + story.

---

### Artists — `/music-hub` (Bottom: “Artists”)

Music / worship / artist-oriented hub.

---

### Fellow — `/fellowship`

Community and fellowship framing.

---

### Profile — `/profile`

Identity and links toward **settings** and related surfaces.

---

### Hubs — `/hubs` (Header)

Hub registry / progression style spaces.

---

## 5. Study, Scripture, and AI

| Area | Route | Purpose |
|------|--------|--------|
| Sanctuary Reader | `/sanctuary-reader` | Reading + **AI Scholar** (theory, decoder, steel man, sermon prep placeholder). |
| The Table | `/table`, `/table/[id]` | **Study groups** (requires Supabase schema). |
| Lab | `/lab` | Hub for theory tools and related links. |
| AI Studio | `/ai-studio` | Consolidated AI / creator tooling. |
| Sermon checker | `/sermon-checker` | Notes vs delivery style workflow. |
| Teleprompter | `/teleprompter` | Scrolling prompts for speaking. |

**APIs** (server needs `OPENAI_API_KEY`): `/api/scholar/theory`, `/api/scholar/decoder`, `/api/scholar/steelman`.

**Tip:** **Reader + Table + Lab** for study; **Teleprompter + Sermon checker** before **Live Studio** for a full prep → live loop.

---

## 6. Live video and watching

| Route | Role |
|--------|------|
| `/live-studio` | Broadcast / room (LiveKit when configured). |
| `/watch/[id]` | Watch flow for ids from the rolodex/chips. |
| `/browse` | Discover. |

---

## 7. Settings, giving, community

- **`/settings`** — preferences where implemented.  
- **`/contribution-tiers`** — giving / tiers.  
- **`/community`** — community entry from related flows.

---

## 8. Suggested workflows

1. Sign in → land on **`/my-sanctuary`**.  
2. Complete **Quick info** and **Save**.  
3. **Study:** `/sanctuary-reader` or `/table` + `/lab`.  
4. **Live:** `/streamers` → **Go live** → `/live-studio`; prep with `/teleprompter` and `/sermon-checker`.  
5. **Community:** `/testify`, `/fellowship`.  
6. **Play:** `/play` → linked games and hubs.  
7. Use the **Header** rail when you’re off the bottom-tab routes.

---

## 9. Limitations

- Some **viewer counts and channel lists** are **demo/placeholder** until backed by real data.  
- **Groups** need Supabase migrations (see `docs/SUPABASE_SETUP.md`, `README.md`).  
- **AI** needs **`OPENAI_API_KEY`**.  
- **Live video** needs **LiveKit** env vars for full studio behavior.

---

*For install and deploy steps, see **README.md** in the repo root.*
