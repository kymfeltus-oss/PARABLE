"use client";

import type React from "react";

const IS_STUDY_AI = process.env.NEXT_PUBLIC_APP_VARIANT === "parable-study-ai";

export type MainNavItem = {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
};

export const STUDY_AI_MAIN_NAV: MainNavItem[] = [
  {
    label: "Sanctuary",
    href: "/sanctuary-reader",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-amber-400" : "text-white/70"}>
        <path d="M4 19V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Table",
    href: "/table",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-amber-400" : "text-white/70"}>
        <path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 21a7 7 0 0 1 18 0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Lab",
    href: "/lab",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-amber-400" : "text-white/70"}>
        <path d="M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="2" />
        <path d="M20 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="2" />
        <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-amber-400" : "text-white/70"}>
        <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 13a4 4 0 1 0-4-4a4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

export const PARABLE_MAIN_NAV: MainNavItem[] = [
  {
    label: "Sanctuary",
    href: "/sanctuary",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Streamers",
    href: "/streamers",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
        <path d="M4 6h16v10H4V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 16v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Play",
    href: "/play",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
        <path d="M6 12h4M8 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 11h.01M18 13h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 18h10a4 4 0 0 0 4-4v-2a6 6 0 0 0-6-6H9a6 6 0 0 0-6 6v2a4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Parables",
    href: "/parables",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
        <path d="M4 19V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Artists",
    href: "/music-hub",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
        <path d="M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="2" />
        <path d="M20 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="2" />
        <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Fellow",
    href: "/fellowship",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
        <path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 21a7 7 0 0 1 18 0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
        <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 13a4 4 0 1 0-4-4a4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

export function getMainNavItems(): MainNavItem[] {
  return IS_STUDY_AI ? STUDY_AI_MAIN_NAV : PARABLE_MAIN_NAV;
}

export function isMainNavItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(href + "/")) return true;
  if (href === "/parables" && (pathname === "/writers-hub" || pathname === "/studio-hub")) return true;
  if (
    href === "/play" &&
    (pathname.startsWith("/gaming") || pathname.startsWith("/imago") || pathname.startsWith("/voices-of-praise"))
  ) {
    return true;
  }
  return false;
}

export { IS_STUDY_AI };
