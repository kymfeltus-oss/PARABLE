"use client";

import { MessageSquare } from "lucide-react";
import StreamersHubLiveChat, {
  type StreamersHubLiveChatVariant,
} from "@/components/streamers/StreamersHubLiveChat";
import { useStreamersUiStore } from "@/stores/streamers-ui-store";

type Props = {
  streamKey: string | null;
  streamLabel?: string;
  senderDisplayName?: string;
  variant?: StreamersHubLiveChatVariant;
};

/**
 * Desktop / tablet chat rail — Postgres chat + Supabase broadcast reactions
 * on `realtime-stream-interactions:{streamKey}` (synced with watch player overlay).
 */
export default function ParableLiveChatRail({
  streamKey,
  streamLabel,
  senderDisplayName,
  variant = "viewer",
}: Props) {
  const chatOpen = useStreamersUiStore((s) => s.chatOpen);
  const setChatOpen = useStreamersUiStore((s) => s.setChatOpen);

  return (
    <>
      {chatOpen ? (
        <button
          type="button"
          aria-label="Close chat"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setChatOpen(false)}
        />
      ) : null}

      <aside
        data-testid="stream-chat-rail"
        className={`fixed bottom-0 right-0 top-14 z-40 w-[min(100vw,20rem)] shrink-0 flex-col overflow-hidden border-l border-[#191f24] bg-[#0b0e11] transition-transform duration-200 sm:w-80 md:static md:z-0 md:flex md:w-80 md:translate-x-0 ${
          chatOpen ? "flex translate-x-0" : "hidden translate-x-full md:flex md:translate-x-0"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col pb-parable-bottom md:pb-0">
          <div className="flex shrink-0 items-center justify-between border-b border-[#191f24] bg-[#191b1f] px-4 py-3 md:hidden">
            <span className="text-xs font-black uppercase tracking-wider text-gray-300">
              Stream Chat
            </span>
            <span className="flex items-center gap-1.5 rounded bg-[#00e165]/10 px-2 py-0.5 text-xs font-bold text-[#00e165]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00e165]" />
              Live
            </span>
          </div>
          <StreamersHubLiveChat
            streamKey={streamKey}
            streamLabel={streamLabel}
            senderDisplayName={senderDisplayName}
            variant={variant}
            fillHeight
            enableQuickReactions={Boolean(streamKey)}
            className="h-full min-h-0"
          />
        </div>
      </aside>
    </>
  );
}

/** Center-column chat fallback below `lg` when the right rail is off-screen. */
export function ParableLiveChatMobile({
  streamKey,
  streamLabel,
  senderDisplayName,
  variant = "viewer",
}: Props) {
  return (
    <div className="flex max-h-[320px] min-h-[240px] flex-col overflow-hidden rounded-xl border border-[#24272c] bg-[#191b1f]">
      <div className="flex items-center gap-2 border-b border-[#24272c] px-3 py-2">
        <MessageSquare size={16} className="text-[#00f2fe]" />
        <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">Live chat</span>
      </div>
      <div className="min-h-0 flex-1">
        <StreamersHubLiveChat
          streamKey={streamKey}
          streamLabel={streamLabel}
          senderDisplayName={senderDisplayName}
          variant={variant}
          fillHeight
          showHeader={false}
          enableQuickReactions={Boolean(streamKey)}
          className="h-full min-h-0"
        />
      </div>
    </div>
  );
}
