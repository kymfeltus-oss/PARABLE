"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type SanctuaryProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type SanctuaryPost = {
  id: string;
  media_url: string | null;
  media_type: string | null;
  content: string | null;
  likesCount: number;
  commentsCount: number;
};

export type SanctuaryLayoutData = {
  profile: SanctuaryProfile | null;
  posts: SanctuaryPost[];
  taggedPosts: SanctuaryPost[];
  totalPosts: number;
  followersCount: number;
  followingCount: number;
  isFollowingCurrentUser: boolean;
};

type PostRow = {
  id: string;
  media_url: string | null;
  post_type?: string | null;
  content: string | null;
  post_likes?: { count?: number }[] | null;
  post_comments?: { count?: number }[] | null;
};

function inferMediaTypeFromUrl(url: string | null): "video" | "image" | null {
  if (!url) return null;
  const base = url.split("?")[0] ?? "";
  if (/\.(mp4|webm|mov|m4v)$/i.test(base)) return "video";
  if (/\.(jpe?g|png|gif|webp|avif)$/i.test(base)) return "image";
  return null;
}

function resolveMediaType(row: PostRow): string | null {
  const pt = row.post_type?.toLowerCase();
  if (pt === "video" || pt === "image" || pt === "carousel" || pt === "gallery" || pt === "story") return pt;
  return inferMediaTypeFromUrl(row.media_url);
}

function countProfileTabPostsFromRows(posts: SanctuaryPost[]): number {
  return posts.filter((p) => p.media_type !== "story" && p.media_type !== "video").length
    + posts.filter((p) => p.media_type === "video").length;
}

function pickCount(raw: { count?: number }[] | null | undefined): number {
  if (!Array.isArray(raw) || raw.length === 0) return 0;
  const n = raw[0]?.count;
  return typeof n === "number" ? n : 0;
}

function mapPostRow(row: PostRow): SanctuaryPost {
  return {
    id: row.id,
    media_url: row.media_url,
    media_type: resolveMediaType(row),
    content: row.content,
    likesCount: pickCount(row.post_likes),
    commentsCount: pickCount(row.post_comments),
  };
}

/** Parallel server fetch for profile header, stats, and gallery grid. */
export async function getProfileLayout(
  targetUserId: string,
  currentUserId?: string | null,
): Promise<SanctuaryLayoutData> {
  const supabase = await createClient();

  const isOwnProfile = Boolean(currentUserId && currentUserId === targetUserId);

  const [profileRes, postsRes, totalPostsRes, followersRes, followingRes, followCheckRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, bio, avatar_url, full_name")
        .eq("id", targetUserId)
        .maybeSingle(),
      supabase
        .from("posts")
        .select("id, media_url, content, post_type, post_likes(count), post_comments(count)")
        .eq("profile_id", targetUserId)
        .in("post_type", ["image", "video", "carousel", "gallery"])
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", targetUserId)
        .in("post_type", ["image", "video", "carousel", "gallery"]),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId),
      !isOwnProfile && currentUserId
        ? supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUserId)
            .eq("following_id", targetUserId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  if (profileRes.error) {
    console.error("getProfileLayout profile:", profileRes.error.message);
  }
  if (postsRes.error) {
    console.error("getProfileLayout posts:", postsRes.error.message);
  }

  const mappedPosts = ((postsRes.data ?? []) as PostRow[]).map(mapPostRow);
  const headCount = totalPostsRes.count ?? countProfileTabPostsFromRows(mappedPosts);
  const totalPosts =
    mappedPosts.length < 30 ? countProfileTabPostsFromRows(mappedPosts) : headCount;

  const profile = (profileRes.data as SanctuaryProfile | null) ?? null;
  const taggedPosts = profile
    ? await fetchTaggedPostsForProfile(supabase, targetUserId, profile.username)
    : [];

  return {
    profile,
    posts: mappedPosts,
    taggedPosts,
    totalPosts,
    followersCount: followersRes.count ?? 0,
    followingCount: followingRes.count ?? 0,
    isFollowingCurrentUser: Boolean(followCheckRes.data),
  };
}

