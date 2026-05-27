/** Live presence flag returned by `/api/streamers`. */
export type StreamerLiveStatus = "live" | "offline";

/** Single streamer row from the discovery API (DB-shaped). */
export interface StreamerProfileRecord {
  id: string;
  username: string;
  profilePicture: string;
  streamTitle: string;
  currentViewers: number;
  liveCategory: string;
  status: StreamerLiveStatus;
}

/** Successful GET `/api/streamers` payload. */
export interface StreamersApiResponse {
  ok: true;
  streamers: StreamerProfileRecord[];
}

/** Error GET `/api/streamers` payload. */
export interface StreamersApiErrorResponse {
  ok: false;
  error: string;
}

/** Kick left-rail channel row (layout + mobile rail). */
export interface KickChannelRow {
  id: string;
  title: string;
  creator: string;
  tag: string;
  viewers: string;
  profilePicture: string;
  isLive: boolean;
}

/** Center spotlight / LiveKit selection shape. */
export interface SpotlightStream {
  id: string;
  username: string;
  title: string;
  category: string;
  viewerLabel: string;
}

export function formatViewerCount(count: number, live: boolean): string {
  if (!live) return "—";
  if (count >= 1_000_000) {
    const m = count / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1000) {
    const k = count / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
}

export function streamerToKickChannel(row: StreamerProfileRecord): KickChannelRow {
  const isLive = row.status === "live";
  return {
    id: row.id,
    title: row.streamTitle,
    creator: row.username,
    tag: row.liveCategory,
    viewers: formatViewerCount(row.currentViewers, isLive),
    profilePicture: row.profilePicture,
    isLive,
  };
}

export function streamerToSpotlight(row: StreamerProfileRecord): SpotlightStream {
  const isLive = row.status === "live";
  return {
    id: row.id,
    username: row.username,
    title: row.streamTitle,
    category: row.liveCategory,
    viewerLabel: formatViewerCount(row.currentViewers, isLive),
  };
}
