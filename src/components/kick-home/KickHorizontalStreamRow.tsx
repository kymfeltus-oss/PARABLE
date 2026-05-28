"use client";

import StreamCard from "@/components/kick-home/StreamCard";
import type { KickStreamCardData } from "@/lib/kick-home-data";

type Props = {
  streams: KickStreamCardData[];
  /** Optional section label (e.g. category name). */
  title?: string;
  className?: string;
};

/** Kick mobile — horizontally scrollable live stream cards. */
export default function KickHorizontalStreamRow({ streams, title, className = "" }: Props) {
  if (streams.length === 0) return null;

  return (
    <section className={className}>
      {title ? (
        <h2 className="mb-3 px-4 text-base font-black tracking-tight text-white">{title}</h2>
      ) : null}
      <div
        className="flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {streams.map((stream) => (
          <StreamCard key={stream.id} stream={stream} variant="rail" />
        ))}
      </div>
    </section>
  );
}
