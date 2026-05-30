"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  Trash2,
  Award,
  Send,
  ShieldAlert,
  X,
  Smile,
  Gavel,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { streamInteractionChannelName } from "@/lib/stream-interactions";

type ChatMessage = {
  id: string;
  display_name: string;
  body: string;
  sender_id?: string | null;
};

type ActivityAlert = {
  id: string;
  text: string;
};

type Props = {
  userId: string;
};

const CUSTOM_EMOTES = ["🔥", "🙌", "👑", "🚀", "💯", "😂", "😮", "💥", "🎉", "⚡"];

const HOST_DISPLAY_NAME = "HOST_STREAMER";

function mapChatRow(row: {
  id?: string;
  body?: string;
  display_name?: string;
  sender_id?: string | null;
}): ChatMessage | null {
  if (!row.id || !row.body) return null;
  return {
    id: row.id,
    display_name: row.display_name?.trim() || "Anonymous",
    body: row.body,
    sender_id: row.sender_id ?? null,
  };
}

function isEmoteOnlyBody(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return CUSTOM_EMOTES.some((e) => trimmed.includes(e)) || /^[\p{Extended_Pictographic}\s]+$/u.test(trimmed);
}

async function broadcastRoomEvent(
  streamId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  const channel = supabase.channel(streamInteractionChannelName(streamId));
  await channel.subscribe();
  await channel.send({ type: "broadcast", event, payload });
  void supabase.removeChannel(channel);
}

