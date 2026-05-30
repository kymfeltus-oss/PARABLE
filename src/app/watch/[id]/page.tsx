import { notFound } from "next/navigation";
import WatchChannelClient from "@/app/watch/[id]/WatchChannelClient";
import type { WatchChannelContext } from "@/lib/watch-channel-context";
import { resolveWatchChannelId } from "@/lib/watch-channel-resolve";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type WatchPageProps = {
  params: Promise<{ id: string }>;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Unified watch entry — IVS primary playback with LiveKit WebRTC failover.
 * Preserves legacy rail ids, demo personas, and profile UUID resolution.
 */
export default async function WatchPageRoute({ params }: WatchPageProps) {
  const { id } = await params;
  const resolved = await resolveWatchChannelId(id);

  if (!resolved.ok) {
    notFound();
  }

  let ivsPlaybackUrl = "";
  let displayName = resolved.username;
  let streamTitle = "";

  if (UUID_RE.test(resolved.channelId)) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, full_name, is_live, stream_title, amazon_ivs_playback_url",
      )
      .eq("id", resolved.channelId)
      .maybeSingle();

    if (profile) {
      ivsPlaybackUrl = profile.amazon_ivs_playback_url?.trim() ?? "";
      displayName =
        profile.display_name?.trim() ||
        profile.full_name?.trim() ||
        profile.username?.trim() ||
        displayName;
      streamTitle = profile.stream_title?.trim() ?? "";
    }
  }

  const channelContext: WatchChannelContext = {
    streamId: resolved.channelId,
    username: resolved.username,
    displayName,
    isLive: resolved.isLive,
    ivsPlaybackUrl,
    streamTitle,
  };

  return (
    <div className="min-h-[100dvh] w-full overflow-hidden bg-[#080a0c]">
      <WatchChannelClient channelContext={channelContext} />
    </div>
  );
}
