"use client";

import { useRouter } from "next/navigation";
import { Activity, Mic, MicOff, Radio, Video, VideoOff, XCircle } from "lucide-react";
import { useLiveBroadcastStore } from "@/stores/live-broadcast-store";

type Props = {
  className?: string;
  onEndStream?: () => void;
};

/** Creator command overlay — End stream, mic/cam, health metrics (Parable teal accents). */
export default function CreatorCommandStrip({ className = "", onEndStream }: Props) {
  const router = useRouter();
  const micOn = useLiveBroadcastStore((s) => s.micOn);
  const camOn = useLiveBroadcastStore((s) => s.camOn);
  const viewerCount = useLiveBroadcastStore((s) => s.viewerCount);
  const health = useLiveBroadcastStore((s) => s.health);
  const setMicOn = useLiveBroadcastStore((s) => s.setMicOn);
  const setCamOn = useLiveBroadcastStore((s) => s.setCamOn);
  const clearPublishing = useLiveBroadcastStore((s) => s.clearPublishing);
  const publisherRailKey = useLiveBroadcastStore((s) => s.publisherRailKey);

  const endStream = () => {
    onEndStream?.();
    clearPublishing();
    router.push("/streamer-hub");
  };

  return (
    <div
      data-testid="creator-command-strip"
      className={[
        "pointer-events-none absolute inset-x-0 top-0 z-40 flex flex-col gap-2 p-3 sm:p-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-auto flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-[#00f2fe]/35 bg-[#0b0e11]/92 px-3 py-2 backdrop-blur-md">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00f2fe]">
          <Radio size={12} className="animate-pulse shrink-0" />
          <span className="truncate">Creator command hub</span>
        </span>
        {publisherRailKey ? (
          <span className="truncate font-mono text-[10px] text-[#64748b]">· {publisherRailKey}</span>
        ) : null}
        <span className="ml-auto truncate font-mono text-[10px] tabular-nums text-[#94a3b8]">
          {viewerCount.toLocaleString()} in room
        </span>
      </div>

      <div className="pointer-events-auto flex min-w-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMicOn(!micOn)}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-[#24272c] bg-[#191b1f]/95 px-3 py-2 text-xs font-bold text-white hover:border-[#00f2fe]/45"
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        >
          {micOn ? <Mic size={14} className="text-[#00f2fe]" /> : <MicOff size={14} />}
          <span className="truncate">{micOn ? "Mic on" : "Mic off"}</span>
        </button>
        <button
          type="button"
          onClick={() => setCamOn(!camOn)}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-[#24272c] bg-[#191b1f]/95 px-3 py-2 text-xs font-bold text-white hover:border-[#00f2fe]/45"
          aria-label={camOn ? "Turn camera off" : "Turn camera on"}
        >
          {camOn ? <Video size={14} className="text-[#00f2fe]" /> : <VideoOff size={14} />}
          <span className="truncate">{camOn ? "Cam on" : "Cam off"}</span>
        </button>
        <button
          type="button"
          onClick={endStream}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/80 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-900/90"
        >
          <XCircle size={14} />
          <span className="truncate">End stream</span>
        </button>
      </div>

      <div
        className="pointer-events-auto flex min-w-0 flex-wrap items-center gap-3 rounded-lg border border-[#24272c] bg-[#191b1f]/90 px-3 py-2 text-[10px] font-mono tabular-nums text-[#94a3b8]"
        data-testid="stream-health-panel"
      >
        <Activity size={12} className="shrink-0 text-[#00f2fe]" />
        <span className="truncate">
          {health.bitrateKbps > 0 ? `${health.bitrateKbps} kbps` : "— kbps"}
        </span>
        <span className="truncate">{health.latencyMs > 0 ? `${health.latencyMs} ms` : "— ms"}</span>
        <span className="truncate">drops {health.droppedFrames}</span>
      </div>
    </div>
  );
}
