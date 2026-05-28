"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Loader2, MessageSquare, Pin, Trash2, Smile } from "lucide-react";
import { useStreamChat } from "@/hooks/useStreamChat";
import { useSimulatedChatFeed } from "@/hooks/useSimulatedChatFeed";
import { isStreamersSimChatEnabled } from "@/lib/streamers-sim-config";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

export type StreamersHubLiveChatVariant = "viewer" | "creator";

export type StreamChatComposerPlacement = "inline" | "viewport-fixed";

type Props = {
  streamKey: string | null | undefined;
  streamLabel?: string;
  senderDisplayName?: string;
  className?: string;
  showHeader?: boolean;
  fillHeight?: boolean;
  variant?: StreamersHubLiveChatVariant;
  /** Pin composer to viewport bottom (Kick mobile watch). */
  composerPlacement?: StreamChatComposerPlacement;
  /** Worship / emoji HUD rendered above the fixed composer. */
  reactionHud?: ReactNode;
  /** Toggle drawer for `reactionHud` when using viewport-fixed composer. */
  showReactionToggle?: boolean;
};

export default function StreamersHubLiveChat({
  streamKey,
  streamLabel,
  senderDisplayName,
  className = "",
  showHeader = true,
  fillHeight = false,
  variant = "viewer",
  composerPlacement = "inline",
  reactionHud,
  showReactionToggle = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const {
    chatEnabled,
    chatMessages,
    pinnedMessage,
    newMessage,
    setNewMessage,
    chatError,
    sending,
    sendChatMessage,
    isCreatorVariant,
    pinMessage,
    clearChatDisplay,
    displayCleared,
  } = useStreamChat({ streamKey, senderDisplayName, variant });

  const simChatEnabled = isStreamersSimChatEnabled();
  const simMessages = useSimulatedChatFeed({
    enabled: simChatEnabled && chatEnabled && !displayCleared,
    streamKey,
  });

  const displayMessages = useMemo(() => {
    if (displayCleared) return [];
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
  }, [chatMessages, simMessages, displayCleared]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [displayMessages.length, pinnedMessage?.id]);

  const scrollToRecent = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const fixedComposer = composerPlacement === "viewport-fixed";

  const composerForm = (
    <form
      onSubmit={sendChatMessage}
      className={
        fixedComposer
          ? "flex min-w-0 items-center gap-2"
          : "shrink-0 border-t border-white/[0.06] bg-black/30 px-3 py-3"
      }
    >
      <div className={fixedComposer ? "flex min-w-0 flex-1 items-center gap-2" : "flex min-w-0 gap-2"}>
        {showReactionToggle ? (
          <button
            type="button"
            aria-label={reactionsOpen ? "Hide reactions" : "Show reactions"}
            aria-expanded={reactionsOpen}
            onClick={() => setReactionsOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-200 transition hover:border-green-500/50 hover:text-white"
          >
            <Smile className="h-5 w-5" />
          </button>
        ) : null}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!chatEnabled || sending}
          placeholder={
            chatEnabled
              ? isCreatorVariant
                ? "Moderate or reply as host…"
                : fixedComposer
                  ? "Send a message…"
                  : "Send a respectful message…"
              : "Pick a channel first"
          }
          className={
            fixedComposer
              ? "min-h-[44px] min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-base text-white placeholder:text-slate-500 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30 disabled:opacity-50"
              : "min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#00f2fe]/40 focus:outline-none focus:ring-1 focus:ring-[#00f2fe]/30 disabled:opacity-50"
          }
          style={fixedComposer ? { fontSize: "16px" } : undefined}
        />
        <button
          type="submit"
          disabled={!chatEnabled || sending || !newMessage.trim()}
          className={
            fixedComposer
              ? "shrink-0 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              : "shrink-0 rounded-xl bg-[#00f2fe] px-4 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          }
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
        </button>
      </div>
    </form>
  );

  return (
    <div
      className={[
        "parable-live-surface flex min-h-0 min-w-0 flex-col font-inter",
        fillHeight ? "h-full min-h-0 rounded-none border-0 bg-transparent shadow-none" : "flex-1 rounded-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showHeader ? (
        <div className="shrink-0 border-b border-white/[0.06] px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="PARABLE" className="h-5 w-5 shrink-0 object-contain opacity-90" />
            <MessageSquare className="h-4 w-4 shrink-0 text-[#00f2fe]" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                {isCreatorVariant ? "Creator moderation" : "Community"}
              </p>
              <h2 className="truncate text-sm font-bold text-white">Live chat</h2>
            </div>
            <span className="ml-auto flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.75)]" />
          </div>
          {isCreatorVariant ? (
            <div className="mt-2 flex min-w-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={clearChatDisplay}
                className="inline-flex min-w-0 items-center gap-1 rounded-lg border border-[#24272c] bg-black/40 px-2 py-1 text-[10px] font-bold text-[#94a3b8] hover:border-[#00f2fe]/40 hover:text-[#00f2fe]"
              >
                <Trash2 size={11} />
                Clear display
              </button>
              <button
                type="button"
                onClick={scrollToRecent}
                className="truncate rounded-lg border border-[#24272c] bg-black/40 px-2 py-1 text-[10px] font-bold text-[#94a3b8] hover:border-[#00f2fe]/40 hover:text-[#00f2fe]"
              >
                Scroll to recent
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {pinnedMessage ? (
        <div className="shrink-0 border-b border-[#00f2fe]/25 bg-[#00f2fe]/10 px-3 py-2">
          <p className="mb-1 flex min-w-0 items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#00f2fe]">
            <Pin size={10} className="shrink-0" />
            Pinned
          </p>
          <p className="truncate text-xs font-bold text-white">{pinnedMessage.user}</p>
          <p className="break-words text-xs text-white/85">{pinnedMessage.text}</p>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className={[
          "min-h-0 min-w-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-3 py-2 text-sm custom-scrollbar",
          fixedComposer ? "pb-16" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!chatEnabled ? (
          <p className="break-words px-1 text-center text-xs italic text-white/45">
            Select a channel to open live chat.
          </p>
        ) : (
          <>
            <p className="break-words text-center text-xs italic text-white/45">
              Welcome to the secure stream chat
              {streamLabel ? (
                <>
                  {" · "}
                  <span className="font-semibold text-[#00f2fe]">{streamLabel}</span>
                </>
              ) : null}
              .
            </p>
            {displayMessages.length === 0 ? (
              <p className="text-center text-xs text-white/35">
                {displayCleared ? "Chat display cleared." : "No messages yet — say hello."}
              </p>
            ) : (
              displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="group min-w-0 break-words rounded-xl border border-white/[0.08] bg-black/40 p-2.5 transition-colors hover:border-[#00f2fe]/20"
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
                    <span className="min-w-0 flex-1 truncate text-xs font-bold text-[#00f2fe]">
                      {msg.user}
                    </span>
                    {isCreatorVariant ? (
                      <button
                        type="button"
                        onClick={() => pinMessage(msg.id)}
                        className="shrink-0 rounded p-1 text-[#64748b] opacity-0 transition-opacity hover:text-[#00f2fe] group-hover:opacity-100"
                        aria-label="Pin message"
                        title="Pin message"
                      >
                        <Pin size={12} />
                      </button>
                    ) : null}
                  </div>
                  <span className="block min-w-0 break-words text-white/85">{msg.text}</span>
                </div>
              ))
            )}
          </>
        )}
        {chatError ? (
          <p className="break-words rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] text-red-200/90">
            {chatError}
          </p>
        ) : null}
      </div>

      {fixedComposer ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          {reactionsOpen && reactionHud ? (
            <div className="mb-2">{reactionHud}</div>
          ) : null}
          {composerForm}
        </div>
      ) : (
        composerForm
      )}
    </div>
  );
}
