"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Heart, Home, Menu } from "lucide-react";
import { useStreamersUiStore } from "@/stores/streamers-ui-store";

const NAV = [
  { href: "/streamers", label: "Home", Icon: Home },
  { href: "/browse", label: "Browse", Icon: Clapperboard },
  { href: "/following", label: "Following", Icon: Heart },
] as const;

type Props = {
  collapsed?: boolean;
};

export default function KickSidebarBrand({ collapsed = false }: Props) {
  const pathname = usePathname();
  const toggleSidebar = useStreamersUiStore((s) => s.toggleSidebar);
  const toggleSidebarCollapsed = useStreamersUiStore((s) => s.toggleSidebarCollapsed);
  const setSidebarOpen = useStreamersUiStore((s) => s.setSidebarOpen);

  const onMenuClick = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      toggleSidebarCollapsed();
      return;
    }
    toggleSidebar();
    setSidebarOpen(true);
  };

  return (
    <div className="shrink-0 border-b border-[#24272c]">
      <div
        className={`flex items-center gap-3 px-3 py-4 ${collapsed ? "flex-col gap-2 px-2" : ""}`}
      >
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-[#24272c]"
          aria-label="Toggle sidebar menu"
        >
          <Menu size={22} strokeWidth={2.25} />
        </button>

        {!collapsed ? (
          <Link href="/streamers" className="group relative flex min-w-0 flex-1 items-center">
            <span
              className="text-[1.35rem] font-black uppercase leading-none tracking-tight text-[#53fc18]"
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                textShadow: "0 0 24px rgba(83, 252, 24, 0.35)",
              }}
            >
              PARABLE
            </span>
            <span className="absolute -right-1 -top-2 rounded bg-white/10 px-1 py-px text-[8px] font-bold uppercase tracking-wider text-[#94a3b8]">
              Beta
            </span>
          </Link>
        ) : (
          <Link
            href="/streamers"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#53fc18]/15 text-xs font-black text-[#53fc18]"
            title="PARABLE Live"
          >
            P
          </Link>
        )}
      </div>

      {!collapsed ? (
        <nav className="space-y-0.5 px-2 pb-3" aria-label="Main">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/streamers" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#24272c] text-white"
                    : "text-[#e2e8f0] hover:bg-[#24272c]/60 hover:text-white"
                }`}
              >
                <Icon
                  size={20}
                  className={active ? "text-[#53fc18]" : "text-[#94a3b8]"}
                  strokeWidth={2}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
