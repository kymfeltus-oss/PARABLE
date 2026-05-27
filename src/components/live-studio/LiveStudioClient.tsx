"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Loader2,
  Send,
  Smile,
  DollarSign,
  Wand2,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { RoomOptions } from "livekit-client";

import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import {
  getParableGuestUserId,
  isParableDevGuestClientEnabled,
} from "@/lib/parable-dev-guest";
import { fetchLiveKitPublisherToken } from "@/lib/livekit-supabase-edge";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";
import { setProfileLiveStatus } from "@/lib/studio-session";

const HubBackground = dynamic(() => import("@/components/HubBackground"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#050505]" />,
});

const LiveStudioBroadcast = dynamic(
  () => import("@/components/live-studio/LiveStudioBroadcast"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center opacity-25">
        <Loader2 className="h-10 w-10 animate-spin text-[#00f2ff]" aria-hidden />
      </div>
    ),
  },
);

const liveStyles = `
  @keyframes techScan {
    0% { transform: translateY(-140%); opacity: 0; }
    15% { opacity: .85; }
    55% { opacity: .22; }
    100% { transform: translateY(180%); opacity: 0; }
  }
  @keyframes floatPop {
    0% { transform: translateY(10px) scale(.85); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: translateY(-70px) scale(1.05); opacity: 0; }
  }
`;

const REACTIONS = ["🔥", "🙏", "💙", "✨", "🙌", "😮", "❤️"];
const GIFTS = [
  { label: "Offering", emoji: "💠", amount: 5 },
  { label: "Blessing", emoji: "✨", amount: 10 },
  { label: "Seed", emoji: "🌱", amount: 25 },
  { label: "Support", emoji: "💙", amount: 50 },
];

type ChatMsg = { id: string; name: string; text: string };
type Floater = { id: string; emoji: string; x: number };

