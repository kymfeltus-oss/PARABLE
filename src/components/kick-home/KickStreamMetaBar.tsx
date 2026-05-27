"use client";

import {
  BadgeCheck,
  Gift,
  Heart,
  Share2,
  Star,
  TriangleAlert,
  Users,
} from "lucide-react";

const KICK_GREEN = "#53fc18";
const BTN_GRAY = "#2b2f32";

export type KickStreamMetaBarProps = {
  username: string;
  avatarUrl: string;
  streamTitle: string;
  tags?: string[];
  viewerCount: number;
  verified?: boolean;
  isFollowing: boolean;
  followBusy?: boolean;
  giftBusy?: boolean;
  onFollow: () => void;
  onGiftSubs: () => void;
  onSubscribe?: () => void;
  onShare?: () => void;
  onReport?: () => void;
};

export default function KickStreamMetaBar({
  username,
  avatarUrl,
  streamTitle,
  tags = [],
  viewerCount,
  verified = true,
  isFollowing,
  followBusy = false,
  giftBusy = false,
  onFollow,
  onGiftSubs,
  onSubscribe,
  onShare,
  onReport,
}: KickStreamMetaBarProps) {
  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      void navigator.share({ title: `${username} live`, url }).catch(() => {});
    } else if (url) {
      void navigator.clipboard.writeText(url);
      alert("Link copied to clipboard.");
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport();
      return;
    }
    if (window.confirm("Report this stream to PARABLE moderators?")) {
      alert("Report submitted. Thank you.");
    }
  };

  const primaryTag = tags[0];

  return (
    <div className="bg-black px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="relative shrink-0">
            <div
              className="h-14 w-14 overflow-hidden rounded-full sm:h-16 sm:w-16"
              style={{ boxShadow: `0 0 0 3px ${KICK_GREEN}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <span
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black"
              style={{ backgroundColor: KICK_GREEN }}
            >
              Live
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-white sm:text-xl">{username}</h1>
              {verified ? (
                <BadgeCheck
                  size={20}
                  className="shrink-0"
                  style={{ color: KICK_GREEN }}
                  fill={KICK_GREEN}
                  strokeWidth={2.5}
                  aria-label="Verified"
                />
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-white/90">{streamTitle}</p>
            {tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={
                      i === 0
                        ? { backgroundColor: "rgba(83,252,24,0.15)", color: KICK_GREEN }
                        : { backgroundColor: "#2b2f32", color: "#e2e8f0" }
                    }
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onFollow}
              disabled={followBusy}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: isFollowing ? BTN_GRAY : KICK_GREEN, color: isFollowing ? "#fff" : "#000" }}
            >
              {!isFollowing ? <Heart size={16} fill="black" strokeWidth={0} /> : null}
              {isFollowing ? "Following" : "Follow"}
            </button>

            <button
              type="button"
              onClick={onGiftSubs}
              disabled={giftBusy}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#353a3e] disabled:opacity-50"
              style={{ backgroundColor: BTN_GRAY }}
            >
              <Gift size={16} />
              Gift Subs
            </button>

            <button
              type="button"
              onClick={onSubscribe}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#353a3e]"
              style={{ backgroundColor: BTN_GRAY }}
            >
              <Star size={16} />
              Subscribe
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span
              className="flex items-center gap-1.5 font-semibold tabular-nums"
              style={{ color: KICK_GREEN }}
            >
              <Users size={16} />
              {viewerCount.toLocaleString()} Viewers
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 text-white/80 transition-colors hover:text-white"
              aria-label="Share stream"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              onClick={handleReport}
              className="flex items-center gap-1 text-white/80 transition-colors hover:text-white"
              aria-label="Report stream"
            >
              <TriangleAlert size={16} />
            </button>
          </div>
        </div>
      </div>

      {primaryTag ? (
        <p className="sr-only">Primary category: {primaryTag}</p>
      ) : null}
    </div>
  );
}
