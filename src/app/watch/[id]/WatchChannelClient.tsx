"use client";

import KickWatchExperience from "@/components/kick-home/KickWatchExperience";
import type { WatchChannelContext } from "@/lib/watch-channel-context";

type Props = {
  channelContext: WatchChannelContext;
};

/** Full interactive watch — chat, reactions, IVS/LiveKit hybrid, Go Live. */
export default function WatchChannelClient({ channelContext }: Props) {
  return (
    <KickWatchExperience
      channelId={channelContext.streamId}
      ivsPlaybackUrl={channelContext.ivsPlaybackUrl}
    />
  );
}
