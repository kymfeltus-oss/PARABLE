"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  BarChart3,
  Users,
  BookOpen,
  Zap,
  Shield,
  Play,
  Pause,
  MessageSquare,
  Heart,
  DollarSign,
  ChevronDown,
  Loader2,
  Search,
  Sparkles,
  Wand2,
  FileText,
  Upload,
  Mic,
  Video,
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import HubBackground from "@/components/HubBackground";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

const MODES = [
  { id: "broadcast", label: "Live Broadcast", icon: <Radio size={16} />, color: "#00f2ff" },
  { id: "study", label: "Message & Study", icon: <BookOpen size={16} />, color: "#a855f7" },
  { id: "interaction", label: "Live Interaction", icon: <MessageSquare size={16} />, color: "#22c55e" },
];

const hubStyles = `
  @keyframes gridDrift {
    0% { transform: translateY(0); opacity: .16; }
    100% { transform: translateY(22px); opacity: .16; }
  }
  @keyframes techScan {
    0% { transform: translateY(-140%); opacity: 0; }
    15% { opacity: .85; }
    55% { opacity: .22; }
    100% { transform: translateY(180%); opacity: 0; }
  }
  @keyframes borderPulse {
    0%,100% { box-shadow: 0 0 0 rgba(0,242,255,0); }
    50% { box-shadow: 0 0 54px rgba(0,242,255,.12); }
  }
  @keyframes shimmerX {
    0% { transform: translateX(-120%); opacity: 0; }
    20% { opacity: .9; }
    65% { opacity: .22; }
    100% { transform: translateX(140%); opacity: 0; }
  }
  @keyframes dotPulse {
    0% { opacity: .18; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-1px); }
    100% { opacity: .18; transform: translateY(0); }
  }
`;

function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[3px] border transition-all ${
        active
          ? "bg-[#00f2ff] text-black border-[#00f2ff] shadow-[0_0_18px_rgba(0,242,255,0.22)]"
          : "bg-white/5 text-white/45 border-white/10 hover:border-[#00f2ff]/25 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function MiniStatus({ isLive }: { isLive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${isLive ? "bg-red-500" : "bg-[#00f2ff]"} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
        style={{ animation: isLive ? "dotPulse 1s ease-in-out infinite" : undefined }}
      />
      <span className="text-[10px] font-black uppercase tracking-[6px] text-white/45">STATUS</span>
      <span className={`text-[10px] font-black uppercase tracking-[6px] ${isLive ? "text-red-400" : "text-[#00f2ff]"}`}>
        {isLive ? "LIVE" : "READY"}
      </span>
    </div>
  );
}

type SermonReport = {
  score: number;
  flags: { type: "ok" | "warn"; label: string; detail: string }[];
  highlights: string[];
};

