"use client";

import Link from "next/link";
import { Eye, Radio } from "lucide-react";
import ChannelAvatar from "@/components/kick-home/ChannelAvatar";
import type { KickStreamCardData } from "@/lib/kick-home-data";

export type StreamCardProps = {
  stream: KickStreamCardData;
};

export default function StreamCard({ stream }: StreamCardProps) {
  const thumbStyle = {
    background: stream.thumbnailGradient,
  };

  return (
    <Link
      href={`/watch/${stream.id}`}
      className="group w-full overflow-hidden rounded-lg border border-[#24272c] bg-[#191b1f] text-left transition-all duration-200 hover:scale-[1.02] hover:border-[#00f2fe]/35 hover:shadow-[0_10px_32px_rgba(0,0,0,0.45)]"
    >
      <div className="relative aspect-video w-full overflow-hidden" style={thumbStyle}>
        {stream.isLive ? (
          <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded bg-[#00f2fe] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-black">
            <Radio size={10} strokeWidth={3} />
            Live
          </span>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <p className="line-clamp-2 text-sm font-bold text-white drop-shadow-md">{stream.title}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-2.5 py-2.5">
        <ChannelAvatar
          src={stream.profilePicture}
          displayName={stream.creator}
          className="h-8 w-8"
          liveRing={stream.isLive}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">{stream.creator}</p>
          <p className="truncate text-[10px] text-[#94a3b8]">{stream.category}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-mono tabular-nums text-[#64748b]">
          <Eye size={12} className="text-[#00f2fe]/80" />
          {stream.viewers}
        </span>
      </div>
    </Link>
  );
}
