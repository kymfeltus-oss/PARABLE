"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Copy, Gamepad2, Loader2, Mic, Shield, Users, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { fetchLiveKitTokenFromEdge } from "@/lib/livekit-supabase-edge";
import {
  GamersHubVoiceShell,
  GamingVcAvatarStack,
  GamingVcConnecting,
  GamingVcNeedSignIn,
  GamingVcTransportBar,
} from "@/components/gaming/GamersHubVoiceChrome";

const MINECRAFT_IP = "srv7504.godlike.club:26060";
const CYAN = "#00FFFF";
const PARABLE_CYAN = "#00f2ff";
const GAMING_LOBBY_ROOM = "Gaming-Lobby";

type PortalId = "minecraft" | "roblox" | "bible";

type HubProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_live: boolean | null;
  playing_minecraft?: boolean | null;
  in_gaming_vc?: boolean | null;
};

const TEXT_CHANNELS: { id: string; label: string }[] = [
  { id: "minecraft-portal", label: "minecraft-portal" },
  { id: "roblox-zone", label: "roblox-zone" },
  { id: "gamer-chat", label: "gamer-chat" },
  { id: "global-chat", label: "global-chat" },
  { id: "sanctuary-builds", label: "sanctuary-builds" },
];

const VOICE_CHANNELS: { id: string; label: string }[] = [
  { id: "prayer-voice", label: "Prayer Voice" },
  { id: "gaming-vc", label: "Gaming-VC" },
];

function portalForChannel(channelId: string): PortalId {
  if (channelId === "minecraft-portal") return "minecraft";
  if (channelId === "roblox-zone") return "roblox";
  if (channelId === "sanctuary-builds" || channelId === "prayer-voice") return "bible";
  return "minecraft";
}

function channelForPortal(portal: PortalId): string {
  if (portal === "minecraft") return "minecraft-portal";
  if (portal === "roblox") return "roblox-zone";
  return "global-chat";
}

