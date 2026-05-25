import type { SupabaseClient } from "@supabase/supabase-js";
import { DEMO_PERSONAS } from "@/lib/demo-personas";
import { mapReelsDbRowToFeedFields, REELS_FEED_SELECT } from "./db-fields";
import { isReelsSchemaUnavailable } from "./schema-errors";
import type { ReelFeedItem, ReelsFeedResponse, ReelRow } from "./types";

const DEMO_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

function mapAuthor(profile: ProfileRow): ReelFeedItem["author"] {
  return {
    id: profile.id,
    username: profile.username?.trim() || "member",
    fullName: profile.full_name?.trim() || profile.username?.trim() || "Member",
    avatarUrl: profile.avatar_url,
  };
}

function mapRow(row: ReelRow, profile: ProfileRow): ReelFeedItem {
  const fields = mapReelsDbRowToFeedFields(row);
  return {
    ...fields,
    author: mapAuthor(profile),
  };
}

export function buildDemoReelsFeed(): ReelFeedItem[] {
  const items: ReelFeedItem[] = [];
  for (const persona of DEMO_PERSONAS) {
    for (const post of persona.posts) {
      if (post.media_type !== "video") continue;
      items.push({
        id: `demo-reel-${persona.username}-${post.id}`,
        userId: persona.id,
        videoUrl: post.media_url ?? DEMO_VIDEO_URL,
        thumbnailUrl: persona.avatar_url,
        caption: post.content ?? "",
        audioTitle: `${persona.full_name} · Original Audio`,
        likesCount: post.likesCount ?? 0,
        commentsCount: post.commentsCount ?? 0,
        createdAt: new Date(Date.now() - items.length * 1000 * 60 * 45).toISOString(),
        author: {
          id: persona.id,
          username: persona.username,
          fullName: persona.full_name,
          avatarUrl: persona.avatar_url,
        },
        isDemo: true,
      });
    }
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchReelsFeed(
  supabase: SupabaseClient,
  viewerId: string | null,
): Promise<ReelsFeedResponse> {
  const { data: rows, error } = await supabase
    .from("reels")
    .select(REELS_FEED_SELECT)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isReelsSchemaUnavailable(error)) {
      return { reels: buildDemoReelsFeed(), currentUserId: viewerId };
    }
    throw new Error(error.message);
  }

  const reelRows = (rows ?? []) as unknown as ReelRow[];
  if (reelRows.length === 0) {
    return { reels: buildDemoReelsFeed(), currentUserId: viewerId };
  }

  const userIds = [...new Set(reelRows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds);

  const profileById = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]));

  const reels = reelRows
    .map((row) => {
      const profile = profileById.get(row.user_id);
      if (!profile) return null;
      return mapRow(row, profile);
    })
    .filter((r): r is ReelFeedItem => r !== null);

  return { reels, currentUserId: viewerId };
}

export async function recordReelViewMetric(
  supabase: SupabaseClient,
  viewerId: string,
  reelId: string,
  watchRatio: number,
): Promise<void> {
  if (reelId.startsWith("demo-reel-")) return;

  const { error } = await supabase.from("reel_views").upsert(
    {
      reel_id: reelId,
      viewer_id: viewerId,
      watch_ratio: Math.min(1, Math.max(0, watchRatio)),
      viewed_at: new Date().toISOString(),
    },
    { onConflict: "reel_id,viewer_id" },
  );

  if (error && !isReelsSchemaUnavailable(error)) {
    console.warn("[reels] view metric:", error.message);
  }
}

export async function incrementReelLike(
  supabase: SupabaseClient,
  reelId: string,
): Promise<{ likesCount: number } | { error: string }> {
  if (reelId.startsWith("demo-reel-")) {
    return { likesCount: 0 };
  }

  const { data: current, error: readError } = await supabase
    .from("reels")
    .select("likes_count")
    .eq("id", reelId)
    .maybeSingle();

  if (readError) {
    if (isReelsSchemaUnavailable(readError)) return { likesCount: 0 };
    return { error: readError.message };
  }

  const next = (current?.likes_count ?? 0) + 1;
  const { data, error } = await supabase
    .from("reels")
    .update({ likes_count: next })
    .eq("id", reelId)
    .select("likes_count")
    .single();

  if (error) {
    if (isReelsSchemaUnavailable(error)) return { likesCount: next };
    return { error: error.message };
  }

  return { likesCount: data.likes_count ?? next };
}