/** Posts from other users that @mention this profile (Tagged tab). */
async function fetchTaggedPostsForProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  targetUserId: string,
  username: string | null,
): Promise<SanctuaryPost[]> {
  const handle = username?.trim();
  if (!handle) return [];

  const mentionNeedle = `@${handle}`;
  const { data, error } = await supabase
    .from("posts")
    .select("id, media_url, content, post_type, post_likes(count), post_comments(count)")
    .neq("profile_id", targetUserId)
    .ilike("content", `%${mentionNeedle}%`)
    .in("post_type", ["image", "video", "carousel", "gallery"])
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("fetchTaggedPostsForProfile:", error.message);
    return [];
  }

  return ((data ?? []) as PostRow[]).map(mapPostRow);
}

/** Client/server refresh for Tagged tab (live @mention feed). */
export async function getTaggedPostsForProfile(
  targetUserId: string,
  username: string | null,
): Promise<SanctuaryPost[]> {
  const supabase = await createClient();
  return fetchTaggedPostsForProfile(supabase, targetUserId, username);
}

export async function toggleFollow(
  targetUserId: string,
  currentUserId: string,
  currentlyFollowing: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  if (currentlyFollowing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUserId)
      .eq("following_id", targetUserId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("follows").insert({
      follower_id: currentUserId,
      following_id: targetUserId,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/my-sanctuary");
  return { ok: true };
}

export type SanctuaryProfileUpdate = {
  username: string | null;
  full_name: string | null;
  bio: string | null;
};

export async function updateSanctuaryProfile(
  profileId: string,
  fields: SanctuaryProfileUpdate,
): Promise<{ ok: true; saved: SanctuaryProfileUpdate } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || user.id !== profileId) {
    return { ok: false, error: "Not signed in or not authorized." };
  }

  const saved: SanctuaryProfileUpdate = {
    username: fields.username?.trim() || null,
    full_name: fields.full_name?.trim() || null,
    bio: fields.bio?.trim() || null,
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      ...saved,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase.auth.updateUser({
    data: {
      username: saved.username ?? undefined,
      full_name: saved.full_name ?? undefined,
    },
  });

  revalidatePath("/my-sanctuary");
  revalidatePath("/profile");
  return { ok: true, saved };
}

export async function uploadAvatar(
  userId: string,
  publicAvatarUrl: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: publicAvatarUrl, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/my-sanctuary");
  revalidatePath("/profile");
  return { success: true };
}

/** Invalidate cached My Sanctuary layout after posts or profile changes elsewhere. */
export async function revalidateMySanctuaryLayout() {
  revalidatePath("/my-sanctuary");
}

export type PublishSanctuaryPostInput = {
  mediaUrl: string;
  content: string | null;
  postType: string;
};

/** Save a sanctuary post after media has been uploaded to storage. */
export async function publishSanctuaryPost(
  input: PublishSanctuaryPostInput,
): Promise<{ ok: true; post: SanctuaryPost } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "Not signed in." };
  }

  const { error: insertError } = await supabase.from("posts").insert({
    profile_id: user.id,
    content: input.content,
    media_url: input.mediaUrl,
    post_type: input.postType,
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  const { data: row, error: fetchError } = await supabase
    .from("posts")
    .select("id, media_url, content, post_type, post_likes(count), post_comments(count)")
    .eq("profile_id", user.id)
    .eq("media_url", input.mediaUrl)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !row) {
    revalidatePath("/my-sanctuary");
    return {
      ok: true,
      post: {
        id: `pending-${crypto.randomUUID()}`,
        media_url: input.mediaUrl,
        media_type: input.postType,
        content: input.content,
        likesCount: 0,
        commentsCount: 0,
      },
    };
  }

  revalidatePath("/my-sanctuary");
  return { ok: true, post: mapPostRow(row as PostRow) };
}
