"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import type { WatchChannelContext } from "@/lib/watch-channel-context";
import HybridStreamPlayer from "@/components/watch/HybridStreamPlayer";
import StreamersHubLiveChat from "@/components/streamers/StreamersHubLiveChat";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  channelContext: WatchChannelContext;
};

export default function KickWatchExperience({ channelContext }: Props) {
  const { userProfile } = useAuth();
  const displayName = userProfile?.username || "Guest";

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#080a0c] text-white">
      <div className="relative flex min-h-0 w-full flex-1 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col bg-[#05070a]">
          <div className="border-b border-[#191f24] shadow-2xl">
            <HybridStreamPlayer
              streamId={channelContext.streamId}
              isLive={channelContext.isLive}
              ivsPlaybackUrl={channelContext.ivsPlaybackUrl}
            />
          </div>

          <div className="w-full space-y-4 bg-[#080a0c] p-4 lg:p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-[#191f24] pb-5 md:flex-row md:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#00f2fe]/30 bg-[#00f2fe]/10 text-sm font-black tracking-wider text-[#00f2fe] uppercase">
                  {channelContext.username.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <h1 className="flex items-center gap-1.5 truncate text-base font-black text-white">
                    {channelContext.displayName}
                    {channelContext.isLive ? (
                      <span className="rounded border border-red-500/30 bg-red-600/10 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
                        LIVE
                      </span>
                    ) : null}
                  </h1>
                  <p className="mt-0.5 truncate text-xs font-semibold text-zinc-400">
                    {channelContext.streamTitle?.trim() ||
                      "High-density multi-platform broadcast"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-[#00f2fe] px-5 py-2.5 text-xs font-black tracking-widest text-black uppercase shadow-xl transition-all active:scale-95 hover:bg-[#00d2dd]"
                >
                  Follow
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#191f24] bg-[#191b1f] px-5 py-2.5 text-xs font-black tracking-widest text-white uppercase transition-all active:scale-95 hover:bg-[#242c33]"
                >
                  Gift Subs
                </button>
                <div className="mx-2 hidden h-8 border-l border-[#191f24] md:block" />
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#00f2fe]">
                  <Users className="h-4 w-4" /> 2,450 watching
                </div>
              </div>
            </div>

            <Link
              href="/streamers"
              className="inline-flex text-xs text-white/50 hover:text-[#00f2fe]"
            >
              ← Back to streamers
            </Link>
          </div>
        </div>

        <aside className="relative z-10 flex h-[min(42dvh,360px)] w-full shrink-0 flex-col border-l border-[#191f24] bg-[#0b0e11] lg:h-auto lg:min-h-[500px] lg:w-[320px]">
          {channelContext.isLive ? (
            <StreamersHubLiveChat
              streamKey={channelContext.streamId}
              streamLabel={channelContext.username}
              senderDisplayName={displayName}
              variant="viewer"
              fillHeight
              showHeader
              className="min-h-0 flex-1 border-0 bg-transparent shadow-none"
            />
          ) : (
            <>
              <div className="border-b border-[#191f24] bg-[#191b1f] p-4 text-xs font-black tracking-wider text-gray-300 uppercase">
                Live Stream Chat
              </div>
              <div className="flex flex-1 items-center justify-center p-4 text-center font-mono text-xs text-zinc-600">
                Chat opens when this channel goes live.
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
