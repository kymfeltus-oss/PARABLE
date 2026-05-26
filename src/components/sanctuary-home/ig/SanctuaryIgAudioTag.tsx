"use client";

import Link from "next/link";
import { Music2 } from "lucide-react";
import type { PostAudioTrack } from "@/lib/sanctuary-post-interactions";

type Props = {
  audio: PostAudioTrack;
};

/** Footer audio attribution — routes to `/audio/[audioId]`. */
export default function SanctuaryIgAudioTag({ audio }: Props) {
  return (
    <Link
      href={`/audio/${encodeURIComponent(audio.id)}`}
      className="group mx-3 mb-2 flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-[#06111E]/50"
      aria-label={`View posts using ${audio.title}`}
    >
      <Music2 className="h-3.5 w-3.5 shrink-0 text-[#00F2FE]" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#CBD5E1] group-hover:text-[#00F2FE]" title={audio.title}>
        {audio.title}
      </span>
    </Link>
  );
}
