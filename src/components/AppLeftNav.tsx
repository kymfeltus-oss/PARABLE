"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMainNavItems, isMainNavItemActive, IS_STUDY_AI } from "@/lib/parable-main-nav";

const RAIL_W = "w-56";

/**
 * Desktop-only primary navigation (matches BottomNav). Mobile uses the bottom tab bar.
 */
export default function AppLeftNav() {
  const pathname = usePathname();
  const items = getMainNavItems();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden shrink-0 flex-col border-r border-white/[0.08] bg-[#040405] lg:flex ${RAIL_W}`}
      aria-label="Main navigation"
    >
      <Link href="/" className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-4 py-4">
        <Image src="/logo.svg" alt="PARABLE" width={112} height={28} className="h-7 w-auto object-contain object-left" priority />
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 scrollbar-hide">
        {items.map((item) => {
          const active = isMainNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition",
                active
                  ? IS_STUDY_AI
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-[#00f2fe]/12 text-[#00f2fe]"
                  : "text-white/65 hover:bg-white/[0.05] hover:text-white",
              ].join(" ")}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                {item.icon(active)}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/** Offset for main content so it clears the fixed rail (`lg:pl-[14rem]` = w-56). */
export const APP_LEFT_NAV_WIDTH_CLASS = "lg:pl-56";
