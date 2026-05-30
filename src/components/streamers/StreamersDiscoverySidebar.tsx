"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fetchProfilesUserFollows } from "@/lib/follows-queries";
import { formatViewerCount, type KickChannelRow } from "@/lib/streamers-types";
import { useStreamersUiStore } from "@/stores/streamers-ui-store";
import DiscoveryChannelSidebarRow, {
  type DiscoverySidebarChannel,
} from "@/components/streamers/DiscoveryChannelSidebarRow";
import StreamersChannelSkeleton from "@/components/streamers/StreamersChannelSkeleton";

function kickRowToDiscovery(row: KickChannelRow): DiscoverySidebarChannel {
  return {
    id: row.id,
    username: row.creator,
    categorySlug: row.tag,
    avatarUrl: row.profilePicture,
    viewersLabel: row.viewers,
    isLive: row.isLive,
  };
}

type Props = {
  recommended: KickChannelRow[];
  isLoading?: boolean;
  activeChannelId?: string | null;
};

export default function StreamersDiscoverySidebar({
  recommended,
  isLoading = false,
  activeChannelId,
}: Props) {
  const sidebarOpen = useStreamersUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useStreamersUiStore((s) => s.setSidebarOpen);
  const sidebarCollapsed = useStreamersUiStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useStreamersUiStore((s) => s.toggleSidebarCollapsed);

  const [followingRows, setFollowingRows] = useState<DiscoverySidebarChannel[]>([]);
  const [followingLoading, setFollowingLoading] = useState(true);

  const loadFollowing = useCallback(async () => {
    setFollowingLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFollowingRows([]);
      setFollowingLoading(false);
      return;
    }

    try {
      const profiles = await fetchProfilesUserFollows(supabase, user.id);
      setFollowingRows(
        profiles.map((p) => {
          const label = p.username?.trim() || p.full_name?.trim() || "Streamer";
          const live = p.is_live === true;
          return {
            id: p.id,
            username: label,
            categorySlug: live ? "Live now" : "Offline",
            avatarUrl: p.avatar_url ?? "",
            viewersLabel: live ? "Live" : "—",
            isLive: live,
          };
        }),
      );
    } catch {
      setFollowingRows([]);
    }
    setFollowingLoading(false);
  }, []);

  useEffect(() => {
    void loadFollowing();
  }, [loadFollowing]);

  const recommendedDiscovery = useMemo(
    () => recommended.map(kickRowToDiscovery),
    [recommended],
  );

  const collapsed = sidebarCollapsed;

  return (
    <>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close channel list"
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        data-testid="stream-sidebar"
        className={[
          "fixed bottom-0 left-0 top-0 z-50 shrink-0 flex-col overflow-hidden border-r border-[#191f24] bg-[#0b0e11] transition-[transform,width] duration-200 md:static md:z-0",
          collapsed ? "w-[70px]" : "w-[70px] lg:w-[240px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarOpen ? "flex" : "hidden md:flex",
        ].join(" ")}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-[#191f24] px-3">
          {!collapsed ? (
            <span className="text-lg font-black uppercase tracking-tight text-[#53fc18]">PARABLE</span>
          ) : (
            <span className="mx-auto text-sm font-black text-[#53fc18]">P</span>
          )}
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[#64748b] hover:bg-[#191f24] hover:text-[#00f2fe]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-2 py-3">
          {!collapsed ? (
            <p className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#64748b]">
              Following
            </p>
          ) : null}
          <div className={collapsed ? "space-y-2" : "mb-4 space-y-0.5"}>
            {followingLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-[#00f2fe]/50" />
              </div>
            ) : followingRows.length === 0 ? (
              !collapsed ? (
                <p className="px-2 py-3 text-center text-[10px] text-[#64748b]">
                  Follow creators to see them here.
                </p>
              ) : null
            ) : (
              followingRows.slice(0, 8).map((ch) => (
                <DiscoveryChannelSidebarRow
                  key={ch.id}
                  channel={ch}
                  collapsed={collapsed}
                  active={activeChannelId === ch.id}
                />
              ))
            )}
          </div>

          {!collapsed ? (
            <p className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#64748b]">
              Recommended
            </p>
          ) : null}

          {isLoading ? (
            <StreamersChannelSkeleton isGamerView={false} count={6} />
          ) : (
            <div className="space-y-0.5">
              {recommendedDiscovery.map((ch) => (
                <DiscoveryChannelSidebarRow
                  key={ch.id}
                  channel={ch}
                  collapsed={collapsed}
                  active={activeChannelId === ch.id}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/** Map API streamers to sidebar rows (exported for tests / parent). */
export function streamersToSidebarChannels(
  rows: { id: string; username: string; liveCategory: string; profilePicture: string; currentViewers: number; status: string }[],
): DiscoverySidebarChannel[] {
  return rows.map((row) => {
    const live = row.status === "live";
    return {
      id: row.id,
      username: row.username,
      categorySlug: row.liveCategory,
      avatarUrl: row.profilePicture,
      viewersLabel: formatViewerCount(row.currentViewers, live),
      isLive: live,
    };
  });
}
