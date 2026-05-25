import type { SupabaseClient } from "@supabase/supabase-js";

export function canDeleteComment(
  commentUserId: string,
  postOwnerId: string | null | undefined,
  currentUserId: string | null | undefined,
): boolean {
  if (!currentUserId) return false;
  return commentUserId === currentUserId || postOwnerId === currentUserId;
}

export async function deletePost(supabase: SupabaseClient, postId: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function deleteComment(supabase: SupabaseClient, commentId: string): Promise<void> {
  const { error } = await supabase.from("post_comments").delete().eq("id", commentId);
  if (error) throw error;
}

export async function deleteReel(supabase: SupabaseClient, reelId: string): Promise<void> {
  const { error } = await supabase.from("reels").delete().eq("id", reelId);
  if (error) throw error;
}

export async function deleteStory(supabase: SupabaseClient, storyId: string): Promise<void> {
  const { error } = await supabase.from("stories").delete().eq("id", storyId);
  if (error) throw error;
}
