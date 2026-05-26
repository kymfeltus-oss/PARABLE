# PARABLE

Main PARABLE web app (feed, sanctuary, play launcher, streamers, and more). Optional **Study AI** layout is available when `NEXT_PUBLIC_APP_VARIANT=parable-study-ai` is set.

---

## Run locally (while you register the domain)

**Port:** **3003** (see `package.json` scripts). Open this repo’s folder in your editor so you run the right project.

1. **Install and env**
   ```bash
   npm install
   cp .env.example .env.local
   ```
   On Windows PowerShell: `Copy-Item .env.example .env.local`
   Edit `.env.local` and set at least:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (auth + The Table)
   - `OPENAI_API_KEY` (AI Scholar: Theory Solver, De-Coder, Steel Man)

2. **Start the app**
   - Open this repo folder (e.g. `...\Downloads\PARABLE`).
   - Confirm package name: `Get-Content package.json | Select-String "name"` should show `"name": "parable"`.
   - Then run:
   ```bash
   npm run dev
   ```
   Open **http://localhost:3003** in your browser.

3. **Optional – production build on your machine**
   ```bash
   npm run build
   npm start
   ```
   (Start uses port 3003.)

---

## What’s built so far

### 1. Sanctuary (Reader) — `/sanctuary-reader`

- **Bible reader** – Sample passage (John 1:1–5) with translation badge and verse numbers.
- **AI Scholar sidebar** (four tabs):
  - **Theory Solver** – Ask a question about the passage; AI returns a synthesis (scripture, history, scholarly debate). Uses `POST /api/scholar/theory`.
  - **De-Coder** – Enter a word from the passage; AI returns Greek/Hebrew, transliteration, gloss, Strong’s, and contextual usages. Uses `POST /api/scholar/decoder`.
  - **Steel Man Debater** – “Generate two views” for the passage (e.g. Reformed vs Arminian) plus shared ground. Uses `POST /api/scholar/steelman`.
  - **Sermon Prep** – Placeholder (three analogies: Tech, Culture, Nature — coming soon).

Entry: **My Sanctuary** → “Open Sanctuary Reader”, or **Sanctuary Reader** header → “Open Lab” / “Groups”.

### 2. The Table (Groups) — `/table`

- **Your groups** – List groups you belong to (Supabase: `study_groups`, `study_group_members`).
- **Create group** – Modal: name + optional description; you’re added as host.
- **Group detail** – `/table/[id]`: name, description, placeholders for Plan, Chat, Temple.

Requires Supabase: run **`supabase/schema-profiles-and-groups.sql`** in the Supabase SQL Editor once (see **docs/SUPABASE_SETUP.md** for full setup from scratch).

### 3. The Lab — `/lab`

- Hub for **Theory Solver**, **Verse-to-Video Studio**, **Sermon Prep** (links to Sanctuary Reader; video/sermon tools “Coming soon”).

### 4. API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/scholar/theory` | POST | Theory Solver: `{ question, passageContext? }` → `{ answer }` |
| `/api/scholar/decoder` | POST | De-Coder: `{ word, verseRef?, verseText? }` → word breakdown JSON |
| `/api/scholar/steelman` | POST | Steel Man: `{ verseRef, verseText? }` → `{ sharedGround, viewA, viewB }` |
| `/api/livekit/token` | (existing) | LiveKit token for video |

All scholar routes use **OpenAI** (`gpt-4o-mini`) and require **`OPENAI_API_KEY`**.

---

## Deploy (Vercel)

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "PARABLE – update"
   git push origin main
   ```

2. **Vercel**
   - Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
   - Import your GitHub repo; framework preset **Next.js** (auto-detected).
   - **Environment variables** (Settings → Environment Variables) — add:
     - `OPENAI_API_KEY` – required for Theory Solver, De-Coder, Steel Man.
     - `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL.
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon key.
     - (Optional) `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` if you use live video.

3. **Deploy** – Vercel will build (`next build`) and deploy. Use the provided URL (e.g. `parable-xxx.vercel.app`).

4. **Supabase**
   - Run `supabase/schema-study-groups.sql` in the Supabase SQL Editor so **The Table** (create/list groups) works.

---

(To run locally, see **Run locally** at the top of this README.) Sign in, then try **My Sanctuary** → **Open Sanctuary Reader** → Theory Solver / De-Coder / Steel Man, and **The Table** → Create group.

---

## Tech stack

- **Next.js** (App Router), **React**, **TypeScript**, **Tailwind**
- **Supabase** – Auth, DB (groups), optional storage
- **OpenAI** – Scholar APIs (theory, decoder, steelman)
- **LiveKit** – Video (existing)
