"use client";

import Link from "next/link";
import ChannelAvatar from "@/components/kick-home/ChannelAvatar";
import type { KickChannelRow } from "@/lib/streamers-types";

type Props = {
  channel: KickChannelRow;
  active?: boolean;
  collapsed?: boolean;
  onSelect?: (id: string) => void;
};

export default function SidebarItem({ channel, active, collapsed, onSelect }: Props) {
  return (
    <Link
      href={`/watch/${channel.id}`}
      onClick={() => onSelect?.(channel.id)}
      title={collapsed ? channel.creator : undefined}
      className={`flex w-full flex-row items-center gap-3 rounded-lg p-2 text-left transition-colors ${
        active
          ? "border border-[#00f2fe]/40 bg-[#00f2fe]/10"
          : "border border-transparent hover:bg-[#24272c]"
      } ${collapsed ? "justify-center px-2" : ""}`}
    >
      <ChannelAvatar
        src={channel.profilePicture}
        displayName={channel.creator}
        className="h-10 w-10"
        liveRing={channel.isLive}
      />
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
    </Link>
  );
}
