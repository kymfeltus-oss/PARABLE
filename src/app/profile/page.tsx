"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  BadgeCheck,
  Gift,
  Users,
  Sparkles,
  Instagram,
  Facebook,
  Youtube,
  Link as LinkIcon,
  Star,
  Crown,
  Shield,
  Wallet,
  CalendarDays,
  Eye,
  Radio,
  ChevronRight,
  Settings,
  Activity,
  Hash,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import { uploadUserAvatarFromDataUrl } from "@/lib/avatar-storage";
import { clearPendingAvatarKeys, persistAvatarPublicUrlToProfile } from "@/lib/profile-avatar";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import ProfileWidgets from "@/components/ProfileWidgets";
import HubBackground from "@/components/HubBackground";

/** Glass sidebar card — Parable command surface */
function ParableSidebarCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/50 shadow-[0_0_36px_rgba(0,242,255,0.06)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(0,242,255,0.1),transparent_50%)]" />
      <div className="relative flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="text-[#00f2ff]">{icon}</span>
        <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-[#00f2ff]/90">{title}</h3>
      </div>
      <div className="relative p-4 text-sm text-white/70">{children}</div>
    </div>
  );
}

function ParablePanel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/45 shadow-[0_0_40px_rgba(0,242,255,0.05)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(168,85,247,0.08),transparent_45%)]" />
      <div className="relative border-b border-white/[0.06] bg-gradient-to-r from-[#00f2ff]/[0.06] to-transparent px-4 py-3 sm:px-5 sm:py-3.5">
        <h4 className="text-base font-bold tracking-tight text-white">{title}</h4>
        {subtitle ? <p className="mt-0.5 text-xs text-white/45">{subtitle}</p> : null}
      </div>
      <div className="relative p-4 text-sm text-white/70 sm:p-5">{children}</div>
    </div>
  );
}

