"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Crown,
  Eye,
  Gift,
  Hash,
  Instagram,
  Link as LinkIcon,
  Loader2,
  Settings,
  Sparkles,
  Trash2,
  User,
  Wallet,
  Youtube,
} from "lucide-react";
import HubBackground from "@/components/HubBackground";
import ProfileWidgets from "@/components/ProfileWidgets";
import { uploadAvatar } from "@/app/my-sanctuary/actions";
import { useAuth } from "@/hooks/useAuth";
import { useProfilePostsLive } from "@/hooks/useProfilePostsLive";
import { uploadUserAvatarFromDataUrl } from "@/lib/avatar-storage";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { PROFILE_STYLE } from "@/lib/constants";
import { persistAvatarPublicUrlToProfile } from "@/lib/profile-avatar";
import {
  auraFromStreak,
  estimateInfluence,
  parseCreatorCategories,
  primaryCategory,
  readSanctuarySeeds,
  readSanctuaryStreak,
} from "@/lib/sanctuary-creator-state";
import { createClient } from "@/utils/supabase/client";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import { deletePost } from "@/lib/content-delete";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  status_text: string | null;
};

type PostLite = {
  id: string;
  media_url: string | null;
  content: string | null;
  created_at: string | null;
  post_type?: string | null;
};

const SUPPORT_TIERS = [
  {
    name: "Seed",
    amount: "$5/mo",
    perks: "Badge · chat highlight",
    borderClass: "border-emerald-500/30",
  },
  {
    name: "Partner",
    amount: "$15/mo",
    perks: "Emotes · early VOD",
    borderClass: "border-[#00f2ff]/35",
  },
  {
    name: "Patron",
    amount: "$35/mo",
    perks: "Monthly Q&A · name on stream",
    borderClass: "border-violet-400/35",
  },
  {
    name: "Ministry circle",
    amount: "$100/mo",
    perks: "Private prayer slot · ministry shout",
    borderClass: "border-amber-400/35",
  },
] as const;

