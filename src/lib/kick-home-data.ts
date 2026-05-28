import { streamThumbnailImage } from "@/lib/kick-discovery-media";
import type { StreamerProfileRecord } from "@/lib/streamers-types";
import { formatViewerCount } from "@/lib/streamers-types";

/** @deprecated Use PARABLE_LIVE.teal from parable-live-theme */
export const KICK_GREEN = "#00f2fe";

export type KickCategoryItem = {
  id: string;
  title: string;
  watching: string;
  href: string;
  /** CSS gradient for portrait card art */
  gradient: string;
};

export const KICK_LIVE_CATEGORIES: KickCategoryItem[] = [
  {
    id: "worship",
    title: "Worship",
    watching: "186K",
    href: "/music-hub",
    gradient: "linear-gradient(160deg, #0d1f24 0%, #0b0e11 55%, #00f2fe18 100%)",
  },
  {
    id: "prayer",
    title: "Prayer",
    watching: "142K",
    href: "/sanctuary",
    gradient: "linear-gradient(160deg, #121f2e 0%, #0b0e11 55%, #00f2fe12 100%)",
  },
  {
    id: "testimonies",
    title: "Stories",
    watching: "98K",
    href: "/sanctuary",
    gradient: "linear-gradient(160deg, #1f1a2e 0%, #0b0e11 55%, #00f2fe16 100%)",
  },
  {
    id: "study",
    title: "Bible study",
    watching: "76K",
    href: "/table",
    gradient: "linear-gradient(160deg, #2e281a 0%, #0b0e11 55%, #00f2fe14 100%)",
  },
  {
    id: "revival",
    title: "Revival",
    watching: "214K",
    href: "/browse",
    gradient: "linear-gradient(160deg, #2e1a1a 0%, #0b0e11 55%, #00f2fe20 100%)",
  },
  {
    id: "gaming",
    title: "Faith gaming",
    watching: "128K",
    href: "/gaming",
    gradient: "linear-gradient(160deg, #1a1a2e 0%, #0b0e11 55%, #00f2fe18 100%)",
  },
  {
    id: "irl",
    title: "IRL",
    watching: "91K",
    href: "/browse",
    gradient: "linear-gradient(160deg, #2e241a 0%, #0b0e11 55%, #00f2fe10 100%)",
  },
  {
    id: "music",
    title: "Music",
    watching: "156K",
    href: "/music-hub",
    gradient: "linear-gradient(160deg, #1a2e2e 0%, #0b0e11 55%, #00f2fe16 100%)",
  },
];

export type KickStreamCardData = {
  id: string;
  title: string;
  creator: string;
  category: string;
  viewers: string;
  isLive: boolean;
  profilePicture: string;
  thumbnailGradient: string;
  thumbnailUrl: string;
};

const THUMB_GRADIENTS = [
  "linear-gradient(135deg, #1f2937 0%, #0b0e11 60%, #00f2fe22 100%)",
  "linear-gradient(135deg, #312e81 0%, #0b0e11 60%, #00f2fe18 100%)",
  "linear-gradient(135deg, #3f1f1f 0%, #0b0e11 60%, #00f2fe20 100%)",
  "linear-gradient(135deg, #1f3f2e 0%, #0b0e11 60%, #00f2fe16 100%)",
];

function thumbGradientForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return THUMB_GRADIENTS[Math.abs(h) % THUMB_GRADIENTS.length];
}

export function streamerToCardData(row: StreamerProfileRecord): KickStreamCardData {
  const isLive = row.status === "live";
  return {
    id: row.id,
    title: row.streamTitle,
    creator: row.username,
    category: row.liveCategory,
    viewers: formatViewerCount(row.currentViewers, isLive),
    isLive,
    profilePicture: row.profilePicture,
    thumbnailGradient: thumbGradientForId(row.id),
    thumbnailUrl: streamThumbnailImage(row.id),
  };
}

/** @deprecated Use `/api/streamers` + `getAllStreamersDemoRecords()` from `streamers-demo-simulation`. */
export const KICK_FALLBACK_STREAMS: KickStreamCardData[] = [];
