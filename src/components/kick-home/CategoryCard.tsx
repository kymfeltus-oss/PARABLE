"use client";

import { useState } from "react";
import Link from "next/link";
import { Radio, Users } from "lucide-react";
import {
  categoryCoverFallback,
  categoryCoverImage,
} from "@/lib/kick-discovery-media";
import type { KickCategoryItem } from "@/lib/kick-home-data";

type Props = {
  category: KickCategoryItem;
  className?: string;
};

export default function CategoryCard({ category, className = "" }: Props) {
  const [src, setSrc] = useState(() => categoryCoverImage(category.id));

  return (
    <Link
      href={category.href}
      className={[
        "group relative block min-w-0 overflow-hidden rounded-lg border border-[#24272c] bg-[#191b1f] transition-all duration-200 hover:scale-[1.02] hover:border-[#00f2fe]/45 hover:shadow-[0_12px_36px_rgba(0,242,254,0.18)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{ background: category.gradient }}
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setSrc(categoryCoverFallback(category.id))}
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#0b0e11] via-[#0b0e11]/25 to-[#0b0e11]/10" />
        <div
          className="pointer-events-none absolute inset-0 z-[2] opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 15%, rgba(0,242,254,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(0,242,254,0.2) 0%, transparent 40%)",
          }}
          aria-hidden
        />

        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]">
          <Radio size={9} strokeWidth={3} className="animate-pulse" />
          Live
        </span>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
          <p className="text-sm font-black uppercase tracking-wide text-white transition-colors group-hover:text-[#00f2fe]">
            {category.title}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] font-semibold tabular-nums text-[#00f2fe]">
            <Users size={11} className="shrink-0 opacity-90" />
            {category.watching} watching
          </p>
        </div>
      </div>
    </Link>
  );
}
