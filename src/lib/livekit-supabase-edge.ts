import type { SupabaseClient } from "@supabase/supabase-js";
import { isParableDevGuestClientEnabled } from "@/lib/parable-dev-guest";

export type LiveKitEdgeTokenResponse = {
  token: string;
  url: string;
  room: string;
  identity?: string;
  name?: string;
};

/**
 * Mints a LiveKit publisher token via the Next.js API route (same path as /live-studio).
 */
export async function fetchLiveKitPublisherToken(
  supabase: SupabaseClient,
  room: string,
): Promise<{ data: LiveKitEdgeTokenResponse | null; error: string | null }> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const guestAllowed = isParableDevGuestClientEnabled();
  const accessToken = session?.access_token;

  if (!accessToken && !guestAllowed) {
    return {
      data: null,
      error: sessionError?.message ?? "Sign in required to go live.",
    };
  }

  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (accessToken) {
      headers.authorization = `Bearer ${accessToken}`;
    }

    const res = await fetch("/api/livekit/token", {
      method: "POST",
      headers,
      credentials: "same-origin",
      body: JSON.stringify({ room, roomName: room }),
    });

    const raw = await res.text();
    let payload: LiveKitEdgeTokenResponse & { error?: string } = {} as LiveKitEdgeTokenResponse;
    try {
      payload = raw ? (JSON.parse(raw) as typeof payload) : ({} as typeof payload);
    } catch {
      return { data: null, error: raw.trim() || `Token request failed (HTTP ${res.status}).` };
    }

    if (!res.ok) {
      return { data: null, error: payload.error || `Token request failed (HTTP ${res.status}).` };
    }

    if (!payload.token || !payload.url) {
      return { data: null, error: "Invalid token response from /api/livekit/token." };
    }

    return { data: payload, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token request failed.";
    return { data: null, error: message };
  }
}

/** @deprecated Use fetchLiveKitPublisherToken — kept for existing imports. */
export const fetchLiveKitTokenFromEdge = fetchLiveKitPublisherToken;
