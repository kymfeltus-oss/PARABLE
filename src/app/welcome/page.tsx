"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * Post-flash welcome — account gateway (no MP4; intro lives at `/`).
 */
export default function WelcomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#020406] px-6 text-center text-white">
      <div className="relative mb-10 h-16 w-64 max-w-[88vw]">
        <Image
          src="/logo/logo.svg"
          alt="PARABLE"
          fill
          priority
          className="object-contain"
        />
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.42em] text-[#00f2fe]">
        THE FUTURE OF KINGDOM MEDIA
      </p>
      <p className="mb-10 text-sm tracking-[0.2em] text-white/70">
        STREAMING • CREATING • BELIEVING
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Link
          href="/create-account"
          className="inline-flex min-w-[200px] items-center justify-center rounded-lg border-2 border-[#00f2fe] bg-[#00f2fe]/10 px-8 py-3 text-sm font-semibold tracking-widest text-white shadow-[0_0_24px_rgba(0,242,254,0.35)] transition hover:bg-[#00f2fe]/20"
        >
          CREATE ACCOUNT
        </Link>
        <Link
          href="/login"
          className="inline-flex min-w-[200px] items-center justify-center rounded-lg border border-white/25 bg-white/5 px-8 py-3 text-sm font-semibold tracking-widest text-white/90 transition hover:bg-white/10"
        >
          LOG IN
        </Link>
      </div>
    </main>
  );
}
