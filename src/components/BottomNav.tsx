"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
};

function IconWrap({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "h-10 w-10 rounded-2xl flex items-center justify-center transition",
        active
          ? "bg-[#00f2fe]/15 border border-[#00f2fe]/25 shadow-[0_0_22px_rgba(0,242,254,0.18)]"
          : "bg-white/5 border border-white/10 hover:bg-white/7",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  const items: NavItem[] = [
    // 1) My Sanctuary
    {
      label: "My Sanctuary",
      href: "/my-sanctuary",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={active ? "text-[#00f2fe]" : "text-white/70"}
        >
          <path
            d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },

    // 2) Streamers
    {
      label: "Streamers",
      href: "/streamers",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={active ? "text-[#00f2fe]" : "text-white/70"}
        >
          <path
            d="M4 6h16v10H4V6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M8 20h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 16v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },

    // 3) Parables
    {
      label: "Parables",
      href: "/parables",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={active ? "text-[#00f2fe]" : "text-white/70"}
        >
          <path
            d="M4 19V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M6 18h12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 8h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 12h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },

    // 4) Testify
    {
      label: "Testify",
      href: "/testify",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={active ? "text-[#00f2fe]" : "text-white/70"}
        >
          <path
            d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M8 8h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 12h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },

    // 5) Music
    {
      label: "Music",
      href: "/music-hub",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={active ? "text-[#00f2fe]" : "text-white/70"}
        >
          <path
            d="M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M20 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9 18V6l11-2v12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },

    // 6) Fellowship
    {
      label: "Fellowship",
      href: "/fellowship",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={active ? "text-[#00f2fe]" : "text-white/70"}
        >
          <path
            d="M16 11a4 4 0 1 0-8 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 21a7 7 0 0 1 18 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M19 8a3 3 0 0 1 2 2.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M5 8a3 3 0 0 0-2 2.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },

    // 7) Profile
    {
      label: "Profile",
      href: "/profile",
      icon: (active) => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={active ? "text-[#00f2fe]" : "text-white/70"}
        >
          <path
            d="M20 21a8 8 0 1 0-16 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M12 13a4 4 0 1 0-4-4a4 4 0 0 0 4 4Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-black to-transparent" />
      <div className="mx-auto max-w-[1100px] px-4 pb-4">
        <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black/55 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,242,254,0.10)]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_30%_10%,rgba(0,242,254,0.16),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(255,255,255,0.08),transparent_55%)]" />
          <nav className="relative flex items-center justify-between px-4 py-3">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-2 min-w-[62px]"
                >
                  <IconWrap active={active}>{item.icon(active)}</IconWrap>
                  <div
                    className={[
                      "text-[10px] font-black uppercase tracking-[3px] transition",
                      active ? "text-[#00f2fe]" : "text-white/45",
                    ].join(" ")}
                  >
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
