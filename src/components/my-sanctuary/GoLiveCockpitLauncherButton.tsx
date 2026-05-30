"use client";

import Link from "next/link";
import { Radio } from "lucide-react";

/** Shortcut to the standalone creator cockpit at `/dashboard/streamers`. */
export function GoLiveCockpitLauncherButton() {
  return (
    <Link
      href="/dashboard/streamers"
      data-testid="go-live-cockpit-fab"
      aria-label="Go Live Panel"
      className="group fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-[#00f2ff] px-5 py-4 text-xs font-black tracking-widest text-black uppercase shadow-[0_15px_40px_-5px_rgba(0,242,255,0.4)] transition-all hover:bg-[#00d2dd] active:scale-95 sm:right-6"
    >
      <Radio className="h-4 w-4 animate-pulse text-black" />
      <span className="max-w-0 overflow-hidden font-black whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs">
        Go Live Panel
      </span>
    </Link>
  );
}