export default function LiveStudioDashboardClient({ userId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [alerts, setAlerts] = useState<ActivityAlert[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [emoteOnly, setEmoteOnly] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatError, setChatError] = useState<string | null>(null);

  const [showBanPanel, setShowBanPanel] = useState(false);
  const [showEmoteTray, setShowEmoteTray] = useState(false);
  const [targetUsername, setTargetUsername] = useState("");
  const [modActionType, setModActionType] = useState<"TIMEOUT" | "BAN">("TIMEOUT");
  const [modBusy, setModBusy] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pushAlert = useCallback((text: string) => {
    setAlerts((current) => [{ id: crypto.randomUUID(), text }, ...current].slice(0, 30));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("viewer_count")
        .eq("id", userId)
        .maybeSingle();
      if (!cancelled && typeof data?.viewer_count === "number") {
        setViewerCount(data.viewer_count);
      }
    }

    async function loadChatHistory() {
      const { data, error } = await supabase
        .from("stream_chat_messages")
        .select("id, body, display_name, sender_id")
        .eq("stream_id", userId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (cancelled) return;
      if (error) {
        setChatError(error.message);
        return;
      }
      setChatError(null);
      setMessages(
        (data ?? [])
          .map((row) => mapChatRow(row))
          .filter((row): row is ChatMessage => row !== null),
      );
    }

    void loadProfile();
    void loadChatHistory();

    const activityFeedSubscription = supabase
      .channel(`live-studio-activity-alerts:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stream_gifts",
          filter: `stream_id=eq.${userId}`,
        },
        async (payload) => {
          const row = payload.new as {
            sender_id?: string;
            gift_id?: string;
            stream_id?: string;
          };
          if (row.stream_id !== userId || !row.sender_id || !row.gift_id) return;

          const [{ data: userProfile }, { data: gift }] = await Promise.all([
            supabase
              .from("profiles")
              .select("display_name, username")
              .eq("id", row.sender_id)
              .maybeSingle(),
            supabase.from("gift_catalog").select("name").eq("id", row.gift_id).maybeSingle(),
          ]);

          const name =
            userProfile?.display_name?.trim() ||
            userProfile?.username?.trim() ||
            "Guest";
          const giftLabel = gift?.name?.trim() || "Premium Gift";
          pushAlert(`${name} dropped a ${giftLabel} on channel!`);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "creator_ledger_entries",
          filter: `creator_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as {
            source_type?: string;
            description?: string;
            coin_amount?: number;
          };
          if (row.source_type === "one_time_gift" && (row.coin_amount ?? 0) < 0) return;
          const label =
            row.description?.trim() ||
            (row.source_type === "coin_purchase"
              ? "Checkout completed — coins deposited"
              : "Monetization transaction recorded");
          pushAlert(label);
        },
      )
      .subscribe();

    const chatFeedSubscription = supabase
      .channel(`live-studio-chat-monitor:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stream_chat_messages",
          filter: `stream_id=eq.${userId}`,
        },
        (payload) => {
          const mapped = mapChatRow(
            payload.new as {
              id?: string;
              body?: string;
              display_name?: string;
              sender_id?: string | null;
            },
          );
          if (!mapped) return;
          setMessages((current) => {
            if (current.some((m) => m.id === mapped.id)) return current;
            return [...current, mapped].slice(-50);
          });
        },
      )
      .subscribe();

    const roomControlSubscription = supabase
      .channel(streamInteractionChannelName(userId))
      .on("broadcast", { event: "chat_clear_command" }, () => {
        setMessages([]);
      })
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(activityFeedSubscription);
      void supabase.removeChannel(chatFeedSubscription);
      void supabase.removeChannel(roomControlSubscription);
    };
  }, [userId, pushAlert]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClearChatRoom = async () => {
    setMessages([]);
    await broadcastRoomEvent(userId, "chat_clear_command", { timestamp: Date.now() });
  };

  const handleToggleEmoteOnly = async () => {
    const next = !emoteOnly;
    setEmoteOnly(next);
    await broadcastRoomEvent(userId, "emote_only_mode", { active: next });
  };

  const handleSendHostMessage = async (e: FormEvent) => {
    e.preventDefault();
    const text = inputMsg.trim();
    if (!text) return;

    if (emoteOnly && !isEmoteOnlyBody(text)) {
      setChatError("Emote-only mode: send emojis from the tray only.");
      return;
    }

    setChatError(null);
    const { error } = await supabase.from("stream_chat_messages").insert({
      stream_id: userId,
      sender_id: userId,
      body: text,
      display_name: HOST_DISPLAY_NAME,
      client_temp_id: crypto.randomUUID(),
    });

    if (error) {
      setChatError(error.message);
      return;
    }
    setInputMsg("");
    setShowEmoteTray(false);
  };

  const handleExecuteModerationPolicy = async (e: FormEvent) => {
    e.preventDefault();
    const username = targetUsername.trim().toLowerCase();
    if (!username) return;

    setModBusy(true);
    const { data: targetProfile, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (lookupError || !targetProfile?.id) {
      setModBusy(false);
      window.alert("Target user profile not found in directory.");
      return;
    }

    const { error: modError } = await supabase.from("stream_moderation_actions").insert({
      streamer_id: userId,
      target_user_id: targetProfile.id,
      action_type: modActionType,
      expires_at:
        modActionType === "TIMEOUT"
          ? new Date(Date.now() + 10 * 60 * 1000).toISOString()
          : null,
    });

    setModBusy(false);

    if (modError) {
      const hint =
        modError.code === "PGRST205" || /schema cache/i.test(modError.message)
          ? "Run supabase/schema-stream-moderation.sql in your Supabase project."
          : modError.message;
      window.alert(`Moderation action failed: ${hint}`);
      return;
    }

    await broadcastRoomEvent(userId, "user_discipline_enforced", {
      targetUserId: targetProfile.id,
      actionType: modActionType,
    });

    pushAlert(
      `${modActionType === "BAN" ? "Permanent ban" : "10m timeout"} applied to @${username}`,
    );
    setTargetUsername("");
    setShowBanPanel(false);
  };

  const appendEmote = (emote: string) => {
    setInputMsg((prev) => `${prev}${prev ? " " : ""}${emote}`);
    setShowEmoteTray(false);
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#080a0c] font-sans text-[#eff1f6] select-none">
      <header className="z-20 flex w-full shrink-0 items-center justify-between border-b border-[#191f24] bg-[#191b1f] px-6 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-2 text-xs font-black tracking-widest text-white uppercase">
            Live Console
            <span className="animate-pulse rounded border border-red-500/20 bg-red-600/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
              BROADCASTING
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs font-bold">
          <span className="flex items-center gap-1.5 text-[#00e165]">
            <Users className="h-4 w-4" />
            {viewerCount > 0 ? viewerCount.toLocaleString() : "—"} Live Viewers
          </span>
        </div>
      </header>

      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-[#191f24] bg-[#0b0e11]">
          <div className="border-b border-[#191f24] bg-[#191b1f] p-3.5 text-[10px] font-black tracking-wider text-gray-400 uppercase">
            Stream Activity Log
          </div>
          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4 text-center font-mono text-[10px] text-gray-600">
                Awaiting active monetization transactions…
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-2 rounded-lg border border-[#191f24] bg-[#111722]/60 p-3 text-xs leading-relaxed"
                >
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                  <span className="font-semibold text-gray-300">{alert.text}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col space-y-4 overflow-y-auto bg-[#080a0c] p-4">
          <div className="relative flex aspect-video max-h-[460px] w-full items-center justify-center overflow-hidden rounded-xl border border-[#191f24] bg-black shadow-2xl">
            <div className="font-mono text-[10px] tracking-widest text-neutral-600 uppercase select-none">
              Stream Preview Output Channel Window
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-black tracking-wider text-gray-500 uppercase">
              Workspace Quick Controls
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => void handleClearChatRoom()}
                data-testid="live-studio-clear-chat"
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#191f24] bg-[#191b1f] p-4 text-xs font-bold text-white transition-colors hover:bg-[#242c33]"
              >
                <Trash2 className="h-4 w-4 text-red-400 transition-transform group-hover:scale-105" />
                Clear Chat Room
              </button>

              <button
                type="button"
                onClick={() => void handleToggleEmoteOnly()}
                data-testid="live-studio-emote-only"
                className={`group flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-xs font-bold transition-colors ${
                  emoteOnly
                    ? "border-[#00e165] bg-[#00e165]/10 text-[#00e165]"
                    : "border-[#191f24] bg-[#191b1f] text-white hover:bg-[#242c33]"
                }`}
              >
                <Smile className="h-4 w-4 transition-transform group-hover:scale-105" />
                {emoteOnly ? "Emote Only: ACTIVE" : "Toggle Emote Mode"}
              </button>

              <button
                type="button"
                onClick={() => setShowBanPanel(true)}
                data-testid="live-studio-discipline-panel"
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-[#191f24] bg-[#191b1f] p-4 text-xs font-bold text-white transition-colors hover:bg-[#242c33]"
              >
                <Gavel className="h-4 w-4 text-yellow-500 transition-transform group-hover:scale-105" />
                Discipline Panel
              </button>
            </div>
          </div>
        </main>

        <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-[#191f24] bg-[#0b0e11]">
          <div className="border-b border-[#191f24] bg-[#191b1f] p-4 text-[10px] font-black tracking-wider text-gray-300 uppercase">
            Channel Live Chat
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 custom-scrollbar">
            {messages.length === 0 ? (
              <p className="text-center font-mono text-[10px] text-gray-600">
                No messages yet — chat sync is live.
              </p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="text-xs leading-relaxed wrap-break-word">
                  <span
                    className={`mr-2 font-bold ${
                      msg.display_name === HOST_DISPLAY_NAME || msg.sender_id === userId
                        ? "text-red-400"
                        : msg.display_name.toLowerCase().includes("mod")
                          ? "text-[#00e165]"
                          : "text-[#00f2fe]"
                    }`}
                  >
                    {msg.display_name}:
                  </span>
                  <span className="text-gray-300">{msg.body}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {chatError ? (
            <p className="px-4 text-[10px] text-red-400" role="alert">
              {chatError}
            </p>
          ) : null}

          <form onSubmit={(e) => void handleSendHostMessage(e)} className="border-t border-[#191f24] bg-[#0b0e11] p-4">
            {showEmoteTray ? (
              <div
                className="mb-2 grid grid-cols-5 gap-1 rounded-lg border border-[#191f24] bg-[#191b1f] p-2"
                data-testid="live-studio-emote-tray"
              >
                {CUSTOM_EMOTES.map((emote) => (
                  <button
                    key={emote}
                    type="button"
                    onClick={() => appendEmote(emote)}
                    className="rounded p-1.5 text-lg transition-transform hover:bg-[#242c33] active:scale-90"
                  >
                    {emote}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-2 rounded-lg border border-[#191f24] bg-[#191b1f] px-3 py-2.5">
              <button
                type="button"
                onClick={() => setShowEmoteTray((v) => !v)}
                className="shrink-0 text-gray-400 transition-colors hover:text-white"
                aria-label="Toggle emote tray"
              >
                <Smile className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={
                  emoteOnly
                    ? "Emote execution lock is active — use tray…"
                    : "Chat as room host…"
                }
                readOnly={emoteOnly}
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-gray-600 read-only:opacity-70"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim()}
                className="shrink-0 text-gray-400 transition-colors hover:text-white disabled:opacity-30"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </aside>
      </div>

      {showBanPanel ? (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-labelledby="discipline-panel-title"
        >
          <form
            onSubmit={(e) => void handleExecuteModerationPolicy(e)}
            className="relative w-full max-w-md space-y-4 rounded-xl border border-[#191f24] bg-[#111722] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowBanPanel(false)}
              className="absolute top-4 right-4 text-gray-500 transition-colors hover:text-white"
              aria-label="Close discipline panel"
            >
              <X className="h-5 w-5" />
            </button>

            <h2
              id="discipline-panel-title"
              className="flex items-center gap-2 pr-8 text-sm font-black tracking-wider text-white uppercase"
            >
              <ShieldAlert className="h-4 w-4 text-red-400" />
              Channel Moderation Overrides
            </h2>

            <div className="space-y-1">
              <label className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                Target Username
              </label>
              <input
                type="text"
                required
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                placeholder="Enter exact account handle username…"
                className="w-full rounded-lg border border-[#191f24] bg-[#0b0e11] p-2.5 text-xs text-white outline-none focus:border-red-500/50"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                Discipline Level Execution
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModActionType("TIMEOUT")}
                  className={`rounded-lg border p-2.5 text-xs font-bold transition-colors ${
                    modActionType === "TIMEOUT"
                      ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                      : "border-[#191f24] bg-[#0b0e11] text-gray-400"
                  }`}
                >
                  TIMEOUT (10m)
                </button>
                <button
                  type="button"
                  onClick={() => setModActionType("BAN")}
                  className={`rounded-lg border p-2.5 text-xs font-bold transition-colors ${
                    modActionType === "BAN"
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : "border-[#191f24] bg-[#0b0e11] text-gray-400"
                  }`}
                >
                  PERMANENT BAN
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={modBusy || !targetUsername.trim()}
              className="w-full rounded-lg bg-red-600 py-3 text-xs font-black tracking-wider text-white uppercase transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {modBusy ? "Enforcing…" : "Enforce Policy Override"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
