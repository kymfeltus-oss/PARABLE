"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Globe,
  Menu,
  MessageSquare,
  MonitorPlay,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onMenuClick: () => void;
  onChatClick: () => void;
};

export default function KickTopNav({ query, onQueryChange, onMenuClick, onChatClick }: Props) {
  const router = useRouter();
  const { userProfile, avatarUrl, loading: authLoading } = useAuth();
  const displayName = userProfile?.username || userProfile?.full_name || "Guest";
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      {/* Kick mobile header (< md) */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-[#24272c] bg-black px-3 md:hidden">
        <Link href="/streamers" className="flex shrink-0 items-center gap-1.5">
          <span className="text-xl font-black uppercase tracking-tight text-[#53fc18]">PARABLE</span>
          <span className="rounded bg-white/10 px-1 py-px text-[8px] font-bold uppercase text-[#94a3b8]">
            Beta
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => router.push("/streamers")}
            className="flex h-10 w-10 items-center justify-center text-white"
            aria-label="Live streams"
          >
            <MonitorPlay size={22} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => router.push("/browse")}
            className="flex h-10 w-10 items-center justify-center text-white"
            aria-label="Browse"
          >
            <Globe size={22} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setMobileSearchOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center text-white"
            aria-label="Search"
            aria-expanded={mobileSearchOpen}
          >
            <Search size={22} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => router.push(userProfile ? "/profile" : "/login")}
            className="flex h-10 w-10 items-center justify-center text-white"
            aria-label="Profile"
          >
            {authLoading ? (
              <User size={22} />
            ) : (
              <div className="h-7 w-7 overflow-hidden rounded-full bg-[#24272c]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl || "/logo.svg"}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={fallbackAvatarOnError}
                />
              </div>
            )}
          </button>
        </div>
      </header>

      {mobileSearchOpen ? (
        <div className="fixed inset-x-0 top-14 z-50 border-b border-[#24272c] bg-black px-3 py-2 md:hidden">
          <label className="flex items-center gap-2 rounded-lg border border-[#24272c] bg-[#191b1f] px-3 py-2.5">
            <Search size={18} className="shrink-0 text-[#64748b]" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search live"
              className="w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-[#64748b]"
              style={{ fontSize: "16px" }}
            />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="shrink-0 text-[#64748b]"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </label>
        </div>
      ) : null}

      {/* Desktop / tablet header (≥ md) */}
      <header className="fixed inset-x-0 top-0 z-50 hidden h-14 shrink-0 items-center gap-3 border-b border-[#24272c] bg-[#0b0e11]/95 px-3 backdrop-blur-md sm:px-4 md:flex">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-[#191b1f] lg:hidden"
          aria-label="Toggle channels sidebar"
        >
          <Menu size={22} strokeWidth={2.25} />
        </button>

        <Link href="/streamers" className="relative flex shrink-0 items-center gap-2 lg:hidden">
          <span className="text-lg font-black uppercase tracking-tight text-[#53fc18]">PARABLE</span>
          <span className="rounded bg-white/10 px-1 py-px text-[8px] font-bold uppercase text-[#94a3b8]">
            Beta
          </span>
        </Link>

        <div className="mx-auto flex min-w-0 max-w-xl flex-1 items-center justify-center px-1 sm:px-4">
          <label className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-[#24272c] bg-[#191b1f] px-3 py-2 transition-colors focus-within:border-[#00f2fe]/50">
            <Search size={16} className="shrink-0 text-[#64748b]" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search live streams, channels, categories"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-[#64748b]"
            />
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onChatClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#191b1f] hover:text-[#00f2fe] lg:hidden"
            aria-label="Toggle live chat"
          >
            <MessageSquare size={18} />
          </button>
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#191b1f] hover:text-white sm:flex"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#191b1f] hover:text-white sm:flex"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            onClick={() => router.push(userProfile ? "/profile" : "/login")}
            className="flex items-center gap-2 rounded-lg border border-[#24272c] bg-[#191b1f] py-1 pl-1 pr-2.5 transition-colors hover:border-[#00f2fe]/35"
          >
            <div className="relative h-7 w-7 overflow-hidden rounded-md bg-[#24272c]">
              {authLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <User size={14} className="text-[#64748b]" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl || "/logo.svg"}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={fallbackAvatarOnError}
                />
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#191b1f] bg-[#00f2fe]" />
            </div>
            <span className="hidden max-w-[6rem] truncate text-xs font-semibold text-white md:inline">
              {displayName}
            </span>
          </button>
        </div>
      </header>
    </>
  );
}
