# Supabase setup for PARABLE (from scratch)

Do this once. Then put the URL and anon key in your `.env.local`.

---

## 1. Create a Supabase project

1. Go to **[supabase.com](https://supabase.com)** and sign in (or create an account).
2. Click **New project**.
3. Pick an **organization** (or create one).
4. Set:
   - **Name:** e.g. `parable` or `parable-study`
   - **Database password:** choose a strong password and **save it** (you need it for DB access later).
   - **Region:** pick one close to you.
5. Click **Create new project** and wait until it’s ready (1–2 minutes).

---

## 2. Get your API keys

1. In the left sidebar, open **Project Settings** (gear icon).
2. Click **API** in the left menu.
3. You’ll see:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **Project API keys** → **anon public**
4. Copy:
   - **Project URL** → put in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → put in `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Create the “avatars” storage bucket (for profile photos)

1. In the left sidebar, click **Storage**.
2. Click **New bucket**.
3. **Name:** `avatars`
4. Leave **Public bucket** **on** (so profile images can be shown).
5. Click **Create bucket**.

(If you skip this, sign-up with a profile photo may fail; the rest of the app can still work.)

---

## 4. Run the database script (profiles + study groups)

1. In the left sidebar, click **SQL Editor**.
2. Click **New query**.
3. Open the file **`supabase/schema-profiles-and-groups.sql`** from your PARABLE project (in Cursor or Notepad).
4. Copy **all** of its contents and paste into the Supabase SQL Editor.
5. Click **Run** (or press Ctrl+Enter).
6. You should see “Success. No rows returned.” (or similar). That means the `profiles` table and the study groups tables are created.

---

## 5. Auth (sign up / sign in)

PARABLE uses Supabase project **`parable-app`** (`rmerwwmamddqrqtxvkrx`).

- **Email** auth: **Authentication** → **Sign In / Providers** → **Email** → **Enabled**
- **Allow new users to sign up:** ON
- To allow sign-up without confirming email (useful for local dev):
  1. On the same page, turn **Confirm email** **OFF** for instant sign-in during development.
- **URL Configuration** (**Authentication** → **URL Configuration**):
  - **Site URL (local):** `http://localhost:3003`
  - **Redirect URLs:** add:
    - `http://localhost:3003/auth/callback`
    - `https://parablestream.com/auth/callback`
    - `https://www.parablestream.com/auth/callback`
    - `https://parablestreaming.com/auth/callback`
    - `https://www.parablestreaming.com/auth/callback`

---

## 6. Put keys in your app

In your project folder, edit **`.env.local`** and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

Restart the dev server (`npm run dev`) after changing env vars.

---

## Done

- **Sign up** in the app (Create Account) and **sign in** (Login).
- **Sanctuary Reader** and **AI Scholar** work with only `OPENAI_API_KEY` in `.env.local`; they don’t need Supabase.
- **The Table** (groups) needs Supabase and the script in step 4.

If something fails, check the Supabase **Logs** (e.g. Auth logs, Postgres logs) for errors.
