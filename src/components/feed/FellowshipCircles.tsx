"use client";

import Link from "next/link";
import { LiveBadge } from "./InstagramPost";

/**
 * Former “Stories” strip — PARABLE Sovereign: Fellowship Circles.
 * Ring gradient: PARABLE Cyan + Streamers action red (see LiveRolodexBrowse).
 */

const CYAN = "#00f2fe";
const ACTION_RED = "#ff6b2c";

export type FellowshipSeed = {
  id: string;
  /** `public.profiles.id` — links to `/profile/:profileId`. */
  profileId?: string;
  label: string;
  /** Optional image — otherwise `initials` or first letter of label is shown. */
  imageUrl?: string;
  initials?: string;
  /** Mirrors `profiles.is_live` — shows pulsing Live badge on the circle. */
  isLive?: boolean;
};

type Props = {
  seeds: FellowshipSeed[];
  onSelect?: (seed: FellowshipSeed) => void;
  /** Extra classes on the outer `<section>` (e.g. padding when embedded in `Stories`). */
  className?: string;
};

const circleClass =
  "group flex shrink-0 flex-col items-center gap-2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2ff]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

export default function FellowshipCircles({ seeds, onSelect, className = "" }: Props) {
  return (
    <section className={["mb-6 w-full", className].filter(Boolean).join(" ")}>
      <div className="mb-3 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#00f2fe]/70">
          Fellowship Circles
        </p>
      </div>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto overflow-y-hidden px-0.5 pb-4 pt-1">
        {seeds.map((seed) => {
          const href = seed.profileId ? `/profile/${seed.profileId}` : null;
          const inner = (
            <>
              <div className="relative inline-flex flex-col items-center">
                <div
                  className="rounded-full p-[3px] transition-transform duration-200 ease-in-out group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${CYAN}, ${ACTION_RED})`,
                  }}
                >
                  <div className="rounded-full bg-black p-[2px]">
                    <div
                      className={[
                        "h-16 w-16 overflow-hidden rounded-full",
                        seed.isLive
                          ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black shadow-[0_0_16px_rgba(239,68,68,0.55)] animate-pulse"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {seed.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={seed.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-black text-lg font-bold text-[#00f2fe]/90">
                          {(seed.initials || seed.label.slice(0, 2)).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {seed.isLive ? (
                  <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
                    <LiveBadge isLive />
                  </div>
                ) : null}
              </div>
              <span className="max-w-[76px] truncate text-[11px] font-medium text-white/80">{seed.label}</span>
            </>
          );
          if (href) {
            return (
              <Link key={seed.id} href={href} className={circleClass}>
                {inner}
              </Link>
            );
          }
          return (
            <button key={seed.id} type="button" onClick={() => onSelect?.(seed)} className={circleClass}>
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
}
