"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Play, Radio } from "lucide-react";
import ChannelAvatar from "@/components/kick-home/ChannelAvatar";
import {
  streamThumbnailFallback,
  streamThumbnailImage,
} from "@/lib/kick-discovery-media";
import type { KickStreamCardData } from "@/lib/kick-home-data";

export type StreamCardProps = {
  stream: KickStreamCardData;
  /** `rail` — fixed-width card for Kick mobile horizontal rows. */
  variant?: "grid" | "rail";
};

export default function StreamCard({ stream, variant = "grid" }: StreamCardProps) {
  const isRail = variant === "rail";
  const [thumbSrc, setThumbSrc] = useState(
    () => stream.thumbnailUrl || streamThumbnailImage(stream.id),
  );

  return (
    <Link
      href={`/watch/${stream.id}`}
      className={[
        "group overflow-hidden rounded-lg border border-[#24272c] bg-[#191b1f] text-left transition-all duration-200 hover:border-[#00f2fe]/45",
        isRail
          ? "w-[min(88vw,340px)] shrink-0 snap-start hover:shadow-[0_8px_28px_rgba(0,242,254,0.15)]"
          : "w-full min-w-0 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,242,254,0.2)]",
      ].join(" ")}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{ background: stream.thumbnailGradient }}
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbSrc}
          alt=""
          className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setThumbSrc(streamThumbnailFallback(stream.id))}
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#0b0e11]/95 via-[#0b0e11]/35 to-transparent" />
        <div
          className="pointer-events-none absolute inset-0 z-[2] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,242,254,0.12) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        {stream.isLive ? (
          <span
            className={
              isRail
                ? "absolute left-2 top-2 z-10 rounded bg-[#53fc18] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-black"
                : "absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-[0_0_14px_rgba(239,68,68,0.55)]"
            }
          >
            {isRail ? "Live" : (
              <>
                <Radio size={10} strokeWidth={3} className="animate-pulse" />
                Live
              </>
            )}
          </span>
        ) : null}

        {!isRail ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00f2fe]/90 text-black shadow-[0_0_24px_rgba(0,242,254,0.45)]">
              <Play size={20} fill="currentColor" />
            </span>
          </div>
        ) : null}

        {!isRail ? (
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <p className="line-clamp-2 text-sm font-bold text-white drop-shadow-md">{stream.title}</p>
          </div>
        ) : null}

        <span
          className={
            isRail
              ? "absolute bottom-2 left-2 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
              : "absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#00f2fe] backdrop-blur-sm"
          }
        >
          {isRail ? (
            <>{stream.viewers} watching</>
          ) : (
            <>
              <Eye size={11} />
              {stream.viewers}
            </>
          )}
        </span>
      </div>

      <div className="flex items-start gap-2 px-2.5 py-2.5">
        <ChannelAvatar
          src={stream.profilePicture}
          displayName={stream.creator}
          className="h-9 w-9 shrink-0"
          liveRing={stream.isLive}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{stream.creator}</p>
          {isRail ? (
            <>
              <p className="line-clamp-2 text-xs text-slate-300">{stream.title}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="rounded bg-[#2b2f32] px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                  {stream.category}
                </span>
                <span className="rounded bg-[#2b2f32] px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                  English
                </span>
              </div>
            </>
          ) : (
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#64748b]">
              {stream.category}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
