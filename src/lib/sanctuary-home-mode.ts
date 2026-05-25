import type { FeedPostNormalized } from "@/hooks/useFeed";
import type { StoryUserGroup } from "@/lib/sanctuary-stories/types";
import {
  createDemoHomeEvents,
  createDemoHomeFeedPosts,
  createDemoHomeTray,
  createDemoStoryGroups,
  DEMO_AVATAR_FALLBACK,
  demoEventHost,
  getDemoPersonaById,
  getDemoPersonaByUsername,
  isDemoPersonaId,
  type DemoHomeEvent,
  type DemoHomeFeedPost,
  type DemoHomeTrayItem,
} from "@/lib/demo-personas";

export type SanctuaryHomeMode = "demo" | "live" | "hybrid";

export function getSanctuaryHomeMode(): SanctuaryHomeMode {
  const v = process.env.NEXT_PUBLIC_SANCTUARY_HOME_MODE?.trim().toLowerCase();
  if (v === "demo" || v === "live" || v === "hybrid") return v;
  return "hybrid";
}

export function shouldIncludeDemoHome(): boolean {
  const mode = getSanctuaryHomeMode();
  return mode === "demo" || mode === "hybrid";
}

export function isDemoHomeItemId(id: string): boolean {
  return id.startsWith("demo-") || isDemoPersonaId(id);
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function mapLiveFeedPost(post: FeedPostNormalized): DemoHomeFeedPost | null {
  const author = post.author;
  if (!author?.username && !author?.full_name) return null;
  const username = author.username ?? author.full_name ?? "member";
  const persona =
    getDemoPersonaByUsername(username) ?? getDemoPersonaById(author.id) ?? null;
  const isVideo = post.media_type === "video";
  return {
    id: post.id,
    userId: author.id,
    username,
    avatar_url: persona?.avatar_url ?? author.avatar_url?.trim() ?? DEMO_AVATAR_FALLBACK,
    role: author.status_text?.trim() || "Member",
    is_verified: false,
    caption: post.content ?? "",
    media_url: post.image_url ?? "",
    post_type: isVideo ? "video" : "image",
    likes: post.likesCount,
    comments: 0,
    has_liked: false,
    created_at: relativeTime(post.created_at),
  };
}

export function mapLiveStoryGroups(groups: StoryUserGroup[]): DemoHomeTrayItem[] {
  return groups.map((g) => {
    const persona = getDemoPersonaById(g.userId);
    return {
      id: `live-tray-${g.userId}`,
      userId: g.userId,
      username: g.username,
      avatar_url: g.avatarUrl?.trim() || persona?.avatar_url || DEMO_AVATAR_FALLBACK,
      role: persona?.role ?? "Member",
      is_verified: persona?.is_verified ?? false,
      is_live: false,
      has_unviewed_story: g.hasUnviewed,
    };
  });
}

function trayUsernameKey(username: string): string {
  return username.replace(/^@/, "").trim().toLowerCase();
}

function dedupeTrayItems(items: DemoHomeTrayItem[]): DemoHomeTrayItem[] {
  const seen = new Set<string>();
  const out: DemoHomeTrayItem[] = [];
  for (const item of items) {
    const key = trayUsernameKey(item.username);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function mergeHomeTray(
  liveStoryTray: DemoHomeTrayItem[],
  liveStreamTray: DemoHomeTrayItem[],
  demo: DemoHomeTrayItem[],
  mode: SanctuaryHomeMode,
): DemoHomeTrayItem[] {
  const live = dedupeTrayItems([...liveStreamTray, ...liveStoryTray]);
  if (mode === "demo") return demo;
  if (mode === "live") return live.length ? live : [];
  const seen = new Set(live.map((t) => trayUsernameKey(t.username)));
  const fill = demo.filter((d) => !seen.has(trayUsernameKey(d.username)));
  return [...live, ...fill];
}

export function mergeHomePosts(
  live: DemoHomeFeedPost[],
  demo: DemoHomeFeedPost[],
  mode: SanctuaryHomeMode,
): DemoHomeFeedPost[] {
  if (mode === "demo") return demo;
  if (mode === "live") return live;
  const seen = new Set(live.map((p) => p.id));
  const fill = demo.filter((d) => !seen.has(d.id));
  return [...live, ...fill];
}

export function mergeHomeEvents(
  live: DemoHomeEvent[],
  demo: DemoHomeEvent[],
  mode: SanctuaryHomeMode,
): DemoHomeEvent[] {
  if (mode === "demo") return demo;
  if (mode === "live") return live.length ? live : [];
  const seen = new Set(live.map((e) => e.id));
  const fill = demo.filter((d) => !seen.has(d.id));
  return [...live, ...fill];
}

export function mergeStoryGroups(
  live: StoryUserGroup[],
  mode: SanctuaryHomeMode,
): StoryUserGroup[] {
  if (mode === "live") return live;
  const demo = createDemoStoryGroups();
  if (mode === "demo") return demo;
  const seen = new Set(live.map((g) => g.userId));
  const fill = demo.filter((g) => !seen.has(g.userId));
  return [...live, ...fill];
}

export function mergeHomePostsFromSources(
  clientPosts: DemoHomeFeedPost[],
  serverPosts: DemoHomeFeedPost[],
  demo: DemoHomeFeedPost[],
  mode: SanctuaryHomeMode,
): DemoHomeFeedPost[] {
  const live = [...clientPosts];
  const seenIds = new Set(live.map((p) => p.id));
  for (const p of serverPosts) {
    if (!seenIds.has(p.id)) {
      live.push(p);
      seenIds.add(p.id);
    }
  }
  if (mode === "demo") return demo;
  if (mode === "live") return live;
  const fill = demo.filter((d) => !seenIds.has(d.id));
  return [...live, ...fill];
}

export function buildMergedHomeFeed(input: {
  mode: SanctuaryHomeMode;
  livePosts: FeedPostNormalized[];
  liveStoryGroups: StoryUserGroup[];
  serverPosts?: DemoHomeFeedPost[];
  serverLiveStreams?: DemoHomeTrayItem[];
  serverEvents?: DemoHomeEvent[];
}): {
  trayItems: DemoHomeTrayItem[];
  feedPosts: DemoHomeFeedPost[];
  upcomingEvents: DemoHomeEvent[];
  storyGroups: StoryUserGroup[];
} {
  const demoTray = createDemoHomeTray();
  const demoPosts = createDemoHomeFeedPosts();
  const demoEvents = createDemoHomeEvents();
  const storyGroups = mergeStoryGroups(input.liveStoryGroups, input.mode);

  const liveStoryTray = mapLiveStoryGroups(input.liveStoryGroups);
  const clientPosts = input.livePosts
    .map(mapLiveFeedPost)
    .filter((p): p is DemoHomeFeedPost => p != null && Boolean(p.media_url));

  return {
    trayItems: mergeHomeTray(
      liveStoryTray,
      input.serverLiveStreams ?? [],
      demoTray,
      input.mode,
    ),
    feedPosts: mergeHomePostsFromSources(
      clientPosts,
      input.serverPosts ?? [],
      demoPosts,
      input.mode,
    ),
    upcomingEvents: mergeHomeEvents(input.serverEvents ?? [], demoEvents, input.mode),
    storyGroups,
  };
}

export { createDemoHomeTray, createDemoHomeFeedPosts, createDemoHomeEvents, demoEventHost };
