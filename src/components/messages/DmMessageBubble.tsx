"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { deliveryLabel } from "@/lib/messages/api";
import type { DmMessage } from "@/lib/messages/types";
import { useLongPress } from "@/hooks/useLongPress";
import DmMessageContextMenu from "@/components/messages/DmMessageContextMenu";
import DmReactionPicker from "@/components/messages/DmReactionPicker";

type Props = {
  message: DmMessage;
  showDeliveryStatus?: boolean;
  onRetry?: () => void;
  onDeleteFailed?: () => void;
  onUnsend?: () => void;
  onReact?: (emoji: string) => void;
  onVisible?: () => void;
};

export default function DmMessageBubble({
  message,
  showDeliveryStatus = false,
  onRetry,
  onDeleteFailed,
  onUnsend,
  onReact,
  onVisible,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactionOpen, setReactionOpen] = useState(false);
  const [failedMenuOpen, setFailedMenuOpen] = useState(false);

  const longPress = useLongPress(() => setMenuOpen(true), undefined, { delayMs: 500 });

  useEffect(() => {
    if (message.isOwn || !onVisible || !rootRef.current) return;
    const el = rootRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onVisible();
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [message.id, message.isOwn, onVisible]);

  const sending = message.localStatus === "sending";
  const failed = message.localStatus === "failed";
  const statusText = showDeliveryStatus ? deliveryLabel(message) : null;
  const reactionEntries = Object.entries(message.reactions);

  return (
    <div
      ref={rootRef}
      className={`relative flex w-full ${message.isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[82%] ${message.isOwn ? "items-end" : "items-start"} flex flex-col`}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(true);
        }}
        {...longPress}
      >
        {reactionOpen ? (
          <DmReactionPicker
            onSelect={(emoji) => {
              onReact?.(emoji);
              setReactionOpen(false);
              setMenuOpen(false);
            }}
            onClose={() => setReactionOpen(false)}
          />
        ) : null}

        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
            message.isOwn
              ? "rounded-br-md bg-gradient-to-br from-[#00F2FE] to-[#0EA5E9] text-[#01040A]"
              : "rounded-bl-md bg-[#06111E] text-[#F8FAFC]"
          } ${sending ? "opacity-70" : ""}`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          {message.postId ? (
            <p className="mt-1 text-[11px] opacity-80">Shared post · {message.postId.slice(0, 8)}…</p>
          ) : null}
          {sending ? (
            <div className="mt-1 flex items-center gap-1 text-[10px] opacity-80">
              <Loader2 className="h-3 w-3 animate-spin" />
              Sending…
            </div>
          ) : null}
        </div>

        {reactionEntries.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {reactionEntries.map(([uid, emoji]) => (
              <span
                key={uid}
                className="rounded-full border border-[#06111E] bg-[#020712] px-1.5 py-0.5 text-xs"
              >
                {emoji}
              </span>
            ))}
          </div>
        ) : null}

        {failed ? (
          <div className="relative mt-1 flex items-center gap-1">
            <button
              type="button"
              className="text-[#F87171]"
              aria-label="Message failed"
              onClick={() => setFailedMenuOpen((v) => !v)}
            >
              <AlertCircle className="h-4 w-4" />
            </button>
            {failedMenuOpen ? (
              <div className="absolute bottom-full right-0 z-20 mb-1 min-w-[140px] overflow-hidden rounded-lg border border-[#06111E] bg-[#020712] py-1 shadow-xl">
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-xs text-[#F8FAFC] hover:bg-[#06111E]"
                  onClick={() => {
                    setFailedMenuOpen(false);
                    onRetry?.();
                  }}
                >
                  Retry Send
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-xs text-[#F87171] hover:bg-[#06111E]"
                  onClick={() => {
                    setFailedMenuOpen(false);
                    onDeleteFailed?.();
                  }}
                >
                  Delete Message
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {statusText ? (
          <p className="mt-1 text-[10px] text-[#64748B]">{statusText}</p>
        ) : null}
      </div>

      <DmMessageContextMenu
        open={menuOpen}
        isOwn={message.isOwn}
        content={message.content}
        onClose={() => setMenuOpen(false)}
        onCopy={() => {
          void navigator.clipboard.writeText(message.content);
          setMenuOpen(false);
        }}
        onUnsend={
          message.isOwn && !message.id.startsWith("temp-")
            ? () => {
                onUnsend?.();
                setMenuOpen(false);
              }
            : undefined
        }
        onReact={() => {
          setMenuOpen(false);
          setReactionOpen(true);
        }}
      />
    </div>
  );
}
