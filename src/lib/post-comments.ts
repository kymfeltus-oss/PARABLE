/** Matches live Supabase: `user_id` FK to `profiles`, embed via `profiles(...)`. */
export const POST_COMMENT_SELECT =
  "id, post_id, user_id, content, created_at, profiles(username, avatar_url, full_name)";

export function commentAuthorId(row: {
  user_id?: string | null;
  profile_id?: string | null;
}): string {
  return String(row.user_id ?? row.profile_id ?? "");
}

export function buildCommentInsert(
  postId: string,
  userId: string,
  content: string,
): { post_id: string; user_id: string; content: string } {
  return { post_id: postId, user_id: userId, content };
}
