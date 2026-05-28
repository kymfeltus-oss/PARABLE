"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import KickTopNav from "@/components/kick-home/KickTopNav";
import KickRecommendedSidebar from "@/components/kick-home/KickRecommendedSidebar";
import KickHeroCarousel from "@/components/kick-home/KickHeroCarousel";
import KickHorizontalStreamRow from "@/components/kick-home/KickHorizontalStreamRow";
import KickHorizontalCategoryRow from "@/components/kick-home/KickHorizontalCategoryRow";
import KickMobilePromoBanner from "@/components/kick-home/KickMobilePromoBanner";
import CategoryCard from "@/components/kick-home/CategoryCard";
import StreamCard from "@/components/kick-home/StreamCard";
import ParableLiveWorkspaceLayout from "@/components/kick-home/ParableLiveWorkspaceLayout";
import ParableLiveChatRail from "@/components/kick-home/ParableLiveChatRail";
import { useCategoryActivitySimulation } from "@/hooks/useCategoryActivitySimulation";
import { KICK_LIVE_CATEGORIES, streamerToCardData, type KickStreamCardData } from "@/lib/kick-home-data";
import {
  streamerToKickChannel,
  type StreamerProfileRecord,
  type StreamersApiErrorResponse,
  type StreamersApiResponse,
} from "@/lib/streamers-types";
import { useLiveSimulation } from "@/hooks/useLiveSimulation";
import {
  getAllStreamersDemoRecords,
  STREAMERS_DISCOVERY_GRID_IDS,
  STREAMERS_LIVE_RAIL_SLOTS,
} from "@/lib/streamers-demo-simulation";
import { useStreamersUiStore } from "@/stores/streamers-ui-store";
import { useStreamWorkspaceMode } from "@/hooks/useStreamWorkspaceMode";
import { useLiveBroadcastStore } from "@/stores/live-broadcast-store";
import CreatorCommandStrip from "@/components/kick-home/CreatorCommandStrip";

function initialDemoStreamers(): StreamerProfileRecord[] {
  return getAllStreamersDemoRecords();
}

