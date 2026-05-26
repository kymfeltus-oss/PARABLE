"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Users,
  HeartHandshake,
  Cross,
  Flame,
  BookOpen,
  Sparkles,
  Mic2,
  Globe,
  Shield,
  Clock3,
  Plus,
  Search,
  ArrowRight,
} from "lucide-react";

type RoomCategory =
  | "All"
  | "Prayer Rooms"
  | "Bible Study"
  | "Testimony Circles"
  | "Women’s Fellowship"
  | "Men’s Fellowship"
  | "Young Adults"
  | "Marriage & Family"
  | "Creator Fellowship"
  | "Late Night Prayer";

type Room = {
  id: string;
  name: string;
  category: Exclude<RoomCategory, "All">;
  description: string;
  people: number;
  pulse: number;
  live: boolean;
  tag: string;
};

const CATEGORIES: RoomCategory[] = [
  "All",
  "Prayer Rooms",
  "Bible Study",
  "Testimony Circles",
  "Women’s Fellowship",
  "Men’s Fellowship",
  "Young Adults",
  "Marriage & Family",
  "Creator Fellowship",
  "Late Night Prayer",
];

function frac(n: number) {
  return n - Math.floor(n);
}

function prand(seed: number) {
  return frac(Math.sin(seed * 9999.123) * 10000);
}

