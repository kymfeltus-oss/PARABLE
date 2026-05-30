"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Menu, MessageSquare, Search, Tv } from "lucide-react";
import KickHeroCarousel from "@/components/kick-home/KickHeroCarousel";
import KickHorizontalStreamRow from "@/components/kick-home/KickHorizontalStreamRow";
import { streamThumbnailFallback, streamThumbnailImage } from "@/lib/kick-discovery-media";
import { streamerToCardData } from "@/lib/kick-home-data";
import { formatViewerCount } from "@/lib/streamers-types";
import type { StreamerProfileRecord } from "@/lib/streamers-types";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { useStreamersUiStore } from "@/stores/streamers-ui-store";

type ChannelCardModel = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  streamTitle: string;
  viewerCount: number;
  isLive: boolean;
  liveCategory: string;
};

type Props = {
  displayName: string;
  query: string;
  onQueryChange: (value: string) => void;
  loading: boolean;
  loadError: string | null;
  filteredChannels: ChannelCardModel[];
  allStreamers: StreamerProfileRecord[];
};

export default function StreamersDiscoveryCenterStage({
  displayName,
  query,
  onQueryChange,
  loading,
  loadError,
  filteredChannels,
  allStreamers,
}: Props) {
  const router = useRouter();
  const toggleSidebar = useStreamersUiStore((s) => s.toggleSidebar);
  const toggleChat = useStreamersUiStore((s) => s.toggleChat);

  const featured =
    filteredChannels.find((c) => c.isLive) ?? filteredChannels[0] ?? null;

  const carouselSlides = filteredChannels
    .filter((c) => c.isLive)
    .slice(0, 6)
    .map((c) => {
      const row = allStreamers.find((s) => s.id === c.id);
      return row ? streamerToCardData(row) : streamerToCardData({
        id: c.id,
        username: c.username,
        profilePicture: c.avatarUrl,
        streamTitle: c.streamTitle,
        currentViewers: c.viewerCount,
        liveCategory: c.liveCategory,
        status: c.isLive ? "live" : "offline",
      });
    });

  const streamsForYou = filteredChannels.slice(0, 12).map((c) => {
    const row = allStreamers.find((s) => s.id === c.id);
    return row
      ? streamerToCardData(row)
      : streamerToCardData({
          id: c.id,
          username: c.username,
          profilePicture: c.avatarUrl,
          streamTitle: c.streamTitle,
          currentViewers: c.viewerCount,
          liveCategory: c.liveCategory,
          status: c.isLive ? "live" : "offline",
        });
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-[#191f24] bg-[#080a0c]/95 px-3 backdrop-blur-md md:px-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#f8fafc] hover:bg-[#191f24] md:hidden"
          aria-label="Open channel list"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href="/streamers"
          className="shrink-0 text-lg font-black uppercase tracking-tight text-[#53fc18] md:text-xl"
        >
          PARABLE
        </Link>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search live streams"
            aria-label="Search live streams"
            className="h-10 w-full rounded-lg border border-[#191f24] bg-[#111722] pl-10 pr-3 text-sm text-white placeholder:text-[#64748b] focus:border-[#00f2fe]/50 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={toggleChat}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#f8fafc] hover:bg-[#191f24] lg:hidden"
          aria-label="Open stream chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        <span className="hidden shrink-0 text-xs font-semibold text-[#64748b] sm:inline">{displayName}</span>
      </header>

      <div
        data-testid="stream-center"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        <section className="w-full bg-gradient-to-b from-[#0e1217] to-[#080a0c] px-3 py-4 md:px-6 md:py-6">
          {carouselSlides.length > 0 ? (
            <KickHeroCarousel
              slides={carouselSlides}
              onWatch={(id) => router.push(`/watch/${id}`)}
            />
          ) : (
            <FeaturedHeroFallback featured={featured} onWatch={(id) => router.push(`/watch/${id}`)} />
          )}
        </section>

        <section className="w-full space-y-8 px-3 pb-8 md:px-6 md:pb-12">
          {loadError ? (
            <p className="rounded-lg border border-[#00f2fe]/25 bg-[#00f2fe]/10 px-3 py-2 text-center text-xs text-[#94a3b8]">
              {loadError}
            </p>
          ) : null}

          {!loading && streamsForYou.length > 0 ? (
            <KickHorizontalStreamRow
              title="Streams For You"
              streams={streamsForYou}
              className="w-full min-w-0"
            />
          ) : null}

          <div>
            <div className="mb-4 flex items-center justify-between border-b border-[#191f24] pb-3 px-1">
              <div className="flex items-center gap-3">
                <Tv className="h-5 w-5 text-[#00f2fe]" />
                <h2
                  data-testid="streamers-section-heading"
                  className="text-lg font-bold uppercase tracking-wider text-white md:text-xl"
                >
                  Live Streamers
                </h2>
              </div>
              <div
                className="rounded-md border border-[#191f24] bg-[#111722] px-3 py-1.5 text-xs font-bold text-[#94a3b8]"
                data-testid="stream-channel-count"
              >
                {filteredChannels.length} channels
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-video w-full animate-pulse rounded-xl border border-[#191f24] bg-[#111722]"
                  />
                ))}
              </div>
            ) : filteredChannels.length === 0 ? (
              <div
                className="flex min-h-[200px] items-center justify-center rounded-xl border border-[#191f24] bg-[#111722] px-6 py-12 text-center"
                data-testid="stream-search-empty"
              >
                <p className="text-sm font-semibold text-[#94a3b8]">No channels match your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredChannels.map((channel) => (
                  <DiscoveryGridCard key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function FeaturedHeroFallback({
  featured,
  onWatch,
}: {
  featured: ChannelCardModel | null;
  onWatch: (id: string) => void;
}) {
  return (
    <div className="relative flex min-h-[280px] w-full items-center overflow-hidden rounded-2xl border border-[#191f24] bg-gradient-to-r from-[#111722] via-[#06111e] to-[#02040a] p-6 shadow-2xl lg:min-h-[320px]">
      {featured ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={streamThumbnailImage(featured.id)}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
            onError={(e) => {
              (e.target as HTMLImageElement).src = streamThumbnailFallback(featured.id);
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#02040a]/95 via-[#06111e]/80 to-transparent" />
        </>
      ) : null}
      <div className="relative z-10 max-w-xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00f2fe]/30 bg-[#00f2fe]/10 px-3 py-1">
          <Flame className="h-4 w-4 animate-pulse text-[#00f2fe]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#00f2fe]">
            Featured Live Broadcast
          </span>
        </div>
        <h1 className="text-2xl font-black uppercase leading-none tracking-tight text-white lg:text-4xl">
          {featured?.streamTitle ?? "Live Interactive Media"}
        </h1>
        <p className="text-sm text-[#94a3b8]">
          {featured
            ? `${featured.displayName} · ${featured.liveCategory} · ${formatViewerCount(featured.viewerCount, featured.isLive)} watching`
            : "Real-time streams with chat built into the watch workspace."}
        </p>
        {featured ? (
          <button
            type="button"
            onClick={() => onWatch(featured.id)}
            className="rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#0ea5e9] px-6 py-3 text-xs font-black uppercase tracking-widest text-[#02040a]"
          >
            Watch Live Now
          </button>
        ) : null}
      </div>
    </div>
  );
}

function DiscoveryGridCard({ channel }: { channel: ChannelCardModel }) {
  return (
    <Link
      href={`/watch/${channel.id}`}
      className="group overflow-hidden rounded-xl border border-[#191f24] bg-[#111722]/40 transition-all hover:border-[#00f2fe]/40 hover:bg-[#111722]/90"
      aria-label={channel.streamTitle}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#02040a]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={streamThumbnailImage(channel.id)}
          alt=""
          className="h-full w-full object-cover opacity-90 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = streamThumbnailFallback(channel.id);
          }}
        />
        {channel.isLive ? (
          <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase text-white">
            Live
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-3 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={channel.avatarUrl || "/logo.svg"}
          alt=""
          className="h-9 w-9 rounded-full border border-[#191f24] object-cover"
          onError={fallbackAvatarOnError}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-white group-hover:text-[#00f2fe]">
            {channel.streamTitle}
          </h3>
          <p className="truncate text-xs text-[#94a3b8]">
            {channel.displayName} · {channel.liveCategory}
          </p>
        </div>
      </div>
    </Link>
  );
}
