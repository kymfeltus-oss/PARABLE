"use client";

import { fallbackAvatarOnError } from "@/lib/avatar-display";
import type { KickChannelRow } from "@/lib/streamers-types";

type Props = {
  channel: KickChannelRow;
  active?: boolean;
  collapsed?: boolean;
  onSelect: (id: string) => void;
};

export default function SidebarItem({ channel, active, collapsed, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(channel.id)}
      title={collapsed ? channel.creator : undefined}
      className={`flex w-full flex-row items-center gap-3 rounded-lg p-2 text-left transition-colors ${
        active
          ? "border border-[#00f2fe]/40 bg-[#00f2fe]/10"
          : "border border-transparent hover:bg-[#24272c]"
      } ${collapsed ? "justify-center px-2" : ""}`}
    >
      <div className="relative h-10 w-10 shrink-0">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#24272c] text-xs font-bold text-white/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={channel.profilePicture}
            alt=""
            className="h-full w-full object-cover"
            onError={fallbackAvatarOnError}
          />
        </div>
        {channel.isLive ? (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-[#191b1f] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.85)]" />
        ) : null}
      </div>
      {!collapsed ? (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{channel.creator}</p>
            <p className="truncate text-[11px] text-[#94a3b8]">{channel.tag}</p>
          </div>
          <span className="shrink-0 text-[10px] font-mono tabular-nums text-[#64748b]">
            {channel.viewers}
          </span>
        </>
      ) : null}
    </button>
  );
}
