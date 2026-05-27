"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import KickStreamMetaBar from "@/components/kick-home/KickStreamMetaBar";
import KickStreamPlayerChrome from "@/components/kick-home/KickStreamPlayerChrome";
import GiftOverlayCanvas from "@/components/GiftOverlayCanvas";

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
  onSubscribe,
  videoSlot,
  loadingVideo,
  videoError,
}: KickLiveWatchPanelProps) {
  return (
    <div className="overflow-hidden rounded-none border-0 bg-black sm:rounded-lg">
      <div className="relative aspect-video w-full bg-black">
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
        <KickStreamPlayerChrome isLive />
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
