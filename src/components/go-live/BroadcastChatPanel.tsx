"use client";

import type { ReactNode } from "react";

interface BroadcastChatPanelProps {
  messagesSlot: ReactNode;
  composerSlot: ReactNode;
}

export default function BroadcastChatPanel({
  messagesSlot,
  composerSlot,
}: BroadcastChatPanelProps) {
  return (
    <div className="flex h-full w-full flex-col bg-[#0b0e11]">
      <div className="select-none border-b border-[#191f24] bg-[#191b1f] p-3.5 text-[10px] font-black tracking-wider text-gray-400 uppercase">
        Studio Monitor Chat Feed
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">{messagesSlot}</div>

      <div className="shrink-0 border-t border-[#191f24] bg-[#0b0e11] p-3">{composerSlot}</div>
    </div>
  );
}
