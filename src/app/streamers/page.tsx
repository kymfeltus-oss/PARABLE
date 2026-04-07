"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Users,
  BookOpen,
  Zap,
  Play,
  Pause,
  MessageSquare,
  Heart,
  DollarSign,
  Settings,
  Loader2,
  Search,
  Sparkles,
  Wand2,
  FileText,
  Upload,
  Video,
  X,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Headphones,
  Cross,
  MonitorPlay,
  Sun,
  Church,
} from "lucide-react";
import HubBackground from "@/components/HubBackground";
import Header from "@/components/Header";
import { FlightDeckVision } from "@/components/command-center/FlightDeckVision";
import { LiveRolodexBrowse } from "@/components/streamers/LiveRolodexBrowse";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

const MODES = [
  { id: "broadcast", label: "Live Broadcast", icon: <Radio size={16} />, color: "#00f2ff" },
  { id: "study", label: "Message & Study", icon: <BookOpen size={16} />, color: "#00f2ff" },
  { id: "interaction", label: "Live Interaction", icon: <MessageSquare size={16} />, color: "#00f2ff" },
] as const;

const CATEGORY_WORLDS = [
  { id: "worship", title: "Worship", watching: "3.8K", subtitle: "Live sets", href: "/music-hub", icon: <Headphones size={20} strokeWidth={1.5} /> },
  { id: "prayer", title: "Prayer", watching: "2.1K", subtitle: "Rooms open", href: "/watch/lr2", icon: <Cross size={20} strokeWidth={1.5} /> },
  { id: "testimonies", title: "Stories", watching: "1.6K", subtitle: "Testimony", href: "/testify", icon: <Sparkles size={20} strokeWidth={1.5} /> },
  { id: "study", title: "Bible study", watching: "1.3K", subtitle: "Teaching", href: "/table", icon: <BookOpen size={20} strokeWidth={1.5} /> },
  { id: "revival", title: "Revival", watching: "4.2K", subtitle: "Night services", href: "/watch/lr4", icon: <Flame size={20} strokeWidth={1.5} /> },
  { id: "gaming", title: "Faith gaming", watching: "2.7K", subtitle: "Community", href: "/gaming", icon: <MonitorPlay size={20} strokeWidth={1.5} /> },
];

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
      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
        active
          ? "bg-[#00f2ff] text-black border-[#00f2ff]"
          : "bg-white/[0.04] text-white/55 border-white/10 hover:border-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function MiniStatus({ isLive }: { isLive: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/50">
      <span className={`h-2 w-2 rounded-full shrink-0 ${isLive ? "bg-red-500 animate-pulse" : "bg-[#00f2ff]/80"}`} />
      <span>{isLive ? "You’re live" : "Offline — ready when you are"}</span>
    </div>
  );
}

type SermonReport = {
  score: number;
  flags: { type: "ok" | "warn"; label: string; detail: string }[];
  highlights: string[];
};

