"use client";

import { useEffect, useRef, useState } from "react";
import { Video, AlertTriangle, CheckCircle, Radio, Plus, Trash2 } from "lucide-react";
import { Room } from "livekit-client";
import { getLiveKitClientUrl } from "@/lib/livekit-env";

type DestinationInput = {
  id: string;
  label: string;
  url: string;
  key: string;
};

type Props = {
  roomName: string;
  userId: string;
};

const DEFAULT_DESTINATIONS: DestinationInput[] = [
  { id: "1", label: "Kick", url: "rtmp://fa723fc1b171.global-contribute.live-video.net/app", key: "" },
  { id: "2", label: "Twitch", url: "rtmp://live.twitch.tv/app", key: "" },
];

export default function StreamControlDeck({ roomName, userId }: Props) {
  const [isLive, setIsLive] = useState(false);
  const [egressId, setEgressId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<DestinationInput[]>(DEFAULT_DESTINATIONS);

  const livekitRoomRef = useRef<Room | null>(null);

  useEffect(() => {
    return () => {
      void livekitRoomRef.current?.disconnect();
      livekitRoomRef.current = null;
    };
  }, []);

  const handleAddField = () => {
    setDestinations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "Custom Destination", url: "", key: "" },
    ]);
  };

  const handleRemoveField = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateField = (id: string, field: "url" | "key" | "label", value: string) => {
    setDestinations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );
  };

  const handleToggleStreamingPipeline = async () => {
    setErrorMsg(null);
    setStatusMsg(null);

    if (isLive) {
      if (egressId) {
        try {
          setStatusMsg("Terminating multicast outputs…");
          const res = await fetch("/api/stream/egress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "STOP", roomName, egressId }),
          });
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (!res.ok) throw new Error(data.error ?? "Egress stop failed");
        } catch (e) {
          console.error("Server egress shutdown failure", e);
          setErrorMsg(e instanceof Error ? e.message : "Could not stop egress");
        }
      }

      if (livekitRoomRef.current) {
        await livekitRoomRef.current.disconnect();
        livekitRoomRef.current = null;
      }

      setIsLive(false);
      setEgressId(null);
      setStatusMsg("Stream successfully terminated.");
      return;
    }

    const activeDestinations = destinations.filter((d) => d.url.trim() && d.key.trim());
    if (activeDestinations.length === 0) {
      setErrorMsg("Add at least one RTMP URL and stream key before going live.");
      return;
    }

    try {
      setStatusMsg("Authorizing local WebRTC audio/video capture devices…");

      const tokenResponse = await fetch("/api/livekit/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          participantIdentity: `streamer_${userId}`,
          isPublisher: true,
        }),
      });

      const tokenData = (await tokenResponse.json()) as {
        token?: string;
        serverUrl?: string;
        url?: string;
        error?: string;
      };

      if (!tokenResponse.ok || !tokenData.token) {
        throw new Error(tokenData.error ?? "Failed to obtain publisher token");
      }

      const serverUrl =
        tokenData.serverUrl ?? tokenData.url ?? getLiveKitClientUrl();

      const room = new Room();
      await room.connect(serverUrl, tokenData.token);
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
      livekitRoomRef.current = room;

      setStatusMsg("Igniting server-side multi-destination RTMP egress pipelines…");
      const egressResponse = await fetch("/api/stream/egress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START",
          roomName,
          destinations: activeDestinations.map((d) => ({
            url: d.url.trim(),
            key: d.key.trim(),
          })),
        }),
      });

      const egressData = (await egressResponse.json()) as {
        egressId?: string;
        error?: string;
      };

      if (!egressResponse.ok || !egressData.egressId) {
        await room.disconnect();
        livekitRoomRef.current = null;
        throw new Error(
          egressData.error ?? "Failed to start server-side multicast distribution layers.",
        );
      }

      setEgressId(egressData.egressId);
      setIsLive(true);
      setStatusMsg("Broadcasting live simultaneously across targets!");
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "An integration runtime error blocked stream configuration.",
      );
      if (livekitRoomRef.current) {
        await livekitRoomRef.current.disconnect();
        livekitRoomRef.current = null;
      }
      setIsLive(false);
      setEgressId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 rounded-2xl border border-[#191f24] bg-[#111722]/60 p-6 text-zinc-200 shadow-2xl backdrop-blur-md select-none">
      <div className="flex items-center justify-between border-b border-[#191f24] pb-4">
        <div className="flex items-center gap-2.5">
          <Video className="h-5 w-5 text-[#00f2fe]" />
          <h2 className="text-base font-black tracking-wider text-white uppercase">
            Multicast Studio Broadcast Deck
          </h2>
        </div>

        <button
          type="button"
          onClick={() => void handleToggleStreamingPipeline()}
          data-testid="stream-control-deck-toggle"
          className={`flex items-center gap-2 rounded-xl border px-6 py-3.5 text-xs font-black tracking-widest uppercase transition-all active:scale-[0.97] ${
            isLive
              ? "border-red-500/20 bg-red-600 text-white shadow-xl shadow-red-600/10 hover:bg-red-700"
              : "border-transparent bg-[#00f2fe] text-black shadow-xl shadow-cyan-500/10 hover:bg-[#00d2dd]"
          }`}
        >
          <Radio className={`h-4 w-4 ${isLive ? "animate-pulse" : ""}`} />
          {isLive ? "End Multicast Session" : "Ignite Multicast Stream"}
        </button>
      </div>

      {statusMsg ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#00f2fe]/20 bg-cyan-950/20 p-3 font-mono text-xs font-semibold tracking-tight text-[#00f2fe]">
          <CheckCircle className="h-4 w-4 shrink-0" /> {statusMsg}
        </div>
      ) : null}
      {errorMsg ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-3 font-mono text-xs font-semibold tracking-tight text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {errorMsg}
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-black tracking-wider text-gray-400 uppercase">
          <span>Target Platform RTMP Configurations</span>
          <button
            type="button"
            onClick={handleAddField}
            disabled={isLive}
            className="flex items-center gap-1 text-[#00f2fe] transition-colors hover:text-white disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" /> Append Target
          </button>
        </div>

        <div className="space-y-3">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="grid grid-cols-1 items-center gap-3 rounded-xl border border-[#191f24] bg-[#0b0e11] p-3 md:grid-cols-6"
            >
              <div className="md:col-span-1">
                <input
                  type="text"
                  value={dest.label}
                  disabled={isLive}
                  onChange={(e) => handleUpdateField(dest.id, "label", e.target.value)}
                  className="w-full border-b border-transparent bg-transparent text-xs font-black text-white uppercase outline-none focus:border-[#00f2fe]/40"
                />
              </div>
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={dest.url}
                  placeholder="rtmp://server.url/app"
                  disabled={isLive}
                  onChange={(e) => handleUpdateField(dest.id, "url", e.target.value)}
                  className="w-full rounded-lg border border-[#191f24] bg-[#111722] p-2 font-mono text-[10px] text-gray-300 outline-none focus:border-[#00f2fe]/40"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="password"
                  value={dest.key}
                  placeholder="Stream Key"
                  disabled={isLive}
                  onChange={(e) => handleUpdateField(dest.id, "key", e.target.value)}
                  className="w-full rounded-lg border border-[#191f24] bg-[#111722] p-2 font-mono text-[10px] text-gray-300 outline-none focus:border-[#00f2fe]/40"
                />
                {destinations.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveField(dest.id)}
                    disabled={isLive}
                    className="rounded p-2 text-gray-500 transition-colors hover:text-red-400 disabled:opacity-20"
                    aria-label={`Remove ${dest.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
