import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveProfileAvatarUrl } from "./resolve-avatar-url";
import { isStoriesSchemaUnavailable } from "./schema-errors";
import type { StoriesFeedResponse, StoryItem, StoryUserGroup } from "./types";

type StoryRow = {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type ViewRow = {
  story_id: string;
};

function displayName(profile: ProfileRow): string {
  return profile.full_name?.trim() || profile.username?.trim() || "Member";
}

export async function fetchActiveStoryGroups(
  supabase: SupabaseClient,
  viewerId: string | null,
): Promise<StoriesFeedResponse> {
  const nowIso = new Date().toISOString();

  const { data: storyRows, error: storiesError } = await supabase
    .from("stories")
    .select("id, user_id, media_url, media_type, created_at")
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: true });

  if (storiesError) {
    if (isStoriesSchemaUnavailable(storiesError)) {
      return { groups: [], currentUserId: viewerId };
    }
    throw new Error(storiesError.message);
  }

  const rows = (storyRows ?? []) as StoryRow[];
  if (rows.length === 0) {
    return { groups: [], currentUserId: viewerId };
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const storyIds = rows.map((r) => r.id);

  const [{ data: profiles }, viewsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", userIds),
    viewerId
      ? supabase.from("story_views").select("story_id").eq("viewer_id", viewerId).in("story_id", storyIds)
      : Promise.resolve({ data: [] as ViewRow[], error: null }),
  ]);

  const views = viewsResult.data;
  if (viewsResult.error && !isStoriesSchemaUnavailable(viewsResult.error)) {
    console.error("story_views:", viewsResult.error.message);
  }

  const profileById = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]));
  const viewedSet = new Set(((views ?? []) as ViewRow[]).map((v) => v.story_id));

  const grouped = new Map<string, StoryItem[]>();
  for (const row of rows) {
    const list = grouped.get(row.user_id) ?? [];
    list.push({
      id: row.id,
      mediaUrl: row.media_url,
      mediaType: row.media_type,
      createdAt: row.created_at,
      viewed: viewedSet.has(row.id),
    });
    grouped.set(row.user_id, list);
  }

  const groups: StoryUserGroup[] = [];

  for (const [userId, stories] of grouped.entries()) {
    const profile = profileById.get(userId);
    const hasUnviewed = viewerId !== userId && stories.some((s) => !s.viewed);
    groups.push({
      userId,
      username: profile ? displayName(profile) : "Member",
      avatarUrl: profile ? resolveProfileAvatarUrl(supabase, profile.avatar_url) : null,
      hasUnviewed,
      stories,
    });
  }

  groups.sort((a, b) => {
    if (a.hasUnviewed !== b.hasUnviewed) return a.hasUnviewed ? -1 : 1;
    const aLatest = a.stories[a.stories.length - 1]?.createdAt ?? "";
    const bLatest = b.stories[b.stories.length - 1]?.createdAt ?? "";
    return bLatest.localeCompare(aLatest);
  });

  if (viewerId) {
    const ownIndex = groups.findIndex((g) => g.userId === viewerId);
    if (ownIndex > 0) {
      const [own] = groups.splice(ownIndex, 1);
      groups.unshift(own);
    } else if (ownIndex === -1) {
      const profile = profileById.get(viewerId);
      groups.unshift({
        userId: viewerId,
        username: profile ? displayName(profile) : "You",
        avatarUrl: profile ? resolveProfileAvatarUrl(supabase, profile.avatar_url) : null,
        hasUnviewed: false,
        stories: [],
      });
    }
  }

  return { groups, currentUserId: viewerId };
}

export async function markStoryViewed(
  supabase: SupabaseClient,
  viewerId: string,
  storyId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from("story_views").insert({
    story_id: storyId,
    viewer_id: viewerId,
  });

  if (error && error.code !== "23505") {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
