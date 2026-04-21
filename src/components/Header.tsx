"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  {
    name: "Play",
    href: "/play",
    active: (p: string) =>
      p === "/play" ||
      p.startsWith("/gaming") ||
      p.startsWith("/imago") ||
      p.startsWith("/voices-of-praise"),
  },
  { name: "Hubs", href: "/hubs", active: (p: string) => p === "/hubs" || p.startsWith("/hubs/") },
  { name: "Streamers", href: "/streamers" },
  {
    name: "Sanctuary",
    href: "/sanctuary",
    active: (p: string) => p === "/sanctuary" || p.startsWith("/sanctuary/"),
  },
] as const;

export default function Header() {
  const pathname = usePathname();
  const supabase = createClient();
  const { userProfile, avatarUrl } = useAuth();
  const [displayName, setDisplayName] = useState("USER");

  useEffect(() => {
    getIdentity();
  }, []);

  const getIdentity = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authUser = session?.user;

      if (authUser) {
        const { data: profile } = await supabase.from("profiles").select("username").eq("id", authUser.id).maybeSingle();

        const name = profile?.username || authUser.user_metadata?.username || "USER";
        setDisplayName(name.toUpperCase());
      }
    } catch (err) {
      console.error("Header Handshake Failure:", err);
    }
  };

  useEffect(() => {
    if (userProfile?.username || userProfile?.full_name) {
      setDisplayName(String(userProfile?.username || userProfile?.full_name).toUpperCase());
    }
  }, [userProfile?.username, userProfile?.full_name]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[150] flex justify-center border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="flex w-full max-w-[430px] flex-col gap-0 md:max-w-[480px]">
        {/* Row 1: brand + identity (never overlaps) */}
        <div className="flex min-h-[52px] items-center justify-between gap-2 px-3 pt-2 md:min-h-14 md:px-3">
          <Link href="/" className="relative block h-7 w-[6.25rem] shrink-0 md:h-8 md:w-32">
            <img src="/logo.svg" alt="Parable" className="h-full w-full object-contain object-left" />
          </Link>

          <div className="flex min-w-0 max-w-[55%] items-center justify-end gap-2">
            <div
              className={`h-8 w-8 shrink-0 overflow-hidden rounded-full bg-black md:h-9 md:w-9 ${
                Number(userProfile?.anointing_level ?? 1) > 1
                  ? "border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.75)] animate-pulse"
                  : "border border-[#00f2ff]/35"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl && avatarUrl !== "/logo.svg" ? avatarUrl : "/logo.svg"}
                alt=""
                className="h-full w-full object-cover"
                onError={fallbackAvatarOnError}
              />
            </div>
            <div className="min-w-0 truncate rounded-full border border-[#00f2ff]/30 bg-[#00f2ff]/5 px-2 py-1 shadow-[0_0_10px_#00f2ff1a] md:px-3 md:py-1.5">
              <span className="block truncate text-[8px] font-black uppercase tracking-wide text-[#00f2ff] md:text-[9px]">
                {displayName}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: full-width link rail (scroll if needed, never clipped by logo) */}
        <div className="border-t border-white/[0.06] px-2 pb-2 pt-1.5 md:px-3 md:pb-2.5">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 scrollbar-hide md:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive =
                "active" in link && link.active ? link.active(pathname ?? "") : pathname === link.href;
              const livePortalHover =
                link.href === "/sanctuary" || link.name === "Sanctuary";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide transition md:px-3 md:text-[10px] md:tracking-[0.12em] ${
                    isActive
                      ? "bg-[#00f2ff]/15 text-[#00f2ff] shadow-[0_0_12px_rgba(0,242,255,0.2)]"
                      : livePortalHover
                        ? "text-white/50 hover:bg-white/[0.07] hover:text-[#00f2ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.5)]"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
