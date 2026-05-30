"use client";

import { Radio, Users, Clock } from "lucide-react";

interface GoLiveHeaderBarProps {
  isLive: boolean;
  viewerCount: number;
  uptimeSeconds: number;
  onToggleLive: () => void;
  isProcessing?: boolean;
}

export default function GoLiveHeaderBar({
  isLive,
  viewerCount,
  uptimeSeconds,
  onToggleLive,
  isProcessing = false,
}: GoLiveHeaderBarProps) {
  const formatUptime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hrs, mins, secs].map((v) => String(v).padStart(2, "0")).join(":");
  };

  return (
    <header className="z-30 flex h-14 w-full shrink-0 select-none items-center justify-between border-b border-[#191f24] bg-[#191b1f] px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-[#00f2ff] to-blue-600 text-xs font-black text-black">
            P
          </div>
          <span className="font-mono text-xs font-black tracking-widest text-white uppercase">
            LIVE STUDIO
          </span>
        </div>

        {isLive ? (
          <div className="hidden items-center gap-4 font-mono text-[11px] font-bold text-gray-400 sm:flex">
            <div className="flex items-center gap-1.5 rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-red-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              LIVE
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatUptime(uptimeSeconds)}
            </div>
            <div className="flex items-center gap-1 text-[#00f2ff]">
              <Users className="h-3.5 w-3.5" /> {viewerCount.toLocaleString()}
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onToggleLive}
        disabled={isProcessing}
        className={`flex h-9 items-center gap-1.5 rounded-lg border px-5 text-[10px] font-black tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-40 ${
          isLive
            ? "border-red-500/20 bg-red-600 text-white shadow-lg shadow-red-600/5 hover:bg-red-700"
            : "border-transparent bg-[#00f2ff] text-black shadow-lg shadow-[#00f2ff]/5 hover:bg-[#00d2dd]"
        }`}
      >
        <Radio className="h-3.5 w-3.5" />
        {isProcessing ? "Processing..." : isLive ? "End Stream" : "Go Live"}
      </button>
    </header>
  );
}