function SparklesBackground() {
  const sparkles = useMemo(() => {
    return Array.from({ length: 56 }).map((_, i) => {
      const r1 = prand(i + 1);
      const r2 = prand(i + 101);
      const r3 = prand(i + 1001);
      const r4 = prand(i + 5001);

      return {
        id: i,
        left: `${(r1 * 100).toFixed(4)}%`,
        top: `${(r2 * 100).toFixed(4)}%`,
        dur: `${(4.2 + r3 * 3.2).toFixed(4)}s`,
        delay: `${(r4 * 1.8).toFixed(4)}s`,
        size: 1 + (i % 3),
        opacity: 0.22 + (i % 4) * 0.08,
      };
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-[#00f2fe] shadow-[0_0_16px_rgba(0,242,254,0.70)]"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `fellowshipSpark ${s.dur} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes fellowshipSpark {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: translate3d(0, -18px, 0) scale(1.08);
          }
          100% {
            transform: translate3d(0, -44px, 0) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes tickerSlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes roomGlow {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(0, 242, 254, 0);
          }
          50% {
            box-shadow: 0 0 46px rgba(0, 242, 254, 0.1);
          }
        }

        @keyframes pulseDot {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[3px] transition-all",
        active
          ? "border-[#00f2fe]/35 bg-[#00f2fe]/16 text-[#00f2fe] shadow-[0_0_24px_rgba(0,242,254,0.14)]"
          : "border-white/10 bg-white/5 text-white/55 hover:border-[#00f2fe]/20 hover:text-white/80",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <span className="text-white/40">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-[3px] text-white/35">
          Live Signal
        </span>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[4px] text-white/45">
        {label}
      </p>
      <p className="mt-1 text-[20px] font-black text-white">{value}</p>
    </div>
  );
}

function CategoryWorld({
  title,
  subtitle,
  value,
  icon,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,242,254,0.10)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[#00f2fe]">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-[3px] text-white/35">
          {value}
        </span>
      </div>
      <h3 className="mt-5 text-[18px] font-black text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/55 leading-relaxed">{subtitle}</p>
      <button className="mt-5 rounded-[18px] border border-[#00f2fe]/25 bg-[#00f2fe]/12 px-4 py-3 text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]">
        Explore
      </button>
    </motion.div>
  );
}

function RoomCard({ room }: { room: Room }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl"
      style={{ animation: room.live ? "roomGlow 5s ease-in-out infinite" : undefined }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.20] bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,254,0.18),transparent_52%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.08),transparent_60%)]" />

      <div className="relative p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2">
            <span
              className={`h-2 w-2 rounded-full ${room.live ? "bg-red-500" : "bg-[#00f2fe]"}`}
              style={{ animation: room.live ? "pulseDot 1.15s ease-in-out infinite" : undefined }}
            />
            <span className="text-[10px] font-black uppercase tracking-[4px] text-white/65">
              {room.tag}
            </span>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]">
              {room.live ? `LIVE • ${room.people} inside` : `${room.people} members`}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[3px] text-white/35">
              Prayer Pulse {room.pulse}
            </p>
          </div>
        </div>

        <h3 className="mt-5 text-[20px] font-black tracking-tight text-white">
          {room.name}
        </h3>
        <p className="mt-2 text-sm text-white/60 leading-relaxed">
          {room.description}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="rounded-[18px] bg-[#00f2fe] px-4 py-3 text-[10px] font-black uppercase tracking-[4px] text-black shadow-[0_0_28px_rgba(0,242,254,0.16)]">
            Enter Room
          </button>
          <button className="rounded-[18px] border border-white/10 bg-black/45 px-4 py-3 text-[10px] font-black uppercase tracking-[4px] text-white/70 hover:bg-white/10 transition">
            Follow Room
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FellowshipPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<RoomCategory>("All");

  const liveRail = useMemo(
    () => [
      { id: "lr-1", title: "Global Prayer Circle", people: 128 },
      { id: "lr-2", title: "Women’s Fellowship", people: 47 },
      { id: "lr-3", title: "Young Adults After Hours", people: 63 },
      { id: "lr-4", title: "Bible Talk Live", people: 29 },
      { id: "lr-5", title: "Marriage Circle", people: 34 },
      { id: "lr-6", title: "Late Night Prayer", people: 56 },
    ],
    []
  );

  const rooms = useMemo<Room[]>(
    () => [
      {
        id: "r1",
        name: "Global Prayer Circle",
        category: "Prayer Rooms",
        description: "Open prayer, comfort, and covering for anyone who needs agreement right now.",
        people: 128,
        pulse: 86,
        live: true,
        tag: "Featured",
      },
      {
        id: "r2",
        name: "Late Night Prayer",
        category: "Late Night Prayer",
        description: "For believers who gather after hours for peace, prayer, and encouragement.",
        people: 56,
        pulse: 34,
        live: true,
        tag: "After Hours",
      },
      {
        id: "r3",
        name: "Bible Study Lounge",
        category: "Bible Study",
        description: "Scripture conversations, reflections, and room for honest questions.",
        people: 41,
        pulse: 18,
        live: true,
        tag: "Study",
      },
      {
        id: "r4",
        name: "Testimony Circle",
        category: "Testimony Circles",
        description: "Share what God has done and let your witness become somebody else’s hope.",
        people: 73,
        pulse: 52,
        live: true,
        tag: "Testify",
      },
      {
        id: "r5",
        name: "Women’s Fellowship",
        category: "Women’s Fellowship",
        description: "Encouragement, wisdom, covering, and real conversation for women in faith.",
        people: 47,
        pulse: 22,
        live: true,
        tag: "Community",
      },
      {
        id: "r6",
        name: "Men’s Fellowship",
        category: "Men’s Fellowship",
        description: "Brotherhood, accountability, prayer, and kingdom conversation.",
        people: 33,
        pulse: 14,
        live: true,
        tag: "Brotherhood",
      },
      {
        id: "r7",
        name: "Young Adults Room",
        category: "Young Adults",
        description: "Faith, purpose, identity, and life conversations for the next generation.",
        people: 63,
        pulse: 26,
        live: true,
        tag: "Next Gen",
      },
      {
        id: "r8",
        name: "Marriage Circle",
        category: "Marriage & Family",
        description: "Prayer, support, and wisdom for couples and families building together.",
        people: 34,
        pulse: 17,
        live: true,
        tag: "Family",
      },
      {
        id: "r9",
        name: "Creator Fellowship",
        category: "Creator Fellowship",
        description: "A room for streamers, artists, and digital builders creating in purpose.",
        people: 21,
        pulse: 10,
        live: true,
        tag: "Creators",
      },
      {
        id: "r10",
        name: "Mothers in Prayer",
        category: "Prayer Rooms",
        description: "Focused agreement and encouragement for mothers covering their homes.",
        people: 19,
        pulse: 11,
        live: false,
        tag: "Prayer",
      },
      {
        id: "r11",
        name: "Sunday Recap Room",
        category: "Bible Study",
        description: "Continue the sermon conversation and unpack what was preached this week.",
        people: 25,
        pulse: 9,
        live: false,
        tag: "Recap",
      },
      {
        id: "r12",
        name: "Healing & Faith Room",
        category: "Prayer Rooms",
        description: "A room centered on healing, peace, faith building, and support.",
        people: 38,
        pulse: 27,
        live: true,
        tag: "Healing",
      },
    ],
    []
  );

  const filteredRooms = useMemo(() => {
    let list = rooms;

    if (category !== "All") {
      list = list.filter((room) => room.category === category);
    }

    if (!query.trim()) return list;

    const q = query.toLowerCase();
    return list.filter(
      (room) =>
        room.name.toLowerCase().includes(q) ||
        room.description.toLowerCase().includes(q) ||
        room.category.toLowerCase().includes(q) ||
        room.tag.toLowerCase().includes(q)
    );
  }, [rooms, category, query]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-[-30%] opacity-[0.20] blur-[90px] animate-[fellowshipOcean_18s_ease-in-out_infinite] bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,254,0.34),transparent_55%),radial-gradient(circle_at_75%_68%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(circle_at_45%_82%,rgba(0,242,254,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:84px_84px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.72)_58%,rgba(0,0,0,0.96)_100%)]" />
      </div>

      <SparklesBackground />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-28 pt-10">
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
          <div
            className="flex min-w-max gap-4 px-4 py-3"
            style={{ animation: "tickerSlide 24s linear infinite" }}
          >
            {[...liveRail, ...liveRail].map((room, idx) => (
              <button
                key={`${room.id}-${idx}`}
                className="inline-flex items-center gap-3 rounded-full border border-[#00f2fe]/18 bg-black/45 px-4 py-3"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[4px] text-white/70">
                  {room.title}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[3px] text-[#00f2fe]">
                  {room.people} inside
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <div className="">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_0_140px_rgba(0,242,254,0.12)]">
              <div className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,254,0.18),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.08),transparent_60%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#00f2fe] shadow-[0_0_18px_rgba(0,242,254,0.9)]" />
                  <span className="text-[11px] font-black uppercase tracking-[4px] text-white/70">
                    Fellowship
                  </span>
                </div>

                <h1 className="mt-5 text-[38px] sm:text-[52px] font-black leading-[1.02] tracking-tight">
                  The{" "}
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 blur-2xl opacity-60 bg-[radial-gradient(circle_at_30%_40%,rgba(0,242,254,0.42),transparent_60%)]" />
                    <span className="relative text-[#00f2fe] drop-shadow-[0_0_24px_rgba(0,242,254,0.55)]">
                      Living Lobby
                    </span>
                  </span>{" "}
                  of Community
                </h1>

                <p className="mt-4 max-w-[760px] text-[15px] leading-relaxed text-white/65">
                  Fellowship is the social heart of Parable. Enter rooms, join prayer,
                  build community, share encouragement, and gather with believers in
                  spaces that feel alive.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="rounded-[22px] bg-[#00f2fe] px-6 py-4 text-[11px] font-black uppercase tracking-[4px] text-black shadow-[0_0_30px_rgba(0,242,254,0.18)]">
                    Enter Fellowship
                  </button>
                  <button className="rounded-[22px] border border-white/10 bg-black/50 px-6 py-4 text-[11px] font-black uppercase tracking-[4px] text-white/70 hover:bg-white/10 transition">
                    Start a Room
                  </button>
                  <button className="rounded-[22px] border border-white/10 bg-black/50 px-6 py-4 text-[11px] font-black uppercase tracking-[4px] text-white/70 hover:bg-white/10 transition">
                    Ask for Prayer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Active Rooms" value="24" icon={<MessageCircle size={18} />} />
            <StatCard label="In Fellowship" value="318" icon={<Users size={18} />} />
            <StatCard label="Prayer Circles" value="9" icon={<HeartHandshake size={18} />} />
            <StatCard label="Testimonies Today" value="42" icon={<Sparkles size={18} />} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <CategoryWorld
            title="Prayer Rooms"
            subtitle="Open rooms for covering, agreement, healing, and peace."
            value="9 active"
            icon={<Cross size={18} />}
          />
          <CategoryWorld
            title="Bible Study"
            subtitle="Scripture centered rooms for reflection and discussion."
            value="6 study circles"
            icon={<BookOpen size={18} />}
          />
          <CategoryWorld
            title="Testimony Circles"
            subtitle="Witness walls where people share breakthrough and hope."
            value="42 today"
            icon={<Sparkles size={18} />}
          />
          <CategoryWorld
            title="Late Night Prayer"
            subtitle="After hours gathering spaces for prayer and encouragement."
            value="always open"
            icon={<Clock3 size={18} />}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="">
            <div className="rounded-[28px] border border-white/10 bg-black/55 px-6 py-4 backdrop-blur-2xl shadow-[0_0_110px_rgba(0,242,254,0.10)]">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-white/35" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search rooms, prayer circles, study spaces, fellowship groups…"
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-white/30"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-start">
            {CATEGORIES.map((x) => (
              <Pill key={x} active={category === x} onClick={() => setCategory(x)}>
                {x}
              </Pill>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <div className="">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_0_120px_rgba(0,242,254,0.10)]">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-[#00f2fe]" />
                <p className="text-[10px] font-black uppercase tracking-[4px] text-white/50">
                  Featured Fellowship
                </p>
              </div>

              <h3 className="mt-5 text-[24px] font-black text-white">
                Global Prayer Circle
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Prayer, peace, covering, and encouragement happening live right now.
              </p>

              <div className="mt-5 rounded-[22px] border border-[#00f2fe]/16 bg-black/45 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-red-400">
                    LIVE • 128 gathered
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]">
                    Pulse 86
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {["Amen 🙏", "Praying with you 💙", "Glory ✨"].map((msg) => (
                    <div
                      key={msg}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[3px] text-white/65"
                    >
                      {msg}
                    </div>
                  ))}
                </div>
              </div>

              <button className="mt-5 w-full rounded-[22px] bg-[#00f2fe] px-6 py-4 text-[11px] font-black uppercase tracking-[4px] text-black shadow-[0_0_30px_rgba(0,242,254,0.18)]">
                Enter Featured Room
              </button>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_0_120px_rgba(0,242,254,0.10)]">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-[#00f2fe]" />
                <p className="text-[10px] font-black uppercase tracking-[4px] text-white/50">
                  Quick Actions
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { label: "Start a Room", icon: <MessageCircle size={14} /> },
                  { label: "Join Prayer", icon: <HeartHandshake size={14} /> },
                  { label: "Drop Encouragement", icon: <Sparkles size={14} /> },
                  { label: "Invite Friends", icon: <Users size={14} /> },
                  { label: "Open Voice Room", icon: <Mic2 size={14} /> },
                  { label: "Regional Fellowship", icon: <Globe size={14} /> },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full rounded-[20px] border border-white/10 bg-black/45 px-4 py-4 text-left text-[11px] font-black uppercase tracking-[3px] text-white/70 hover:bg-white/10 transition"
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="text-[#00f2fe]">{item.icon}</span>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_0_120px_rgba(0,242,254,0.10)]">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[#00f2fe]" />
                <p className="text-[10px] font-black uppercase tracking-[4px] text-white/50">
                  Circle Signals
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {[
                  "86 people praying right now",
                  "42 testimonies shared today",
                  "9 prayer circles open",
                  "318 gathered across fellowship",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[18px] border border-white/10 bg-black/45 px-4 py-4 text-sm text-white/65"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <button className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[4px] text-[#00f2fe]">
                View all signals <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fellowshipOcean {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(2%, -2%, 0) rotate(6deg);
          }
        }
      `}</style>
    </div>
  );
}