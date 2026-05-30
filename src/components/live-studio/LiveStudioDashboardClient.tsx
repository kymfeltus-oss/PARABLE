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
  Sliders,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { streamInteractionChannelName } from "@/lib/stream-interactions";
import CreatorStudioControlRoom from "@/components/go-live/CreatorStudioControlRoom";
import GoLiveHeaderBar from "@/components/go-live/GoLiveHeaderBar";
import StreamHealthMatrix from "@/components/go-live/StreamHealthMatrix";
import BroadcastChatPanel from "@/components/go-live/BroadcastChatPanel";

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

  const [isLive, setIsLive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [bitrate, setBitrate] = useState(5800);
  const [fps, setFps] = useState(60);
  const [streamTitle, setStreamTitle] = useState("Sanctuary Broadcast Stream");
  const [streamCategory, setStreamCategory] = useState("Worship");

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

  useEffect(() => {
    if (!isLive) {
      setUptime(0);
      return;
    }
    const ticker = window.setInterval(() => {
      setUptime((prev) => prev + 1);
      setBitrate(Math.floor(5400 + Math.random() * 600));
      setFps(Math.random() > 0.96 ? 59 : 60);
    }, 1000);
    return () => window.clearInterval(ticker);
  }, [isLive]);

  const toggleBroadcastPipeline = () => {
    setIsProcessing(true);
    window.setTimeout(() => {
      setIsLive((prev) => !prev);
      setIsProcessing(false);
    }, 800);
  };

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

  const displayViewerCount = isLive && viewerCount > 0 ? viewerCount : isLive ? 2450 : 0;

  return (
    <div className="relative font-sans text-[#eff1f6] select-none">
      <CreatorStudioControlRoom
        headerSlot={
          <GoLiveHeaderBar
            isLive={isLive}
            viewerCount={displayViewerCount}
            uptimeSeconds={uptime}
            onToggleLive={toggleBroadcastPipeline}
            isProcessing={isProcessing}
          />
        }
        telemetrySlot={
          <div className="flex h-full flex-col overflow-hidden">
            <StreamHealthMatrix
              status={isLive ? "LIVE" : "STANDBY"}
              bitrateKbps={bitrate}
              fps={fps}
              viewerCount={displayViewerCount}
              uptimeSeconds={uptime}
            />
            <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#191f24] p-3 custom-scrollbar">
              <div className="mb-2 text-[10px] font-black tracking-wider text-gray-500 uppercase">
                Stream Activity Log
              </div>
              {alerts.length === 0 ? (
                <p className="text-center font-mono text-[10px] text-gray-600">
                  Awaiting active monetization transactions…
                </p>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-2 rounded-lg border border-[#191f24] bg-[#111722]/60 p-3 text-xs leading-relaxed"
                    >
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                      <span className="font-semibold text-gray-300">{alert.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
        videoSlot={
          isLive ? (
            <div className="flex h-full w-full items-center justify-center bg-neutral-950 font-mono text-xs font-bold tracking-widest text-red-500 select-none">
              LIVE BROADCAST CAPTURE RUNNING (WEBRTC HOOKS MOUNTED)
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-950 font-mono text-xs tracking-widest text-zinc-500 select-none">
              READY TO STREAM COCKPIT STANDBY
            </div>
          )
        }
        metadataSlot={
          <div className="space-y-4 font-mono select-none">
            <div className="flex items-center gap-1.5 border-b border-[#191f24] pb-2 text-[10px] font-black tracking-wider text-gray-500 uppercase">
              <Sliders className="h-3.5 w-3.5 text-[#00f2ff]" /> Metadata Modulators
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">
                  Stream Layout Title
                </label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#191f24] bg-[#0b0e11] p-2.5 text-xs text-white outline-none focus:border-[#00f2ff]/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">
                  Category Selection
                </label>
                <select
                  value={streamCategory}
                  onChange={(e) => setStreamCategory(e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-[#191f24] bg-[#0b0e11] p-2.5 text-xs text-white outline-none focus:border-[#00f2ff]/40"
                >
                  <option value="Worship">Worship &amp; Praise</option>
                  <option value="Sermon">Theological Discourse</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-black tracking-wider text-gray-500 uppercase">
                Workspace Quick Controls
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          </div>
        }
        chatSlot={
          <BroadcastChatPanel
            messagesSlot={
              <>
                {messages.length === 0 ? (
                  <p className="text-center font-mono text-[10px] text-gray-600">
                    No messages yet — chat sync is live.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg) => (
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
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
                {chatError ? (
                  <p className="mt-2 text-[10px] text-red-400" role="alert">
                    {chatError}
                  </p>
                ) : null}
              </>
            }
            composerSlot={
              <form onSubmit={(e) => void handleSendHostMessage(e)}>
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
            }
          />
        }
      />

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