export default function StreamersKickHome() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const toggleSidebar = useStreamersUiStore((s) => s.toggleSidebar);
  const toggleChat = useStreamersUiStore((s) => s.toggleChat);

  const [streamers, setStreamers] = useState<StreamerProfileRecord[]>(initialDemoStreamers);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    () => initialDemoStreamers()[0]?.id ?? null,
  );

  const displayName = userProfile?.username || userProfile?.full_name || "Guest";
  const observerId = userProfile?.id ?? null;
  const { isCreatorHub } = useStreamWorkspaceMode({
    channelId: activeChannelId,
    userId: observerId,
  });
  const liveViewerCount = useLiveBroadcastStore((s) => s.viewerCount);
  const isPublishing = useLiveBroadcastStore((s) => s.isPublishing);
  const chatVariant = isCreatorHub ? "creator" : "viewer";

  useEffect(() => {
    let cancelled = false;

    async function loadStreamers() {
      setIsRefreshing(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/streamers");
        const data = (await res.json()) as StreamersApiResponse | StreamersApiErrorResponse;
        if (!res.ok || !data.ok) {
          throw new Error("error" in data ? data.error : "Failed to load streamers");
        }
        if (!cancelled) {
          const rows =
            data.streamers.length > 0 ? data.streamers : getAllStreamersDemoRecords();
          setStreamers(rows);
          setActiveChannelId((prev) =>
            rows.some((r) => r.id === prev) ? prev : (rows[0]?.id ?? null),
          );
        }
      } catch (err) {
        console.error("Streamers discovery fetch failed", err);
        if (!cancelled) {
          const fallback = getAllStreamersDemoRecords();
          setStreamers(fallback);
          setActiveChannelId(fallback[0]?.id ?? null);
          setLoadError("Showing demo live channels while discovery reconnects.");
        }
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    }

    void loadStreamers();
    return () => {
      cancelled = true;
    };
  }, []);

  const simulatedStreamers = useLiveSimulation(streamers);
  const liveCategories = useCategoryActivitySimulation(KICK_LIVE_CATEGORIES);

  const platformLiveLabel = useMemo(() => {
    if (isPublishing && liveViewerCount > 0) {
      return `${liveViewerCount.toLocaleString()} in your live room`;
    }
    const total = simulatedStreamers
      .filter((s) => s.status === "live")
      .reduce((sum, s) => sum + s.currentViewers, 0);
    if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M+ watching live`;
    if (total >= 1000) return `${Math.round(total / 1000)}K+ watching live`;
    return `${total.toLocaleString()}+ watching live`;
  }, [isPublishing, liveViewerCount, simulatedStreamers]);

  const liveRail = useMemo(() => {
    const byId = new Map(simulatedStreamers.map((row) => [row.id, row]));
    return STREAMERS_LIVE_RAIL_SLOTS.map((slot) => byId.get(slot.id))
      .filter((row): row is StreamerProfileRecord => Boolean(row))
      .map(streamerToKickChannel);
  }, [simulatedStreamers]);

  const activeChatLabel = useMemo(() => {
    const row = simulatedStreamers.find((s) => s.id === activeChannelId);
    return row?.username;
  }, [simulatedStreamers, activeChannelId]);

  const allStreams = useMemo((): KickStreamCardData[] => {
    const byId = new Map(simulatedStreamers.map((row) => [row.id, streamerToCardData(row)]));
    const seen = new Set<string>();
    const ordered: KickStreamCardData[] = [];

    const pushUnique = (card: KickStreamCardData | undefined) => {
      if (!card || seen.has(card.id)) return;
      seen.add(card.id);
      ordered.push(card);
    };

    for (const id of STREAMERS_DISCOVERY_GRID_IDS) {
      pushUnique(byId.get(id));
    }
    for (const row of simulatedStreamers) {
      if (!STREAMERS_DISCOVERY_GRID_IDS.includes(row.id)) {
        pushUnique(streamerToCardData(row));
      }
    }

    return ordered;
  }, [simulatedStreamers]);

  const filteredStreams = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allStreams;
    return allStreams.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.creator.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [allStreams, query]);

  const featuredSlides = useMemo(
    () => filteredStreams.filter((s) => s.isLive).slice(0, 5),
    [filteredStreams],
  );

  const mobileFeaturedStreams = useMemo(
    () => filteredStreams.filter((s) => s.isLive).slice(0, 8),
    [filteredStreams],
  );

  const streamsByCategory = useMemo(() => {
    const map = new Map<string, KickStreamCardData[]>();
    for (const stream of filteredStreams.filter((s) => s.isLive)) {
      const key = stream.category?.trim() || "Live";
      const list = map.get(key) ?? [];
      list.push(stream);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredStreams]);

  const goWatch = (id: string) => router.push(`/watch/${id}`);
  const searchActive = query.trim().length > 0;
  const showEmptySearch = searchActive && filteredStreams.length === 0;
  const showStreamSkeleton = streamers.length === 0 && isRefreshing;

  const mobileDiscovery = (
    <div className="min-w-0 space-y-5 bg-black pb-8 pt-2 md:hidden">
      {loadError ? (
        <p className="mx-4 rounded-lg border border-[#00f2fe]/25 bg-[#00f2fe]/10 px-3 py-2 text-center text-xs text-[#94a3b8]">
          {loadError}
        </p>
      ) : null}

      {showStreamSkeleton ? (
        <div className="flex gap-3 overflow-hidden px-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-48 w-[min(88vw,340px)] shrink-0 animate-pulse rounded-lg border border-[#24272c] bg-[#191b1f]"
            />
          ))}
        </div>
      ) : showEmptySearch ? (
        <div
          className="mx-4 flex min-h-[160px] items-center justify-center rounded-xl border border-[#24272c] bg-[#191b1f] px-6 py-10 text-center"
          data-testid="stream-search-empty"
        >
          <p className="text-sm font-semibold text-[#94a3b8]">No channels match your search</p>
        </div>
      ) : (
        <KickHorizontalStreamRow streams={mobileFeaturedStreams} />
      )}

      <section>
        <div className="mb-3 flex items-center justify-between gap-3 px-4">
          <h2 className="text-base font-black tracking-tight text-white">Top Live Categories</h2>
          <button
            type="button"
            onClick={() => router.push("/browse")}
            className="shrink-0 text-xs font-bold text-slate-400 hover:text-white"
          >
            View all
          </button>
        </div>
        <KickHorizontalCategoryRow categories={liveCategories} />
      </section>

      <KickMobilePromoBanner />

      {!showStreamSkeleton && !showEmptySearch
        ? streamsByCategory.map(([category, streams]) => (
            <KickHorizontalStreamRow key={category} title={category} streams={streams} />
          ))
        : null}
    </div>
  );

  const desktopDiscovery = (
    <div className="hidden min-w-0 space-y-8 p-4 pb-6 sm:p-6 md:block">
      {loadError ? (
        <p className="rounded-lg border border-[#00f2fe]/25 bg-[#00f2fe]/10 px-3 py-2 text-center text-xs text-[#94a3b8]">
          {loadError}
        </p>
      ) : null}
      <div className="relative min-w-0">
        <KickHeroCarousel slides={featuredSlides} onWatch={goWatch} />
        {isPublishing ? <CreatorCommandStrip /> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#00f2fe]/20 bg-[#00f2fe]/5 px-3 py-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#00f2fe]">
          {platformLiveLabel}
        </span>
        <span className="text-[10px] text-[#64748b]">· Fellowship-wide live pulse</span>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">Top Live Categories</h2>
          <button
            type="button"
            onClick={() => router.push("/browse")}
            className="shrink-0 text-xs font-bold text-[#00f2fe] hover:underline"
          >
            View all
          </button>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8">
          {liveCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">Recommended Streams</h2>
          <span className="text-xs tabular-nums text-[#64748b]">
            {filteredStreams.length} live now
            {isRefreshing ? " · updating…" : ""}
          </span>
        </div>
        {showStreamSkeleton ? (
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-lg border border-[#24272c] bg-[#191b1f]"
              >
                <div className="aspect-video bg-[#24272c]" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-3/4 rounded bg-[#24272c]" />
                  <div className="h-2 w-1/2 rounded bg-[#24272c]/70" />
                </div>
              </div>
            ))}
          </div>
        ) : showEmptySearch ? (
          <div
            className="flex min-h-[200px] w-full items-center justify-center rounded-xl border border-[#24272c] bg-[#191b1f] px-6 py-12 text-center"
            data-testid="stream-search-empty"
          >
            <p className="text-sm font-semibold text-[#94a3b8]">No channels match your search</p>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8">
            {filteredStreams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const centerContent = (
    <>
      {mobileDiscovery}
      {desktopDiscovery}
    </>
  );

  return (
    <>
      <ParableLiveWorkspaceLayout
        topNav={
          <KickTopNav
            query={query}
            onQueryChange={setQuery}
            onMenuClick={toggleSidebar}
            onChatClick={toggleChat}
          />
        }
        leftSidebar={
          <KickRecommendedSidebar
            channels={liveRail}
            activeChannelId={activeChannelId}
            isLoading={showStreamSkeleton}
            onSelectChannel={(id) => {
              setActiveChannelId(id);
              router.push(`/watch/${id}`);
            }}
          />
        }
        main={centerContent}
        rightChat={
          <ParableLiveChatRail
            streamKey={activeChannelId}
            streamLabel={activeChatLabel}
            senderDisplayName={displayName}
            variant={chatVariant}
          />
        }
      />
    </>
  );
}
