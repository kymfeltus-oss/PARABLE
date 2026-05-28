"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import KickStreamMetaBar from "@/components/kick-home/KickStreamMetaBar";
import GiftOverlayCanvas from "@/components/GiftOverlayCanvas";
import WorshipReactionHud from "@/components/kick-home/WorshipReactionHud";
import type { WorshipReactionKind } from "@/lib/worship-reactions";

export type KickLiveWatchPanelProps = {
  streamId: string;
  username: string;
  avatarUrl: string;
  streamTitle: string;
  tags: string[];
  viewerCount: number;
  verified?: boolean;
  isFollowing: boolean;
  followBusy?: boolean;
  giftBusy?: boolean;
  onFollow: () => void;
  onGiftSubs: () => void;
  onWorshipReaction?: (kind: WorshipReactionKind) => void;
  onSubscribe?: () => void;
  videoSlot: ReactNode;
  loadingVideo?: boolean;
  videoError?: string | null;
};

/** Kick-style video shell + player chrome + meta bar (Follow, Gift Subs, Subscribe, stats). */
export default function KickLiveWatchPanel({
  streamId,
  username,
  avatarUrl,
  streamTitle,
  tags,
  viewerCount,
  verified,
  isFollowing,
  followBusy,
  giftBusy,
  onFollow,
  onGiftSubs,
  onWorshipReaction,
  onSubscribe,
  videoSlot,
  loadingVideo,
  videoError,
}: KickLiveWatchPanelProps) {
  return (
    <div className="overflow-hidden rounded-none border-0 bg-black sm:rounded-lg">
      <div className="relative aspect-video w-full bg-black" data-watch-player-root>
        <GiftOverlayCanvas streamId={streamId} enabled />
        {loadingVideo ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            Connecting to stream…
          </div>
        ) : videoError ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-4 text-center text-sm text-red-300">
            {videoError}
          </div>
        ) : (
          videoSlot
        )}
        {onWorshipReaction ? (
          <WorshipReactionHud onReaction={onWorshipReaction} disabled={giftBusy} />
        ) : null}
      </div>

      <KickStreamMetaBar
        username={username}
        avatarUrl={avatarUrl}
        streamTitle={streamTitle}
        tags={tags}
        viewerCount={viewerCount}
        verified={verified}
        isFollowing={isFollowing}
        followBusy={followBusy}
        giftBusy={giftBusy}
        onFollow={onFollow}
        onGiftSubs={onGiftSubs}
        onSubscribe={onSubscribe}
      />
    </div>
  );
}
