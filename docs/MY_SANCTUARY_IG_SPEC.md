# MASTER SPECIFICATION: My Sanctuary Instagram Parity (Full Stack)

## System Constraints & Core Rules
- **CRITICAL:** Zero regression or breaking changes to existing hooks, user tables, or backend processing.
- **ISOLATION:** All new stories, posts, and media schema logic must run safely adjacent to current features. No placeholder modules or dead buttons.
- **DESIGN PALETTE:**
  - Deep Dark Canvas (Background): `#01040A` (Sub-panels: `#020712`)
  - Secondary Dark (Cards/Borders): `#06111E`
  - Neon Accent (Unviewed Glow): `#00F2FE` (Vibrant Cyan)
  - Secondary Accent (Active): `#0EA5E9` (Deep Cyan)
  - Text Hierarchy: Primary `#F8FAFC`, Muted `#94A3B8`, Soft `#CBD5E1`

## Database (Production)

Stories use isolated tables in `supabase/schema-stories.sql` (not `public.posts`):

- `public.stories` — 24h expiry via `expires_at`
- `public.story_views` — per-viewer tracking

The spec’s `sanctuary_stories` / `sanctuary_story_views` names are logical aliases; run `schema-stories.sql` in Supabase SQL Editor.

## Priority Tiers

### P0 (Must Ship)
1. Stories horizontal tray & viewer loop (neon rings, 24h filter)
2. Profile **+** create post/reel (10 MB client limit)
3. Posts / Reels / Tagged tabs backed by Supabase
4. Story + StoryView data model (see schema above)

### P1 (Next)
1. Fullscreen stories player polish (progress segments — partial in `StoryModalViewer`)
2. Vertical PiP reel player

### P2 (Future)
1. Story highlights, filters, archive

## Acceptance Checklist
- [x] Horizontal stories tray hides scrollbar, retains touch scroll
- [x] Stories filtered to &lt; 24 hours (`expires_at`)
- [x] Tab panels switch without lifecycle errors
- [x] Reels tab shows play overlays
- [x] Layout scales mobile → 1180px desktop grid

## P0 Audit (codebase vs spec)

| P0 item | Status | Implementation |
|---------|--------|----------------|
| Stories tray + viewer | **Shipped** | `sanctuary-stories/*`, `/api/stories`, neon rings in `sanctuary-stories.css` |
| Create + / 10 MB | **Shipped** | `onCreateMedia`, `sanctuary-media-limits.ts`, `SanctuaryCreationStudio` |
| Posts / Reels / Tagged | **Shipped** | `filterFeedPosts` / `filterReelPosts`, `getTaggedPostsForProfile`, live hooks |
| Story DB model | **Shipped** | `supabase/schema-stories.sql` → `stories`, `story_views` |

### Gaps closed this pass
- Profile posts query excludes legacy `post_type = story`
- Dead **Message** button removed unless `onMessageUser` is wired
- Mobile header **+** (`profile-mobile-toolbar`)
- Tagged tab live refresh via `useTaggedPostsLive`
- Story viewed ring updates via stable `markViewed` ref
- Tab loader scoped to Tagged fetch (no follow-transition flash)

### Out of scope (P1+)
- Public `/my-sanctuary/[userId]`, vertical reel player, story highlights

## Manual Test Script
1. Authenticate → `/my-sanctuary`
2. **+** → pick video &gt; 10 MB → failure alert → pick &lt; 10 MB → publish
3. Posts count increments; Reels tab shows play overlay
4. Open unviewed story → progress bar → close → ring muted