export default function StreamerHub() {
  const router = useRouter();
  const { userProfile, avatarUrl, loading: authLoading } = useAuth();

  const [activeMode, setActiveMode] = useState<(typeof MODES)[number]["id"]>("broadcast");
  const [isLive, setIsLive] = useState(false);
  const [analytics] = useState({ support: "$2,450", active: "1.2k", praise: "1.28M", prayer: "32" });
  const displayName = userProfile?.username || userProfile?.full_name || "User";

  const [query, setQuery] = useState("");
  const [activeRow, setActiveRow] = useState<"ForYou" | "Trending" | "New" | "Following">("ForYou");

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [teleprompterOpen, setTeleprompterOpen] = useState(false);
  const [checkerOpen, setCheckerOpen] = useState(false);

  const [notesTitle, setNotesTitle] = useState("Sunday Message");
  const [teleprompterText, setTeleprompterText] = useState("");
  const [teleSpeed, setTeleSpeed] = useState(26);
  const [telePlaying, setTelePlaying] = useState(false);
  const [teleFont, setTeleFont] = useState(18);

  const [notesInput, setNotesInput] = useState("");
  const [liveInput, setLiveInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [report, setReport] = useState<SermonReport | null>(null);

  const STREAMS = useMemo(
    () => ({
      ForYou: [
        { id: "s1", title: "Kingdom Night Live", creator: "Alpha Creator", live: true, tag: "Worship", viewers: "2.4K" },
        { id: "s2", title: "Sermon Studio", creator: "Beta Artist", live: false, tag: "Study", viewers: "—" },
        { id: "s3", title: "Gaming for Ministry", creator: "Zion Streamer", live: true, tag: "Gaming", viewers: "980" },
        { id: "s4", title: "Prayer & Peace", creator: "Sanctuary Host", live: false, tag: "Prayer", viewers: "—" },
      ],
      Trending: [
        { id: "t1", title: "Revival Broadcast", creator: "Kai", live: true, tag: "Live", viewers: "4.1K" },
        { id: "t2", title: "Bible Breakdown", creator: "Nia", live: false, tag: "Study", viewers: "—" },
        { id: "t3", title: "Faith Talk", creator: "Eli", live: true, tag: "Talk", viewers: "1.7K" },
        { id: "t4", title: "Worship Set", creator: "Jules", live: false, tag: "Worship", viewers: "—" },
      ],
      New: [
        { id: "n1", title: "First Stream: Welcome", creator: "New Creator", live: false, tag: "Intro", viewers: "—" },
        { id: "n2", title: "Notes to Stage", creator: "Speaker Lab", live: true, tag: "Live", viewers: "430" },
        { id: "n3", title: "Creator Setup", creator: "Parable Academy", live: false, tag: "Guide", viewers: "—" },
        { id: "n4", title: "Late Night Prayer", creator: "Peace Room", live: true, tag: "Prayer", viewers: "620" },
      ],
      Following: [
        { id: "f1", title: "Community Pulse", creator: "Alpha Creator", live: true, tag: "Live", viewers: "2.4K" },
        { id: "f2", title: "Studio Session", creator: "Beta Artist", live: false, tag: "Behind", viewers: "—" },
        { id: "f3", title: "Preach Practice", creator: "Gamma Pastor", live: false, tag: "Practice", viewers: "—" },
        { id: "f4", title: "Scripture Sprint", creator: "Delta Teacher", live: true, tag: "Study", viewers: "1.1K" },
      ],
    }),
    []
  );

  const liveRail = useMemo(
    () => [
      { id: "lr1", title: "WORSHIP NIGHT LIVE", creator: "Sanctuary Main", viewers: "3.2K", tag: "WORSHIP" },
      { id: "lr2", title: "PRAYER ROOM", creator: "Prayer Watch", viewers: "982", tag: "PRAYER" },
      { id: "lr3", title: "TESTIMONY STREAM", creator: "Faith Voices", viewers: "438", tag: "TESTIFY" },
      { id: "lr4", title: "REVIVAL NIGHT", creator: "Upper Room", viewers: "1.8K", tag: "REVIVAL" },
      { id: "lr5", title: "KINGDOM BUSINESS", creator: "Market Grace", viewers: "611", tag: "KINGDOM" },
      { id: "lr6", title: "DELIVERANCE ROOM", creator: "Freedom House", viewers: "721", tag: "DELIVERANCE" },
    ],
    []
  );

  const roloItems = useMemo(
    () =>
      liveRail.map((r, idx) => ({
        id: r.id,
        title: r.title.replace(/\s+/g, " ").trim(),
        creator: r.creator,
        viewers: r.viewers,
        tag: r.tag,
        hot: idx === 0 || idx === 3,
      })),
    [liveRail]
  );

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

  const liveCount = useMemo(() => {
    return Object.values(STREAMS).flat().filter((stream) => stream.live).length;
  }, [STREAMS]);

  const activeModeLabel = useMemo(() => {
    return MODES.find((mode) => mode.id === activeMode)?.label || "Live Broadcast";
  }, [activeMode]);

  const goSettings = () => router.push("/settings");
  const goAiStudio = () => router.push("/ai-studio");
  const goTeleprompter = () => router.push("/teleprompter");
  const goSermonChecker = () => router.push("/sermon-checker");
  const goGoLive = () => router.push("/live-studio");
  const goWatch = (id: string) => router.push(`/watch/${id}`);
  const goTiers = () => router.push("/contribution-tiers");
  const goCommunity = () => router.push("/community");
  const goTestify = () => router.push("/testify");
  const goBrowse = () => router.push("/browse");

  const goBroadcastMode = (modeId: (typeof MODES)[number]["id"]) => {
    setActiveMode(modeId);
    if (modeId === "broadcast") router.push("/live-studio");
    if (modeId === "study") router.push("/table");
    if (modeId === "interaction") router.push("/testify");
  };

  const toggleLive = () => {
    if (isLive) {
      setIsLive(false);
      router.push("/live-studio");
    } else {
      goGoLive();
    }
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
    <div className="relative min-h-screen w-full bg-[#08080a] text-white selection:bg-[#00f2ff]/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
      </div>

      <Header />

      <main className="relative z-10 w-full min-w-0 pb-parable-bottom pt-parable-header">
        <div className="border-b border-white/[0.06] bg-black/30 backdrop-blur-md">
          <div className="mx-auto flex w-full min-w-0 max-w-full flex-col gap-3 px-4 py-4">
            <p className="min-w-0 break-words text-sm leading-snug text-white/70">
              <span className="font-semibold tabular-nums text-[#00f2ff]">{liveCount}</span> live channels ·{" "}
              <span className="text-white/45">Rolodex first, or AI Sanctuary for Sunday streams.</span>
            </p>
            <div className="flex min-w-0 flex-wrap gap-2">
              {liveRail.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goWatch(item.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:border-[#00f2ff]/35 hover:bg-white/[0.07] transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-[#00f2ff] font-medium">{item.tag}</span>
                  <span className="text-white/50 hidden sm:inline">{item.viewers}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={goBrowse}
                className="inline-flex items-center gap-2 rounded-full border border-[#00f2ff]/25 bg-[#00f2ff]/10 px-3 py-1.5 text-xs font-semibold text-[#00f2ff] hover:bg-[#00f2ff]/15 transition-colors"
              >
                Discover more
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full min-w-0 max-w-full px-4 py-8">
          <div className="grid grid-cols-1 gap-8">
            <aside className="space-y-5">
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full border border-white/15 overflow-hidden bg-zinc-900 flex items-center justify-center">
                        {authLoading ? (
                          <Loader2 className="animate-spin text-[#00f2ff]" size={18} />
                        ) : avatarUrl && avatarUrl !== "/logo.svg" ? (
                          <img
                            src={avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={fallbackAvatarOnError}
                          />
                        ) : (
                          <Users className="text-white/25" size={22} />
                        )}
                      </div>
                      {isLive ? (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-950" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {authLoading ? "…" : displayName}
                      </p>
                      <p className="text-xs text-white/45 mt-0.5">Your creator hub</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={goSettings}
                    className="shrink-0 p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
                    aria-label="Settings"
                  >
                    <Settings size={16} />
                  </button>
                </div>
                <div className="mt-4">
                  <MiniStatus isLive={isLive} />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={goAiStudio}
                    className="w-full py-2.5 rounded-xl bg-[#00f2ff] text-black text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    AI Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsToolsOpen(true)}
                    className="w-full py-2.5 rounded-xl border border-white/12 bg-white/[0.04] text-sm text-white/80 hover:bg-white/[0.07] transition-colors"
                  >
                    Tools
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={goCommunity}
                      className="py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:text-white transition-colors"
                    >
                      Community
                    </button>
                    <button
                      type="button"
                      onClick={goTestify}
                      className="py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:text-white transition-colors"
                    >
                      Testify
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-5">
                <p className="text-xs font-medium text-white/45">Network pulse</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <button
                    type="button"
                    onClick={goTestify}
                    className="rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] py-2 transition-colors"
                  >
                    <p className="text-lg font-semibold text-[#00f2ff] tabular-nums leading-tight">{analytics.praise}</p>
                    <p className="text-[10px] text-white/40 mt-1">Praise</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/fellowship")}
                    className="rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] py-2 transition-colors"
                  >
                    <p className="text-lg font-semibold text-white tabular-nums leading-tight">{analytics.prayer}</p>
                    <p className="text-[10px] text-white/40 mt-1">Prayer</p>
                  </button>
                  <button
                    type="button"
                    onClick={goTiers}
                    className="rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] py-2 transition-colors"
                  >
                    <p className="text-lg font-semibold text-white tabular-nums leading-tight">{analytics.support}</p>
                    <p className="text-[10px] text-white/40 mt-1">Support</p>
                  </button>
                </div>
              </div>
            </aside>

            <section className="min-w-0 space-y-8">
              <LiveRolodexBrowse items={roloItems} onWatch={goWatch} />

              <Link
                href="/ai-sanctuary"
                className="group block rounded-2xl border border-[#ff6b2c]/30 bg-gradient-to-r from-[#ff6b2c]/[0.12] via-black/50 to-[#00f2ff]/[0.08] p-6 backdrop-blur-md transition-all hover:border-[#ff6b2c]/50 hover:shadow-[0_0_40px_rgba(255,107,44,0.12)]"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#ff6b2c]/35 bg-black/40">
                    <Sun className="text-[#ffb89a]" size={32} strokeWidth={1.25} />
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffb89a]/90">
                      AI Sanctuary
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white tracking-tight whitespace-normal">
                      Sunday morning hub · browse ministries on stream
                    </h2>
                    <p className="mt-2 text-sm text-white/50 leading-relaxed">
                      Pick a church or ministry, see service times, and jump into the right live room. Pair with Director
                      Mode when you want Word vs Worship controls.
                    </p>
                  </div>
                  <div className="flex w-full min-w-0 flex-col gap-2">
                    <span className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#ff6b2c] px-4 py-2.5 text-sm font-semibold text-black">
                      <Church size={16} className="shrink-0" />
                      Browse ministries
                    </span>
                    <span className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/70 transition-colors group-hover:text-white">
                      Open
                      <Sparkles size={14} className="shrink-0 text-[#00f2ff]" />
                    </span>
                  </div>
                </div>
              </Link>

              <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md overflow-hidden">
                <div className="grid grid-cols-1 gap-0">
                  <div className="flex flex-col justify-center p-6">
                    <p className="text-xs font-medium text-[#00f2ff]/90">Featured spotlight</p>
                    <h1 className="mt-2 text-2xl font-semibold text-white tracking-tight leading-snug whitespace-normal">
                      Worship revival night
                    </h1>
                    <p className="mt-3 text-sm text-white/55 leading-relaxed max-w-md">
                      One clear place to watch what’s live or head to the studio when you’re ready to broadcast.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => goWatch("lr1")}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#00f2ff] text-black px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        <Play size={16} fill="currentColor" />
                        Watch live
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/sunday")}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#ff6b2c]/50 bg-[#ff6b2c]/10 text-[#ffb89a] px-5 py-2.5 text-sm font-semibold hover:bg-[#ff6b2c]/15 transition-colors"
                      >
                        Director Mode
                      </button>
                      <button
                        type="button"
                        onClick={goGoLive}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/[0.07] transition-colors"
                      >
                        Open studio
                      </button>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/45">
                      <span>
                        <span className="text-white font-medium tabular-nums">{liveCount}</span> live
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span>
                        <span className="text-white font-medium tabular-nums">3.8K</span> watching featured
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="text-white/35">{activeModeLabel}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => goWatch("lr1")}
                    className="relative aspect-video min-h-[200px] w-full border-t border-white/[0.06] bg-zinc-950 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2ff]/50"
                    aria-label="Watch featured live stream"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff]/10 via-transparent to-purple-500/10 group-hover:from-[#00f2ff]/18 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="text-[#00f2ff]/25 group-hover:text-[#00f2ff]/40 transition-colors" size={64} strokeWidth={1} />
                    </div>
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/70 border border-white/10 px-3 py-1.5 text-xs">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-300 font-medium">Live</span>
                    </div>
                    <div className="absolute bottom-4 right-4 rounded-lg bg-black/70 border border-[#00f2ff]/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#00f2ff] opacity-0 group-hover:opacity-100 transition-opacity">
                      Tap to watch
                    </div>
                  </button>
                </div>
              </div>

              <FlightDeckVision />

              <div className="rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4">
                  <label className="flex min-w-0 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5">
                    <Search size={18} className="text-white/35 shrink-0" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search streams or creators"
                      className="bg-transparent w-full min-w-0 outline-none text-sm text-white placeholder:text-white/30"
                    />
                  </label>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    <Pill active={activeRow === "ForYou"} onClick={() => setActiveRow("ForYou")}>
                      For you
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
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-white/45 mb-3">Browse by mood</p>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORY_WORLDS.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => router.push(cat.href)}
                      className="rounded-xl border border-white/[0.08] bg-black/35 p-4 text-left hover:border-[#00f2ff]/25 hover:bg-black/50 transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#00f2ff]/90 opacity-90 group-hover:opacity-100">{cat.icon}</span>
                        <span className="text-xs text-white/40 tabular-nums">{cat.watching}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-white">{cat.title}</p>
                      <p className="mt-1 text-xs text-white/40">{cat.subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div id="channel-grid" className="rounded-2xl border border-white/[0.08] bg-black/35 overflow-hidden scroll-mt-28">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles size={16} className="text-[#00f2ff] shrink-0" />
                    <h2 className="text-sm font-semibold text-white truncate">
                      {activeRow === "ForYou"
                        ? "For you"
                        : activeRow === "Trending"
                        ? "Trending"
                        : activeRow === "New"
                        ? "New & rising"
                        : "Following"}
                    </h2>
                  </div>
                  <span className="text-xs text-white/40 tabular-nums shrink-0">{filteredTiles.length} channels</span>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4">
                    {filteredTiles.map((s) => (
                      <motion.button
                        key={s.id}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => goWatch(s.id)}
                        className="rounded-xl border border-white/[0.08] bg-black/40 text-left overflow-hidden hover:border-white/15 transition-colors"
                      >
                        <div className="aspect-video bg-zinc-950 flex items-center justify-center border-b border-white/[0.06] relative">
                          <Zap className="text-[#00f2ff]/30" size={36} strokeWidth={1.25} />
                          {s.live ? (
                            <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wide text-red-300 bg-black/60 border border-red-500/25 px-2 py-0.5 rounded-md">
                              Live · {s.viewers}
                            </span>
                          ) : (
                            <span className="absolute top-3 left-3 text-[10px] font-medium text-white/45 bg-black/50 px-2 py-0.5 rounded-md">
                              Replay
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-[#00f2ff]/90">{s.tag}</p>
                              <p className="mt-1 font-semibold text-white leading-snug">{s.title}</p>
                              <p className="mt-1 text-xs text-white/45">{s.creator}</p>
                            </div>
                            <span className="shrink-0 text-xs font-medium text-[#00f2ff]">Watch</span>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-xs text-white/35">
                            <span className="inline-flex items-center gap-1">
                              <Heart size={14} /> 12K
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MessageSquare size={14} /> 940
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-white/50">Broadcast mode</p>
                  <button
                    type="button"
                    onClick={toggleLive}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      isLive
                        ? "bg-red-500/15 border-red-500/35 text-red-300"
                        : "bg-[#00f2ff] border-[#00f2ff] text-black"
                    }`}
                  >
                    {isLive ? (
                      <span className="inline-flex items-center gap-2">
                        <Pause size={14} /> End
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Play size={14} /> Go live
                      </span>
                    )}
                  </button>
                </div>
                <div className="mt-4 space-y-1.5">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => goBroadcastMode(m.id)}
                      className={`w-full px-3 py-3 rounded-xl text-left text-sm transition-colors flex items-center gap-2 ${
                        activeMode === m.id
                          ? "bg-[#00f2ff]/15 text-[#00f2ff] border border-[#00f2ff]/25"
                          : "text-white/55 hover:text-white hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-md p-5">
                <p className="text-xs font-medium text-white/50">Creator shortcuts</p>
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={goTeleprompter}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-left hover:border-[#00f2ff]/25 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#00f2ff]" />
                      <span className="text-sm font-medium text-white">Teleprompter</span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">Scroll notes on stream.</p>
                  </button>
                  <button
                    type="button"
                    onClick={goSermonChecker}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-left hover:border-[#00f2ff]/25 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Wand2 size={16} className="text-[#00f2ff]" />
                      <span className="text-sm font-medium text-white">Sermon checker</span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">Notes vs transcript.</p>
                  </button>
                  <button
                    type="button"
                    onClick={goTiers}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-left hover:border-[#00f2ff]/25 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[#00f2ff]" />
                      <span className="text-sm font-medium text-white">Giving & tiers</span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">Support controls.</p>
                  </button>
                </div>
              </div>
            </aside>
          </div>
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
              className="flex h-full w-full max-w-full min-w-0 flex-col border-l border-white/10 bg-zinc-950 shadow-2xl"
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
                <div className="rounded-[1.5rem] border border-[#00f2ff]/18 bg-black/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[5px] text-[#00f2ff]">Teleprompter</p>
                  <p className="mt-2 text-sm text-white/60 font-bold italic leading-relaxed">
                    Upload or paste notes, then run a clean scroll overlay while live.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => router.push("/teleprompter")}
                      className="px-4 py-3 rounded-full bg-[#00f2ff] text-black text-[9px] font-black uppercase tracking-[5px]"
                    >
                      Open Teleprompter Page
                    </button>
                    <label className="px-4 py-3 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[3px] text-white/55 cursor-pointer hover:border-[#00f2ff]/25 transition-all inline-flex items-center gap-2 justify-center">
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

                <div className="rounded-[1.5rem] border border-[#00f2ff]/18 bg-black/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[5px] text-[#00f2ff]">Sermon Checker</p>
                  <p className="mt-2 text-sm text-white/60 font-bold italic leading-relaxed">
                    Compare notes vs transcript, get alignment signals, and spot drift.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => router.push("/sermon-checker")}
                      className="px-4 py-3 rounded-full bg-[#00f2ff] text-black text-[9px] font-black uppercase tracking-[5px]"
                    >
                      Open Checker Page
                    </button>
                    <button
                      onClick={() => router.push("/ai-studio")}
                      className="px-4 py-3 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[3px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
                    >
                      Full AI Studio
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/55 p-4">
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
              className="w-full max-w-[430px] bg-zinc-950 border border-[#00f2ff]/18 rounded-[1.75rem] overflow-hidden shadow-2xl"
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
                <div className="rounded-[1.25rem] border border-white/10 bg-black/55 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[4px] text-white/45">Title</p>
                  <input
                    value={notesTitle}
                    onChange={(e) => setNotesTitle(e.target.value)}
                    className="mt-2 w-full bg-black/60 border border-white/10 px-4 py-3 outline-none text-sm font-bold text-white rounded-[1rem] focus:border-[#00f2ff]/40"
                  />
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-black/55 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[4px] text-white/45">Controls</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => setTelePlaying((v) => !v)}
                      className={`flex-1 px-4 py-3 rounded-full font-black uppercase tracking-[4px] text-[10px] border transition-all ${
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
                      className="px-4 py-3 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[4px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
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

                <div className="rounded-[1.25rem] border border-white/10 bg-black/55 p-4">
                  <textarea
                    value={teleprompterText}
                    onChange={(e) => setTeleprompterText(e.target.value)}
                    placeholder="Paste notes…"
                    rows={6}
                    className="w-full bg-black/60 border border-white/10 p-4 outline-none text-sm font-bold text-white/85 rounded-[1rem] focus:border-[#00f2ff]/40 resize-none"
                  />
                </div>

                <div className="rounded-[1.25rem] border border-[#00f2ff]/14 bg-black/55 overflow-hidden">
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
                    className="flex-1 px-5 py-3 rounded-full bg-[#00f2ff] text-black text-[10px] font-black uppercase tracking-[5px]"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => router.push("/teleprompter")}
                    className="flex-1 px-5 py-3 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[5px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
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
              className="w-full max-w-[430px] bg-zinc-950 border border-[#00f2ff]/18 rounded-[1.75rem] overflow-hidden shadow-2xl"
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
                <div className="rounded-[1.25rem] border border-white/10 bg-black/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45">Sermon Notes</p>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Paste notes…"
                    rows={6}
                    className="mt-3 w-full bg-black/60 border border-white/10 p-4 outline-none text-sm font-bold text-white/85 rounded-[1rem] focus:border-[#00f2ff]/40 resize-none"
                  />
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-black/55 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[6px] text-white/45">Live Transcript</p>
                  <textarea
                    value={liveInput}
                    onChange={(e) => setLiveInput(e.target.value)}
                    placeholder="Paste transcript…"
                    rows={6}
                    className="mt-3 w-full bg-black/60 border border-white/10 p-4 outline-none text-sm font-bold text-white/85 rounded-[1rem] focus:border-[#00f2ff]/40 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNotesInput("");
                      setLiveInput("");
                      setReport(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[4px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
                  >
                    Reset
                  </button>
                  <button
                    onClick={runChecker}
                    disabled={checking}
                    className="flex-1 px-5 py-3 rounded-full bg-[#00f2ff] text-black text-[10px] font-black uppercase tracking-[5px] disabled:opacity-60"
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

                <div className="rounded-[1.25rem] border border-[#00f2ff]/14 bg-black/55 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[6px] text-white/55">Report</p>
                    <p className="text-[10px] font-black uppercase tracking-[6px] text-white/35">
                      {report ? `Score: ${report.score}` : "—"}
                    </p>
                  </div>

                  {!report ? (
                    <p className="mt-3 text-sm text-white/60 font-bold italic leading-relaxed">
                      Paste notes + transcript, then run check. (UI only for now.)
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
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

                      <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
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
                  className="w-full px-5 py-3 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[5px] text-white/55 hover:border-[#00f2ff]/25 transition-all"
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