export default function LiveStudioClient() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { userProfile } = useAuth();

  const [goingLive, setGoingLive] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [lkToken, setLkToken] = useState<string | null>(null);
  const [lkUrl, setLkUrl] = useState<string | null>(null);
  const [lkRoom, setLkRoom] = useState("");
  const [lkError, setLkError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "m1", name: "Alpha Viewer", text: "Locked in ✅" },
    { id: "m2", name: "Beta Viewer", text: "This is clean 🔥" },
  ]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [totalOfferings, setTotalOfferings] = useState(2450);

  const idSeed = useRef(0);
  const makeId = () => `${Date.now()}-${++idSeed.current}`;

  const phoneShell =
    "relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-28 pt-parable-header";

  useEffect(() => {
    if (!floaters.length) return;
    const t = setTimeout(() => setFloaters((p) => p.slice(1)), 1100);
    return () => clearTimeout(t);
  }, [floaters]);

  const pushFloater = (emoji: string) => {
    setFloaters((prev) => [
      ...prev,
      { id: makeId(), emoji, x: 15 + Math.random() * 70 },
    ]);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: makeId(), name: "You", text: chatInput.trim() },
    ]);
    setChatInput("");
  };

  const reportLiveKitMediaError = useCallback((msg: string) => {
    setLkError(msg);
  }, []);

  const sendGift = (amount: number, emoji: string) => {
    setTotalOfferings((v) => v + amount);
    pushFloater(emoji);
    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        name: "System",
        text: `Offering received: $${amount} ${emoji}`,
      },
    ]);
  };

  const startLive = async () => {
    try {
      setLkError(null);
      setGoingLive(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const guestPreview = isParableDevGuestClientEnabled();
      const creatorId =
        session?.user?.id ??
        (guestPreview ? (userProfile?.id as string | undefined) ?? getParableGuestUserId() : null);

      if (!creatorId) {
        throw new Error("Sign in required to go live.");
      }

      const roomName = unifiedStreamRoomName(creatorId);
      setLkRoom(roomName);

      const { data, error: tokenErr } = await fetchLiveKitPublisherToken(supabase, roomName);
      if (tokenErr || !data?.token || !data.url) {
        throw new Error(tokenErr ?? "Token endpoint returned an invalid payload.");
      }

      setLkToken(data.token);
      setLkUrl(data.url);
      if (data.room) setLkRoom(data.room);

      if (session?.user?.id) {
        const { error: liveErr } = await setProfileLiveStatus(supabase, session.user.id, true);
        if (liveErr) {
          console.error("live-studio: is_live update", liveErr.message);
        }
      }

      setIsLive(true);
    } catch (e: unknown) {
      console.error("GO LIVE FAILED:", e);
      const detail =
        e instanceof Error && e.message.trim()
          ? e.message.trim()
          : "Unknown error — see browser console.";
      setLkError(detail);
      setIsLive(false);
      setLkToken(null);
      setLkUrl(null);
      alert(`Go Live failed\n\n${detail}`);
    } finally {
      setGoingLive(false);
    }
  };

  const endLive = () => {
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const creatorId =
        session?.user?.id ??
        (isParableDevGuestClientEnabled()
          ? (userProfile?.id as string | undefined) ?? getParableGuestUserId()
          : null);
      if (creatorId && session?.user?.id) {
        await setProfileLiveStatus(supabase, creatorId, false);
      }
    })();
    setIsLive(false);
    setLkToken(null);
    setLkUrl(null);
  };

  const roomOptions: RoomOptions = useMemo(
    () => ({
      adaptiveStream: true,
      dynacast: true,
    }),
    [],
  );

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden selection:bg-[#00f2ff]">
      <style>{liveStyles}</style>

      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <HubBackground />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,black_100%)] opacity-90" />
      </div>

      <Header />

      <main className={phoneShell}>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="rounded-sm border border-white/10 bg-black/60 px-3 py-2 transition-all hover:border-[#00f2ff]/25"
          >
            <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[4px] text-white/60">
              <ArrowLeft size={14} /> Back
            </span>
          </button>

          <h1
            data-lcp-anchor="live-studio-title"
            className="text-[9px] font-black uppercase tracking-[6px] text-white/45"
          >
            Live Studio
          </h1>

          <button
            onClick={() => router.push("/streamers")}
            className="rounded-sm border border-white/10 bg-black/60 px-3 py-2 transition-all hover:border-[#00f2ff]/25"
          >
            <span className="text-[9px] font-black uppercase tracking-[4px] text-white/60">
              Hub
            </span>
          </button>
        </div>

        {lkError ? (
          <div className="mb-3 rounded-sm border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[6px] text-red-200">
                  Go Live Error
                </p>
                <p className="mt-1 text-sm font-bold italic text-white/70">{lkError}</p>
              </div>
              <button
                onClick={() => setLkError(null)}
                className="rounded-sm border border-white/10 bg-black/40 px-3 py-2 text-white/60 transition-all hover:border-red-500/30"
              >
                ✕
              </button>
            </div>
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-sm border border-[#00f2ff]/18 bg-black/55 backdrop-blur-md">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#00f2ff]/10 to-transparent"
              style={{ animation: "techScan 3.6s linear infinite" }}
            />
          </div>

          <div className="relative p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    isLive ? "bg-red-500" : "bg-[#00f2ff]"
                  }`}
                />
                <span className="text-[9px] font-black uppercase tracking-[5px] text-white/55">
                  {isLive ? "Broadcast Active" : "Standby"}
                </span>
              </div>

              <div className="text-[9px] font-black uppercase tracking-[4px] text-[#00f2ff]">
                Offerings ${totalOfferings.toLocaleString()}
              </div>
            </div>

            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-sm border border-[#00f2ff]/14 bg-black">
              <div className="pointer-events-none absolute inset-0">
                {floaters.map((f) => (
                  <div
                    key={f.id}
                    className="absolute bottom-6 text-2xl"
                    style={{
                      left: `${f.x}%`,
                      animation: "floatPop 1.1s ease-out forwards",
                      filter: "drop-shadow(0 0 10px rgba(0,242,255,.25))",
                    }}
                  >
                    {f.emoji}
                  </div>
                ))}
              </div>

              {isLive && lkToken && lkUrl ? (
                <LiveStudioBroadcast
                  token={lkToken}
                  serverUrl={lkUrl}
                  roomName={lkRoom}
                  camOn={camOn}
                  micOn={micOn}
                  roomOptions={roomOptions}
                  onDisconnected={() => {
                    setIsLive(false);
                    setLkToken(null);
                    setLkUrl(null);
                  }}
                  onError={(message) => setLkError(message)}
                  onMediaError={reportLiveKitMediaError}
                />
              ) : (
                <div className="flex flex-col items-center opacity-25">
                  <Video size={64} className="text-[#00f2ff]" />
                  <div className="mt-2 text-[9px] font-black uppercase tracking-[5px] text-white/45">
                    Camera Preview Placeholder
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => setCamOn((v) => !v)}
                className={`rounded-sm border px-3 py-3 text-[9px] font-black uppercase tracking-[4px] transition-all ${
                  camOn
                    ? "border-[#00f2ff]/25 bg-black/70 text-[#00f2ff]"
                    : "border-white/10 bg-white/5 text-white/55"
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {camOn ? <Video size={14} /> : <VideoOff size={14} />} Cam
                </span>
              </button>

              <button
                onClick={() => setMicOn((v) => !v)}
                className={`rounded-sm border px-3 py-3 text-[9px] font-black uppercase tracking-[4px] transition-all ${
                  micOn
                    ? "border-[#00f2ff]/25 bg-black/70 text-[#00f2ff]"
                    : "border-white/10 bg-white/5 text-white/55"
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {micOn ? <Mic size={14} /> : <MicOff size={14} />} Mic
                </span>
              </button>

              {!isLive ? (
                <button
                  onClick={() => void startLive()}
                  disabled={goingLive}
                  className="rounded-sm bg-[#00f2ff] px-3 py-3 text-[9px] font-black uppercase tracking-[4px] text-black disabled:opacity-60"
                >
                  {goingLive ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={14} /> Going…
                    </span>
                  ) : (
                    "Go Live"
                  )}
                </button>
              ) : (
                <button
                  onClick={endLive}
                  className="rounded-sm border border-red-500/40 bg-red-500/10 px-3 py-3 text-[9px] font-black uppercase tracking-[4px] text-red-300"
                >
                  End
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => router.push("/teleprompter")}
                className="rounded-sm border border-[#00f2ff]/18 bg-black/60 px-3 py-3 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FileText size={14} /> Tele
                </span>
              </button>
              <button
                onClick={() => router.push("/sermon-checker")}
                className="rounded-sm border border-[#00f2ff]/18 bg-black/60 px-3 py-3 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Wand2 size={14} /> Check
                </span>
              </button>
              <button
                onClick={() => router.push("/ai-studio")}
                className="rounded-sm border border-[#00f2ff]/18 bg-black/60 px-3 py-3 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Sparkles size={14} /> AI
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-sm border border-[#00f2ff]/14 bg-black/55 p-4 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[6px] text-white/45">
              <Smile size={14} className="text-[#00f2ff]" /> Reactions
            </p>
            <p className="text-[9px] font-black uppercase tracking-[4px] text-white/35">
              Tap to send
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {REACTIONS.map((e) => (
              <button
                key={e}
                onClick={() => pushFloater(e)}
                className="rounded-sm border border-white/10 bg-white/5 px-4 py-3 text-lg transition-all hover:border-[#00f2ff]/25"
              >
                {e}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[6px] text-white/45">
              <DollarSign size={14} className="text-[#00f2ff]" /> Offerings
            </p>
            <p className="text-[9px] font-black uppercase tracking-[4px] text-[#00f2ff]">
              Total ${totalOfferings.toLocaleString()}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {GIFTS.map((g) => (
              <button
                key={g.label}
                onClick={() => sendGift(g.amount, g.emoji)}
                className="rounded-sm border border-[#00f2ff]/18 bg-black/60 px-4 py-3 transition-all hover:border-[#00f2ff]/35"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[3px] text-white/70">
                    {g.label}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[3px] text-[#00f2ff]">
                    ${g.amount}
                  </span>
                </div>
                <div className="mt-2 text-xl">{g.emoji}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-white/35">
            <ShieldCheck size={14} className="text-[#00f2ff]" />
            <span className="text-[9px] font-black uppercase tracking-[4px]">
              Gifts are simulated UI for now
            </span>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-sm border border-white/10 bg-black/55 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45">
              Live Chat
            </p>
            <span className="text-[9px] font-black uppercase tracking-[4px] text-white/35">
              {messages.length}
            </span>
          </div>

          <div className="custom-scrollbar max-h-[30vh] space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className="rounded-sm border border-white/10 bg-white/5 p-3">
                <p className="text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff]">
                  {m.name}
                </p>
                <p className="text-sm font-bold italic text-white/65">{m.text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-white/10 p-4">
            <input
              id="live-studio-chat-input"
              name="liveStudioChatMessage"
              type="text"
              autoComplete="off"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Send a message…"
              aria-label="Send a message"
              className="flex-1 rounded-sm border border-white/10 bg-black/60 px-4 py-3 text-sm font-bold outline-none placeholder:text-white/25 focus:border-[#00f2ff]/30"
            />
            <button
              onClick={sendChat}
              className="rounded-sm bg-[#00f2ff] px-4 py-3 text-[10px] font-black uppercase tracking-[4px] text-black"
            >
              <span className="inline-flex items-center gap-2">
                <Send size={14} /> Send
              </span>
            </button>
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 242, 255, 0.18);
            border-radius: 10px;
          }
        `}</style>
      </main>
    </div>
  );
}
