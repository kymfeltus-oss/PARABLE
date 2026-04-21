"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  BadgeCheck,
  Heart,
  DollarSign,
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

/** Discord-style sidebar card (#2b2d31 surface). */
function DiscordWidget({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#1f2023] bg-[#2b2d31] shadow-[0_1px_0_rgba(4,4,5,0.2)]">
      <div className="flex items-center gap-2 border-b border-black/50 bg-[#232428] px-3 py-2">
        <span className="text-[#949ba4]">{icon}</span>
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#b5bac1]">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

/** Twitch “About” panel: header strip + content. */
function TwitchPanel({
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
    <div className={`flex flex-col overflow-hidden rounded-md border border-[#1f2023] bg-[#2b2d31] ${className}`}>
      <div className="border-b border-black/40 bg-[#1e1f22] px-4 py-2.5">
        <h4 className="text-sm font-semibold text-[#ececec]">{title}</h4>
        {subtitle ? <p className="mt-0.5 text-xs text-[#949ba4]">{subtitle}</p> : null}
      </div>
      <div className="p-4 text-sm text-[#dbdee1]">{children}</div>
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
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      className={[
        "w-full min-w-0 overflow-hidden rounded-lg border p-4 text-left transition-all",
        active
          ? "border-[#5865f2]/50 bg-[#5865f2]/15 shadow-[0_0_0_1px_rgba(88,101,242,0.35)]"
          : "border-[#1f2023] bg-[#1e1f22] hover:border-[#3f4147]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="text-[#5865f2]">{icon}</span>
        <span className="text-xs font-bold text-[#00d166]">{amount}</span>
      </div>
      <h3 className="mt-3 break-words text-base font-bold text-[#ececec]">{title}</h3>
      <p className="mt-1 break-words text-xs leading-relaxed text-[#949ba4]">{subtitle}</p>
      <div className="mt-4 rounded bg-[#5865f2]/20 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#949ef8]">
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
    return <div className="min-h-full bg-[#313338]" />;
  }

  return (
    <div className="min-h-full bg-[#313338] pb-parable-bottom text-[#dbdee1]">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChangeProfilePicture}
      />

      {/* Facebook-style cover (full width) */}
      <div className="relative w-full overflow-hidden bg-[#1e1f22]">
        <div className="h-44 bg-gradient-to-br from-[#5865f2]/35 via-[#3c45a5]/20 to-[#1e1f22] sm:h-52 lg:h-60" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0zm30 30h30v30H30z' fill='%23fff' fill-opacity='.06'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Profile photo overlaps bottom-left of cover */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative -mt-[4.5rem] pb-1 sm:-mt-[5.25rem]">
            <button
              type="button"
              onClick={openAvatarPicker}
              disabled={savingAvatar}
              className="relative flex h-[7.5rem] w-[7.5rem] shrink-0 overflow-hidden rounded-full border-4 border-[#313338] bg-[#2b2d31] shadow-xl ring-2 ring-[#1f2023] transition hover:ring-[#5865f2]/50 disabled:opacity-60 sm:h-[8.5rem] sm:w-[8.5rem]"
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
                <User className="m-auto text-[#5865f2]" size={48} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-5">
        {/* Identity row */}
        <div className="flex flex-col gap-4 border-b border-[#1f2023] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 pl-0 sm:pl-[calc(8.5rem+1rem)]">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#ececec] sm:text-3xl">{displayName}</h1>
              <span className="inline-flex items-center gap-1 rounded bg-[#5865f2]/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#b5bac1]">
                <BadgeCheck size={12} className="text-[#5768f5]" />
                Member
              </span>
            </div>
            <p className="mt-1 text-sm text-[#949ba4]">
              @{handle} · {roleLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded bg-[#4e5058] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#5c5e66]"
            >
              <Settings size={14} />
              Edit profile
            </Link>
            <Link
              href="/my-sanctuary"
              className="rounded bg-[#5865f2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4752c4]"
            >
              My Sanctuary
            </Link>
            <button
              type="button"
              onClick={openAvatarPicker}
              disabled={savingAvatar}
              className="rounded border border-[#4e5058] px-3 py-2 text-xs font-medium text-[#b5bac1] hover:bg-[#2b2d31] disabled:opacity-50"
            >
              {savingAvatar ? "…" : "Update photo"}
            </button>
          </div>
        </div>

        {avatarStatus ? (
          <p className="mt-3 text-xs text-[#949ba4]">{avatarStatus}</p>
        ) : null}

        {/* Discord sidebar + Twitch center + ProfileWidgets (right on lg) */}
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Sidebar widgets */}
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[260px]">
            <DiscordWidget title="User info" icon={<User size={14} />}>
              <ul className="space-y-3 text-xs">
                <li className="flex justify-between gap-2 border-b border-[#1f2023] pb-2 text-[#b5bac1]">
                  <span className="flex items-center gap-1.5 text-[#949ba4]">
                    <Hash size={12} />
                    Username
                  </span>
                  <span className="truncate font-medium text-[#ececec]">{handle}</span>
                </li>
                <li className="flex justify-between gap-2 border-b border-[#1f2023] pb-2">
                  <span className="flex items-center gap-1.5 text-[#949ba4]">
                    <Star size={12} />
                    Role
                  </span>
                  <span className="text-[#ececec]">{roleLabel}</span>
                </li>
                <li className="flex justify-between gap-2 border-b border-[#1f2023] pb-2">
                  <span className="flex items-center gap-1.5 text-[#949ba4]">
                    <Eye size={12} />
                    Followers
                  </span>
                  <span className="text-[#ececec]">0</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[#949ba4]">
                    <Radio size={12} />
                    Streams
                  </span>
                  <span className="text-[#ececec]">0</span>
                </li>
              </ul>
            </DiscordWidget>

            <DiscordWidget title="Connected groups" icon={<Users size={14} />}>
              <ul className="space-y-1">
                {CONNECTED_GROUPS.map((g) => (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      className="group flex items-center justify-between gap-2 rounded px-2 py-2 text-xs transition hover:bg-[#35373c]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#5865f2]/25 text-[#b5bac1]">
                          <Hash size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-[#ececec]">{g.name}</span>
                          <span className="text-[10px] text-[#949ba4]">{g.tag}</span>
                        </span>
                      </span>
                      <ChevronRight size={14} className="shrink-0 text-[#6d7078] group-hover:text-[#b5bac1]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </DiscordWidget>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-row lg:items-start">
            {/* Center: Twitch-style info grid + tabs */}
            <main className="min-w-0 flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TwitchPanel title="About" subtitle="Bio & mission" className="md:col-span-2">
                <p className="leading-relaxed text-[#b5bac1]">
                  Your public identity on PARABLE: testimony, streams, and fellowship. Update details in{" "}
                  <Link href="/settings" className="font-medium text-[#00aff4] hover:underline">
                    Settings
                  </Link>
                  ; post from Sanctuary to grow your grid and show up in recent activity.
                </p>
                <div className="mt-4 rounded-md border border-[#1f2023] bg-[#1e1f22] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d7078]">Mission</p>
                  <p className="mt-2 text-sm text-[#b5bac1]">
                    Building a digital sanctuary where creators and communities gather through story, sound, and live
                    connection.
                  </p>
                </div>
              </TwitchPanel>

              <TwitchPanel title="Recent activity" subtitle="Latest moments">
                {gridPosts.length === 0 ? (
                  <p className="text-sm text-[#949ba4]">No posts yet. Share from Sanctuary.</p>
                ) : (
                  <ul className="max-h-56 space-y-2 overflow-y-auto pr-1 scrollbar-hide">
                    {gridPosts.slice(0, 6).map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/sanctuary/${p.id}`}
                          className="flex gap-2 rounded-md border border-transparent px-2 py-2 text-left transition hover:border-[#1f2023] hover:bg-[#1e1f22]"
                        >
                          <Activity size={14} className="mt-0.5 shrink-0 text-[#5865f2]" />
                          <span className="min-w-0">
                            <span className="block truncate text-xs text-[#ececec]">
                              {(p.content || "New post").slice(0, 80)}
                              {(p.content || "").length > 80 ? "…" : ""}
                            </span>
                            <span className="text-[10px] text-[#6d7078]">
                              {formatActivityDate(p.created_at) || "Sanctuary"}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </TwitchPanel>

              <TwitchPanel title="Links" subtitle="Social & hubs">
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-md border border-[#1f2023] bg-[#1e1f22] px-3 py-2 text-xs font-medium text-[#b5bac1] hover:bg-[#2b2d31]"
                  >
                    <Instagram size={14} />
                    Instagram
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-md border border-[#1f2023] bg-[#1e1f22] px-3 py-2 text-xs font-medium text-[#b5bac1] hover:bg-[#2b2d31]"
                  >
                    <Facebook size={14} />
                    Facebook
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-md border border-[#1f2023] bg-[#1e1f22] px-3 py-2 text-xs font-medium text-[#b5bac1] hover:bg-[#2b2d31]"
                  >
                    <Youtube size={14} />
                    YouTube
                  </a>
                  <Link
                    href="/hubs"
                    className="inline-flex items-center gap-2 rounded-md border border-[#1f2023] bg-[#1e1f22] px-3 py-2 text-xs font-medium text-[#00aff4] hover:bg-[#2b2d31]"
                  >
                    <LinkIcon size={14} />
                    Parable hubs
                  </Link>
                </div>
              </TwitchPanel>
              </div>

              {/* Mobile: stacked below info panels, above post feed */}
              <div className="lg:hidden">
                <ProfileWidgets profile={userProfile} />
              </div>

              {/* Tab strip (Twitch panel feel) */}
              <div className="flex rounded-md bg-[#1e1f22] p-1 ring-1 ring-[#1f2023]">
              <button
                type="button"
                onClick={() => setProfileTab("posts")}
                className={`flex-1 rounded py-2.5 text-center text-sm font-semibold transition ${
                  profileTab === "posts" ? "bg-[#313338] text-[#ececec] shadow-sm" : "text-[#949ba4] hover:text-[#dbdee1]"
                }`}
              >
                Posts · {gridPosts.length}
              </button>
              <button
                type="button"
                onClick={() => setProfileTab("about")}
                className={`flex-1 rounded py-2.5 text-center text-sm font-semibold transition ${
                  profileTab === "about" ? "bg-[#313338] text-[#ececec] shadow-sm" : "text-[#949ba4] hover:text-[#dbdee1]"
                }`}
              >
                Details
              </button>
            </div>

            {profileTab === "posts" && (
              <TwitchPanel title="Posts" subtitle="Your Sanctuary grid">
                {gridPosts.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[#3f4147] py-12 text-center text-sm text-[#949ba4]">
                    No public posts yet. Share from{" "}
                    <Link href="/my-sanctuary" className="font-medium text-[#00aff4] hover:underline">
                      Sanctuary
                    </Link>
                    .
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    {gridPosts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/sanctuary/${p.id}`}
                        className="relative aspect-square overflow-hidden rounded-md bg-[#1e1f22]"
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
                          <div className="flex h-full items-center p-2 text-center text-[10px] text-[#6d7078]">
                            {(p.content ?? "").slice(0, 48)}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </TwitchPanel>
            )}

            {profileTab === "about" && (
              <TwitchPanel title="Profile details" subtitle="At a glance">
                <div className="space-y-4 text-sm">
                  <div className="flex flex-col gap-1 border-b border-[#1f2023] pb-3">
                    <span className="text-xs text-[#6d7078]">Creator type</span>
                    <span className="font-semibold text-[#ececec]">{roleLabel}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-[#1f2023] pb-3">
                    <span className="flex items-center gap-2 text-xs text-[#6d7078]">
                      <CalendarDays size={14} className="text-[#5865f2]" /> Joined
                    </span>
                    <span className="font-semibold text-[#ececec]">Jan 2026</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-xs text-[#6d7078]">
                      <Wallet size={14} className="text-[#5865f2]" /> Support wallet
                    </span>
                    <span className="font-semibold text-[#ececec]">Enabled</span>
                  </div>
                </div>
              </TwitchPanel>
            )}

            <TwitchPanel title="Support" subtitle="Bless this creator">
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
            </TwitchPanel>

            <div className="grid gap-4 md:grid-cols-2">
              <TwitchPanel title="Quick amounts" subtitle="One-tap tiers">
                <div className="grid grid-cols-2 gap-2">
                  {["$10", "$25", "$50", "$100", "$250", "$500"].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="rounded-md border border-[#1f2023] bg-[#1e1f22] px-3 py-3 text-xs font-bold text-[#00d166] transition hover:bg-[#2b2d31]"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </TwitchPanel>
              <TwitchPanel title="Signals" subtitle="Community pulse">
                <ul className="space-y-2 text-xs text-[#949ba4]">
                  {[
                    "24 new supporters this week",
                    "Top seed amount today is $250",
                    "Offering goal is 68% complete",
                    "Most active support hour is 8 PM",
                  ].map((item) => (
                    <li key={item} className="rounded border border-[#1f2023] bg-[#1e1f22] px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </TwitchPanel>
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
