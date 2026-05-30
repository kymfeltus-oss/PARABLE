"use client";

import Link from "next/link";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

export type DiscoverySidebarChannel = {
  id: string;
  username: string;
  categorySlug: string;
  avatarUrl: string;
  viewersLabel: string;
  isLive: boolean;
};

type Props = {
  channel: DiscoverySidebarChannel;
  collapsed?: boolean;
  active?: boolean;
};

/** Kick left-rail row: avatar, username, category, live bulb, viewer count. */
export default function DiscoveryChannelSidebarRow({ channel, collapsed, active }: Props) {
  return (
    <Link
      href={`/watch/${channel.id}`}
      title={collapsed ? channel.username : undefined}
      className={[
        "group flex w-full items-center gap-2.5 rounded-lg p-2 transition-colors",
        active
          ? "bg-[#00f2ff]/10 border border-[#00f2ff]/30"
          : "border border-transparent hover:bg-[#191f24]",
        collapsed ? "justify-center px-1.5" : "",
      ].join(" ")}
    >
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={channel.avatarUrl || "/logo.svg"}
          alt=""
          className={[
            "rounded-full border border-[#191f24] bg-[#111722] object-cover",
            collapsed ? "h-9 w-9" : "h-10 w-10",
          ].join(" ")}
          onError={fallbackAvatarOnError}
        />
        {channel.isLive ? (
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b0e11] bg-[#53fc18] shadow-[0_0_6px_rgba(83,252,24,0.85)]"
            aria-label="Live"
          />
        ) : null}
      </div>

      {!collapsed ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white group-hover:text-[#53fc18]">
            {channel.username}
          </p>
          <p className="truncate text-[11px] font-medium text-[#64748b]">{channel.categorySlug}</p>
        </div>
      ) : null}

      {!collapsed ? (
        <span className="shrink-0 font-mono text-[11px] font-bold tabular-nums text-[#94a3b8]">
          {channel.viewersLabel}
        </span>
      ) : null}
    </Link>
  );
}
