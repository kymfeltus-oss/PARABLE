import type { SupabaseClient } from "@supabase/supabase-js";

export type FollowProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_live?: boolean | null;
};

/** PostgREST FK names from public.follows → public.profiles */
const FK_FOLLOWING = "follows_following_id_fkey";
const FK_FOLLOWER = "follows_follower_id_fkey";

const PROFILE_SELECT_WITH_LIVE =
  "id, username, full_name, avatar_url, is_live" as const;

const PROFILE_SELECT_BASIC = "id, username, full_name, avatar_url" as const;

function isFollowProfileRow(row: unknown): row is FollowProfileRow {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return typeof r.id === "string";
}

function mapProfileRows(data: unknown): FollowProfileRow[] {
  if (!Array.isArray(data)) return [];
  return data.filter(isFollowProfileRow);
}

function flattenFollowProfiles(data: unknown[]): FollowProfileRow[] {
  const out: FollowProfileRow[] = [];
  for (const row of data ?? []) {
    const raw = (row as { profiles?: FollowProfileRow | FollowProfileRow[] }).profiles;
    const p = Array.isArray(raw) ? raw[0] : raw;
    if (p?.id) out.push(p);
  }
  return out;
}

async function fetchProfilesByIds(
  supabase: SupabaseClient,
  ids: string[],
  withLive: boolean,
): Promise<FollowProfileRow[]> {
  if (ids.length === 0) return [];

  const { data, error } = withLive
    ? await supabase
        .from("profiles")
        .select(PROFILE_SELECT_WITH_LIVE)
        .in("id", ids)
    : await supabase
        .from("profiles")
        .select(PROFILE_SELECT_BASIC)
        .in("id", ids);

  if (error) throw error;
  return mapProfileRows(data);
}

/**
 * Profiles the user follows — explicit FK embed, two-step fallback if schema cache lacks the link.
 */
export async function fetchProfilesUserFollows(
  supabase: SupabaseClient,
  followerId: string,
  options?: { includeIsLive?: boolean },
): Promise<FollowProfileRow[]> {
  const withLive = options?.includeIsLive !== false;
  const embedSelect = withLive
    ? `id, follower_id, following_id, profiles!${FK_FOLLOWING} (${PROFILE_SELECT_WITH_LIVE})`
    : `id, follower_id, following_id, profiles!${FK_FOLLOWING} (${PROFILE_SELECT_BASIC})`;

  const { data, error } = await supabase
    .from("follows")
    .select(embedSelect)
    .eq("follower_id", followerId);

  if (!error) {
    return flattenFollowProfiles(data ?? []);
  }

  const embedFailed =
    error.code === "PGRST200" ||
    /relationship|schema cache|could not find/i.test(error.message ?? "");

  if (!embedFailed) throw error;

  const { data: followRows, error: followErr } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", followerId);

  if (followErr) throw followErr;

  const ids = (followRows ?? []).map((r) => r.following_id).filter(Boolean);
  return fetchProfilesByIds(supabase, ids, withLive);
}

/**
 * Followers or following list for a profile — explicit FK embed, two-step fallback.
 */
export async function fetchFollowListForProfile(
  supabase: SupabaseClient,
  profileUserId: string,
  mode: "followers" | "following",
): Promise<FollowProfileRow[]> {
  const filterColumn = mode === "followers" ? "following_id" : "follower_id";
  const fk = mode === "followers" ? FK_FOLLOWER : FK_FOLLOWING;
  const embedSelect = `id, follower_id, following_id, profiles!${fk} (${PROFILE_SELECT_BASIC})`;

  const { data, error } = await supabase
    .from("follows")
    .select(embedSelect)
    .eq(filterColumn, profileUserId);

  if (!error) {
    return flattenFollowProfiles(data ?? []);
  }

  const embedFailed =
    error.code === "PGRST200" ||
    /relationship|schema cache|could not find/i.test(error.message ?? "");

  if (!embedFailed) throw error;

  const idColumn = mode === "followers" ? "follower_id" : "following_id";
  const { data: followRows, error: followErr } = await supabase
    .from("follows")
    .select(idColumn)
    .eq(filterColumn, profileUserId);

  if (followErr) throw followErr;

  const ids = (followRows ?? [])
    .map((r) => (r as Record<string, string>)[idColumn])
    .filter(Boolean);

  return fetchProfilesByIds(supabase, ids, false);
}
