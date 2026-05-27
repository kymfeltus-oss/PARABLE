"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import KickSidebarBrand from "@/components/kick-home/KickSidebarBrand";
import SidebarItem from "@/components/kick-home/SidebarItem";
import StreamersChannelSkeleton from "@/components/streamers/StreamersChannelSkeleton";
import { useStreamersUiStore } from "@/stores/streamers-ui-store";
import type { KickChannelRow } from "@/lib/streamers-types";

type Props = {
  channels: KickChannelRow[];
  activeChannelId: string | null;
  isLoading: boolean;
  onSelectChannel: (id: string) => void;
};

export default function KickRecommendedSidebar({
  channels,
  activeChannelId,
  isLoading,
  onSelectChannel,
}: Props) {
  const sidebarOpen = useStreamersUiStore((s) => s.sidebarOpen);
  const sidebarCollapsed = useStreamersUiStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useStreamersUiStore((s) => s.toggleSidebarCollapsed);
  const setSidebarOpen = useStreamersUiStore((s) => s.setSidebarOpen);

  return (
    <>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed bottom-0 left-0 top-14 z-40 flex w-64 shrink-0 flex-col overflow-hidden border-r border-[#24272c] bg-[#191b1f] transition-[transform,width] duration-200 md:static md:translate-x-0 ${
          sidebarCollapsed ? "md:w-[72px]" : "md:w-64"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${
          sidebarOpen ? "flex" : "hidden md:flex"
        }`}
      >
        <KickSidebarBrand collapsed={sidebarCollapsed} />

        <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2 pt-3">
          {!sidebarCollapsed ? (
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#64748b]">
              Recommended
            </p>
          ) : null}
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="ml-auto hidden h-7 w-7 items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-[#24272c] hover:text-[#00f2fe] md:flex"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
          {isLoading ? (
            <StreamersChannelSkeleton isGamerView={false} count={6} />
          ) : (
            <div className="space-y-1">
              {channels.map((ch) => (
                <SidebarItem
                  key={ch.id}
                  channel={ch}
                  active={activeChannelId === ch.id}
                  collapsed={sidebarCollapsed}
                  onSelect={onSelectChannel}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
