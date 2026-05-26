import {
  DEMO_AVATAR_FALLBACK,
  getDemoPersonaById,
  getDemoPersonaByUsername,
  type DemoHomeEvent,
  type DemoHomeFeedPost,
  type DemoHomeTrayItem,
  type DemoPersonaUsername,
} from "@/lib/demo-personas";
import { createClient } from "@/utils/supabase/server";

export type SanctuaryHomeServerPayload = {
  posts: DemoHomeFeedPost[];
  liveStreams: DemoHomeTrayItem[];
  events: DemoHomeEvent[];
  /** ISO cursor for paginated lazy-load of timeline posts. */
  postsNextCursor?: string | null;
};

type PostRow = {
  id: string;
  content: string | null;
  media_url: string | null;
  post_type: string | null;
  created_at: string;
  profile_id: string;
  profiles:
    | {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
        role: string | null;
      }
    | {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
        role: string | null;
      }[]
    | null;
  post_likes?: { count?: number }[] | null;
  post_comments?: { count?: number }[] | null;
};

type LiveProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  is_live: boolean | null;
};

type EventRow = {
  id: string;
  host_id: string | null;
  title: string;
  description: string;
  cover_image_url: string | null;
  scheduled_for: string;
  ticket_price: number | string | null;
  requires_registration: boolean | null;
};

function pickCount(raw: { count?: number }[] | null | undefined): number {
  if (!Array.isArray(raw) || raw.length === 0) return 0;
  return typeof raw[0]?.count === "number" ? raw[0].count : 0;
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function normalizeProfile<T>(raw: T | T[] | null | undefined): T | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function mapPostRow(row: PostRow): DemoHomeFeedPost | null {
  const profile = normalizeProfile(row.profiles);
  if (!profile) return null;
  const username = profile.username?.trim() || profile.full_name?.trim() || "member";
  const persona =
    getDemoPersonaByUsername(username) ?? getDemoPersonaById(profile.id) ?? null;
  const isVideo = row.post_type === "video";
  return {
    id: row.id,
    userId: profile.id,
    username,
    avatar_url: persona?.avatar_url ?? profile.avatar_url?.trim() ?? DEMO_AVATAR_FALLBACK,
    role: profile.role?.trim() || "Member",
    is_verified: false,
    caption: row.content ?? "",
    media_url: row.media_url ?? "",
    post_type: isVideo ? "video" : "image",
    likes: pickCount(row.post_likes),
    comments: pickCount(row.post_comments),
    has_liked: false,
    created_at: relativeTime(row.created_at),
  };
}

function mapLiveProfile(row: LiveProfileRow): DemoHomeTrayItem {
  const persona = getDemoPersonaById(row.id);
  const username = row.username?.trim() || persona?.username || "broadcaster";
  return {
    id: `live-stream-${row.id}`,
    userId: row.id,
    username,
    avatar_url: persona?.avatar_url ?? row.avatar_url?.trim() ?? DEMO_AVATAR_FALLBACK,
    role: persona?.role ?? row.role?.trim() ?? "Broadcaster",
    is_verified: persona?.is_verified ?? false,
    is_live: true,
    viewer_count: undefined,
  };
}

function resolveEventHostUsername(
  row: EventRow,
  hostUsernamesById: Map<string, string>,
): DemoPersonaUsername {
  if (row.host_id) {
    const hostUsername = hostUsernamesById.get(row.host_id);
    const fromProfile = getDemoPersonaByUsername(hostUsername ?? "");
    if (fromProfile) return fromProfile.username;
    if (hostUsername) {
      const normalized = hostUsername.replace(/^@/, "").trim().toLowerCase();
      const asDemo = getDemoPersonaByUsername(normalized);
      if (asDemo) return asDemo.username;
    }
  }
  if (row.id === "demo-event-2") return "gospel_vibe";
  return "pastor_james";
}

function mapEventRow(row: EventRow, hostUsernamesById: Map<string, string>): DemoHomeEvent {
  return {
    id: row.id,
    hostUsername: resolveEventHostUsername(row, hostUsernamesById),
    title: row.title,
    description: row.description,
    cover_image: row.cover_image_url?.trim() || "https://picsum.photos/seed/parable-event/600/280",
    scheduled_for: new Date(row.scheduled_for).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    ticket_price: Number(row.ticket_price ?? 0),
    requires_registration: row.requires_registration !== false,
    is_registered: false,
  };
}

/** Server prefetch for `/my-sanctuary` — maps spec tables to feed props. */
export async function fetchSanctuaryHomePayload(): Promise<SanctuaryHomeServerPayload> {
  const { posts, nextCursor: postsNextCursor } = await fetchSanctuaryHomePostsPageWithCursor(undefined, 30);
  const supabase = await createClient();

  const [liveRes, eventsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, role, is_live")
      .eq("is_live", true)
      .limit(12),
    supabase
      .from("sanctuary_events")
      .select("id, host_id, title, description, cover_image_url, scheduled_for, ticket_price, requires_registration")
      .order("scheduled_for", { ascending: true })
      .limit(10),
  ]);

  if (liveRes.error) {
    console.error("fetchSanctuaryHomePayload live:", liveRes.error.message);
  }
  if (eventsRes.error) {
    const msg = eventsRes.error.message ?? "";
    const missingTable =
      msg.includes("sanctuary_events") &&
      (msg.includes("does not exist") || msg.includes("schema cache") || eventsRes.error.code === "42P01");
    if (!missingTable) {
      console.error("fetchSanctuaryHomePayload events:", msg);
    }
  }

  const liveStreams = ((liveRes.data ?? []) as LiveProfileRow[]).map(mapLiveProfile);

  let events: DemoHomeEvent[] = [];
  if (!eventsRes.error && eventsRes.data?.length) {
    const eventRows = eventsRes.data as EventRow[];
    const hostIds = [...new Set(eventRows.map((e) => e.host_id).filter((id): id is string => Boolean(id)))];
    const hostUsernamesById = new Map<string, string>();

    if (hostIds.length > 0) {
      const { data: hosts, error: hostsErr } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", hostIds);
      if (hostsErr) {
        console.error("fetchSanctuaryHomePayload event hosts:", hostsErr.message);
      } else {
        for (const h of hosts ?? []) {
          if (h.id && h.username) hostUsernamesById.set(h.id as string, h.username as string);
        }
      }
    }

    events = eventRows.map((row) => mapEventRow(row, hostUsernamesById));
  }

  return { posts, liveStreams, events, postsNextCursor };
}

