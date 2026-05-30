"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import type { RemoteTrack } from "livekit-client";
import { getLiveKitClientUrl } from "@/lib/livekit-env";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";

const IVS_PLAYER_SCRIPT =
  "https://player.live-video.net/1.40.0/amazon-ivs-player.min.js";

type PlayerEngine = "IVS" | "LIVEKIT_FAILOVER" | "LOADING" | "OFFLINE";

type Props = {
  streamId: string;
  isLive: boolean;
  ivsPlaybackUrl: string;
  className?: string;
  /** Native controls steal clicks from overlay HUD — default off on watch. */
  showNativeControls?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
};

declare global {
  interface Window {
    IVSPlayer?: {
      isPlayerSupported: boolean;
      create: () => IvsPlayerInstance;
      PlayerState: { PLAYING: string; IDLE: string; BUFFERING: string; ENDED: string };
      PlayerEventType: { ERROR: string; STATE_CHANGED: string };
    };
  }
}

type IvsPlayerInstance = {
  attachHTMLVideoElement: (el: HTMLVideoElement) => void;
  load: (url: string) => void;
  play: () => void;
  pause: () => void;
  delete: () => void;
  addEventListener: (event: string, cb: () => void) => void;
};

function loadIvsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.IVSPlayer?.isPlayerSupported) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${IVS_PLAYER_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("IVS script failed")));
      return;
    }

    const script = document.createElement("script");
    script.src = IVS_PLAYER_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Amazon IVS player SDK"));
    document.body.appendChild(script);
  });
}

export default function HybridStreamPlayer({
  streamId,
  isLive,
  ivsPlaybackUrl,
  className = "",
  showNativeControls = false,
  videoRef: externalVideoRef,
}: Props) {
  const [engine, setEngine] = useState<PlayerEngine>(isLive ? "LOADING" : "OFFLINE");
  const [livekitTrack, setLivekitTrack] = useState<RemoteTrack | null>(null);

  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;
  const ivsPlayerRef = useRef<IvsPlayerInstance | null>(null);
  const livekitRoomRef = useRef<Room | null>(null);
  const failoverStartedRef = useRef(false);

  const activateLiveKitFailover = useCallback(async () => {
    if (failoverStartedRef.current) return;
    failoverStartedRef.current = true;

    ivsPlayerRef.current?.pause();

    const roomName = unifiedStreamRoomName(streamId);

    try {
      const response = await fetch("/api/livekit/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          participantIdentity: `viewer_session_${crypto.randomUUID().slice(0, 8)}`,
          isPublisher: false,
        }),
      });

      const data = (await response.json()) as {
        token?: string;
        serverUrl?: string;
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.token) {
        throw new Error(data.error ?? "LiveKit viewer token failed");
      }

      const serverUrl = data.serverUrl ?? data.url ?? getLiveKitClientUrl();
      const room = new Room();
      livekitRoomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video) {
          setLivekitTrack(track);
          setEngine("LIVEKIT_FAILOVER");
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        setEngine("OFFLINE");
      });

      await room.connect(serverUrl, data.token);
    } catch (err) {
      console.error("LiveKit failover error:", err);
      setEngine("OFFLINE");
    }
  }, [streamId]);

  const initializeIvs = useCallback(async () => {
    const playbackUrl = ivsPlaybackUrl.trim();
    const videoEl = videoRef.current;

    if (!playbackUrl || !videoEl) {
      await activateLiveKitFailover();
      return;
    }

    try {
      await loadIvsScript();
      const IVS = window.IVSPlayer;
      if (!IVS?.isPlayerSupported) {
        await activateLiveKitFailover();
        return;
      }

      const player = IVS.create();
      ivsPlayerRef.current = player;
      player.attachHTMLVideoElement(videoEl);
      player.load(playbackUrl);
      player.play();
      setEngine("IVS");

      const onError = () => {
        console.warn("Amazon IVS error — switching to LiveKit failover");
        void activateLiveKitFailover();
      };

      player.addEventListener(IVS.PlayerEventType?.ERROR ?? "ERROR", onError);
    } catch (err) {
      console.warn("IVS init failed:", err);
      await activateLiveKitFailover();
    }
  }, [activateLiveKitFailover, ivsPlaybackUrl]);

  useEffect(() => {
    if (!isLive) {
      setEngine("OFFLINE");
      return;
    }

    failoverStartedRef.current = false;
    setEngine("LOADING");
    void initializeIvs();

    return () => {
      ivsPlayerRef.current?.delete();
      ivsPlayerRef.current = null;
      void livekitRoomRef.current?.disconnect();
      livekitRoomRef.current = null;
      setLivekitTrack(null);
    };
  }, [initializeIvs, isLive, streamId, ivsPlaybackUrl]);

  useEffect(() => {
    if (engine === "LIVEKIT_FAILOVER" && livekitTrack && videoRef.current) {
      livekitTrack.attach(videoRef.current);
    }
  }, [engine, livekitTrack]);

  return (
    <div
      className={`pointer-events-none relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black ${className}`}
      data-watch-player-root
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted={engine === "LIVEKIT_FAILOVER"}
        controls={showNativeControls}
        className={`pointer-events-none h-full w-full object-contain ${engine === "OFFLINE" || engine === "LOADING" ? "hidden" : "block"}`}
      />

      {engine === "LOADING" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-[#00f2fe]" />
          Connecting to broadcast matrix…
        </div>
      ) : null}

      {engine === "OFFLINE" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
          Stream offline or unavailable
        </div>
      ) : null}

      {engine === "LIVEKIT_FAILOVER" ? (
        <div className="absolute right-4 bottom-4 z-20 rounded bg-yellow-500 px-2 py-0.5 font-mono text-[9px] font-black tracking-wider text-black uppercase">
          WebRTC Failover Connected
        </div>
      ) : null}
    </div>
  );
}
