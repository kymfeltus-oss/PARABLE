"use client";

import Link from "next/link";
import { Info, X } from "lucide-react";
import { useState } from "react";

/** Kick-style full-width promo strip on mobile discovery. */
export default function KickMobilePromoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative mx-4 overflow-hidden rounded-lg border border-[#24272c] bg-gradient-to-r from-[#1a1f24] via-[#0f1419] to-[#1a2420]">
      <div className="flex min-h-[72px] items-center gap-3 px-4 py-3 pr-16">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-black uppercase tracking-tight text-white">Win 100 Subs</p>
          <p className="text-xs text-slate-400">Fellowship giveaway · PARABLE Live</p>
        </div>
        <Link
          href="/wallet"
          className="shrink-0 rounded-md bg-[#53fc18] px-4 py-2 text-sm font-black uppercase text-black transition hover:brightness-110"
        >
          Enter
        </Link>
      </div>
      <button
        type="button"
        aria-label="Dismiss promo"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:text-white"
      >
        <X size={16} />
      </button>
      <span className="pointer-events-none absolute right-10 top-2 text-slate-600" aria-hidden>
        <Info size={14} />
      </span>
    </div>
  );
}
