"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import StreamersHubLiveChat from "@/components/streamers/StreamersHubLiveChat";
import { isStreamersSimChatEnabled } from "@/lib/streamers-sim-config";
import { useStreamersUiStore } from "@/stores/streamers-ui-store";

type Props = {
  streamKey: string;
  streamLabel?: string;
  senderDisplayName?: string;
};

/**
 * Right discovery chat pane (340px, lg+). Sim chat when `isStreamersSimChatEnabled()`.
 */
export default function StreamersDiscoveryChatRail({
  streamKey,
  streamLabel,
  senderDisplayName,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const chatOpen = useStreamersUiStore((s) => s.chatOpen);
  const setChatOpen = useStreamersUiStore((s) => s.setChatOpen);
  const simActive = isStreamersSimChatEnabled();

  if (collapsed) {
    return (
      <div className="hidden h-full w-12 shrink-0 flex-col border-l border-[#191f24] bg-[#0b0e11] lg:flex">
        <button
          type="button"
          aria-label="Expand stream chat"
          onClick={() => setCollapsed(false)}
          className="mt-4 flex h-10 w-full items-center justify-center text-[#64748b] hover:text-[#53fc18]"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <>
      {chatOpen ? (
        <button
          type="button"
          aria-label="Close stream chat"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setChatOpen(false)}
        />
      ) : null}

      <aside
        data-testid="stream-chat-rail"
        className={[
          "fixed bottom-0 right-0 top-0 z-50 flex w-[min(100vw,340px)] shrink-0 flex-col overflow-hidden border-l border-[#191f24] bg-[#0b0e11]",
          "transition-transform duration-200 lg:static lg:z-0 lg:w-[340px]",
          chatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          chatOpen ? "flex" : "hidden lg:flex",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-[#191f24] bg-[#111722] px-3 py-3">
          <button
            type="button"
            aria-label="Collapse stream chat"
            onClick={() => setCollapsed(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-[#191f24] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 className="flex-1 text-center text-xs font-black uppercase tracking-widest text-[#f8fafc]">
            Stream Chat
          </h2>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center">
            {simActive ? (
              <span className="flex items-center gap-1 rounded bg-[#53fc18]/10 px-2 py-0.5 text-[10px] font-bold text-[#53fc18]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#53fc18]" />
                Live
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-[#64748b]" aria-hidden />
            )}
          </span>
        </div>

        <div className="min-h-0 flex-1">
          <StreamersHubLiveChat
            streamKey={streamKey}
            streamLabel={streamLabel}
            senderDisplayName={senderDisplayName}
            showHeader={false}
            fillHeight
            messageLayout="kick-inline"
            enableQuickReactions
            className="h-full min-h-0 bg-[#0b0e11]"
          />
        </div>
      </aside>
    </>
  );
}
