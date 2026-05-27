"use client";

import Link from "next/link";
import type { KickCategoryItem } from "@/lib/kick-home-data";

type Props = {
  category: KickCategoryItem;
};

export default function CategoryCard({ category }: Props) {
  return (
    <Link
      href={category.href}
      className="group relative block overflow-hidden rounded-lg border border-[#24272c] bg-[#191b1f] transition-all duration-200 hover:scale-[1.02] hover:border-[#00f2fe]/40 hover:shadow-[0_8px_28px_rgba(0,242,255,0.12)]"
    >
      <div className="aspect-[3/4] w-full" style={{ background: category.gradient }}>
        <div className="flex h-full flex-col justify-end p-3">
          <p className="text-sm font-bold text-white transition-colors group-hover:text-[#00f2fe]">
            {category.title}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-[#94a3b8]">{category.watching} watching</p>
        </div>
      </div>
    </Link>
  );
}
