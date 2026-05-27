"use client";

import LiveVideoPlayer, { type LiveVideoPlayerProps } from "@/components/LiveVideoPlayer";

export type ParableLivePlayerProps = Omit<LiveVideoPlayerProps, "roomName"> & {
  roomName?: string;
};

/**
 * @deprecated Prefer `LiveVideoPlayer` — thin alias kept for existing imports.
 */
export default function ParableLivePlayer(props: ParableLivePlayerProps) {
  return <LiveVideoPlayer {...props} />;
}

export { ParableLivePlayer };
