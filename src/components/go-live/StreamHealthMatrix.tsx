"use client";

import { Activity, Cpu } from "lucide-react";
import type { StreamTelemetry } from "@/lib/go-live-layout-types";

export default function StreamHealthMatrix({
  status,
  bitrateKbps,
  fps,
}: StreamTelemetry) {
  const isLive = status === "LIVE";

  return (
    <div className="flex h-full w-full select-none flex-col gap-4 overflow-y-auto bg-[#0b0e11] p-4">
      <div className="flex items-center gap-1.5 border-b border-[#191f24] pb-2 text-[10px] font-black tracking-wider text-gray-500 uppercase">
        <Activity className="h-3.5 w-3.5 text-[#00f2ff]" /> System Telemetry
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
        <div className="space-y-1 rounded-xl border border-[#191f24] bg-[#111722]/60 p-3">
          <span className="block text-[9px] font-bold tracking-wider text-gray-500 uppercase">
            Bitrate Ingest
          </span>
          <span className="font-mono text-sm font-black text-white">
            {isLive ? `${(bitrateKbps / 1000).toFixed(2)} Mbps` : "0.00 Mbps"}
          </span>
        </div>

        <div className="space-y-1 rounded-xl border border-[#191f24] bg-[#111722]/60 p-3">
          <span className="block text-[9px] font-bold tracking-wider text-gray-500 uppercase">
            Encoder Performance
          </span>
          <span className="font-mono text-sm font-black text-white">
            {isLive ? `${fps} FPS` : "0 FPS"}
          </span>
        </div>

        <div className="space-y-1 rounded-xl border border-[#191f24] bg-[#111722]/60 p-3">
          <span className="block text-[9px] font-bold tracking-wider text-gray-500 uppercase">
            Live Connection Status
          </span>
          <span
            className={`block font-mono text-[11px] font-black uppercase ${
              isLive ? "text-green-400" : "text-yellow-500"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="hidden space-y-1 rounded-xl border border-[#191f24] bg-[#111722]/60 p-3 md:block">
          <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider text-gray-500 uppercase">
            <Cpu className="h-3 w-3 text-[#00f2ff]" /> Guard Rails
          </span>
          <span className="block text-[10px] leading-relaxed font-semibold text-gray-400">
            Prophetic filtering configurations operational.
          </span>
        </div>
      </div>
    </div>
  );
}
