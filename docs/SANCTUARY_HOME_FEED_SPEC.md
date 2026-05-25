# MASTER SPECIFICATION: My Sanctuary Home Feed & Simulation Engine

Anchor document for `/my-sanctuary` — home timeline, stories tray, ticketing desk, and demo persona merge.

## 0. Main Controller Flow

```
[ APP MAIN CONTROLLER ENTRY ]
              │
              ▼
[ GET /my-sanctuary DASHBOARD ]
              │
    ┌─────────┴─────────┐
    ▼                   ▼
[ DATABASE RE-QUERY ]   [ SESSION INTERACTION MONITOR ]
├── profiles is_live    ├── ticket ownership array (registrations)
├── stories < 24h       └── currentUserId local state
└── posts paginated
              │
              ▼
[ LAYOUT DESK: TWO-COLUMN DISPATCH ]
    ┌─────────┴─────────┐
    ▼ (Left)            ▼ (Right)
Stories + Post Grid     Ticketed Broadcast Console
```

| Engine block | Implementation |
|--------------|----------------|
| Database re-query | `home-data.ts` → `fetchSanctuaryHomePayload` + `loadMoreSanctuaryHomePosts` |
| Session monitor | `MySanctuaryHomeServer` auth + `registeredEventIds` state |
| Left column | `SanctuaryHomeStoriesStrip` + `SanctuaryHomeFeed` timeline |
| Right column | Ticketed Actions sidebar + modal → `sanctuary_event_registrations` |

## 1. Core Architecture

| Item | Value |
|------|--------|
| **Route** | `/my-sanctuary` — main social + media timeline |
| **Entry** | `app/my-sanctuary/page.tsx` → `MySanctuaryHomeServer` → `MySanctuaryHomeClientView` → `SanctuaryHomeFeed` |
| **Hybrid mode** | `NEXT_PUBLIC_SANCTUARY_HOME_MODE=hybrid` (default) — real DB rows + demo personas |
| **Safety** | Do not break auth session wrappers, `getProfileLayout`, or global layout headers |

### Hybrid data flow

```
Supabase (posts, live profiles, events, stories, registrations)
        ↓
MySanctuaryHomeServer  — server prefetch
        ↓
MySanctuaryHomeClientView  — useFeed + useSanctuaryStories (live refresh)
        ↓
buildMergedHomeFeed()  — merge with demo-personas.ts
        ↓
SanctuaryHomeFeed + SanctuaryHomeStoriesStrip
```

## 2. Interactive Elements & Button Mapping

| UI | Action | Route / outcome |
|----|--------|-----------------|
| **Tray — neon pulse (`is_live`)** | Tap bubble | `/stream/[userId]` |
| **Tray — cyan ring (`has_story`)** | Tap bubble | Full-screen `StoryModalViewer` |
| **Tray — first bubble (+ badge)** | Tap | File picker → `/api/stories` (≤10 MB) |
| **Post heart** | Tap | Optimistic ±1; sync `post_likes` (real posts only) |
| **Post image double-tap** | Double tap | Heart burst animation + like (real posts persist) |
| **Post comment icon** | Tap | Slide-up comment sheet (`CommentSection`) |
| **Post video overlay (TV icon)** | Tap | `/parables/[postId]` autoplay |
| **Get Pass** | Tap | Secure Ticket Verification modal |
| **Authorize Access & Pay** | Tap | Insert `sanctuary_event_registrations` → `✓ Registered` badge |

### Design palette

- Canvas: `#01040A` · Panels: `#020712` / `#06111E`
- Accent: `#00F2FE` · Secondary: `#0EA5E9`
- Liked heart: `#EF4444` · Registered badge: emerald

## 3. Database Sync Matrix

Logical spec names map to **production tables in this repo**:

| Spec name | Production table / source | Notes |
|-----------|---------------------------|--------|
| `sanctuary_posts` | `public.posts` + `post_likes` / `post_comments` | Feed timeline; `post_type` image/video |
| `sanctuary_live_streams` | `public.profiles` (`is_live = true`) | Tray live rings; stream route uses profile id |
| `sanctuary_stories` | `public.stories` + `story_views` | 24h expiry; see `schema-stories.sql` |
| `sanctuary_events` | `public.sanctuary_events` | Optional; run `schema-sanctuary-home.sql` |
| `sanctuary_event_registrations` | `public.sanctuary_event_registrations` | See `schema-sanctuary-event-registrations.sql` |

### Demo simulation accounts (app-wide)

Five personas in `src/lib/demo-personas.ts` — used when hybrid mode fills empty feed/tray:

- `pastor_james`, `sister_sarah`, `gospel_vibe`, `kingdom_gamer`, `prophetic_voices`

Avatars: Picsum seeds (not user uploads). Profiles: `/profile/{username}`.

## 4. Key Files

| File | Role |
|------|------|
| `docs/SANCTUARY_HOME_FEED_SPEC.md` | This spec |
| `src/lib/demo-personas.ts` | Demo users, posts, events, stories |
| `src/lib/sanctuary-home-mode.ts` | Merge helpers + `buildMergedHomeFeed` |
| `src/app/my-sanctuary/home-data.ts` | Server Supabase prefetch |
| `src/components/SanctuaryHomeFeed.tsx` | Timeline + ticketing UI |
| `src/components/SanctuaryHomeStoriesStrip.tsx` | Tray + story modal + upload |
| `src/app/stream/[streamId]/page.tsx` | Live viewer |
| `src/app/parables/[postId]/page.tsx` | Video focus player |

## 5. Environment

```env
NEXT_PUBLIC_SANCTUARY_HOME_MODE=hybrid   # demo | live | hybrid
```

## 6. Manual Test Script

1. Sign in → `/my-sanctuary`
2. Tap live bubble (neon) → `/stream/...`
3. Tap story bubble → modal with progress bars
4. Tap **Your story +** → upload ≤10 MB
5. Heart a post → red fill; real posts persist in `post_likes`
6. Tap video TV overlay → `/parables/[id]`
7. Get Pass → Authorize → `✓ Registered` (run event registration SQL first)

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `GET /api/stories 500` | Run `supabase/schema-stories.sql` in Supabase SQL Editor |
| Story upload fails | Same SQL + `supabase/storage-avatars-policies.sql` for media bucket |
| No visible changes after code edits | Restart `npm run dev` from `PARABLE-main\PARABLE-main` (port 3003) |
| Console `sanctuary_events` errors | Run `supabase/schema-sanctuary-home.sql` (optional) |

## 8. Acceptance Checklist

- [x] Hybrid merge: real posts + demo personas
- [x] Stories tray: live route, story modal, + upload (10 MB)
- [x] Likes: optimistic UI + `post_likes` for real UUID posts
- [x] Double-tap image like + heart burst UI
- [x] Comment sheet overlay on timeline posts
- [x] Paginated lazy-load for DB timeline posts
- [x] Video posts route to `/parables/[id]`
- [x] Ticketing modal + `sanctuary_event_registrations`
- [x] Auth/session preserved via `MySanctuaryHomeServer`
- [ ] Optional: populate `sanctuary_events` in Supabase for DB-only events panel
