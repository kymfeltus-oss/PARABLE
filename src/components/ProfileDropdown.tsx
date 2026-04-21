"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

export type ProfileDropdownProfile = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
};

type Props = {
  profile: ProfileDropdownProfile | null;
};

type DropdownItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  onNavigate?: () => void;
};

function DropdownItem({ href, icon, label, onNavigate }: DropdownItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 transition hover:bg-[#2b2d31] hover:text-white"
    >
      {icon}
      {label}
    </Link>
  );
}

/**
 * Avatar trigger + account menu — dark Discord-style panel (`#18191c`).
 */
export default function ProfileDropdown({ profile }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login?logged_out=1");
  };

  const profileHref = profile?.id ? `/profile/${profile.id}` : "/profile";
  const displayName =
    profile?.full_name?.trim() || profile?.username?.trim() || "My Account";
  const handle = profile?.username?.trim();
  const avatarSrc = profile?.avatar_url?.trim() || "/logo.svg";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="h-8 w-8 overflow-hidden rounded-full border border-cyan-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc}
            className="h-full w-full object-cover"
            alt=""
            onError={fallbackAvatarOnError}
          />
        </div>
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 z-[100] mt-2 w-56 origin-top-right rounded-lg border border-neutral-800 bg-[#18191c] py-2 shadow-2xl ring-1 ring-black/40"
          role="menu"
        >
          <div className="mb-2 border-b border-neutral-800 px-4 py-3">
            <p className="text-sm font-bold leading-tight text-white">{displayName}</p>
            {handle ? <p className="text-xs text-gray-400">@{handle}</p> : null}
          </div>

          <DropdownItem
            href={profileHref}
            icon={<User size={16} className="shrink-0 opacity-80" aria-hidden />}
            label="My Profile"
            onNavigate={close}
          />
          <DropdownItem
            href="/settings"
            icon={<Settings size={16} className="shrink-0 opacity-80" aria-hidden />}
            label="User Settings"
            onNavigate={close}
          />

          <div className="mt-2 border-t border-neutral-800 pt-2">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <LogOut size={16} className="shrink-0" aria-hidden />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
