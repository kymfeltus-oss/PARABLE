"use client";

import { useEffect, useMemo, useRef } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { useStreamChat } from "@/hooks/useStreamChat";
import { useSimulatedChatFeed } from "@/hooks/useSimulatedChatFeed";
import { isStreamersSimChatEnabled } from "@/lib/streamers-sim-config";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

type Props = {
  streamKey: string | null | undefined;
  streamLabel?: string;
  senderDisplayName?: string;
  className?: string;
  /** When false, parent supplies the section title (e.g. clean-mode card). */
  showHeader?: boolean;
  /** Kick right rail: fill grid cell, input pinned by parent grid. */
  fillHeight?: boolean;
};

/**
 * PARABLE-branded live chat rail — Supabase Realtime on `stream_chat_messages`.
 */
export default function StreamersHubLiveChat({
  streamKey,
  streamLabel,
  senderDisplayName,
  className = "",
  showHeader = true,
  fillHeight = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    chatEnabled,
    chatMessages,
    newMessage,
    setNewMessage,
    chatError,
    sending,
    sendChatMessage,
  } = useStreamChat({ streamKey, senderDisplayName });

  const simChatEnabled = isStreamersSimChatEnabled();
  const simMessages = useSimulatedChatFeed({
    enabled: simChatEnabled && chatEnabled,
    streamKey,
  });

  const displayMessages = useMemo(() => {
    if (simMessages.length === 0) return chatMessages;
    const seen = new Set<string>();
    const merged = [...chatMessages, ...simMessages];
    const out = [];
    for (const m of merged) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      out.push(m);
    }
    return out;
  }, [chatMessages, simMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [displayMessages.length]);

  return (
    <div
      className={[
        "parable-live-surface flex min-h-0 flex-col font-inter",
        fillHeight ? "h-full min-h-0 rounded-none border-0 bg-transparent shadow-none" : "flex-1 rounded-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showHeader ? (
        <div className="shrink-0 border-b border-white/[0.06] px-3 py-3">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="PARABLE" className="h-5 w-5 shrink-0 object-contain opacity-90" />
            <MessageSquare className="h-4 w-4 shrink-0 text-[#00f2ff]" strokeWidth={2} />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Community
              </p>
              <h2 className="truncate text-sm font-bold text-white">Live chat</h2>
            </div>
            <span className="ml-auto flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.75)]" />
          </div>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="min-h-0 min-w-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-3 py-2 text-sm custom-scrollbar"
      >
        {!chatEnabled ? (
          <p className="px-1 text-center text-xs italic text-white/45">
            Select a channel to open live chat.
          </p>
        ) : (
          <>
            <p className="text-center text-xs italic text-white/45">
              Welcome to the secure stream chat
              {streamLabel ? (
                <>
                  {" · "}
                  <span className="font-semibold text-[#00f2ff]">{streamLabel}</span>
                </>
              ) : null}
              .
            </p>
            {displayMessages.length === 0 ? (
              <p className="text-center text-xs text-white/35">No messages yet — say hello.</p>
            ) : (
              displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="min-w-0 break-words rounded-xl border border-white/[0.08] bg-black/40 p-2.5 transition-colors hover:border-[#00f2ff]/20"
                >
                  <div className="mb-0.5 flex min-w-0 items-center gap-2">
                    {msg.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.avatarUrl}
                        alt=""
                        className="h-6 w-6 shrink-0 rounded-full object-cover"
                        onError={fallbackAvatarOnError}
                      />
                    ) : null}
                    <span className="min-w-0 truncate text-xs font-bold text-[#00f2fe]">{msg.user}</span>
                  </div>
                  <span className="block min-w-0 break-words text-white/85">{msg.text}</span>
                </div>
              ))
            )}
          </>
        )}
        {chatError ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] text-red-200/90">
            {chatError}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={sendChatMessage}
        className="shrink-0 border-t border-white/[0.06] bg-black/30 px-3 py-3"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!chatEnabled || sending}
            placeholder={chatEnabled ? "Send a respectful message…" : "Pick a channel first"}
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#00f2ff]/40 focus:outline-none focus:ring-1 focus:ring-[#00f2ff]/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!chatEnabled || sending || !newMessage.trim()}
            className="rounded-xl bg-[#00f2ff] px-4 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
