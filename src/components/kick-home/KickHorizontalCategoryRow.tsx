"use client";

import CategoryCard from "@/components/kick-home/CategoryCard";
import type { KickCategoryItem } from "@/lib/kick-home-data";

type Props = {
  categories: KickCategoryItem[];
  className?: string;
};

/** Kick mobile — horizontally scrollable category portrait tiles. */
export default function KickHorizontalCategoryRow({ categories, className = "" }: Props) {
  return (
    <div
      className={[
        "flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} className="w-36 shrink-0 snap-start sm:w-40" />
      ))}
    </div>
  );
}