function SupportCard({
  title,
  amount,
  subtitle,
  icon,
  active = false,
}: {
  title: string;
  amount: string;
  subtitle: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.992 }}
      className={[
        "group w-full min-w-0 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
        active
          ? "border-[#00f2ff]/55 bg-[#00f2ff]/[0.08] shadow-[0_0_0_1px_rgba(0,242,255,0.35),0_0_40px_rgba(0,242,255,0.12)]"
          : "border-white/[0.08] bg-black/40 hover:border-[#00f2ff]/30 hover:bg-[#00f2ff]/[0.04]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="text-[#00f2ff] transition group-hover:drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]">{icon}</span>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-300">
          {amount}
        </span>
      </div>
      <h3 className="mt-3 break-words text-base font-bold text-white">{title}</h3>
      <p className="mt-1 break-words text-xs leading-relaxed text-white/50">{subtitle}</p>
      <div className="mt-4 rounded-xl bg-gradient-to-r from-[#00f2ff]/25 to-fuchsia-500/20 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#00f2ff]">
        Support now
      </div>
    </motion.button>
  );
}

type ProfileGridPost = {
  id: string;
  media_url: string | null;
  content: string | null;
  media_type: string | null;
  created_at?: string;
};

const CONNECTED_GROUPS: { name: string; href: string; tag: string }[] = [
  { name: "Fellowship", href: "/fellowship", tag: "Community" },
  { name: "Writers Hub", href: "/writers-hub", tag: "Stories" },
  { name: "Music Hub", href: "/music-hub", tag: "Artists" },
];

function formatActivityDate(iso: string | undefined) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ProfilePage() {
  const [selectedSupport, setSelectedSupport] = useState("Seed");
  const [profileTab, setProfileTab] = useState<"posts" | "about">("posts");
  const [gridPosts, setGridPosts] = useState<ProfileGridPost[]>([]);
  const { userProfile, avatarUrl, loading, applyAvatarFromUpload } = useAuth();
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<string | null>(null);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const displayName =
    userProfile?.username || userProfile?.full_name || "Your Profile";
  const roleLabel = userProfile?.role || "Creator";
  const handle =
    userProfile?.username ??
    (userProfile?.full_name
      ? String(userProfile.full_name).split(/\s+/)[0].toLowerCase()
      : "you");
  const supabase = createClient();

  useEffect(() => {
    if (!userProfile?.id) {
      setGridPosts([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, media_url, content, media_type, created_at")
        .eq("profile_id", userProfile.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error || cancelled) return;
      setGridPosts((data ?? []) as ProfileGridPost[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [userProfile?.id, supabase]);

  const compressImage = async (file: File): Promise<string | null> => {
    const source = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
    if (!source) return null;

    const image = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = source;
    });
    if (!image) return source;

    const maxDim = 640;
    const ratio = Math.min(1, maxDim / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.78);
  };

  const openAvatarPicker = () => {
    if (!userProfile?.id) {
      setAvatarStatus("You must be logged in before uploading a profile photo.");
      return;
    }
    avatarInputRef.current?.click();
  };

  const handleChangeProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!userProfile?.id) {
      setAvatarStatus("You must be logged in before uploading a profile photo.");
      return;
    }
    if (!file) {
      setAvatarStatus("No image selected.");
      return;
    }

    const dataUrl = await compressImage(file);

    if (!dataUrl) {
      setAvatarStatus(
        "Could not read this image. Use JPG or PNG (HEIC may not work in the browser).",
      );
      return;
    }

    setLocalAvatarPreview(dataUrl);
    setAvatarStatus("Uploading profile photo...");
    setSavingAvatar(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        setAvatarStatus("Session expired. Sign in again, then upload.");
        return;
      }

      const uploaded = await uploadUserAvatarFromDataUrl(supabase, user.id, dataUrl);
      if ("error" in uploaded) {
        setAvatarStatus(
          `Upload failed: ${uploaded.error}. In Supabase: create bucket "avatars" (public) and run SQL from supabase/storage-avatars-policies.sql.`,
        );
        return;
      }

      const username =
        userProfile.username ||
        (user.user_metadata?.username as string | undefined) ||
        user.email?.split("@")[0] ||
        `user-${user.id.slice(0, 8)}`;
      const fullName =
        userProfile.full_name || (user.user_metadata?.full_name as string | undefined) || "";

      const saved = await persistAvatarPublicUrlToProfile(supabase, user.id, uploaded.publicUrl, {
        username,
        full_name: fullName,
      });

      if (!saved.ok) {
        setAvatarStatus(`Save failed: ${saved.error}`);
        return;
      }

      const { error: metaErr } = await supabase.auth.updateUser({
        data: { avatar_url: uploaded.publicUrl },
      });
      if (metaErr) {
        /* optional */
      }

      clearPendingAvatarKeys(
        user.id,
        user.email ? String(user.email).trim().toLowerCase() : null,
        user.email ? `parable:pending-avatar:${String(user.email).trim().toLowerCase()}` : null,
      );

      applyAvatarFromUpload(uploaded.publicUrl);
      setLocalAvatarPreview(null);
      setAvatarStatus("Profile photo saved.");
      window.dispatchEvent(
        new CustomEvent("parable:profile-updated", {
          detail: { bumpAvatar: true },
        }),
      );
    } finally {
      setSavingAvatar(false);
      event.target.value = "";
    }
  };

  const supportOptions = [
    {
      title: "Seed",
      amount: "$25",
      subtitle: "A faith seed to support the creator’s vision, content, and community work.",
      icon: <Sparkles size={18} />,
    },
    {
      title: "Tithe",
      amount: "$50",
      subtitle: "Support kingdom building, stewardship, and long term growth through consistent giving.",
      icon: <Crown size={18} />,
    },
    {
      title: "Offering",
      amount: "$100",
      subtitle: "A special offering to bless the work, the mission, and the impact being built here.",
      icon: <Gift size={18} />,
    },
    {
      title: "Partner Support",
      amount: "$250",
      subtitle: "A higher support level for followers who want to invest in expansion and vision.",
      icon: <Shield size={18} />,
    },
  ];

  if (loading) {
    return (
      <div className="relative min-h-[70vh] overflow-hidden bg-[#030306] pb-parable-bottom">
        <HubBackground />
        <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#00f2ff]/30 bg-black/60 shadow-[0_0_60px_rgba(0,242,255,0.2)]">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#00f2ff]/20 to-fuchsia-500/10" />
          </div>
          <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#00f2ff]/60" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/35">Loading sanctuary profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#030306] pb-parable-bottom text-white selection:bg-[#00f2ff]/25">
      <div className="fixed inset-0 z-0">
        <HubBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00f2ff]/[0.04] via-transparent to-black/80 pointer-events-none" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,242,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.15)_1px,transparent_1px)`,
            backgroundSize: "56px 56px",
          }}
        />
      </div>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChangeProfilePicture}
      />

      {/* Hero cover — cyan / violet sanctuary beam */}
      <div className="relative z-10 w-full overflow-hidden">
        <div className="relative h-48 sm:h-56 lg:h-64">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00f2ff]/25 via-fuchsia-600/20 to-[#09090b]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030306] via-transparent to-transparent" />
          <div className="absolute -bottom-16 left-1/2 h-40 w-[min(100%,720px)] -translate-x-1/2 rounded-full bg-[#00f2ff]/25 blur-[80px]" />
          <div className="absolute right-[10%] top-8 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-[60px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0zm30 30h30v30H30z' fill='%23fff' fill-opacity='.08'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative -mt-[4.5rem] pb-1 sm:-mt-[5.25rem]">
            <button
              type="button"
              onClick={openAvatarPicker}
              disabled={savingAvatar}
              className="relative flex h-[7.5rem] w-[7.5rem] shrink-0 overflow-hidden rounded-full border-[3px] border-[#030306] bg-black/70 shadow-[0_0_0_2px_rgba(0,242,255,0.35),0_0_60px_rgba(0,242,255,0.25)] ring-1 ring-white/10 transition hover:shadow-[0_0_0_2px_rgba(0,242,255,0.55),0_0_80px_rgba(0,242,255,0.35)] disabled:opacity-60 sm:h-[8.5rem] sm:w-[8.5rem]"
            >
              {(localAvatarPreview || avatarUrl) && (localAvatarPreview || avatarUrl) !== "/logo.svg" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={localAvatarPreview || avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={fallbackAvatarOnError}
                />
              ) : (
                <User className="m-auto text-[#00f2ff]" size={48} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-5">
        {/* Identity row */}
        <div className="flex flex-col gap-5 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 pl-0 sm:pl-[calc(8.5rem+1rem)]">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#00f2ff]/70">Sanctuary identity</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                {displayName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#00f2ff]/35 bg-[#00f2ff]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#00f2ff]">
                <BadgeCheck size={12} className="text-[#00f2ff]" />
                Verified member
              </span>
            </div>
            <p className="mt-2 text-sm text-white/50">
              <span className="font-mono text-[#00f2ff]/80">@{handle}</span>
              <span className="mx-2 text-white/20">·</span>
              <span className="text-white/60">{roleLabel}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white/90 transition hover:border-[#00f2ff]/40 hover:bg-[#00f2ff]/10"
            >
              <Settings size={14} className="text-[#00f2ff]" />
              Edit profile
            </Link>
            <Link
              href="/my-sanctuary"
              className="rounded-xl bg-gradient-to-r from-[#00f2ff] to-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_28px_rgba(0,242,255,0.35)] transition hover:brightness-110"
            >
              My Sanctuary
            </Link>
            <button
              type="button"
              onClick={openAvatarPicker}
              disabled={savingAvatar}
              className="rounded-xl border border-[#00f2ff]/30 bg-transparent px-4 py-2.5 text-xs font-bold text-[#00f2ff] transition hover:bg-[#00f2ff]/10 disabled:opacity-50"
            >
              {savingAvatar ? "…" : "Update photo"}
            </button>
          </div>
        </div>

        {avatarStatus ? (
          <p className="mt-4 rounded-xl border border-[#00f2ff]/20 bg-[#00f2ff]/5 px-4 py-2 text-xs text-[#00f2ff]/90">{avatarStatus}</p>
        ) : null}

        {/* Discord sidebar + Twitch center + ProfileWidgets (right on lg) */}
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Sidebar widgets */}
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[260px]">
            <ParableSidebarCard title="Signal" icon={<User size={14} />}>
              <ul className="space-y-3 text-xs">
                <li className="flex justify-between gap-2 border-b border-white/[0.06] pb-2">
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Hash size={12} className="text-[#00f2ff]/70" />
                    Username
                  </span>
                  <span className="truncate font-semibold text-white">{handle}</span>
                </li>
                <li className="flex justify-between gap-2 border-b border-white/[0.06] pb-2">
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Star size={12} className="text-[#00f2ff]/70" />
                    Role
                  </span>
                  <span className="text-white/90">{roleLabel}</span>
                </li>
                <li className="flex justify-between gap-2 border-b border-white/[0.06] pb-2">
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Eye size={12} className="text-[#00f2ff]/70" />
                    Followers
                  </span>
                  <span className="font-mono text-[#00f2ff]">0</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Radio size={12} className="text-[#00f2ff]/70" />
                    Streams
                  </span>
                  <span className="font-mono text-[#00f2ff]">0</span>
                </li>
              </ul>
            </ParableSidebarCard>

            <ParableSidebarCard title="Connected hubs" icon={<Users size={14} />}>
              <ul className="space-y-1">
                {CONNECTED_GROUPS.map((g) => (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      className="group flex items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-xs transition hover:bg-[#00f2ff]/[0.06]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#00f2ff]/25 bg-[#00f2ff]/10 text-[#00f2ff]">
                          <Hash size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-white">{g.name}</span>
                          <span className="text-[10px] text-white/40">{g.tag}</span>
                        </span>
                      </span>
                      <ChevronRight size={14} className="shrink-0 text-white/25 group-hover:text-[#00f2ff]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </ParableSidebarCard>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-row lg:items-start">
            {/* Center: Twitch-style info grid + tabs */}
            <main className="min-w-0 flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ParablePanel title="About" subtitle="Bio & mission" className="md:col-span-2">
                <p className="leading-relaxed text-white/60">
                  Your public identity on PARABLE: testimony, streams, and fellowship. Update details in{" "}
                  <Link href="/settings" className="font-semibold text-[#00f2ff] hover:underline">
                    Settings
                  </Link>
                  ; post from Sanctuary to grow your grid and show up in recent activity.
                </p>
                <div className="mt-4 rounded-xl border border-[#00f2ff]/20 bg-[#00f2ff]/[0.04] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f2ff]/80">Mission</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Building a digital sanctuary where creators and communities gather through story, sound, and live
                    connection.
                  </p>
                </div>
              </ParablePanel>

              <ParablePanel title="Recent activity" subtitle="Latest moments">
                {gridPosts.length === 0 ? (
                  <p className="text-sm text-white/45">No posts yet. Share from Sanctuary.</p>
                ) : (
                  <ul className="max-h-56 space-y-2 overflow-y-auto pr-1 scrollbar-hide">
                    {gridPosts.slice(0, 6).map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/sanctuary/${p.id}`}
                          className="flex gap-2 rounded-xl border border-transparent px-2 py-2 text-left transition hover:border-[#00f2ff]/20 hover:bg-[#00f2ff]/[0.04]"
                        >
                          <Activity size={14} className="mt-0.5 shrink-0 text-[#00f2ff]" />
                          <span className="min-w-0">
                            <span className="block truncate text-xs text-white">
                              {(p.content || "New post").slice(0, 80)}
                              {(p.content || "").length > 80 ? "…" : ""}
                            </span>
                            <span className="text-[10px] text-white/35">
                              {formatActivityDate(p.created_at) || "Sanctuary"}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </ParablePanel>

              <ParablePanel title="Links" subtitle="Social & hubs">
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-[#00f2ff]/35 hover:text-[#00f2ff]"
                  >
                    <Instagram size={14} />
                    Instagram
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-[#00f2ff]/35 hover:text-[#00f2ff]"
                  >
                    <Facebook size={14} />
                    Facebook
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-[#00f2ff]/35 hover:text-[#00f2ff]"
                  >
                    <Youtube size={14} />
                    YouTube
                  </a>
                  <Link
                    href="/hubs"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#00f2ff]/40 bg-[#00f2ff]/10 px-3 py-2 text-xs font-bold text-[#00f2ff] transition hover:bg-[#00f2ff]/20"
                  >
                    <LinkIcon size={14} />
                    Parable hubs
                  </Link>
                </div>
              </ParablePanel>
              </div>

              {/* Mobile: stacked below info panels, above post feed */}
              <div className="lg:hidden">
                <ProfileWidgets profile={userProfile} />
              </div>

              {/* Tab strip */}
              <div className="flex rounded-2xl border border-white/[0.08] bg-black/40 p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setProfileTab("posts")}
                className={`flex-1 rounded-xl py-3 text-center text-sm font-bold transition ${
                  profileTab === "posts"
                    ? "bg-gradient-to-r from-[#00f2ff] to-cyan-400 text-black shadow-[0_0_24px_rgba(0,242,255,0.25)]"
                    : "text-white/45 hover:text-white/80"
                }`}
              >
                Posts · {gridPosts.length}
              </button>
              <button
                type="button"
                onClick={() => setProfileTab("about")}
                className={`flex-1 rounded-xl py-3 text-center text-sm font-bold transition ${
                  profileTab === "about"
                    ? "bg-gradient-to-r from-[#00f2ff] to-cyan-400 text-black shadow-[0_0_24px_rgba(0,242,255,0.25)]"
                    : "text-white/45 hover:text-white/80"
                }`}
              >
                Details
              </button>
            </div>

            {profileTab === "posts" && (
              <ParablePanel title="Posts" subtitle="Your Sanctuary grid">
                {gridPosts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#00f2ff]/25 bg-[#00f2ff]/[0.03] py-14 text-center text-sm text-white/50">
                    No public posts yet. Share from{" "}
                    <Link href="/my-sanctuary" className="font-bold text-[#00f2ff] hover:underline">
                      Sanctuary
                    </Link>
                    .
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {gridPosts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/sanctuary/${p.id}`}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-black/50 ring-0 transition hover:border-[#00f2ff]/40 hover:shadow-[0_0_24px_rgba(0,242,255,0.15)]"
                      >
                        {p.media_url ? (
                          p.media_type === "video" ||
                          /\.(mp4|webm|mov)$/i.test(p.media_url.split("?")[0] ?? "") ? (
                            <video src={p.media_url} className="h-full w-full object-cover" muted playsInline />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.media_url} alt="" className="h-full w-full object-cover" />
                          )
                        ) : (
                          <div className="flex h-full items-center p-2 text-center text-[10px] text-white/35">
                            {(p.content ?? "").slice(0, 48)}
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                )}
              </ParablePanel>
            )}

            {profileTab === "about" && (
              <ParablePanel title="Profile details" subtitle="At a glance">
                <div className="space-y-4 text-sm">
                  <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-3">
                    <span className="text-xs text-white/40">Creator type</span>
                    <span className="font-semibold text-white">{roleLabel}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-3">
                    <span className="flex items-center gap-2 text-xs text-white/40">
                      <CalendarDays size={14} className="text-[#00f2ff]" /> Joined
                    </span>
                    <span className="font-semibold text-white">Jan 2026</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-xs text-white/40">
                      <Wallet size={14} className="text-[#00f2ff]" /> Support wallet
                    </span>
                    <span className="font-semibold text-emerald-300/90">Enabled</span>
                  </div>
                </div>
              </ParablePanel>
            )}

            <ParablePanel title="Support" subtitle="Bless this creator">
              <div className="grid gap-3 sm:grid-cols-2">
                {supportOptions.map((item) => (
                  <div key={item.title} onClick={() => setSelectedSupport(item.title)}>
                    <SupportCard
                      title={item.title}
                      amount={item.amount}
                      subtitle={item.subtitle}
                      icon={item.icon}
                      active={selectedSupport === item.title}
                    />
                  </div>
                ))}
              </div>
            </ParablePanel>

            <div className="grid gap-4 md:grid-cols-2">
              <ParablePanel title="Quick amounts" subtitle="One-tap tiers">
                <div className="grid grid-cols-2 gap-2">
                  {["$10", "$25", "$50", "$100", "$250", "$500"].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-xs font-black text-emerald-300 transition hover:border-[#00f2ff]/35 hover:bg-[#00f2ff]/10"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </ParablePanel>
              <ParablePanel title="Signals" subtitle="Community pulse">
                <ul className="space-y-2 text-xs text-white/50">
                  {[
                    "24 new supporters this week",
                    "Top seed amount today is $250",
                    "Offering goal is 68% complete",
                    "Most active support hour is 8 PM",
                  ].map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-white/[0.06] bg-black/35 px-3 py-2.5 transition hover:border-[#00f2ff]/20"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </ParablePanel>
            </div>
            </main>

            {/* Desktop: right sidebar */}
            <aside className="hidden w-full shrink-0 lg:block lg:w-80">
              <ProfileWidgets profile={userProfile} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
