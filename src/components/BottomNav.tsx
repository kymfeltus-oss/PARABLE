"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getMainNavItems,
  isMainNavItemActive,
  IS_STUDY_AI,
} from "@/lib/parable-main-nav";
import { shellBottomNavInnerClass, shellKindFromPathname } from "@/lib/app-shell-widths";

const STUDY_AI_ACCENT_ACTIVE = "bg-amber-500/15 border-amber-500/30 shadow-[0_0_22px_rgba(234,179,8,0.2)]";
const STUDY_AI_ACCENT_TEXT = "text-amber-400";
const PARABLE_ACCENT_ACTIVE = "bg-[#00f2fe]/15 border border-[#00f2fe]/25 shadow-[0_0_22px_rgba(0,242,254,0.18)]";
const PARABLE_ACCENT_TEXT = "text-[#00f2fe]";

function IconWrap({
  active,
  children,
  studyAi,
  compact,
  sanctuaryPortalGlow,
}: {
  active: boolean;
  children: React.ReactNode;
  studyAi?: boolean;
  compact?: boolean;
  /** Neon cyan hover for Sanctuary / Parables “portal” tabs */
  sanctuaryPortalGlow?: boolean;
}) {
  return (
    <div
      className={[
        compact ? "flex h-9 w-9 items-center justify-center rounded-xl" : "flex h-10 w-10 items-center justify-center rounded-2xl",
        "transition duration-200",
        active
          ? studyAi
            ? STUDY_AI_ACCENT_ACTIVE
            : PARABLE_ACCENT_ACTIVE
          : [
              "border border-white/10 bg-white/5 hover:bg-white/7",
              sanctuaryPortalGlow
                ? "hover:border-[#00f2ff]/55 hover:shadow-[0_0_28px_rgba(0,242,255,0.45),0_0_2px_rgba(0,242,255,0.8)]"
                : "",
            ].join(" "),
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/** Primary app navigation — fixed bottom tab bar (all breakpoints). */
export default function BottomNav() {
  const pathname = usePathname();
  const items = getMainNavItems();
  const colClass = items.length <= 4 ? "grid-cols-4" : items.length <= 5 ? "grid-cols-5" : "grid-cols-7";
  const navInner = shellBottomNavInnerClass(shellKindFromPathname(pathname));

  return (
    <div className="z-50 flex w-full shrink-0 justify-center border-t border-white/[0.06] bg-[#070708]/98 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1 backdrop-blur-md">
      <div className={navInner}>
        <div
          className={[
            "relative overflow-hidden rounded-[26px] border border-white/10 backdrop-blur-2xl",
            IS_STUDY_AI ? "bg-black/55 shadow-[0_0_80px_rgba(234,179,8,0.08)]" : "bg-black/55 shadow-[0_0_80px_rgba(0,242,254,0.10)]",
          ].join(" ")}
        >
          <div
            className={[
              "pointer-events-none absolute inset-0 opacity-[0.22]",
              IS_STUDY_AI ? "bg-[radial-gradient(circle_at_30%_10%,rgba(234,179,8,0.14),transparent_55%)]" : "bg-[radial-gradient(circle_at_30%_10%,rgba(0,242,254,0.16),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(255,255,255,0.08),transparent_55%)]",
            ].join(" ")}
          />
          <nav className={["relative grid w-full gap-x-0 gap-y-1 px-0.5 py-1.5 sm:px-1 sm:py-2", colClass].join(" ")}>
            {items.map((item) => {
              const active = isMainNavItemActive(pathname, item.href);
              const sanctuaryPortalGlow =
                item.href.includes("sanctuary") || item.href === "/parables" || item.href === "/sanctuary-reader";

              return (
                <Link key={item.href} href={item.href} className="flex min-w-0 flex-col items-center gap-0.5 sm:gap-1">
                  <IconWrap
                    active={active}
                    compact
                    studyAi={IS_STUDY_AI}
                    sanctuaryPortalGlow={sanctuaryPortalGlow}
                  >
                    {item.icon(active)}
                  </IconWrap>
                  <span
                    className={[
                      "line-clamp-2 min-h-[1.25rem] max-w-full px-0.5 text-center text-[6px] font-black uppercase leading-tight tracking-wide transition sm:min-h-[1.5rem] sm:text-[7px]",
                      active ? (IS_STUDY_AI ? "text-amber-400" : "text-[#00f2ff]") : "text-white/45",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
