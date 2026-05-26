import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Toggle `profiles.is_live` for the streamer command center / studio shell.
 * Requires RLS allowing users to update their own profile row.
 */
export async function setProfileLiveStatus(
  supabase: SupabaseClient,
  userId: string,
  isLive: boolean,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("profiles").update({ is_live: isLive }).eq("id", userId);
  return { error: error ? new Error(error.message) : null };
}