function SupportCard({
  name,
  amount,
  perks,
  borderClass,
}: {
  name: string;
  amount: string;
  perks: string;
  borderClass: string;
}) {
  return (
    <div className={`rounded-2xl border bg-black/45 px-5 py-5 ${borderClass} ${PROFILE_STYLE.supportCard}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{name}</p>
          <p className="mt-1 text-sm text-white/50">{perks}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold tabular-nums text-white">{amount}</p>
          <Link
            href="/contribution-tiers"
            className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-[#00f2ff] hover:underline"
          >
            View tiers
          </Link>
        </div>
      </div>
    </div>
  );
}

function ParableSidebarCard({
  profile,
  displayName,
  handle,
  category,
  avatarSrc,
  avatarUploading,
  onAvatarClick,
  followers,
  following,
  postCount,
  streakDays,
  seeds,
  influence,
  aura,
}: {
  profile: ProfileRow;
  displayName: string;
  handle: string;
  category: string;
  avatarSrc: string | null;
  avatarUploading: boolean;
  onAvatarClick: () => void;
  followers: number;
  following: number;
  postCount: number;
  streakDays: number;
  seeds: number;
  influence: number;
  aura: "cyan" | "gold";
}) {
  const auraRing =
    aura === "gold"
      ? "from-amber-400/50 to-orange-500/30 shadow-[0_0_40px_rgba(251,191,36,0.2)]"
      : "from-[#00f2ff]/50 to-fuchsia-500/30 shadow-[0_0_40px_rgba(0,242,255,0.2)]";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black/45 p-6 shadow-[0_0_60px_rgba(0,242,255,0.08)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#00f2ff]/10 blur-3xl" />
      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="relative">
          <div className={`absolute -inset-1 rounded-full bg-gradient-to-br opacity-80 blur-md ${auraRing}`} />
          <button
            type="button"
            onClick={onAvatarClick}
            disabled={avatarUploading}
            className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#030306] bg-black/80 disabled:cursor-wait disabled:opacity-70"
            aria-label="Update profile photo"
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={fallbackAvatarOnError}
              />
            ) : (
              <User className="m-auto text-[#00f2ff]" size={48} />
            )}
            {avatarUploading ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55">
                <Loader2 className="h-6 w-6 animate-spin text-[#00f2ff]" />
              </span>
            ) : null}
          </button>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#00f2ff]/70">
            Parable command center
          </p>
          <h1 className="mt-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            {displayName}
          </h1>
          <p className="mt-1 font-mono text-sm text-[#00f2ff]/80">@{handle}</p>
          <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60">
            {category}
          </p>
        </div>

        <button
          type="button"
          onClick={onAvatarClick}
          disabled={avatarUploading}
          className="text-[10px] font-black uppercase tracking-[0.22em] text-[#00f2ff]/80 transition hover:text-[#00f2ff] disabled:opacity-50"
        >
          Update photo
        </button>

        {profile.bio ? (
          <p className="max-w-xs text-sm leading-relaxed text-white/55">{profile.bio}</p>
        ) : null}

        <div className="grid w-full grid-cols-3 gap-2 border-t border-white/[0.06] pt-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-3">
            <p className="text-lg font-bold text-white">{postCount}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">Posts</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-3">
            <p className="text-lg font-bold text-white">{followers}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">Followers</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-3">
            <p className="text-lg font-bold text-white">{following}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">Following</p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#00f2ff]/20 bg-[#00f2ff]/[0.04] px-3 py-2.5 text-left">
            <Activity className="h-4 w-4 shrink-0 text-[#00f2ff]" aria-hidden />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Streak</p>
              <p className="text-sm font-bold text-white">{streakDays} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/[0.06] px-3 py-2.5 text-left">
            <Gift className="h-4 w-4 shrink-0 text-violet-300" aria-hidden />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Seeds</p>
              <p className="text-sm font-bold text-white">{seeds.toLocaleString()}</p>
            </div>
          </div>
          <div className="col-span-2 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left">
            <Eye className="h-4 w-4 shrink-0 text-[#00f2ff]/70" aria-hidden />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Influence signal</p>
              <p className="text-sm font-bold text-white">{influence.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap justify-center gap-2 border-t border-white/[0.06] pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/45">
            <Instagram className="h-3.5 w-3.5" aria-hidden />
            Social
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/45">
            <Youtube className="h-3.5 w-3.5" aria-hidden />
            Channel
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/45">
            <LinkIcon className="h-3.5 w-3.5" aria-hidden />
            Link hub
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/45">
            <Hash className="h-3.5 w-3.5" aria-hidden />
            Tags
          </span>
        </div>

        <Link
          href="/profile"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#00f2ff]/35 bg-[#00f2ff]/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-[#00f2ff] transition hover:bg-[#00f2ff]/20"
        >
          View profile
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

async function compressImageToDataUrl(file: File): Promise<string | null> {
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
}

function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url.split("?")[0] ?? "");
}

export default function ProfileCommandCenterView() {
  const router = useRouter();
  const { userProfile, avatarUrl, loading: authLoading, applyAvatarFromUpload, refreshProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [posts, setPosts] = useState<PostLite[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const [creatorStreak, setCreatorStreak] = useState(0);
  const [creatorSeeds, setCreatorSeeds] = useState(100);
  const [pendingDeletePostId, setPendingDeletePostId] = useState<string | null>(null);
  const [deletePostLoading, setDeletePostLoading] = useState(false);

  const userId = userProfile?.id ? String(userProfile.id) : "";

  const reloadLayout = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    setLoading(true);

    const [profileRes, postsRes, followersRes, followingRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, bio, role, status_text")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("posts")
        .select("id, media_url, content, created_at, post_type")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId),
    ]);

    if (profileRes.data) setProfile(profileRes.data as ProfileRow);
    setPosts((postsRes.data ?? []) as PostLite[]);
    setFollowers(followersRes.count ?? 0);
    setFollowing(followingRes.count ?? 0);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    if (!userProfile?.id) {
      router.replace("/login?next=/profile/command-center");
      return;
    }
    void reloadLayout();
  }, [authLoading, userProfile?.id, router, reloadLayout]);

  useEffect(() => {
    setCreatorStreak(readSanctuaryStreak());
    setCreatorSeeds(readSanctuarySeeds());
  }, []);

  useProfilePostsLive(userId || undefined, () => {
    void reloadLayout();
  });

  const confirmDeletePost = async () => {
    if (!pendingDeletePostId || deletePostLoading) return;
    setDeletePostLoading(true);
    try {
      const supabase = createClient();
      await deletePost(supabase, pendingDeletePostId);
      setPosts((prev) => prev.filter((p) => p.id !== pendingDeletePostId));
      setPendingDeletePostId(null);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not delete post.");
    } finally {
      setDeletePostLoading(false);
    }
  };

  const openAvatarPicker = () => {
    if (avatarUploading) return;
    avatarInputRef.current?.click();
  };

  const handleChangeProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !userId) return;

    const dataUrl = await compressImageToDataUrl(file);
    if (!dataUrl) return;

    setLocalAvatarPreview(dataUrl);
    setAvatarUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) return;

      const uploaded = await uploadUserAvatarFromDataUrl(supabase, user.id, dataUrl);
      if ("error" in uploaded) return;

      const username = profile?.username?.trim() || "member";
      const fullName = profile?.full_name?.trim() || username;
      const saved = await persistAvatarPublicUrlToProfile(supabase, user.id, uploaded.publicUrl, {
        username,
        full_name: fullName,
      });
      if (!saved.ok) return;

      applyAvatarFromUpload(uploaded.publicUrl);
      const res = await uploadAvatar(user.id, uploaded.publicUrl);
      if (res.success) {
        setProfile((prev) => (prev ? { ...prev, avatar_url: uploaded.publicUrl } : prev));
        refreshProfile();
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  if (authLoading || (loading && !profile)) {
    return (
      <div className="relative min-h-[50vh] overflow-hidden bg-[#030306] pb-parable-bottom">
        <div className="fixed inset-0 z-0">
          <HubBackground />
        </div>
        <div className="relative z-10 flex min-h-[50vh] flex-col items-center justify-center gap-4 text-white/40">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00f2ff]/30 border-t-[#00f2ff]" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00f2ff]/60">
            Loading command center
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="relative flex min-h-[50vh] flex-col items-center justify-center gap-4 overflow-hidden bg-[#030306] px-4 text-center pb-parable-bottom">
        <div className="fixed inset-0 z-0">
          <HubBackground />
        </div>
        <div className="relative z-10 max-w-sm rounded-2xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#00f2ff]/60" />
          <p className="text-sm text-white/60">Profile not ready yet.</p>
          <Link
            href="/profile"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#00f2ff] to-cyan-400 py-3 text-xs font-black uppercase tracking-wider text-black"
          >
            View profile
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.username || profile.full_name || "Member";
  const handle = profile.username || displayName;
  const categories = parseCreatorCategories(profile.role);
  const category = primaryCategory(categories);
  const avatarSrc = localAvatarPreview || (avatarUrl !== "/logo.svg" ? avatarUrl : profile.avatar_url);
  const influence = estimateInfluence(posts.length, following);
  const aura = auraFromStreak(creatorStreak);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#030306] pb-parable-bottom text-white selection:bg-[#00f2ff]/25">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleChangeProfilePicture(e)}
      />

      <div className="fixed inset-0 z-0">
        <HubBackground />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#00f2ff]/[0.05] via-transparent to-black/90" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,242,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.12)_1px,transparent_1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.08] bg-black/70 px-4 py-3.5 backdrop-blur-xl">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.35em] text-[#00f2ff]/60">Command center</p>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/85">Parable profile hub</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/70 transition hover:border-[#00f2ff]/35 hover:text-[#00f2ff]"
          >
            View profile
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-[#00f2ff]/35 bg-[#00f2ff]/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-[#00f2ff] transition hover:bg-[#00f2ff]/20"
          >
            <Settings className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </header>

      <div className={`relative z-10 ${PROFILE_STYLE.bodyGrid}`}>
        <aside className="space-y-4 lg:col-span-1">
          <ParableSidebarCard
            profile={profile}
            displayName={displayName}
            handle={handle}
            category={category}
            avatarSrc={avatarSrc}
            avatarUploading={avatarUploading}
            onAvatarClick={openAvatarPicker}
            followers={followers}
            following={following}
            postCount={posts.length}
            streakDays={creatorStreak}
            seeds={creatorSeeds}
            influence={influence}
            aura={aura}
          />
          <ProfileWidgets profile={profile} />
        </aside>

        <div className="space-y-10 lg:col-span-2">
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#00f2ff]/90">
                  <Crown className="h-4 w-4" aria-hidden />
                  Support tiers
                </h3>
                <p className="mt-2 max-w-xl text-sm text-white/45">
                  Reserve supporter intent and ministry tiers. Checkout wiring lands on contribution tiers.
                </p>
              </div>
              <Link
                href="/contribution-tiers"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00f2ff] hover:underline"
              >
                <Wallet className="h-4 w-4" aria-hidden />
                Giving hub
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {SUPPORT_TIERS.map((tier) => (
                <SupportCard key={tier.name} {...tier} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#00f2ff]/90">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]" />
                Posts grid
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-white/35">
                <CalendarDays className="h-3.5 w-3.5 text-[#00f2ff]/70" aria-hidden />
                Latest sanctuary media
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {posts.length === 0 ? (
                <div className="col-span-3 rounded-2xl border border-dashed border-[#00f2ff]/25 bg-[#00f2ff]/[0.03] px-4 py-12 text-center">
                  <p className="text-sm text-white/45">No posts yet — share from your sanctuary feed.</p>
                  <Link
                    href="/profile"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00f2ff] hover:underline"
                  >
                    Profile
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-black/50 transition hover:border-[#00f2ff]/40 hover:shadow-[0_0_20px_rgba(0,242,255,0.12)]"
                  >
                    <Link href={`/sanctuary/${post.id}`} className="block h-full w-full">
                      {post.media_url ? (
                        isVideoUrl(post.media_url) ? (
                          <video src={post.media_url} className="h-full w-full object-cover" muted playsInline />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.media_url} alt="" className="h-full w-full object-cover" />
                        )
                      ) : (
                        <div className="flex h-full items-center p-1 text-center text-[10px] text-white/35">
                          {(post.content ?? "").slice(0, 40)}
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPendingDeletePostId(post.id);
                      }}
                      className="absolute right-1.5 top-1.5 z-10 rounded-full bg-black/70 p-1.5 text-white/80 opacity-0 transition hover:bg-red-600/90 hover:text-white group-hover:opacity-100"
                      aria-label="Delete post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/streamers"
              className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/40 px-5 py-4 transition hover:border-[#00f2ff]/30"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Studio</p>
                <p className="mt-1 text-sm font-semibold text-white">Open streamer command deck</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#00f2ff] transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              href="/sanctuary"
              className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/40 px-5 py-4 transition hover:border-[#00f2ff]/30"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Sanctuary feed</p>
                <p className="mt-1 text-sm font-semibold text-white">Publish from the home composer</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#00f2ff] transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </section>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={Boolean(pendingDeletePostId)}
        title="Delete post?"
        description="This permanently removes the post from your profile and feed."
        loading={deletePostLoading}
        onCancel={() => setPendingDeletePostId(null)}
        onConfirm={() => void confirmDeletePost()}
      />
    </div>
  );
}
