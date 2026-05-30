"use client";

import { useEffect, useRef, useState } from "react";
import {
  Settings,
  Cpu,
  FileText,
  Sliders,
  Radio,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { Room, RoomEvent } from "livekit-client";
import { supabase } from "@/lib/supabaseClient";
import { encodeCelebrationPayload } from "@/lib/livekit-celebration";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";
import { getLiveKitClientUrl } from "@/lib/livekit-env";

type Props = {
  userId: string;
};

export default function StreamerDashboardClient({ userId }: Props) {
  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState("Sermon Blueprint Live");
  const [streamKey, setStreamKey] = useState("live_882415190_pk_x92F13b5c7e9");
  const [showKey, setShowKey] = useState(false);
  const [teleprompterText, setTeleprompterText] = useState("");
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [isScrolling, setIsScrolling] = useState(false);
  const [livekitRoom, setLivekitRoom] = useState<Room | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const teleprompterRef = useRef<HTMLTextAreaElement>(null);

  const roomName = unifiedStreamRoomName(userId);

  useEffect(() => {
    if (!isScrolling) return;
    const el = teleprompterRef.current;
    if (!el) return;
    const tickMs = 50;
    const pixelsPerTick = scrollSpeed * 0.35;
    const timer = window.setInterval(() => {
      el.scrollTop += pixelsPerTick;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) el.scrollTop = 0;
    }, tickMs);
    return () => window.clearInterval(timer);
  }, [isScrolling, scrollSpeed]);

  useEffect(() => {
    return () => {
      void livekitRoom?.disconnect();
    };
  }, [livekitRoom]);

  const syncProfileLiveState = async (targetState: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_live: targetState,
        stream_title: streamTitle.trim() || null,
      })
      .eq("id", userId);

    if (error) return false;

    const channel = supabase.channel("global-live-status-sync");
    await channel.subscribe();
    await channel.send({
      type: "broadcast",
      event: "stream_state_change",
      payload: {
        id: userId,
        userId,
        is_live: targetState,
        isLive: targetState,
        stream_title: streamTitle,
      },
    });
    void supabase.removeChannel(channel);
    return true;
  };

  const handleToggleLiveState = async () => {
    setConnectError(null);

    if (isLive) {
      if (livekitRoom) {
        await livekitRoom.disconnect();
        setLivekitRoom(null);
      }
      await syncProfileLiveState(false);
      setIsLive(false);
      return;
    }

    try {
      const response = await fetch("/api/livekit/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          participantIdentity: `streamer_${userId}`,
          isPublisher: true,
        }),
      });

      const data = (await response.json()) as {
        token?: string;
        serverUrl?: string;
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.token) {
        throw new Error(data.error ?? "Failed to obtain LiveKit token");
      }

      const serverUrl = data.serverUrl ?? data.url ?? getLiveKitClientUrl();
      const room = new Room();

      room.on(RoomEvent.Disconnected, () => {
        setIsLive(false);
        setLivekitRoom(null);
      });

      await room.connect(serverUrl, data.token);
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);

      const profileOk = await syncProfileLiveState(true);
      if (!profileOk) {
        await room.disconnect();
        throw new Error("Could not update live profile state");
      }

      setLivekitRoom(room);
      setIsLive(true);
    } catch (err) {
      console.error("LiveKit connection pipeline ignition crash:", err);
      setConnectError(err instanceof Error ? err.message : "Connection failed");
      setIsLive(false);
      setLivekitRoom(null);
    }
  };

  const emitCelebrationTrigger = (emojiType: string) => {
    if (!livekitRoom) return;
    const byteData = encodeCelebrationPayload(emojiType, "STREAMER_HOST");
    void livekitRoom.localParticipant.publishData(byteData, { reliable: true });
  };

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-[#080a0c] p-4 font-sans text-[#f8fafc] antialiased selection:bg-[#00f2ff]/20 lg:p-8">
      <header className="flex shrink-0 flex-col items-start justify-between gap-4 border-b border-[#191f24] pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-white uppercase lg:text-2xl">
            Stream Studio{" "}
            <span className="animate-pulse rounded border border-[#00f2ff]/20 bg-[#00f2ff]/10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-[#00f2ff]">
              LIVE CONTROL COCKPIT
            </span>
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            WebRTC ingest · data-channel celebrations · AI teleprompter
          </p>
          {connectError ? (
            <p className="mt-2 text-xs text-red-400">{connectError}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isLive ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => emitCelebrationTrigger("🔥")}
                className="rounded-lg border border-[#191f24] bg-[#191f24] p-2 text-lg hover:bg-[#242c33]"
                aria-label="Send fire celebration"
              >
                🔥
              </button>
              <button
                type="button"
                onClick={() => emitCelebrationTrigger("🙌")}
                className="rounded-lg border border-[#191f24] bg-[#191f24] p-2 text-lg hover:bg-[#242c33]"
                aria-label="Send hands celebration"
              >
                🙌
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void handleToggleLiveState()}
            className={`flex items-center gap-2 rounded-lg border px-6 py-3.5 text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.97] ${
              isLive
                ? "border-red-500/30 bg-red-600 text-white hover:bg-red-700"
                : "border-transparent bg-[#00f2ff] text-black hover:bg-[#00d2dd]"
            }`}
          >
            <Radio className="h-4 w-4" />
            {isLive ? "Disconnect Stream" : "Ignite Go Live"}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col space-y-6 lg:col-span-1">
          <div className="space-y-4 rounded-xl border border-[#191f24] bg-[#111722]/50 p-5 shadow-lg">
            <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white uppercase">
              <Settings className="h-4 w-4 text-[#00f2ff]" /> Broadcast Configuration
            </h2>
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="w-full rounded-lg border border-[#191f24] bg-[#0b0e11] p-3 text-xs font-semibold text-white outline-none focus:border-[#00f2ff]/40"
            />
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                <Key className="h-3 w-3" /> Stream Key (Keep Private)
              </label>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-[#191f24] bg-[#0b0e11] p-2.5">
                <input
                  type={showKey ? "text" : "password"}
                  value={streamKey}
                  readOnly
                  className="min-w-0 flex-1 truncate border-none bg-transparent font-mono text-xs text-gray-300 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="p-1 text-gray-400 hover:text-white"
                  aria-label={showKey ? "Hide stream key" : "Show stream key"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="font-mono text-[10px] text-[#64748b]">Room: {roomName}</p>
          </div>

          <div className="flex flex-1 flex-col space-y-3 rounded-xl border border-[#191f24] bg-[#111722]/50 p-5 shadow-lg">
            <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white uppercase">
              <Cpu className="h-4 w-4 text-[#00f2ff]" /> Prophetic Chat Engine
            </h2>
            <p className="text-[11px] leading-relaxed font-medium text-gray-400">
              Celebration bursts emit on the LiveKit data channel; viewers render them on the gift
              overlay canvas in under a second.
            </p>
            <div className="flex items-center justify-between border-t border-[#191f24] pt-2 text-[10px] font-bold">
              <span className="text-gray-500 uppercase">Lexical Analysis Model</span>
              <span className="rounded border border-[#00f2ff]/20 bg-[#00f2ff]/10 px-2 py-0.5 text-[#00f2ff]">
                v2.4-ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="flex min-h-[400px] flex-col rounded-xl border border-[#191f24] bg-[#111722]/50 p-6 shadow-lg lg:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-[#191f24] pb-4">
            <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white uppercase">
              <FileText className="h-4 w-4 text-[#00f2ff]" /> AI Script Teleprompter Engine
            </h2>
            <button
              type="button"
              onClick={() => setIsScrolling((v) => !v)}
              className="rounded border border-gray-700 bg-[#242c33] px-4 py-2 text-[10px] font-black tracking-wider text-white uppercase hover:bg-[#2d3740]"
            >
              {isScrolling ? "Halt Teleprompter" : "Activate Prompt Scroll"}
            </button>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-xl border border-[#191f24] bg-[#0b0e11] p-4">
            <textarea
              ref={teleprompterRef}
              value={teleprompterText}
              onChange={(e) => setTeleprompterText(e.target.value)}
              placeholder="Write your sermon notes or script dialogue elements here..."
              className="h-full min-h-[280px] w-full resize-none border-none bg-transparent font-mono text-lg leading-relaxed font-bold tracking-tight text-[#00f2ff] outline-none placeholder:text-gray-800"
            />
          </div>
          <div className="mt-4 flex items-center gap-6 rounded-lg border border-[#191f24] bg-[#0b0e11] p-3 text-xs font-bold">
            <span className="flex shrink-0 items-center gap-1.5 text-[10px] tracking-wider text-gray-400 uppercase">
              <Sliders className="h-3.5 w-3.5 text-gray-500" /> Scroll Speed
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-[#191f24] accent-[#00f2ff]"
            />
            <span className="shrink-0 rounded border border-[#00f2ff]/20 bg-[#00f2ff]/10 px-2 py-0.5 font-mono text-[#00f2ff]">
              {scrollSpeed}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
