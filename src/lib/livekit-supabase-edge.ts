import type { SupabaseClient } from "@supabase/supabase-js";

export type LiveKitEdgeTokenResponse = {
  token: string;
  url: string;
  room: string;
  identity?: string;
  name?: string;
};

/**
 * Calls the Supabase Edge Function `get-livekit-token` (JWT forwarded by the Supabase client).
 */
export async function fetchLiveKitTokenFromEdge(
  supabase: SupabaseClient,
  room: string,
  /** Display label for the LiveKit token `name` claim (edge still binds `identity` to `auth.uid()`). */
  username: string,
): Promise<{ data: LiveKitEdgeTokenResponse | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke<LiveKitEdgeTokenResponse>("get-livekit-token", {
    body: { room, username },
  });

  if (error) {
    return { data: null, error: error.message || "Edge function failed" };
  }

  if (!data?.token || !data?.url) {
    return { data: null, error: "Invalid token response from get-livekit-token" };
  }

  return { data, error: null };
}
