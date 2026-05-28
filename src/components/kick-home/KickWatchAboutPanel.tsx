"use client";

import KickStreamMetaBar from "@/components/kick-home/KickStreamMetaBar";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

export type KickWatchAboutPanelProps = {
  username: string;
  avatarUrl: string;
  streamTitle: string;
  tags: string[];
  viewerCount: number;
  followerCount: number;
  bio: string;
  liveCategory: string;
  verified?: boolean;
  isFollowing: boolean;
  followBusy?: boolean;
  giftBusy?: boolean;
  onFollow: () => void;
  onGiftSubs: () => void;
  onSubscribe?: () => void;
};

/** Mobile "About" tab — streamer card, metadata, and follow actions. */
export default function KickWatchAboutPanel({
  username,
  avatarUrl,
  streamTitle,
  tags,
  viewerCount,
  followerCount,
  bio,
  liveCategory,
  verified,
  isFollowing,
  followBusy,
  giftBusy,
  onFollow,
  onGiftSubs,
  onSubscribe,
}: KickWatchAboutPanelProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-950 px-4 py-4 pb-8">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-full border-2 border-slate-700 object-cover"
          onError={fallbackAvatarOnError}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-white">{username}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-500">{liveCategory}</p>
          <p className="mt-1 text-xs text-slate-400">
            {followerCount.toLocaleString()} followers · {viewerCount.toLocaleString()} watching
          </p>
        </div>
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

      <section className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">About</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{bio}</p>
      </section>

      <section className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Channel</h3>
        <dl className="mt-2 space-y-2 text-sm text-slate-300">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Category</dt>
            <dd className="font-semibold text-white">{liveCategory}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Language</dt>
            <dd className="font-semibold text-white">English</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
