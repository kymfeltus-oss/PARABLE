"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import KickStreamMetaBar from "@/components/kick-home/KickStreamMetaBar";
import GiftOverlayCanvas from "@/components/GiftOverlayCanvas";
import WorshipReactionHud from "@/components/kick-home/WorshipReactionHud";
import type { WorshipReactionKind } from "@/lib/worship-reactions";

export type KickLiveWatchPanelShell = "desktop" | "mobile";

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
  /** Mobile: sticky 16:9 player only. Desktop: player + meta bar. */
  shell?: KickLiveWatchPanelShell;
  /** Admin moderation overlay (gear HUD). */
  adminOverlay?: ReactNode;
  /** LiveKit CELEBRATION_BURST payloads for gift overlay HUD. */
  liveKitBursts?: { id: string; emoji: string }[];
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
  shell = "desktop",
  adminOverlay,
  liveKitBursts = [],
}: KickLiveWatchPanelProps) {
  const isMobileShell = shell === "mobile";

  const playerRootClass = isMobileShell
    ? "relative sticky top-0 z-50 w-full shrink-0 aspect-video overflow-hidden bg-black"
    : "relative aspect-video w-full overflow-hidden bg-black";

  const playerBlock = (
    <div className={playerRootClass} data-watch-player-root>
      {adminOverlay}
      <GiftOverlayCanvas
        streamId={streamId}
        enabled
        clipToPlayer
        liveKitBursts={liveKitBursts}
      />
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
      {!isMobileShell && onWorshipReaction ? (
        <WorshipReactionHud onReaction={onWorshipReaction} disabled={giftBusy} layout="overlay" />
      ) : null}
      {isMobileShell && onWorshipReaction ? (
        <WorshipReactionHud
          onReaction={onWorshipReaction}
          disabled={giftBusy}
          layout="mobile-rail"
        />
      ) : null}
    </div>
  );

  if (isMobileShell) {
    return <div className="w-full shrink-0 bg-black">{playerBlock}</div>;
  }

  return (
    <div className="overflow-hidden rounded-none border-0 bg-black md:rounded-lg">
      {playerBlock}
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
