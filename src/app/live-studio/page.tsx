"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

import HubBackground from "@/components/HubBackground";
import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/client";

// LiveKit (client-side)
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import type { RoomOptions } from "livekit-client";

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

export default function LiveStudioPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // ✅ Hydration guard
  const [mounted, setMounted] = useState(false);

  // Live state
  const [goingLive, setGoingLive] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Media toggles (UI + LiveKit controls will follow later)
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // LiveKit connection
  const [lkToken, setLkToken] = useState<string | null>(null);
  const [lkUrl, setLkUrl] = useState<string | null>(null);
  const [lkRoom, setLkRoom] = useState<string>("parable-live");
  const [lkError, setLkError] = useState<string | null>(null);

  // Chat
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "m1", name: "Alpha Viewer", text: "Locked in ✅" },
    { id: "m2", name: "Beta Viewer", text: "This is clean 🔥" },
  ]);

  // Reactions / Offerings
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [totalOfferings, setTotalOfferings] = useState(2450);

  // Keep IDs stable-ish (client-only) without any server render conflicts
  const idSeed = useRef(0);
  const makeId = () => `${Date.now()}-${++idSeed.current}`;

  const phoneShell =
    "mx-auto w-full max-w-[430px] px-4 pt-24 pb-28 relative z-10";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Floater cleanup
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

  // ✅ Mint LiveKit token via your API route
  const startLive = async () => {
    try {
      setLkError(null);
      setGoingLive(true);

      // 1) get Supabase session access token
      const {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession();

      if (sessErr || !session?.access_token) {
        throw new Error("Supabase session missing. Please sign in again.");
      }

      // 2) call your token endpoint
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ room: lkRoom }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Token request failed");
      }

      const data = (await res.json()) as {
        token: string;
        url: string;
        room: string;
      };

      if (!data?.token || !data?.url) {
        throw new Error("Token endpoint returned an invalid payload.");
      }

      setLkToken(data.token);
      setLkUrl(data.url);
      setIsLive(true);
    } catch (e: any) {
      console.error("GO LIVE FAILED:", e);
      setLkError(
        typeof e?.message === "string"
          ? e.message
          : "GO LIVE FAILED — open console for details."
      );
      setIsLive(false);
      setLkToken(null);
      setLkUrl(null);
      alert("GO LIVE FAILED — open console for details.");
    } finally {
      setGoingLive(false);
    }
  };

  const endLive = () => {
    // disconnect by unmounting LiveKitRoom
    setIsLive(false);
    setLkToken(null);
    setLkUrl(null);
  };

  // LiveKit Room options (basic)
  const roomOptions: RoomOptions = useMemo(
    () => ({
      adaptiveStream: true,
      dynacast: true,
    }),
    []
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
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 rounded-sm border border-white/10 bg-black/60 hover:border-[#00f2ff]/25 transition-all"
          >
            <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[4px] text-white/60">
              <ArrowLeft size={14} /> Back
            </span>
          </button>

          <div className="text-[9px] font-black uppercase tracking-[6px] text-white/45">
            Live Studio
          </div>

          <button
            onClick={() => router.push("/streamers")}
            className="px-3 py-2 rounded-sm border border-white/10 bg-black/60 hover:border-[#00f2ff]/25 transition-all"
          >
            <span className="text-[9px] font-black uppercase tracking-[4px] text-white/60">
              Hub
            </span>
          </button>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {lkError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-3 rounded-sm border border-red-500/30 bg-red-500/10 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[6px] text-red-200">
                    Go Live Error
                  </p>
                  <p className="text-sm font-bold italic text-white/70 mt-1">
                    {lkError}
                  </p>
                </div>
                <button
                  onClick={() => setLkError(null)}
                  className="px-3 py-2 rounded-sm border border-white/10 bg-black/40 hover:border-red-500/30 transition-all text-white/60"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Broadcast window */}
        <div className="relative overflow-hidden rounded-sm border border-[#00f2ff]/18 bg-black/55 backdrop-blur-md">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#00f2ff]/10 to-transparent"
              style={{ animation: "techScan 3.6s linear infinite" }}
            />
          </div>

          <div className="relative p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
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

            {/* ✅ Video area */}
            <div className="relative aspect-video rounded-sm overflow-hidden border border-[#00f2ff]/14 bg-black flex items-center justify-center">
              {/* Floating reactions */}
              <div className="absolute inset-0 pointer-events-none">
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

              {/* ✅ Mount-gated LiveKit (prevents hydration mismatch) */}
              {mounted && isLive && lkToken && lkUrl ? (
                <LiveKitRoom
                  token={lkToken}
                  serverUrl={lkUrl}
                  options={roomOptions}
                  connect={true}
                  audio={micOn}
                  video={camOn}
                  onDisconnected={() => {
                    setIsLive(false);
                    setLkToken(null);
                    setLkUrl(null);
                  }}
                  onError={(err) => {
                    console.error("LiveKit error:", err);
                    setLkError(err?.message || "LiveKit connection error.");
                  }}
                  className="absolute inset-0"
                >
                  {/* You can add a real camera preview component later.
                      For now, this keeps the room connected and audio rendered. */}
                  <RoomAudioRenderer />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center opacity-90">
                      <div className="text-[10px] font-black uppercase tracking-[6px] text-white/60">
                        Connected
                      </div>
                      <div className="text-sm font-bold italic text-white/70 mt-1">
                        Room: {lkRoom}
                      </div>
                    </div>
                  </div>
                </LiveKitRoom>
              ) : (
                <div className="opacity-25 flex flex-col items-center">
                  <Video size={64} className="text-[#00f2ff]" />
                  <div className="mt-2 text-[9px] font-black uppercase tracking-[5px] text-white/45">
                    {mounted ? "Camera Preview Placeholder" : "Loading…"}
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => setCamOn((v) => !v)}
                className={`px-3 py-3 rounded-sm border text-[9px] font-black uppercase tracking-[4px] transition-all ${
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
                className={`px-3 py-3 rounded-sm border text-[9px] font-black uppercase tracking-[4px] transition-all ${
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
                  onClick={startLive}
                  disabled={goingLive || !mounted}
                  className="px-3 py-3 rounded-sm bg-[#00f2ff] text-black text-[9px] font-black uppercase tracking-[4px] disabled:opacity-60"
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
                  className="px-3 py-3 rounded-sm border border-red-500/40 bg-red-500/10 text-red-300 text-[9px] font-black uppercase tracking-[4px]"
                >
                  End
                </button>
              )}
            </div>

            {/* Creator tools */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => router.push("/teleprompter")}
                className="px-3 py-3 rounded-sm border border-[#00f2ff]/18 bg-black/60 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FileText size={14} /> Tele
                </span>
              </button>
              <button
                onClick={() => router.push("/sermon-checker")}
                className="px-3 py-3 rounded-sm border border-[#00f2ff]/18 bg-black/60 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Wand2 size={14} /> Check
                </span>
              </button>
              <button
                onClick={() => router.push("/ai-studio")}
                className="px-3 py-3 rounded-sm border border-[#00f2ff]/18 bg-black/60 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Sparkles size={14} /> AI
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Reactions + Offerings */}
        <div className="mt-3 rounded-sm border border-[#00f2ff]/14 bg-black/55 backdrop-blur-md p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45 inline-flex items-center gap-2">
              <Smile size={14} className="text-[#00f2ff]" /> Reactions
            </p>
            <p className="text-[9px] font-black uppercase tracking-[4px] text-white/35">
              Tap to send
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {REACTIONS.map((e) => (
              <button
                key={e}
                onClick={() => pushFloater(e)}
                className="px-4 py-3 rounded-sm border border-white/10 bg-white/5 hover:border-[#00f2ff]/25 transition-all text-lg"
              >
                {e}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45 inline-flex items-center gap-2">
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
                className="px-4 py-3 rounded-sm border border-[#00f2ff]/18 bg-black/60 hover:border-[#00f2ff]/35 transition-all"
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

        {/* Chat */}
        <div className="mt-3 rounded-sm border border-white/10 bg-black/55 backdrop-blur-md overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45">
              Live Chat
            </p>
            <span className="text-[9px] font-black uppercase tracking-[4px] text-white/35">
              {messages.length}
            </span>
          </div>

          <div className="p-4 space-y-3 max-h-[30vh] overflow-y-auto custom-scrollbar">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-sm border border-white/10 bg-white/5 p-3"
              >
                <p className="text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff]">
                  {m.name}
                </p>
                <p className="text-sm text-white/65 font-bold italic">
                  {m.text}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Send a message…"
              className="flex-1 bg-black/60 border border-white/10 px-4 py-3 rounded-sm outline-none text-sm font-bold placeholder:text-white/25 focus:border-[#00f2ff]/30"
            />
            <button
              onClick={sendChat}
              className="px-4 py-3 rounded-sm bg-[#00f2ff] text-black text-[10px] font-black uppercase tracking-[4px]"
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