export default function StreamerHub() {
  const supabase = createClient();
  const router = useRouter();

  const [activeMode, setActiveMode] = useState("broadcast");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics] = useState({ support: "$2,450", active: "1.2k" });

  const [user, setUser] = useState<{ name: string; profilePic: string | null }>({
    name: "",
    profilePic: null,
  });

  const [query, setQuery] = useState("");
  const [activeRow, setActiveRow] = useState<"ForYou" | "Trending" | "New" | "Following">("ForYou");

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [teleprompterOpen, setTeleprompterOpen] = useState(false);
  const [checkerOpen, setCheckerOpen] = useState(false);

  // Teleprompter (kept working in-page, but routes also work)
  const [notesTitle, setNotesTitle] = useState("Sunday Message");
  const [teleprompterText, setTeleprompterText] = useState("");
  const [teleSpeed, setTeleSpeed] = useState(26);
  const [telePlaying, setTelePlaying] = useState(false);
  const [teleFont, setTeleFont] = useState(18);

  // Checker (UI-only)
  const [notesInput, setNotesInput] = useState("");
  const [liveInput, setLiveInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [report, setReport] = useState<SermonReport | null>(null);

  // Replace with real streams later
  const STREAMS = useMemo(
    () => ({
      ForYou: [
        { id: "s1", title: "Kingdom Night Live", creator: "Alpha Creator", live: true, tag: "Worship", viewers: "2.4k" },
        { id: "s2", title: "Sermon Studio", creator: "Beta Artist", live: false, tag: "Study", viewers: "—" },
        { id: "s3", title: "Gaming for Ministry", creator: "Zion Streamer", live: true, tag: "Gaming", viewers: "980" },
        { id: "s4", title: "Prayer & Peace", creator: "Sanctuary Host", live: false, tag: "Prayer", viewers: "—" },
      ],
      Trending: [
        { id: "t1", title: "Revival Broadcast", creator: "Kai", live: true, tag: "Live", viewers: "4.1k" },
        { id: "t2", title: "Bible Breakdown", creator: "Nia", live: false, tag: "Study", viewers: "—" },
        { id: "t3", title: "Faith Talk", creator: "Eli", live: true, tag: "Talk", viewers: "1.7k" },
        { id: "t4", title: "Worship Set", creator: "Jules", live: false, tag: "Worship", viewers: "—" },
      ],
      New: [
        { id: "n1", title: "First Stream: Welcome", creator: "New Creator", live: false, tag: "Intro", viewers: "—" },
        { id: "n2", title: "Notes to Stage", creator: "Speaker Lab", live: true, tag: "Live", viewers: "430" },
        { id: "n3", title: "Creator Setup", creator: "Parable Academy", live: false, tag: "Guide", viewers: "—" },
        { id: "n4", title: "Late Night Prayer", creator: "Peace Room", live: true, tag: "Prayer", viewers: "620" },
      ],
      Following: [
        { id: "f1", title: "Community Pulse", creator: "Alpha Creator", live: true, tag: "Live", viewers: "2.4k" },
        { id: "f2", title: "Studio Session", creator: "Beta Artist", live: false, tag: "Behind", viewers: "—" },
        { id: "f3", title: "Preach Practice", creator: "Gamma Pastor", live: false, tag: "Practice", viewers: "—" },
        { id: "f4", title: "Scripture Sprint", creator: "Delta Teacher", live: true, tag: "Study", viewers: "1.1k" },
      ],
    }),
    []
  );

  // Identity sync
  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const metadataName = authUser.user_metadata?.display_name || authUser.user_metadata?.full_name;
          const metadataAvatar = authUser.user_metadata?.avatar_url;

          let finalPic: string | null = null;
          if (metadataAvatar) {
            const { data } = supabase.storage.from("avatars").getPublicUrl(metadataAvatar);
            finalPic = `${data.publicUrl}?t=${Date.now()}`;
          }

          setUser({
            name: metadataName || "Authorized Legend",
            profilePic: finalPic,
          });
        }
      } catch (err) {
        console.error("Identity Sync Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIdentity();
  }, [supabase]);

  // Teleprompter scroll loop
  useEffect(() => {
    if (!teleprompterOpen || !telePlaying) return;
    const el = document.getElementById("parable-teleprompter-scroll");
    if (!el) return;

    let raf = 0;
    const tick = () => {
      el.scrollTop += teleSpeed / 60;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [teleprompterOpen, telePlaying, teleSpeed]);

  const filteredTiles = useMemo(() => {
    const row = STREAMS[activeRow];
    if (!query.trim()) return row;
    const q = query.toLowerCase();
    return row.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.creator.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q)
    );
  }, [STREAMS, activeRow, query]);

  // ✅ Real routing map (pages can be designed next)
  const goSettings = () => router.push("/settings");
  const goAiStudio = () => router.push("/ai-studio");
  const goTeleprompter = () => router.push("/teleprompter");
  const goSermonChecker = () => router.push("/sermon-checker");
  const goGoLive = () => router.push("/live-studio");
  const goWatch = (id: string) => router.push(`/watch/${id}`);
  const goTiers = () => router.push("/contribution-tiers");
  const goCommunity = () => router.push("/community");

  const toggleLive = () => {
    setIsLive((v) => !v);
    // route into studio when starting
    if (!isLive) goGoLive();
  };

  const runChecker = async () => {
    setChecking(true);
    setReport(null);

    await new Promise((r) => setTimeout(r, 900));

    const a = notesInput.trim();
    const b = liveInput.trim();

    const lengthDelta = Math.abs(a.length - b.length);
    const base = a && b ? 82 : a || b ? 64 : 52;
    const score = Math.max(40, Math.min(98, base - Math.min(22, Math.floor(lengthDelta / 120))));

    const flags: SermonReport["flags"] = [];
    if (!a) flags.push({ type: "warn", label: "Missing notes", detail: "Upload or paste notes for strongest alignment checks." });
    if (!b) flags.push({ type: "warn", label: "Missing live transcript", detail: "Paste transcript or live capture for comparison." });
    if (a && b) flags.push({ type: "ok", label: "Theme alignment", detail: "Core topics appear consistent." });
    if (a && b && lengthDelta > 900) flags.push({ type: "warn", label: "Structure drift", detail: "Transcript length diverges significantly from notes." });
    if (a && b) flags.push({ type: "ok", label: "Clarity check", detail: "Key points are readable and well segmented." });

    setReport({
      score,
      flags,
      highlights: [
        "Suggested: tighten transitions between sections.",
        "Suggested: add a clear closing call-to-action.",
        "Suggested: repeat your main scripture reference once more for retention.",
      ],
    });

    setChecking(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden selection:bg-[#00f2ff]">
      <style>{hubStyles}</style>

      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,242,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,242,255,0.055)_1px,transparent_1px)] bg-[size:64px_64px]"
            style={{ animation: "gridDrift 7s ease-in-out infinite alternate" }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[34vh] bg-gradient-to-t from-[#00f2ff]/6 to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,black_100%)] opacity-90" />
      </div>

      <Header />

      {/* ✅ OFFICIAL PHONE APP SPEC (single-column, 430px max) */}
      <main className="relative z-10 pt-24 pb-28 mx-auto w-full max-w-[430px] px-4">
        {/* TOP: Identity */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className="relative overflow-hidden rounded-sm border border-[#00f2ff]/18 bg-black/55 backdrop-blur-md px-4 py-4"
            style={{ animation: "borderPulse 5s ease-in-out infinite" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#00f2ff]/10 to-transparent"
                style={{ animation: "techScan 3.4s linear infinite" }}
              />
            </div>

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full border-2 border-[#00f2ff]/45 overflow-hidden bg-black flex items-center justify-center shadow-[0_0_18px_rgba(0,242,255,0.18)]">
                    {loading ? (
                      <Loader2 className="animate-spin text-[#00f2ff]" size={16} />
                    ) : user.profilePic ? (
                      <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="text-white/25" size={22} />
                    )}
                  </div>
                  {isLive && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-black animate-pulse" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-black italic uppercase tracking-[2px] text-white">
                    {loading ? "SYNCING..." : user.name}
                  </span>
                  <span className="text-[8px] font-bold text-[#00f2ff] uppercase tracking-[2px]">
                    Premium Creator • Authorized
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MiniStatus isLive={isLive} />
                <button
                  onClick={goSettings}
                  className="px-3 py-2 rounded-sm border border-white/10 bg-black/60 hover:border-[#00f2ff]/30 transition-all"
                >
                  <span className="text-[9px] font-black uppercase tracking-[3px] text-white/60 inline-flex items-center gap-2">
                    Settings <ChevronDown size={12} className="text-white/35" />
                  </span>
                </button>
              </div>
            </div>

            <div className="relative mt-4 flex gap-2">
              <button
                onClick={goAiStudio}
                className="flex-1 px-4 py-3 rounded-sm border border-[#00f2ff]/25 bg-black/70 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff] hover:text-white transition-colors"
              >
                AI Studio
              </button>
              <button
                onClick={goCommunity}
                className="flex-1 px-4 py-3 rounded-sm border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[3px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
              >
                Community
              </button>
            </div>
          </div>
        </motion.div>

        {/* SEARCH */}
        <div className="mt-3 relative overflow-hidden rounded-sm border border-[#00f2ff]/18 bg-black/55 backdrop-blur-md px-4 py-4">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#00f2ff]/10 to-transparent"
              style={{ animation: "techScan 3.4s linear infinite" }}
            />
          </div>
          <div className="relative flex items-center gap-3">
            <Search size={18} className="text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search streams, creators, categories…"
              className="bg-transparent w-full outline-none text-sm font-bold placeholder:text-white/25"
            />
            <button
              onClick={() => setQuery("")}
              className={`text-[9px] font-black uppercase tracking-[3px] ${query ? "text-[#00f2ff]" : "text-white/25"} transition-colors`}
            >
              Clear
            </button>
          </div>
        </div>

        {/* ROW SELECTOR */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill active={activeRow === "ForYou"} onClick={() => setActiveRow("ForYou")}>
            For You
          </Pill>
          <Pill active={activeRow === "Trending"} onClick={() => setActiveRow("Trending")}>
            Trending
          </Pill>
          <Pill active={activeRow === "New"} onClick={() => setActiveRow("New")}>
            New
          </Pill>
          <Pill active={activeRow === "Following"} onClick={() => setActiveRow("Following")}>
            Following
          </Pill>
        </div>

        {/* MODE + GO LIVE */}
        <div className="mt-3 rounded-sm border border-[#00f2ff]/18 bg-black/55 backdrop-blur-md overflow-hidden">
          <div className="px-4 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white/45">
              <SlidersHorizontal size={16} className="text-white/35" />
              <span className="text-[9px] font-black uppercase tracking-[3px]">Mode</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={toggleLive}
              className={`px-5 py-3 rounded-sm font-black uppercase tracking-[5px] text-[10px] border transition-all ${
                isLive
                  ? "bg-red-500/10 border-red-500/40 text-red-400"
                  : "bg-[#00f2ff] border-[#00f2ff] text-black shadow-[0_0_22px_rgba(0,242,255,0.22)]"
              }`}
            >
              {isLive ? (
                <span className="inline-flex items-center gap-2">
                  <Pause size={14} /> End
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Play size={14} /> Go Live
                </span>
              )}
            </motion.button>
          </div>

          <div className="px-2 pb-3">
            <div className="flex items-center justify-between gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id)}
                  className={`flex-1 px-3 py-3 rounded-sm text-[9px] font-black uppercase tracking-[3px] transition-all ${
                    activeMode === m.id ? "bg-[#00f2ff] text-black" : "text-white/45 hover:text-white bg-white/5"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {m.icon} <span className="hidden sm:inline">{m.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURED WINDOW (phone) */}
        <div className="mt-4 relative overflow-hidden rounded-sm border border-[#00f2ff]/18 bg-black/55 backdrop-blur-md p-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,242,255,0.12),transparent_45%)]" />
            <div
              className="absolute inset-x-0 h-44 bg-gradient-to-b from-transparent via-[#00f2ff]/10 to-transparent"
              style={{ animation: "techScan 3.6s linear infinite" }}
            />
          </div>

          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45">Featured</p>
            <h2 className="mt-2 text-xl font-black italic uppercase tracking-tighter">
              Sanctuary Live Window
            </h2>
            <p className="mt-2 text-sm text-white/60 font-bold italic leading-relaxed">
              Clean discovery + creator tools. Not crowded. Built to feel premium.
            </p>

            <div className="mt-4 relative aspect-video rounded-sm overflow-hidden border border-[#00f2ff]/18 bg-black shadow-[0_0_40px_rgba(0,242,255,0.10)]">
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                {isLive && (
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red]"
                  />
                )}
                <span className="text-[9px] font-black uppercase tracking-[5px]">
                  {isLive ? "BROADCAST ACTIVE" : "STANDBY MODE"}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-25">
                <Zap size={90} className="text-[#00f2ff]" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <button
                  onClick={goTeleprompter}
                  className="px-3 py-2 rounded-sm border border-[#00f2ff]/25 bg-black/70 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff] hover:text-white transition-colors"
                >
                  Teleprompter
                </button>
                <button
                  onClick={goSermonChecker}
                  className="px-3 py-2 rounded-sm border border-[#00f2ff]/25 bg-black/70 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff] hover:text-white transition-colors"
                >
                  Checker
                </button>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={goTeleprompter}
                className="flex-1 px-4 py-3 rounded-sm bg-[#00f2ff] text-black text-[9px] font-black uppercase tracking-[5px] shadow-[0_0_18px_rgba(0,242,255,0.18)]"
              >
                Open Teleprompter
              </button>
              <button
                onClick={goSermonChecker}
                className="flex-1 px-4 py-3 rounded-sm border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[5px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
              >
                Sermon Checker
              </button>
            </div>
          </div>
        </div>

        {/* NETFLIX ROW (phone) */}
        <div className="mt-4 rounded-sm border border-[#00f2ff]/14 bg-black/40 overflow-hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#00f2ff]" />
              <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45">
                {activeRow === "ForYou"
                  ? "For You"
                  : activeRow === "Trending"
                  ? "Trending Now"
                  : activeRow === "New"
                  ? "New & Rising"
                  : "Following"}
              </p>
            </div>

            <div className="text-[9px] font-black uppercase tracking-[3px] text-white/35">
              {filteredTiles.length}
            </div>
          </div>

          <div className="px-4 pb-5 overflow-x-auto custom-scrollbar">
            <div className="flex gap-3 min-w-max">
              {filteredTiles.map((s) => (
                <motion.button
                  key={s.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => goWatch(s.id)}
                  className="w-[220px] relative overflow-hidden rounded-sm border border-white/10 bg-black/55 text-left"
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,255,0.12),transparent_50%)]" />
                    <div
                      className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent opacity-20"
                      style={{ animation: "shimmerX 2.2s ease-in-out infinite" }}
                    />
                  </div>

                  <div className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] font-black uppercase tracking-[4px] text-[#00f2ff]">{s.tag}</div>
                      {s.live ? (
                        <div className="text-[9px] font-black uppercase tracking-[4px] text-red-400">
                          LIVE • {s.viewers}
                        </div>
                      ) : (
                        <div className="text-[9px] font-black uppercase tracking-[4px] text-white/35">
                          REPLAY
                        </div>
                      )}
                    </div>

                    <div className="mt-3 h-[110px] rounded-sm border border-[#00f2ff]/14 bg-black flex items-center justify-center">
                      <Zap className="text-[#00f2ff]/60" size={34} />
                    </div>

                    <p className="mt-3 text-[14px] font-black italic uppercase tracking-tight leading-tight">{s.title}</p>
                    <p className="mt-1 text-[11px] text-white/45 font-bold uppercase tracking-[2px]">{s.creator}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="px-3 py-2 rounded-sm border border-[#00f2ff]/25 bg-black/70 text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff]">
                        Watch
                      </span>
                      <div className="flex items-center gap-3 text-white/35">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black">
                          <Heart size={14} className="text-[#00f2ff]" /> 12k
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black">
                          <MessageSquare size={14} className="text-[#00f2ff]" /> 940
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ANALYTICS (phone, stacked) */}
        <div className="mt-4 rounded-sm border border-white/10 bg-black/55 backdrop-blur-md p-4">
          <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45 flex items-center gap-2">
            <BarChart3 size={14} className="text-[#00f2ff]" /> Stewardship Analytics
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-sm border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-black uppercase tracking-[3px] text-white/45">Support</p>
              <p className="mt-2 text-xl font-black italic tracking-tighter text-white">{analytics.support}</p>
            </div>
            <div className="rounded-sm border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-black uppercase tracking-[3px] text-white/45">Active</p>
              <p className="mt-2 text-xl font-black italic tracking-tighter text-[#00f2ff]">{analytics.active}</p>
            </div>
          </div>
        </div>

        {/* CONTRIBUTION TIERS (routes) */}
        <div className="mt-3 rounded-sm border border-[#00f2ff]/14 bg-black/55 backdrop-blur-md p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45 flex items-center gap-2">
              <Zap size={14} className="text-[#00f2ff]" /> Contribution Engine
            </p>
            <button
              onClick={goTiers}
              className="text-[9px] font-black uppercase tracking-[3px] text-[#00f2ff] hover:text-white transition-colors"
            >
              View
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { label: "Entry Layer", icon: <Users size={12} />, val: "Free" },
              { label: "Mid Tier", icon: <Shield size={12} />, val: "$9.99" },
              { label: "High Tier", icon: <Heart size={12} />, val: "$24.99" },
            ].map((tier, i) => (
              <button
                key={i}
                onClick={goTiers}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/10 hover:border-[#00f2ff]/25 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#00f2ff]">{tier.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-[3px]">{tier.label}</span>
                </div>
                <span className="text-[10px] font-black italic">{tier.val}</span>
              </button>
            ))}
          </div>

          <button
            onClick={goTiers}
            className="mt-3 w-full rounded-sm border border-[#00f2ff]/18 bg-[#00f2ff]/5 p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full border border-[#00f2ff]/35 flex items-center justify-center">
              <DollarSign className="text-[#00f2ff]" size={18} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[3px]">Sanctuary Growth</p>
              <p className="text-[10px] text-white/45 font-bold italic">Open giving & support controls.</p>
            </div>
          </button>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 242, 255, 0.18);
            border-radius: 10px;
          }
        `}</style>
      </main>

      {/* OPTIONAL: Keep these modals in place (still functional), but now buttons also route */}
      {/* AI TOOLS DRAWER */}
      <AnimatePresence>
        {isToolsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex justify-end"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="w-full max-w-lg h-full bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 size={18} className="text-[#00f2ff]" />
                  <p className="text-[10px] font-black uppercase tracking-[6px] text-white/55">AI Studio Tools</p>
                </div>
                <button onClick={() => setIsToolsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                <div className="rounded-sm border border-[#00f2ff]/18 bg-black/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[5px] text-[#00f2ff]">Teleprompter</p>
                  <p className="mt-2 text-sm text-white/60 font-bold italic leading-relaxed">
                    Upload or paste notes, then run a clean scroll overlay while live.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => router.push("/teleprompter")}
                      className="px-4 py-3 rounded-sm bg-[#00f2ff] text-black text-[9px] font-black uppercase tracking-[5px]"
                    >
                      Open Teleprompter Page
                    </button>
                    <label className="px-4 py-3 rounded-sm border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[3px] text-white/55 cursor-pointer hover:border-[#00f2ff]/25 transition-all inline-flex items-center gap-2 justify-center">
                      <Upload size={14} className="text-[#00f2ff]" /> Upload Notes
                      <input
                        type="file"
                        accept=".txt,.md,.doc,.docx"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const text = await f.text();
                          setTeleprompterText(text);
                          setNotesInput(text);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-sm border border-[#00f2ff]/18 bg-black/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[5px] text-[#00f2ff]">Sermon Checker</p>
                  <p className="mt-2 text-sm text-white/60 font-bold italic leading-relaxed">
                    Compare notes vs transcript, get alignment signals, and spot drift.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => router.push("/sermon-checker")}
                      className="px-4 py-3 rounded-sm bg-[#00f2ff] text-black text-[9px] font-black uppercase tracking-[5px]"
                    >
                      Open Checker Page
                    </button>
                    <button
                      onClick={() => router.push("/ai-studio")}
                      className="px-4 py-3 rounded-sm border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[3px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
                    >
                      Full AI Studio
                    </button>
                  </div>
                </div>

                <div className="rounded-sm border border-white/10 bg-black/55 p-4">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-[#00f2ff]" />
                    <p className="text-[10px] font-black uppercase tracking-[5px] text-white/55">Streaming Features</p>
                  </div>
                  <ul className="mt-3 text-sm text-white/55 font-bold italic leading-relaxed space-y-2">
                    <li>• Watch page + chat + reactions</li>
                    <li>• VOD replay + highlights</li>
                    <li>• Subscriptions + tiers + gifting</li>
                    <li>• Moderation + safety controls</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* (Kept) Teleprompter modal + Checker modal can stay, but you now have real routes too */}
      <AnimatePresence>
        {teleprompterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-[430px] bg-zinc-950 border border-[#00f2ff]/18 rounded-sm overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#00f2ff]" />
                  <p className="text-[10px] font-black uppercase tracking-[6px] text-white/55">Teleprompter</p>
                </div>
                <button onClick={() => setTeleprompterOpen(false)} className="text-white/60 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="rounded-sm border border-white/10 bg-black/55 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[4px] text-white/45">Title</p>
                  <input
                    value={notesTitle}
                    onChange={(e) => setNotesTitle(e.target.value)}
                    className="mt-2 w-full bg-black/60 border border-white/10 px-4 py-3 outline-none text-sm font-bold text-white rounded-sm focus:border-[#00f2ff]/40"
                  />
                </div>

                <div className="rounded-sm border border-white/10 bg-black/55 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[4px] text-white/45">Controls</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => setTelePlaying((v) => !v)}
                      className={`flex-1 px-4 py-3 rounded-sm font-black uppercase tracking-[4px] text-[10px] border transition-all ${
                        telePlaying
                          ? "bg-red-500/10 border-red-500/40 text-red-300"
                          : "bg-[#00f2ff] border-[#00f2ff] text-black shadow-[0_0_18px_rgba(0,242,255,0.18)]"
                      }`}
                    >
                      {telePlaying ? "Pause" : "Run"}
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById("parable-teleprompter-scroll");
                        if (el) el.scrollTop = 0;
                      }}
                      className="px-4 py-3 rounded-sm border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[4px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-[9px] font-black uppercase tracking-[4px] text-white/45">Speed</p>
                    <input
                      type="range"
                      min={10}
                      max={70}
                      value={teleSpeed}
                      onChange={(e) => setTeleSpeed(Number(e.target.value))}
                      className="mt-2 w-full"
                    />
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[3px] text-white/35">{teleSpeed} px/sec</div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[9px] font-black uppercase tracking-[4px] text-white/45">Font</p>
                    <input
                      type="range"
                      min={14}
                      max={28}
                      value={teleFont}
                      onChange={(e) => setTeleFont(Number(e.target.value))}
                      className="mt-2 w-full"
                    />
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[3px] text-white/35">{teleFont}px</div>
                  </div>
                </div>

                <div className="rounded-sm border border-white/10 bg-black/55 p-4">
                  <textarea
                    value={teleprompterText}
                    onChange={(e) => setTeleprompterText(e.target.value)}
                    placeholder="Paste notes…"
                    rows={6}
                    className="w-full bg-black/60 border border-white/10 p-4 outline-none text-sm font-bold text-white/85 rounded-sm focus:border-[#00f2ff]/40 resize-none"
                  />
                </div>

                <div className="rounded-sm border border-[#00f2ff]/14 bg-black/55 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[6px] text-white/55">Live Scroll • {notesTitle}</p>
                    <div className="text-[9px] font-black uppercase tracking-[4px] text-white/35">{telePlaying ? "RUNNING" : "PAUSED"}</div>
                  </div>

                  <div
                    id="parable-teleprompter-scroll"
                    className="h-[34vh] overflow-y-auto p-5 leading-relaxed custom-scrollbar"
                    style={{ fontSize: teleFont }}
                  >
                    <div className="text-white/80 font-bold whitespace-pre-wrap">
                      {teleprompterText || "Paste notes to begin…"}
                    </div>
                    <div className="h-24" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNotesInput(teleprompterText);
                      setTeleprompterOpen(false);
                    }}
                    className="flex-1 px-5 py-3 rounded-sm bg-[#00f2ff] text-black text-[10px] font-black uppercase tracking-[5px]"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => router.push("/teleprompter")}
                    className="flex-1 px-5 py-3 rounded-sm border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[5px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
                  >
                    Full Page
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-[430px] bg-zinc-950 border border-[#00f2ff]/18 rounded-sm overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#00f2ff]" />
                  <p className="text-[10px] font-black uppercase tracking-[6px] text-white/55">Sermon Checker</p>
                </div>
                <button onClick={() => setCheckerOpen(false)} className="text-white/60 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="rounded-sm border border-white/10 bg-black/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45">Sermon Notes</p>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Paste notes…"
                    rows={6}
                    className="mt-3 w-full bg-black/60 border border-white/10 p-4 outline-none text-sm font-bold text-white/85 rounded-sm focus:border-[#00f2ff]/40 resize-none"
                  />
                </div>

                <div className="rounded-sm border border-white/10 bg-black/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45">Live Transcript</p>
                  <textarea
                    value={liveInput}
                    onChange={(e) => setLiveInput(e.target.value)}
                    placeholder="Paste transcript…"
                    rows={6}
                    className="mt-3 w-full bg-black/60 border border-white/10 p-4 outline-none text-sm font-bold text-white/85 rounded-sm focus:border-[#00f2ff]/40 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNotesInput("");
                      setLiveInput("");
                      setReport(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-sm border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[4px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
                  >
                    Reset
                  </button>
                  <button
                    onClick={runChecker}
                    disabled={checking}
                    className="flex-1 px-5 py-3 rounded-sm bg-[#00f2ff] text-black text-[10px] font-black uppercase tracking-[5px] disabled:opacity-60"
                  >
                    {checking ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Checking…
                      </span>
                    ) : (
                      "Run Check"
                    )}
                  </button>
                </div>

                <div className="rounded-sm border border-[#00f2ff]/14 bg-black/55 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[6px] text-white/55">Report</p>
                    <p className="text-[10px] font-black uppercase tracking-[6px] text-white/35">
                      {report ? `Score: ${report.score}` : "—"}
                    </p>
                  </div>

                  {!report ? (
                    <p className="mt-3 text-sm text-white/60 font-bold italic leading-relaxed">
                      Paste notes + transcript, then run check. (UI-only for now.)
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-sm border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[4px] text-[#00f2ff]">Signals</p>
                        <div className="mt-3 space-y-3">
                          {report.flags.map((f, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              {f.type === "ok" ? (
                                <CheckCircle2 size={18} className="text-[#00f2ff]" />
                              ) : (
                                <AlertTriangle size={18} className="text-yellow-300" />
                              )}
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[3px] text-white/70">{f.label}</p>
                                <p className="text-sm text-white/55 font-bold italic">{f.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-sm border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[4px] text-[#00f2ff]">Suggestions</p>
                        <ul className="mt-3 space-y-2">
                          {report.highlights.map((h, idx) => (
                            <li key={idx} className="text-sm text-white/60 font-bold italic leading-relaxed">
                              • {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push("/sermon-checker")}
                  className="w-full px-5 py-3 rounded-sm border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[5px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
                >
                  Open Full Checker Page
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