export default function GamersHubLayout() {
  const supabase = useMemo(() => createClient(), []);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setAuthUserId(data.user?.id ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUserId(session?.user?.id ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);
  const [activePortal, setActivePortal] = useState<PortalId>("minecraft");
  const [activeChannel, setActiveChannel] = useState("minecraft-portal");
  const [members, setMembers] = useState<HubProfile[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersHint, setMembersHint] = useState<string | null>(null);
  const [hubActivityColumns, setHubActivityColumns] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const [vcCreds, setVcCreds] = useState<{ token: string; url: string } | null>(null);
  const [vcLoading, setVcLoading] = useState(false);
  const [vcError, setVcError] = useState<string | null>(null);
  const [voicePeerIds, setVoicePeerIds] = useState<string[]>([]);
  const [realmBusy, setRealmBusy] = useState(false);

  const voicePeerSet = useMemo(() => new Set(voicePeerIds), [voicePeerIds]);

  const setPeerIdsStable = useCallback((ids: readonly string[]) => {
    setVoicePeerIds(ids.length ? [...ids] : []);
  }, []);

  const patchProfileVc = useCallback(
    async (inVc: boolean) => {
      if (!authUserId || !hubActivityColumns) return;
      const { error } = await supabase.from("profiles").update({ in_gaming_vc: inVc }).eq("id", authUserId);
      if (error?.message?.includes("in_gaming_vc") || error?.code === "PGRST204") {
        setHubActivityColumns(false);
        return;
      }
      if (error) console.warn("GamersHub in_gaming_vc:", error.message);
    },
    [authUserId, hubActivityColumns, supabase],
  );

  const handleVoiceDisconnected = useCallback(() => {
    setVcCreds(null);
    setVoicePeerIds([]);
    void patchProfileVc(false);
  }, [patchProfileVc]);

  const loadMembers = useCallback(async () => {
    setMembersLoading(true);
    setMembersHint(null);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      setMembers([]);
      setMembersHint("Sign in to load the fellowship roster from profiles.");
      setMembersLoading(false);
      return;
    }

    let useActivity = hubActivityColumns;
    let sel =
      "id, username, full_name, avatar_url, is_live, playing_minecraft, in_gaming_vc" as const;
    let { data, error } = await supabase.from("profiles").select(sel).order("full_name", { ascending: true }).limit(48);

    if (error && (error.message.includes("playing_minecraft") || error.message.includes("in_gaming_vc"))) {
      useActivity = false;
      setHubActivityColumns(false);
      const r2 = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, is_live")
        .order("full_name", { ascending: true })
        .limit(48);
      data = (r2.data ?? []).map((row) => ({
        ...row,
        playing_minecraft: null,
        in_gaming_vc: null,
      }));
      error = r2.error;
    }

    if (error) {
      console.error("GamersHub members:", error.message);
      setMembers([]);
      setMembersHint("Could not load profiles (check discovery policies).");
      setMembersLoading(false);
      return;
    }

    setMembers((data ?? []) as HubProfile[]);
    setMembersLoading(false);
  }, [hubActivityColumns, supabase]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    const ch = supabase
      .channel("gamers-hub-profiles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new as Partial<HubProfile> & { id?: string };
          if (!row?.id) return;
          setMembers((prev) =>
            prev.map((m) =>
              m.id === row.id
                ? {
                    ...m,
                    is_live: typeof row.is_live === "boolean" ? row.is_live : m.is_live,
                    playing_minecraft:
                      typeof row.playing_minecraft === "boolean" ? row.playing_minecraft : m.playing_minecraft,
                    in_gaming_vc: typeof row.in_gaming_vc === "boolean" ? row.in_gaming_vc : m.in_gaming_vc,
                    avatar_url: (row.avatar_url as string | null | undefined) ?? m.avatar_url,
                    username: (row.username as string | null | undefined) ?? m.username,
                    full_name: (row.full_name as string | null | undefined) ?? m.full_name,
                  }
                : m,
            ),
          );
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [supabase]);

  const prevChannelRef = useRef(activeChannel);

  useEffect(() => {
    const prev = prevChannelRef.current;
    prevChannelRef.current = activeChannel;
    if (prev === "gaming-vc" && activeChannel !== "gaming-vc") {
      setVcCreds(null);
      setVcError(null);
      setVcLoading(false);
      void patchProfileVc(false);
    }
  }, [activeChannel, patchProfileVc]);

  useEffect(() => {
    if (activeChannel !== "gaming-vc") {
      setVcLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setVcError(null);
      setVcLoading(true);
      setVcCreds(null);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        if (!cancelled) setVcLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", authUser.id)
        .maybeSingle();

      const display =
        (prof?.username as string | undefined)?.trim() ||
        (prof?.full_name as string | undefined)?.trim() ||
        authUser.email ||
        "Gamer";

      const { data, error } = await fetchLiveKitTokenFromEdge(supabase, GAMING_LOBBY_ROOM, display);
      if (cancelled) return;
      if (error || !data?.token || !data.url) {
        setVcError(error ?? "Could not join voice.");
        setVcLoading(false);
        return;
      }
      setVcCreds({ token: data.token, url: data.url });
      setVcLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChannel, supabase]);

  const syncPortalFromChannel = (channelId: string) => {
    setActiveChannel(channelId);
    setActivePortal(portalForChannel(channelId));
  };

  const onPortalClick = (portal: PortalId) => {
    setActivePortal(portal);
    setActiveChannel(channelForPortal(portal));
  };

  const copyServerIp = async () => {
    try {
      await navigator.clipboard.writeText(MINECRAFT_IP);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = MINECRAFT_IP;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* ignore */
      }
    }
    setToastOpen(true);
    window.setTimeout(() => setToastOpen(false), 3200);
  };

  const showMinecraftCard = activePortal === "minecraft" && activeChannel === "minecraft-portal";

  const selfRealm = useMemo(() => {
    if (!authUserId) return false;
    const row = members.find((m) => m.id === authUserId);
    return row?.playing_minecraft === true;
  }, [authUserId, members]);

  const toggleRealmPresence = useCallback(async () => {
    if (!authUserId || !hubActivityColumns) return;
    setRealmBusy(true);
    const next = !selfRealm;
    const { error } = await supabase.from("profiles").update({ playing_minecraft: next }).eq("id", authUserId);
    if (error?.message?.includes("playing_minecraft") || error?.code === "PGRST204") {
      setHubActivityColumns(false);
      setRealmBusy(false);
      return;
    }
    if (error) {
      console.warn("playing_minecraft:", error.message);
      setRealmBusy(false);
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === authUserId ? { ...m, playing_minecraft: next } : m)),
    );
    setRealmBusy(false);
  }, [authUserId, hubActivityColumns, selfRealm, supabase]);

  const hubBody = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <nav
        className="flex shrink-0 flex-row items-center justify-center gap-2 border-b border-white/[0.06] bg-[#0a0b0c] py-2 lg:w-[52px] lg:flex-col lg:border-b-0 lg:border-r lg:py-3"
        aria-label="Portals"
      >
        <PortalIcon
          label="Minecraft"
          active={activePortal === "minecraft"}
          onClick={() => onPortalClick("minecraft")}
        >
          <span className="text-lg font-black leading-none text-[#5dce3d]">M</span>
        </PortalIcon>
        <PortalIcon label="Roblox" active={activePortal === "roblox"} onClick={() => onPortalClick("roblox")}>
          <span className="text-lg font-black leading-none text-[#e63950]">R</span>
        </PortalIcon>
        <PortalIcon label="Bible trivia" active={activePortal === "bible"} onClick={() => onPortalClick("bible")}>
          <BookOpen className="text-[#00FFFF]" size={20} strokeWidth={1.5} />
        </PortalIcon>
      </nav>

      <aside className="flex max-h-[40vh] shrink-0 flex-col border-b border-white/[0.06] bg-[#0f1011]/90 backdrop-blur-xl lg:max-h-none lg:w-[220px] lg:border-b-0 lg:border-r">
        <div className="border-b border-white/[0.06] px-3 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Channels</p>
          <p className="mt-0.5 truncate text-sm font-bold text-white/90">Fellowship server</p>
        </div>
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2">
          <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/30">Text</p>
          <ul className="space-y-0.5">
            {TEXT_CHANNELS.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => syncPortalFromChannel(c.id)}
                  className={[
                    "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-sm transition",
                    activeChannel === c.id
                      ? "bg-white/[0.08] font-semibold text-white"
                      : "text-white/50 hover:bg-white/[0.05] hover:text-white/80",
                  ].join(" ")}
                >
                  <span className="text-white/35">#</span>
                  <span className="truncate">{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/30">Voice</p>
          <ul className="space-y-0.5">
            {VOICE_CHANNELS.map((c) => (
              <li key={c.id}>
                <div>
                  <button
                    type="button"
                    onClick={() => syncPortalFromChannel(c.id)}
                    className={[
                      "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition",
                      activeChannel === c.id
                        ? "bg-white/[0.08] font-semibold text-white"
                        : "text-white/50 hover:bg-white/[0.05] hover:text-white/80",
                    ].join(" ")}
                  >
                    <span aria-hidden>🔊</span>
                    <span className="truncate">{c.label}</span>
                  </button>
                  {c.id === "gaming-vc" && activeChannel === "gaming-vc" && vcCreds ? (
                    <GamingVcAvatarStack className="pb-1" />
                  ) : null}
                  {c.id === "gaming-vc" && activeChannel === "gaming-vc" && !vcCreds && vcLoading ? (
                    <GamingVcConnecting />
                  ) : null}
                  {c.id === "gaming-vc" && activeChannel === "gaming-vc" && !vcCreds && !vcLoading && !authUserId ? (
                    <GamingVcNeedSignIn />
                  ) : null}
                  {c.id === "gaming-vc" && activeChannel === "gaming-vc" && vcError ? (
                    <p className="px-2 pb-2 text-[10px] text-red-400/90">{vcError}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
        {activeChannel === "gaming-vc" && vcCreds ? (
          <GamingVcTransportBar
            disabled={false}
            onLeave={() => {
              setActiveChannel("minecraft-portal");
              setActivePortal("minecraft");
              setVcCreds(null);
              void patchProfileVc(false);
            }}
          />
        ) : null}
      </aside>

      <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#0f1011]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-[1] p-4 sm:p-6">
          {showMinecraftCard ? (
            <MinecraftServerBento
              onCopyIp={copyServerIp}
              hubActivityColumns={hubActivityColumns}
              realmSelf={selfRealm}
              realmBusy={realmBusy}
              onRealmToggle={() => void toggleRealmPresence()}
            />
          ) : activeChannel === "gaming-vc" ? (
            <GlassPanel className="p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Voice · LiveKit</p>
              <h2 className="mt-2 text-2xl font-black text-white">Gaming-Lobby</h2>
              <p className="mt-3 max-w-xl text-sm text-white/55">
                You&apos;re connected with spatial-style Web Audio mixing — voices sit in one shared room instead of a
                flat phone bridge. Use the sidebar to mute, deafen, or disconnect.
              </p>
              {vcCreds ? (
                <p className="mt-4 text-xs font-semibold text-[#00FFFF]">
                  {voicePeerIds.length} voice participant{voicePeerIds.length === 1 ? "" : "s"} online
                </p>
              ) : vcLoading ? (
                <p className="mt-4 flex items-center gap-2 text-xs text-white/45">
                  <Loader2 className="h-4 w-4 animate-spin" /> Minting token…
                </p>
              ) : (
                <p className="mt-4 text-xs text-red-400/80">{vcError ?? "Join voice from the channel list."}</p>
              )}
            </GlassPanel>
          ) : activePortal === "roblox" || activeChannel === "roblox-zone" ? (
            <GlassPanel className="p-6">
              <Gamepad2 className="text-[#00FFFF]" size={28} />
              <h2 className="mt-4 text-xl font-bold text-white">Roblox zone</h2>
              <p className="mt-2 max-w-lg text-sm text-white/55">
                Squad up from the Parable Play launcher — prototypes and activity tiles live there today.
              </p>
              <Link
                href="/play"
                className="mt-5 inline-flex rounded-lg border border-[#00FFFF]/40 bg-[#00FFFF]/10 px-4 py-2 text-sm font-bold text-[#00FFFF] transition hover:shadow-[0_0_26px_rgba(0,255,255,0.35)]"
              >
                Open launcher
              </Link>
            </GlassPanel>
          ) : activePortal === "bible" ? (
            <GlassPanel className="p-6">
              <BookOpen className="text-[#00FFFF]" size={28} />
              <h2 className="mt-4 text-xl font-bold text-white">Sanctuary & Scripture</h2>
              <p className="mt-2 max-w-lg text-sm text-white/55">
                Bible trivia and build showcases stay family-friendly — jump to Sanctuary for the full feed.
              </p>
              <Link
                href="/sanctuary"
                className="mt-5 inline-flex rounded-lg border border-[#00FFFF]/40 bg-[#00FFFF]/10 px-4 py-2 text-sm font-bold text-[#00FFFF] transition hover:shadow-[0_0_26px_rgba(0,255,255,0.35)]"
              >
                Open Sanctuary
              </Link>
            </GlassPanel>
          ) : (
            <GlassPanel className="p-6">
              <Users className="text-[#00FFFF]" size={28} />
              <h2 className="mt-4 text-xl font-bold text-white">#{activeChannel.replace(/-/g, " ")}</h2>
              <p className="mt-2 max-w-lg text-sm text-white/55">
                Select <span className="font-semibold text-white/80">🔊 Gaming-VC</span> to join the LiveKit lobby, or{" "}
                <span className="font-semibold text-white/80"># minecraft-portal</span> for the server card.
              </p>
            </GlassPanel>
          )}
        </div>
      </main>

      <aside className="flex max-h-[36vh] shrink-0 flex-col border-t border-white/[0.06] bg-[#0f1011]/90 backdrop-blur-xl lg:max-h-none lg:w-[260px] lg:border-l lg:border-t-0">
        <div className="border-b border-white/[0.06] px-3 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Online members</p>
          <p className="mt-1 text-sm font-bold text-white">Portal presence</p>
        </div>
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
          {membersLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin opacity-50" style={{ color: CYAN }} />
            </div>
          ) : members.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-white/40">{membersHint ?? "No profiles loaded yet."}</p>
          ) : (
            members.map((p) => {
              const label = p.username?.trim() || p.full_name?.trim() || "Member";
              const live = p.is_live === true;
              const inVoice = voicePeerSet.has(p.id) || p.in_gaming_vc === true;
              const inMc = p.playing_minecraft === true;
              const portalActive = live || inVoice || inMc;
              return (
                <Link
                  key={p.id}
                  href={`/profile/${p.id}`}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-white/[0.05]"
                >
                  <div className="relative shrink-0">
                    <div
                      className={[
                        "relative h-9 w-9 rounded-full p-[2px]",
                        live
                          ? "bg-gradient-to-br from-[#00FFFF] to-cyan-600 shadow-[0_0_14px_rgba(0,255,255,0.45)]"
                          : "bg-white/10",
                      ].join(" ")}
                    >
                      <div className="h-full w-full overflow-hidden rounded-full bg-[#111214] ring-2 ring-[#0f1011]">
                        {p.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={fallbackAvatarOnError}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/45">
                            {label.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0f1011]"
                      style={{
                        backgroundColor: portalActive ? PARABLE_CYAN : "rgba(255,255,255,0.2)",
                        boxShadow: portalActive ? `0 0 10px ${PARABLE_CYAN}` : "none",
                      }}
                      title={portalActive ? "Active on portal" : "Idle"}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-white/90">{label}</p>
                      {inMc ? (
                        <span
                          className="shrink-0 text-[10px] font-black text-[#5dce3d]"
                          title="Playing Minecraft"
                        >
                          M
                        </span>
                      ) : null}
                      {inVoice ? <Mic className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-label="In voice" /> : null}
                    </div>
                    <p className="truncate text-[10px] text-white/45">
                      {inMc ? "Playing Minecraft" : null}
                      {inMc && inVoice ? " · " : null}
                      {inVoice ? "In Gaming-Lobby (voice)" : null}
                      {!inMc && !inVoice ? (live ? "LiveKit · broadcasting" : "LiveKit · idle") : null}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );

  const voiceShellActive = activeChannel === "gaming-vc" && vcCreds != null && authUserId != null;

  return (
    <div
      className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#0f1011] pb-[4.5rem] font-[family-name:var(--font-parable),system-ui,sans-serif] text-[#dbdee1]"
      style={{ ["--neon-cyan" as string]: CYAN }}
    >
      <header className="shrink-0 border-b border-white/[0.06] bg-[#0f1011]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Parable · Portal</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Gamers <span style={{ color: CYAN }}>Hub</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-bold text-[#dbdee1] transition hover:border-[#00FFFF]/45 hover:text-[#00FFFF] hover:shadow-[0_0_22px_rgba(0,255,255,0.25)]"
            >
              Gamer Covenant · Rules
            </button>
            <Link
              href="/play"
              className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/70 transition hover:border-[#00FFFF]/45 hover:text-[#00FFFF] hover:shadow-[0_0_22px_rgba(0,255,255,0.25)]"
            >
              Parable Play
            </Link>
          </div>
        </div>
      </header>

      {voiceShellActive && vcCreds ? (
        <GamersHubVoiceShell
          token={vcCreds.token}
          serverUrl={vcCreds.url}
          roomName={GAMING_LOBBY_ROOM}
          onPeerIdentities={setPeerIdsStable}
          onConnected={() => void patchProfileVc(true)}
          onDisconnected={handleVoiceDisconnected}
          onError={(m) => setVcError(m)}
        >
          {hubBody}
        </GamersHubVoiceShell>
      ) : (
        hubBody
      )}

      {rulesOpen ? (
        <div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setRulesOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="covenant-title"
            className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0f1011]/85 p-6 shadow-[0_0_60px_rgba(0,255,255,0.12)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setRulesOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1 text-white/40 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 text-[#00FFFF]">
              <Shield size={22} />
              <h2 id="covenant-title" className="text-lg font-black tracking-tight text-white">
                Gamer Covenant
              </h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/70">
              <li>No griefing — build others up, do not tear their work down.</li>
              <li>Keep it family-friendly — language and humor stay sanctuary-safe.</li>
              <li>Respect all players — patience, hospitality, and fair play come first.</li>
            </ul>
            <button
              type="button"
              onClick={() => setRulesOpen(false)}
              className="mt-6 w-full rounded-lg border border-[#00FFFF]/40 bg-[#00FFFF]/10 py-2.5 text-sm font-bold text-[#00FFFF] transition hover:shadow-[0_0_28px_rgba(0,255,255,0.35)]"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}

      {toastOpen ? (
        <div
          className="fixed bottom-24 left-1/2 z-[200] w-[min(100%,22rem)] -translate-x-1/2 rounded-xl border border-[#00FFFF]/50 bg-[#0a0c0d]/95 px-4 py-3 text-center text-sm font-semibold text-[#00FFFF] shadow-[0_0_40px_rgba(0,255,255,0.35)] backdrop-blur-md md:bottom-8"
          role="status"
        >
          IP Copied! Paste into Minecraft Multiplayer to join.
        </div>
      ) : null}
    </div>
  );
}

function PortalIcon({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={[
        "flex h-11 w-11 items-center justify-center rounded-full border transition",
        active
          ? "border-[#00FFFF]/60 bg-[#00FFFF]/15 shadow-[0_0_20px_rgba(0,255,255,0.35)]"
          : "border-white/[0.08] bg-[#151618] hover:border-[#00FFFF]/35 hover:shadow-[0_0_18px_rgba(0,255,255,0.2)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function GlassPanel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/[0.08] bg-[#121314]/75 shadow-[0_12px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function MinecraftServerBento({
  onCopyIp,
  hubActivityColumns,
  realmSelf,
  realmBusy,
  onRealmToggle,
}: {
  onCopyIp: () => void;
  hubActivityColumns: boolean;
  realmSelf: boolean;
  realmBusy: boolean;
  onRealmToggle: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#101214]/95 to-[#0a0b0c]/95 shadow-[0_0_80px_rgba(0,255,255,0.06)] backdrop-blur-xl">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Primary portal</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Minecraft Server</h2>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 rounded-full border border-[#23a559]/35 bg-[#23a559]/10 px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#23a559] opacity-50" />
                  <span className="relative h-2 w-2 rounded-full bg-[#23a559]" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#39d98a]">SERVER ONLINE</span>
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-white/45">0/20 PLAYERS</p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-white/[0.08] bg-black/35 p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Java address</p>
            <p className="mt-2 break-all font-mono text-lg text-[#00FFFF] sm:text-xl">{MINECRAFT_IP}</p>
            <button
              type="button"
              onClick={onCopyIp}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#00FFFF]/45 bg-[#00FFFF]/10 py-3 text-sm font-black uppercase tracking-widest text-[#00FFFF] transition hover:bg-[#00FFFF]/18 hover:shadow-[0_0_32px_rgba(0,255,255,0.4)] sm:w-auto sm:px-10"
            >
              <Copy size={18} strokeWidth={2} />
              COPY SERVER IP
            </button>
          </div>

          {hubActivityColumns ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-white/35">Cross-app status</p>
                <p className="mt-1 text-xs text-white/55">
                  Toggle when you&apos;re on the Parable realm so the member list shows{" "}
                  <span className="text-white/80">Playing Minecraft</span>.
                </p>
              </div>
              <button
                type="button"
                disabled={realmBusy}
                onClick={onRealmToggle}
                className={[
                  "shrink-0 rounded-lg border px-4 py-2 text-xs font-black uppercase tracking-wider transition",
                  realmSelf
                    ? "border-[#5dce3d]/50 bg-[#5dce3d]/15 text-[#86efac]"
                    : "border-[#00FFFF]/40 bg-[#00FFFF]/10 text-[#00FFFF] hover:shadow-[0_0_20px_rgba(0,255,255,0.25)]",
                ].join(" ")}
              >
                {realmBusy ? "Saving…" : realmSelf ? "On realm · tap to clear" : "I'm on the realm"}
              </button>
            </div>
          ) : (
            <p className="mt-4 text-xs text-white/35">
              Run <code className="text-[#00FFFF]/80">supabase/profiles-add-gamers-hub-activity.sql</code> to enable realm
              presence on profiles.
            </p>
          )}

          <p className="mt-6 text-sm leading-relaxed text-white/50">
            Godlike.Host shows joins in your console; Parable shows fellowship here. Wire a webhook later for
            automatic Minecraft presence.
          </p>
        </div>

        <div className="border-t border-white/[0.06] bg-black/25 p-6 sm:border-l sm:border-t-0 lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">Parable circuit</p>
          <ul className="mt-4 space-y-3 text-sm text-white/55">
            <li className="flex gap-2">
              <span className="text-[#00FFFF]">·</span>
              Jump in via Multiplayer → Direct Connection, then paste the IP.
            </li>
            <li className="flex gap-2">
              <span className="text-[#00FFFF]">·</span>
              Covenant: no griefing, family-friendly chat, respect every player.
            </li>
            <li className="flex gap-2">
              <span className="text-[#00FFFF]">·</span>
              <span className="font-semibold text-white/70">Command center:</span> voice rings pulse when someone is
              speaking in Gaming-Lobby.
            </li>
          </ul>
          <Link
            href="/gaming/play/narrow-road"
            className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-white/[0.1] py-2.5 text-xs font-bold text-white/60 transition hover:border-[#00FFFF]/35 hover:text-[#00FFFF] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]"
          >
            Browser flagship demos
          </Link>
        </div>
      </div>
    </article>
  );
}
