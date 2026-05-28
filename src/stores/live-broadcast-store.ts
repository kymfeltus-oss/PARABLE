import { create } from "zustand";

export type StreamHealthSnapshot = {
  bitrateKbps: number;
  latencyMs: number;
  droppedFrames: number;
};

type LiveBroadcastState = {
  isPublishing: boolean;
  publisherUserId: string | null;
  /** Discovery rail key when broadcasting as demo theatre (e.g. `lr1`). */
  publisherRailKey: string | null;
  roomName: string | null;
  micOn: boolean;
  camOn: boolean;
  viewerCount: number;
  health: StreamHealthSnapshot;
  setPublishing: (payload: {
    userId: string;
    roomName: string;
    railKey?: string | null;
  }) => void;
  clearPublishing: () => void;
  setMicOn: (on: boolean) => void;
  setCamOn: (on: boolean) => void;
  setViewerCount: (count: number) => void;
  setHealth: (health: Partial<StreamHealthSnapshot>) => void;
};

const DEFAULT_HEALTH: StreamHealthSnapshot = {
  bitrateKbps: 0,
  latencyMs: 0,
  droppedFrames: 0,
};

export const useLiveBroadcastStore = create<LiveBroadcastState>((set) => ({
  isPublishing: false,
  publisherUserId: null,
  publisherRailKey: null,
  roomName: null,
  micOn: true,
  camOn: true,
  viewerCount: 0,
  health: DEFAULT_HEALTH,
  setPublishing: ({ userId, roomName, railKey }) =>
    set({
      isPublishing: true,
      publisherUserId: userId,
      publisherRailKey: railKey ?? "lr1",
      roomName,
      micOn: true,
      camOn: true,
      health: { bitrateKbps: 2800, latencyMs: 42, droppedFrames: 0 },
    }),
  clearPublishing: () =>
    set({
      isPublishing: false,
      publisherUserId: null,
      publisherRailKey: null,
      roomName: null,
      viewerCount: 0,
      health: DEFAULT_HEALTH,
    }),
  setMicOn: (micOn) => set({ micOn }),
  setCamOn: (camOn) => set({ camOn }),
  setViewerCount: (viewerCount) => set({ viewerCount }),
  setHealth: (patch) =>
    set((s) => ({
      health: { ...s.health, ...patch },
    })),
}));