export type SanctuaryHomePostsPage = {
  posts: DemoHomeFeedPost[];
  nextCursor: string | null;
};

/** Paginated timeline fetch for lazy-load (cursor = oldest `created_at` ISO in current page). */
export async function fetchSanctuaryHomePostsPage(
  beforeCreatedAt?: string,
  limit = 10,
): Promise<DemoHomeFeedPost[]> {
  const supabase = await createClient();

  let q = supabase
    .from("posts")
    .select(
      "id, content, media_url, post_type, created_at, profile_id, profiles:profile_id(id, username, full_name, avatar_url, role), post_likes(count), post_comments(count)",
    )
    .in("post_type", ["image", "video", "carousel", "gallery"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (beforeCreatedAt) {
    q = q.lt("created_at", beforeCreatedAt);
  }

  const { data, error } = await q;

  if (error) {
    console.error("fetchSanctuaryHomePostsPage:", error.message);
    return [];
  }

  return ((data ?? []) as PostRow[])
    .map(mapPostRow)
    .filter((p): p is DemoHomeFeedPost => p != null && Boolean(p.media_url));
}

export async function fetchSanctuaryHomePostsPageWithCursor(
  beforeCreatedAt?: string,
  limit = 10,
): Promise<SanctuaryHomePostsPage> {
  const supabase = await createClient();

  let q = supabase
    .from("posts")
    .select(
      "id, content, media_url, post_type, created_at, profile_id, profiles:profile_id(id, username, full_name, avatar_url, role), post_likes(count), post_comments(count)",
    )
    .in("post_type", ["image", "video", "carousel", "gallery"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (beforeCreatedAt) {
    q = q.lt("created_at", beforeCreatedAt);
  }

  const { data, error } = await q;

  if (error) {
    console.error("fetchSanctuaryHomePostsPageWithCursor:", error.message);
    return { posts: [], nextCursor: null };
  }

  const rows = (data ?? []) as PostRow[];
  const posts = rows
    .map(mapPostRow)
    .filter((p): p is DemoHomeFeedPost => p != null && Boolean(p.media_url));
  const lastRow = rows[rows.length - 1];

  return {
    posts,
    nextCursor: rows.length === limit && lastRow ? lastRow.created_at : null,
  };
}
