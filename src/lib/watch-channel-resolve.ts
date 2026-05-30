import { getDemoWatchRecordById, isDemoRailWatchChannel } from "@/lib/streamers-demo-simulation";
import { getDemoPersonaById } from "@/lib/demo-personas";
import { createClient } from "@/utils/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type WatchChannelResolveResult =
  | { ok: true; channelId: string; isLive: boolean; username: string }
  | { ok: false };

/**
 * Validates watch route ids: legacy rail keys, demo personas, or live profile UUIDs.
 */
export async function resolveWatchChannelId(id: string): Promise<WatchChannelResolveResult> {
  const trimmed = id.trim();
  if (!trimmed) return { ok: false };

  if (isDemoRailWatchChannel(trimmed) || getDemoPersonaById(trimmed) || getDemoWatchRecordById(trimmed)) {
    const demo = getDemoWatchRecordById(trimmed) ?? null;
    const persona = getDemoPersonaById(trimmed);
    return {
      ok: true,
      channelId: trimmed,
      isLive: demo?.status === "live" || persona?.is_live === true || isDemoRailWatchChannel(trimmed),
      username: demo?.username ?? persona?.full_name ?? trimmed,
    };
  }

  if (!UUID_RE.test(trimmed)) {
    return { ok: false };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, full_name, is_live")
    .eq("id", trimmed)
    .maybeSingle();

  if (!data?.id) return { ok: false };

  return {
    ok: true,
    channelId: data.id,
    isLive: data.is_live === true,
    username:
      data.username?.trim() ||
      data.display_name?.trim() ||
      data.full_name?.trim() ||
      "Creator",
  };
}
