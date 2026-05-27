"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import KickTopNav from "@/components/kick-home/KickTopNav";
import KickRecommendedSidebar from "@/components/kick-home/KickRecommendedSidebar";
import KickHeroCarousel from "@/components/kick-home/KickHeroCarousel";
import CategoryCard from "@/components/kick-home/CategoryCard";
import StreamCard from "@/components/kick-home/StreamCard";
import ParableLiveWorkspaceLayout from "@/components/kick-home/ParableLiveWorkspaceLayout";
import ParableLiveChatRail, { ParableLiveChatMobile } from "@/components/kick-home/ParableLiveChatRail";
import { KICK_LIVE_CATEGORIES, streamerToCardData, type KickStreamCardData } from "@/lib/kick-home-data";
import {
  streamerToKickChannel,
  type StreamerProfileRecord,
  type StreamersApiErrorResponse,
  type StreamersApiResponse,
} from "@/lib/streamers-types";
import { useLiveSimulation } from "@/hooks/useLiveSimulation";
import {
  STREAMERS_DISCOVERY_GRID_IDS,
  STREAMERS_LIVE_RAIL_SLOTS,
} from "@/lib/streamers-demo-simulation";
import { useStreamersUiStore } from "@/stores/streamers-ui-store";

export default function StreamersKickHome() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const toggleSidebar = useStreamersUiStore((s) => s.toggleSidebar);
  const toggleChat = useStreamersUiStore((s) => s.toggleChat);

  const [streamers, setStreamers] = useState<StreamerProfileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const displayName = userProfile?.username || userProfile?.full_name || "Guest";

  useEffect(() => {
    let cancelled = false;

    async function loadStreamers() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/streamers");
        const data = (await res.json()) as StreamersApiResponse | StreamersApiErrorResponse;
        if (!res.ok || !data.ok) {
          throw new Error("error" in data ? data.error : "Failed to load streamers");
        }
        if (!cancelled) {
          setStreamers(data.streamers);
          setActiveChannelId(data.streamers[0]?.id ?? null);
        }
      } catch (err) {
        console.error("Streamers discovery fetch failed", err);
        if (!cancelled) setStreamers([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadStreamers();
    return () => {
      cancelled = true;
    };
  }, []);

  const simulatedStreamers = useLiveSimulation(streamers);

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
    const ordered: KickStreamCardData[] = [];
    for (const id of STREAMERS_DISCOVERY_GRID_IDS) {
      const card = byId.get(id);
      if (card) ordered.push(card);
    }
    for (const row of simulatedStreamers) {
      if (!STREAMERS_DISCOVERY_GRID_IDS.includes(row.id)) {
        ordered.push(streamerToCardData(row));
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

  const goWatch = (id: string) => router.push(`/watch/${id}`);
  const searchActive = query.trim().length > 0;
  const showEmptySearch = !isLoading && searchActive && filteredStreams.length === 0;

  const centerContent = (
    <div className="min-w-0 space-y-8 p-4 pb-6 sm:p-6">
      <KickHeroCarousel slides={featuredSlides} onWatch={goWatch} />

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
          {KICK_LIVE_CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">Recommended Streams</h2>
          <span className="text-xs tabular-nums text-[#64748b]">{filteredStreams.length} channels</span>
        </div>
        {isLoading ? (
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

      <div className="lg:hidden">
        <ParableLiveChatMobile
          streamKey={activeChannelId}
          streamLabel={activeChatLabel}
          senderDisplayName={displayName}
        />
      </div>
    </div>
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
            isLoading={isLoading}
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
          />
        }
      />
    </>
  );
}
