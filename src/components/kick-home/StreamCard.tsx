"use client";

import { Eye, Radio } from "lucide-react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import type { KickStreamCardData } from "@/lib/kick-home-data";

export type StreamCardProps = {
  stream: KickStreamCardData;
  onWatch?: (id: string) => void;
};

export default function StreamCard({ stream, onWatch }: StreamCardProps) {
  return (
    <button
      type="button"
      onClick={() => onWatch?.(stream.id)}
      className="group w-full overflow-hidden rounded-lg border border-[#24272c] bg-[#191b1f] text-left transition-all duration-200 hover:scale-[1.02] hover:border-[#00f2fe]/35 hover:shadow-[0_10px_32px_rgba(0,0,0,0.45)]"
    >
      <div className="relative aspect-video w-full overflow-hidden" style={{ background: stream.thumbnailGradient }}>
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
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#24272c]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stream.profilePicture}
            alt=""
            className="h-full w-full object-cover"
            onError={fallbackAvatarOnError}
          />
          {stream.isLive ? (
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-[#191b1f] bg-red-500" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">{stream.creator}</p>
          <p className="truncate text-[10px] text-[#94a3b8]">{stream.category}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-mono tabular-nums text-[#64748b]">
          <Eye size={12} className="text-[#00f2fe]/80" />
          {stream.viewers}
        </span>
      </div>
    </button>
  );
}
