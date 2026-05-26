"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_CHAT_PERKS,
  getUserChatPerks,
  type UserChatDisplayPerks,
} from "@/lib/monetization-helpers";
import GiftOverlayCanvas from "@/components/GiftOverlayCanvas";

export interface StreamChatMessage {
  id: string;
  user: string;
  text: string;
  badge?: string;
  color?: string;
  highlighted?: boolean;
}

export type StreamWorkspaceProps = {
  streamId: string;
  playbackUrl: string;
  creatorName: string;
  /** Optional LiveKit / video shell — kept outside chat state to avoid player remounts. */
  videoSlot?: ReactNode;
  initialViewMode?: "clean" | "gamer";
};

export default function StreamWorkspace({
  streamId,
  playbackUrl,
  creatorName,
  videoSlot,
  initialViewMode = "clean",
}: StreamWorkspaceProps) {
  const { userProfile } = useAuth();
  const [viewMode, setViewMode] = useState<"clean" | "gamer">(initialViewMode);
  const [messages, setMessages] = useState<StreamChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatPerks, setChatPerks] = useState<UserChatDisplayPerks>(DEFAULT_CHAT_PERKS);
  const [sendingGiftSku, setSendingGiftSku] = useState<string | null>(null);

  const giftOptions = [
    { sku: "gift_applause", label: "Applause 👏", cost: "50c" },
    { sku: "gift_controller", label: "Arcade 🎮", cost: "200c" },
    { sku: "gift_trophy", label: "Trophy 🏆", cost: "1000c" },
  ] as const;

  const sendVirtualGift = async (sku: string) => {
    if (!userProfile?.id) {
      alert("Please log in to purchase gifts.");
      return;
    }

    setSendingGiftSku(sku);

    try {
      const res = await fetch("/api/stream/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.id,
          streamerId: streamId,
          giftSku: sku,
          streamId,
        }),
      });

      const raw = await res.text();
      let data: { error?: string; success?: boolean } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        data = { error: raw.trim() || `Gift failed (HTTP ${res.status}).` };
      }

      if (!res.ok) {
        alert(data.error || "Transaction declined.");
      }
    } catch (err) {
      console.error("Critical failure during live gifting execution handover:", err);
      alert("Network error while sending gift. Please try again.");
    } finally {
      setSendingGiftSku(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadChatPerks() {
      if (!userProfile?.id) {
        setChatPerks(DEFAULT_CHAT_PERKS);
        return;
      }

      const perks = await getUserChatPerks(userProfile.id);
      if (!cancelled) setChatPerks(perks);
    }

    void loadChatPerks();
    return () => {
      cancelled = true;
    };
  }, [userProfile?.id]);

  const displayName =
    (typeof userProfile?.username === "string" && userProfile.username.trim()) ||
    (typeof userProfile?.full_name === "string" && userProfile.full_name.trim()) ||
    "You";

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userPerks =
      viewMode === "gamer" && userProfile?.id
        ? chatPerks
        : DEFAULT_CHAT_PERKS;

    const newMessage: StreamChatMessage = {
      id: crypto.randomUUID(),
      user: displayName,
      text: chatInput.trim(),
      badge: userPerks.badge,
      color: userPerks.color,
      highlighted: userPerks.chat_highlight,
    };

    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");

    void fetch("/api/chat/send-async", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamId, message: newMessage }),
    }).catch((err) => console.error("Background logging omitted crash risk:", err));
  };

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col bg-slate-950 text-slate-50 ${
        viewMode === "gamer" ? "lg:flex-row" : "flex-col"
      }`}
    >
      <div className="z-10 flex w-full items-center justify-between border-b border-slate-800 bg-slate-900 p-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold font-inter">{creatorName} Live Meeting</h1>
          <p className="text-xs text-slate-400">Stream Tracking ID: {streamId}</p>
        </div>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === "clean" ? "gamer" : "clean")}
          className="shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 font-semibold font-inter text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all duration-200 hover:scale-105"
        >
          Switch to {viewMode === "clean" ? "💥 Gamer Mode" : "📺 Clean Mode"}
        </button>
      </div>

      <div
        className={`flex w-full flex-1 overflow-hidden ${
          viewMode === "gamer" ? "flex-col lg:flex-row" : "flex-col"
        }`}
      >
        <div
          className={`relative flex flex-1 items-center justify-center bg-black ${
            viewMode === "gamer" ? "w-full lg:w-3/4" : "mx-auto w-full max-w-4xl p-4"
          }`}
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
            {videoSlot ?? (
              <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-slate-500">
                [ Low-Latency Video Player Connected: {playbackUrl} ]
              </div>
            )}

            <GiftOverlayCanvas streamId={streamId} enabled={viewMode === "gamer"} />

            {viewMode === "gamer" ? (
              <div className="absolute left-4 top-4 z-20 animate-pulse rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Live
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={`flex flex-col border-slate-800 bg-slate-900 ${
            viewMode === "gamer"
              ? "h-[400px] w-full border-t lg:h-auto lg:w-1/4 lg:border-l lg:border-t-0"
              : "mx-auto w-full max-w-4xl border-t p-4"
          }`}
        >
          {viewMode === "gamer" ? (
            <div className="border-b border-slate-800 bg-slate-950 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Support This Broadcast
              </p>
              <div className="grid grid-cols-3 gap-2">
                {giftOptions.map((gift) => (
                  <button
                    key={gift.sku}
                    type="button"
                    onClick={() => sendVirtualGift(gift.sku)}
                    disabled={sendingGiftSku !== null}
                    className="group flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-2 transition-all hover:border-cyan-500/50 hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                      {gift.label}
                    </span>
                    <span className="mt-0.5 font-mono text-[10px] text-slate-500">{gift.cost}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="max-h-[400px] flex-1 space-y-3 overflow-y-auto p-4 font-inter text-sm">
            {messages.length === 0 ? (
              <p className="text-center italic text-slate-500">Welcome to the secure stream chat.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl border p-2 transition-all ${
                    msg.highlighted && viewMode === "gamer"
                      ? "border-cyan-500/50 bg-gradient-to-r from-slate-900 to-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "border-slate-800 bg-slate-950"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    {msg.badge && viewMode === "gamer" ? (
                      <span
                        className="select-none text-base animate-pulse"
                        title="Platform premium tier"
                      >
                        {msg.badge}
                      </span>
                    ) : null}

                    <span
                      className="font-bold tracking-wide"
                      style={{ color: viewMode === "gamer" ? msg.color : "#cbd5e1" }}
                    >
                      {msg.user}:
                    </span>

                    <span className="break-all text-slate-200">{msg.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 border-t border-slate-800 bg-slate-950 p-3"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                viewMode === "gamer" ? "Send high energy chat..." : "Type a respectful message..."
              }
              className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none font-inter"
            />
            <button
              type="submit"
              className="rounded bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
