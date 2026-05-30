import type { SupabaseClient } from "@supabase/supabase-js";
import type { StreamerProfileRecord } from "@/lib/streamers-types";
import { streamThumbnailImage } from "@/lib/kick-discovery-media";

export type StreamCategoryRow = {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  parent?: { id: string; name: string; slug: string } | null;
};

export type ProfileDiscoveryRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  viewer_count: number | null;
  current_category: string | null;
  is_live: boolean | null;
  stream_title: string | null;
  category_id?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  /** Discovery backfill flag — see supabase/schema-discovery-is-demo.sql */
  is_demo?: boolean | null;
};

/** Fallback when `public.categories` is not migrated yet. */
export const FALLBACK_CATEGORIES: StreamCategoryRow[] = [
  { id: "b1000000-0000-4000-8000-000000000005", slug: "just-chatting", name: "Just Chatting", parent_id: "b1000000-0000-4000-8000-000000000001", sort_order: 10, parent: { id: "b1000000-0000-4000-8000-000000000001", name: "IRL", slug: "irl" } },
  { id: "b1000000-0000-4000-8000-000000000002", slug: "worship", name: "Worship", parent_id: null, sort_order: 2, parent: null },
  { id: "b1000000-0000-4000-8000-000000000003", slug: "prayer", name: "Prayer", parent_id: null, sort_order: 3, parent: null },
  { id: "b1000000-0000-4000-8000-000000000006", slug: "revival", name: "Revival", parent_id: "b1000000-0000-4000-8000-000000000002", sort_order: 11, parent: { id: "b1000000-0000-4000-8000-000000000002", name: "Worship", slug: "worship" } },
  { id: "b1000000-0000-4000-8000-000000000007", slug: "bible-study", name: "Bible Study", parent_id: "b1000000-0000-4000-8000-000000000003", sort_order: 12, parent: { id: "b1000000-0000-4000-8000-000000000003", name: "Prayer", slug: "prayer" } },
  { id: "b1000000-0000-4000-8000-000000000008", slug: "faith-gaming", name: "Faith Gaming", parent_id: "b1000000-0000-4000-8000-000000000004", sort_order: 13, parent: { id: "b1000000-0000-4000-8000-000000000004", name: "Gaming", slug: "gaming" } },
];

export function formatCategoryLabel(cat: StreamCategoryRow): string {
  if (cat.parent?.name) return `${cat.name} (${cat.parent.name})`;
  return cat.name;
}

function normalizeCategoryRow(raw: Record<string, unknown>): StreamCategoryRow {
  const parentRaw = raw.parent;
  let parent: StreamCategoryRow["parent"] = null;
  if (parentRaw && typeof parentRaw === "object" && !Array.isArray(parentRaw)) {
    const p = parentRaw as Record<string, unknown>;
    if (typeof p.id === "string" && typeof p.name === "string" && typeof p.slug === "string") {
      parent = { id: p.id, name: p.name, slug: p.slug };
    }
  }
  return {
    id: String(raw.id),
    slug: String(raw.slug),
    name: String(raw.name),
    parent_id: (raw.parent_id as string | null) ?? null,
    sort_order: typeof raw.sort_order === "number" ? raw.sort_order : 0,
    parent,
  };
}

export async function fetchStreamCategories(
  supabase: SupabaseClient,
): Promise<StreamCategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id, sort_order, parent:parent_id ( id, name, slug )")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    if (error) console.warn("fetchStreamCategories:", error.message);
    return FALLBACK_CATEGORIES;
  }

  return (data as Record<string, unknown>[]).map(normalizeCategoryRow);
}

export async function fetchCategoryBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<StreamCategoryRow | null> {
  const normalized = slug.trim().toLowerCase();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id, sort_order, parent:parent_id ( id, name, slug )")
    .eq("slug", normalized)
    .maybeSingle();

  if (error) {
    console.warn("fetchCategoryBySlug:", error.message);
  }
  if (data) return normalizeCategoryRow(data as Record<string, unknown>);

  return FALLBACK_CATEGORIES.find((c) => c.slug === normalized) ?? null;
}

/** Live discovery query — profiles only (never live_streams). */
export async function fetchLiveProfilesByCategory(
  supabase: SupabaseClient,
  categoryId: string,
): Promise<ProfileDiscoveryRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, viewer_count, current_category, is_live, stream_title")
    .eq("category_id", categoryId)
    .eq("is_live", true)
    .gte("viewer_count", 0)
    .order("viewer_count", { ascending: false });

  if (error) {
    console.warn("fetchLiveProfilesByCategory:", error.message);
    return [];
  }

  return (data ?? []) as ProfileDiscoveryRow[];
}

export function profileRowToStreamerRecord(row: ProfileDiscoveryRow): StreamerProfileRecord {
  const viewers = typeof row.viewer_count === "number" ? row.viewer_count : 0;
  const isLive = row.is_live === true;
  const display =
    row.username?.trim() ||
    row.display_name?.trim() ||
    row.full_name?.trim() ||
    "Creator";

  return {
    id: row.id,
    username: display,
    profilePicture: row.avatar_url?.trim() || "/logo.svg",
    streamTitle: row.stream_title?.trim() || `${display} Live`,
    currentViewers: viewers,
    liveCategory: row.current_category?.trim() || "Live",
    status: isLive ? "live" : "offline",
  };
}

export async function updateProfileStreamCategory(
  supabase: SupabaseClient,
  profileId: string,
  categoryId: string,
  categoryName: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("profiles")
    .update({
      category_id: categoryId,
      current_category: categoryName,
    })
    .eq("id", profileId);

  return { error: error ? new Error(error.message) : null };
}

/** Admin HUD — requires profiles.is_admin === true (authenticated). */
export function isParableAdminProfile(profile: { is_admin?: boolean | null } | null | undefined): boolean {
  return profile?.is_admin === true;
}
