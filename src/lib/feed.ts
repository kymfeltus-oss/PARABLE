import { createClient } from "@/utils/supabase/client";

export type FeedFilter = "home" | "following" | "profile";

export async function fetchHomeFeed(limit = 20, offset = 0) {
  const supabase = createClient();

  // NOTE: This expects posts.profile_id -> profiles.id
  // and likes/comments tables exist (you now have them).
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, profile_id, content, post_type, media_url, created_at,
      profiles:profile_id ( id, full_name, avatar_url ),
      likes(count),
      comments(count)
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data ?? [];
}

export async function fetchFollowingFeed(limit = 20, offset = 0) {
  const supabase = createClient();

  // This expects a view named "v_following_feed"
  // If you already made vSQL #11 (feed views), use that view name.
  const { data, error } = await supabase
    .from("v_following_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data ?? [];
}

export async function fetchProfileFeed(profileId: string, limit = 20, offset = 0) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, profile_id, content, post_type, media_url, created_at,
      profiles:profile_id ( id, full_name, avatar_url ),
      likes(count),
      comments(count)
    `
    )
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data ?? [];
}

export async function toggleLike(postId: string) {
  const supabase = createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userRes.user;
  if (!user) throw new Error("Not logged in.");

  // likes table: (post_id uuid, user_id uuid)
  const { data: existing, error: e1 } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (e1) throw e1;

  if (existing?.id) {
    const { error } = await supabase.from("likes").delete().eq("id", existing.id);
    if (error) throw error;
    return { liked: false };
  } else {
    const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
    if (error) throw error;
    return { liked: true };
  }
}

export async function addComment(postId: string, content: string) {
  const supabase = createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userRes.user;
  if (!user) throw new Error("Not logged in.");

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, content });

  if (error) throw error;
  return { ok: true };
}

export async function toggleBookmark(postId: string) {
  const supabase = createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;

  const user = userRes.user;
  if (!user) throw new Error("Not logged in.");

  const { data: existing, error: e1 } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (e1) throw e1;

  if (existing?.id) {
    const { error } = await supabase.from("bookmarks").delete().eq("id", existing.id);
    if (error) throw error;
    return { saved: false };
  } else {
    const { error } = await supabase.from("bookmarks").insert({ post_id: postId, user_id: user.id });
    if (error) throw error;
    return { saved: true };
  }
}
