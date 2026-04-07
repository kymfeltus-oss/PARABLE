"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const IS_STUDY_AI = process.env.NEXT_PUBLIC_APP_VARIANT === "parable-study-ai";

type NavItem = {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
};

const STUDY_AI_ACCENT_ACTIVE = "bg-amber-500/15 border-amber-500/30 shadow-[0_0_22px_rgba(234,179,8,0.2)]";
const STUDY_AI_ACCENT_TEXT = "text-amber-400";
const PARABLE_ACCENT_ACTIVE = "bg-[#00f2fe]/15 border border-[#00f2fe]/25 shadow-[0_0_22px_rgba(0,242,254,0.18)]";
const PARABLE_ACCENT_TEXT = "text-[#00f2fe]";

function IconWrap({
  active,
  children,
  studyAi,
  compact,
}: {
  active: boolean;
  children: React.ReactNode;
  studyAi?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        compact ? "flex h-9 w-9 items-center justify-center rounded-xl" : "flex h-10 w-10 items-center justify-center rounded-2xl",
        "transition",
        active
          ? studyAi
            ? STUDY_AI_ACCENT_ACTIVE
            : PARABLE_ACCENT_ACTIVE
          : "border border-white/10 bg-white/5 hover:bg-white/7",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

const STUDY_AI_NAV: NavItem[] = [
  {
    label: "Sanctuary",
    href: "/sanctuary-reader",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? STUDY_AI_ACCENT_TEXT : "text-white/70"}>
        <path d="M4 19V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M6 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Table",
    href: "/table",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? STUDY_AI_ACCENT_TEXT : "text-white/70"}>
        <path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 21a7 7 0 0 1 18 0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Lab",
    href: "/lab",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? STUDY_AI_ACCENT_TEXT : "text-white/70"}>
        <path d="M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M20 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? STUDY_AI_ACCENT_TEXT : "text-white/70"}>
        <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 13a4 4 0 1 0-4-4a4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (IS_STUDY_AI) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-black to-transparent" />
      <div className="w-full max-w-[430px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:max-w-[480px]">
        <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black/55 backdrop-blur-2xl shadow-[0_0_80px_rgba(234,179,8,0.08)]">
          <nav className="relative flex items-center gap-0.5 overflow-x-auto px-2 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STUDY_AI_NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href + "/"));
                return (
                  <Link key={item.href} href={item.href} className="flex shrink-0 flex-col items-center gap-1.5 min-w-[56px]">
                    <IconWrap active={active} studyAi>{item.icon(active)}</IconWrap>
                    <span className={["text-[10px] font-black uppercase tracking-[3px] transition", active ? "text-amber-400" : "text-white/45"].join(" ")}>
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

  const parableNav: NavItem[] = [
    {
      label: "Sanctuary",
      href: "/my-sanctuary",
      icon: (active) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
          <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      ),
    },

    {
      label: "Streamers",
      href: "/streamers",
      icon: (active) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
          <path d="M4 6h16v10H4V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 16v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },

    {
      label: "Play",
      href: "/play",
      icon: (active) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
          <path d="M6 12h4M8 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M15 11h.01M18 13h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 18h10a4 4 0 0 0 4-4v-2a6 6 0 0 0-6-6H9a6 6 0 0 0-6 6v2a4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      ),
    },

    {
      label: "Parables",
      href: "/parables",
      icon: (active) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
          <path d="M4 19V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M6 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },

    {
      label: "Testify",
      href: "/testify",
      icon: (active) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M8 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },

    {
      label: "Artists",
      href: "/music-hub",
      icon: (active) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
          <path d="M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      ),
    },

    {
      label: "Fellow",
      href: "/fellowship",
      icon: (active) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
          <path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 21a7 7 0 0 1 18 0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      ),
    },

    {
      label: "Profile",
      href: "/profile",
      icon: (active) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={active ? "text-[#00f2fe]" : "text-white/70"}>
          <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M12 13a4 4 0 1 0-4-4a4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
    },
  ];

  const items = IS_STUDY_AI ? STUDY_AI_NAV : parableNav;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-black to-transparent" />
      <div className="w-full max-w-[430px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:max-w-[480px]">
        <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black/55 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,242,254,0.10)]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_30%_10%,rgba(0,242,254,0.16),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(255,255,255,0.08),transparent_55%)]" />
          <nav className="relative grid grid-cols-4 gap-x-0.5 gap-y-2 px-1.5 py-2">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href + "/")) ||
                (item.href === "/play" &&
                  (pathname?.startsWith("/gaming") || pathname?.startsWith("/imago") || pathname?.startsWith("/voices-of-praise")));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-w-0 flex-col items-center gap-1"
                >
                  <IconWrap active={active} compact>
                    {item.icon(active)}
                  </IconWrap>
                  <span
                    className={[
                      "line-clamp-2 min-h-[1.5rem] max-w-full px-0.5 text-center text-[7px] font-black uppercase leading-tight tracking-wide transition",
                      active ? "text-[#00f2ff]" : "text-white/45",
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