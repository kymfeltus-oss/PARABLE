"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import InstagramPost from "@/components/feed/InstagramPost";
import SanctuaryFeedTopBar from "@/components/feed/SanctuaryFeedTopBar";
import SanctuaryPostComposer from "@/components/sanctuary/SanctuaryPostComposer";
import { useAuth } from "@/hooks/useAuth";
import { loadAllTestimonies, saveTestimonies, TESTIMONY_STORAGE_KEY } from "@/lib/testimony-storage";
import { RECOMMENDED_SANCTUARY_CHANNELS, type SanctuaryChannel } from "@/lib/sanctuary-following";
import { SanctuaryFollowingPanel } from "@/components/sanctuary/SanctuaryFollowingPanel";
import { useRegisteredProfileSuggestions } from "@/hooks/useRegisteredProfileSuggestions";
import { useSanctuaryFollowGraph } from "@/hooks/useSanctuaryFollowGraph";
import SanctuaryCommandHeader from "@/components/sanctuary/SanctuaryCommandHeader";
import SanctuaryBioModule from "@/components/sanctuary/SanctuaryBioModule";
import SanctuaryCategoryUtility from "@/components/sanctuary/SanctuaryCategoryUtility";
import SanctuaryTestimonyWall from "@/components/sanctuary/SanctuaryTestimonyWall";
import SanctuaryLiveStatusCard from "@/components/sanctuary/SanctuaryLiveStatusCard";

type TestimonyPost = {
  id: number;
  user: string;
  time: string;
  tag: string;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | null;
  mediaName?: string;
  createdAt: number;
  stats: {
    amens: number;
    comments: number;
    shares: number;
    praiseBreaks: number;
    claps: number;
    dances: number;
    shouts: number;
  };
  reactions?: Record<string, number>;
};

const REACTION_EMOJIS = ["🙏", "❤️", "👏"] as const;

type SanctuaryFeedRow = {
  id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  profiles?: Record<string, unknown> | Record<string, unknown>[] | null;
  post_likes?: { count?: number }[] | null;
};

function normalizeProfileEmbed(raw: SanctuaryFeedRow["profiles"]) {
  const one = Array.isArray(raw) ? raw[0] : raw;
  if (!one || typeof one !== "object") return null;
  const p = one as Record<string, unknown>;
  const id = p.id;
  if (id == null) return null;
  return {
    id: String(id),
    full_name: (p.full_name as string | null | undefined) ?? null,
    avatar_url: (p.avatar_url as string | null | undefined) ?? null,
    username: (p.username as string | null | undefined) ?? null,
    status_text: (p.status_text as string | null | undefined) ?? null,
    is_live: typeof p.is_live === "boolean" ? p.is_live : null,
  };
}

function pickLikesCount(row: SanctuaryFeedRow): number {
  const raw = row.post_likes;
  if (!Array.isArray(raw) || raw.length === 0) return 0;
  const n = raw[0]?.count;
  return typeof n === "number" ? n : 0;
}

function formatRelativeTime(createdAt: number) {
  const diffMs = Date.now() - createdAt;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function loadMyTestimonies(username?: string | null) {
  try {
    const raw = window.localStorage.getItem(TESTIMONY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TestimonyPost[];
    if (!Array.isArray(parsed)) return [];
    const targetNames = [username]
      .filter(Boolean)
      .map((value) => String(value).trim().toUpperCase());
    return parsed
      .filter((post) => targetNames.includes(String(post.user).trim().toUpperCase()))
      .map((post) => {
        if (
          post.mediaUrl &&
          !post.mediaUrl.startsWith("data:") &&
          !post.mediaUrl.startsWith("http") &&
          !post.mediaUrl.startsWith("/")
        ) {
          return { ...post, mediaUrl: undefined, mediaType: null, mediaName: undefined };
        }
        return post;
      });
  } catch {
    return [];
  }
}

const BROWSE_TAGS = [
  "Faith & Prayer",
  "Testimonies",
  "Youth Ministry",
  "Worship",
  "Bible Study",
  "Healing",
  "Deliverance",
  "Gaming",
];

type LiveCategory = {
  id: string;
  title: string;
  subtitle: string;
  viewers: string;
  badges: string[];
  gradient: string;
  imageSrc?: string;
};

const LIVE_CHURCH_CATEGORIES: LiveCategory[] = [
  {
    id: "sunday-service",
    title: "Sunday Service Live",
    subtitle: "Sanctuary & Sermon",
    viewers: "181.3K watching",
    badges: ["Worship", "Word"],
    gradient: "from-emerald-500 via-teal-400 to-cyan-400",
    imageSrc: "/images/sunday-service-live.png",
  },
  {
    id: "choir-nights",
    title: "Choir Nights Live",
    subtitle: "Black Church Choirs",
    viewers: "134.4K watching",
    badges: ["Choir", "Music"],
    gradient: "from-violet-500 via-purple-500 to-indigo-400",
    imageSrc: "/images/choir-nights-live.png",
  },
  {
    id: "just-testifying",
    title: "Just Testifying",
    subtitle: "Praise Reports Only",
    viewers: "152.1K watching",
    badges: ["Testimony", "Community"],
    gradient: "from-fuchsia-500 via-pink-500 to-amber-400",
    imageSrc: "/images/just-testifying.png",
  },
  {
    id: "youth-revival",
    title: "Youth Revival",
    subtitle: "Gen Z on Fire",
    viewers: "55.4K watching",
    badges: ["Youth", "Revival"],
    gradient: "from-sky-500 via-cyan-400 to-lime-400",
    imageSrc: "/images/youth-revival.png",
  },
  {
    id: "creatives-real-talk",
    title: "Creatives Real Talk",
    subtitle: "Creators & Culture",
    viewers: "18.4K watching",
    badges: ["Creators", "Culture"],
    gradient: "from-cyan-500 via-blue-500 to-violet-500",
    imageSrc: "/images/creatives-real-talk.png",
  },
  {
    id: "street-church",
    title: "Street Church",
    subtitle: "Outreach & IRL",
    viewers: "18.4K watching",
    badges: ["Outreach", "Culture"],
    gradient: "from-amber-500 via-lime-400 to-emerald-500",
    imageSrc: "/images/street-church.png",
  },
];

export default function MySanctuaryPage() {
  const router = useRouter();
  const { userProfile, avatarUrl, loading } = useAuth();
  const { registeredChannels, registeredLoading, registeredError } = useRegisteredProfileSuggestions();
  const {
    followingIds,
    updateFollowingIds,
    customFollowers,
    updateCustomFollowers,
    allFollowers,
  } = useSanctuaryFollowGraph(registeredChannels);
  const displayName = userProfile?.username || userProfile?.full_name || "Your Sanctuary";

  const [testimonies, setTestimonies] = useState<TestimonyPost[]>([]);
  const [sanctuaryPosts, setSanctuaryPosts] = useState<SanctuaryFeedRow[]>([]);
  const [sanctuaryFeedLoading, setSanctuaryFeedLoading] = useState(true);
  const composerAnchorRef = useRef<HTMLDivElement | null>(null);

  const fetchSanctuaryPosts = useCallback(async () => {
    setSanctuaryFeedLoading(true);
    const supabase = createClient();

    // Disambiguate FK: `posts` may reference `profiles` more than once (e.g. author + editor).
    const res = await supabase
      .from("posts")
      .select("*, profiles:profile_id(*), post_likes(count)")
      .eq("category", "sanctuary")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data, error } = res;
    if (error) {
      console.error("My Sanctuary posts:", error.message);
      setSanctuaryPosts([]);
    } else {
      setSanctuaryPosts((data ?? []) as SanctuaryFeedRow[]);
    }
    setSanctuaryFeedLoading(false);
  }, []);

  useEffect(() => {
    if (loading || !userProfile) return;
    void fetchSanctuaryPosts();
  }, [loading, userProfile, fetchSanctuaryPosts]);

  useEffect(() => {
    const onPosted = () => {
      void fetchSanctuaryPosts();
    };
    window.addEventListener("parable:sanctuary-posted", onPosted);
    return () => window.removeEventListener("parable:sanctuary-posted", onPosted);
  }, [fetchSanctuaryPosts]);

  useEffect(() => {
    if (loading) return;
    const refresh = () => {
      const username = userProfile?.username || null;
      setTestimonies(loadMyTestimonies(username));
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("parable:testimonies-updated", refresh as EventListener);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("parable:testimonies-updated", refresh as EventListener);
    };
  }, [loading, userProfile?.username]);

  useEffect(() => {
    if (loading) return;
    if (!userProfile) router.replace("/login?next=/my-sanctuary");
  }, [loading, userProfile, router]);

  const followedAccounts = allFollowers.filter((f) => followingIds.includes(f.id));
  const liveFollowed = followedAccounts.filter((f) => f.isLive);

  const handleToggleFollow = (id: string) => {
    updateFollowingIds((current) =>
      current.includes(id) ? current.filter((fId) => fId !== id) : [...current, id]
    );
  };

  const handleAddCustom = (name: string, handle: string) => {
    const id = `custom-${Date.now()}`;
    const avatarLabel = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const follower: SanctuaryChannel = {
      id,
      name,
      handle,
      avatarLabel,
      isLive: false,
      viewers: "0",
    };
    updateCustomFollowers([...customFollowers, follower]);
    updateFollowingIds((current) => [...current, id]);
  };

  const handleRemoveCustomChannel = (id: string) => {
    if (!id.startsWith("custom-")) return;
    updateCustomFollowers(customFollowers.filter((c) => c.id !== id));
    updateFollowingIds((current) => current.filter((x) => x !== id));
  };

  const handleTestimonyReaction = (postId: number, emoji: string) => {
    const all = loadAllTestimonies();
    const updated = all.map((p) => {
      if (p.id !== postId) return p;
      const reactions = { ...(p.reactions || {}) };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...p, reactions };
    });
    if (saveTestimonies(updated)) {
      setTestimonies(loadMyTestimonies(userProfile?.username || null));
    }
  };

  if (loading || !userProfile) {
    return <div className="min-h-full bg-black" />;
  }

  const role = userProfile?.role as string | undefined;
  const bioText = (userProfile as { bio?: string | null })?.bio ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-black font-sans text-white">
      {/* Instagram-style fixed top: logo · search · actions (single row, no duplicate site header) */}
      <header className="sticky top-0 z-30 shrink-0">
        <SanctuaryFeedTopBar />
      </header>

      {/* Slim composer — same vertical rhythm as IG “new post” strip */}
      <div ref={composerAnchorRef} id="my-sanctuary-composer">
        <SanctuaryPostComposer variant="igHome" category="sanctuary" />
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-hide pb-parable-bottom">
        {sanctuaryFeedLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border border-[#00f2ff] border-t-transparent" />
          </div>
        ) : sanctuaryPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <h2 className="text-lg font-bold text-white">Welcome to the Sanctuary</h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-400">
              Share a photo or video above to light up the feed — your story belongs here.
            </p>
            <button
              type="button"
              onClick={() => composerAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="mt-6 rounded-full bg-[#00f2ff] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-300"
            >
              Be the first to post!
            </button>
          </div>
        ) : (
          <div className="w-full">
            {sanctuaryPosts.map((row) => {
              const author = normalizeProfileEmbed(row.profiles);
              return (
                <InstagramPost
                  key={row.id}
                  id={row.id}
                  content={row.content ?? ""}
                  image_url={row.media_url ?? undefined}
                  media_url={row.media_url ?? undefined}
                  media_type={row.media_type}
                  author={
                    author
                      ? {
                          id: author.id,
                          full_name: author.full_name ?? undefined,
                          username: author.username ?? undefined,
                          avatar_url: author.avatar_url ?? undefined,
                          status_text: author.status_text ?? undefined,
                          is_live: author.is_live ?? undefined,
                        }
                      : null
                  }
                  created_at={row.created_at}
                  likesCount={pickLikesCount(row)}
                />
              );
            })}
          </div>
        )}

        <section className="mx-3 mt-4 mb-8 rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-3">
          <p className="text-[11px] text-neutral-500">
            This tab shows posts where <span className="font-semibold text-neutral-400">category = sanctuary</span>.
            Open{" "}
            <button
              type="button"
              onClick={() => router.push("/sanctuary")}
              className="font-semibold text-[#00f2ff] underline-offset-2 hover:underline"
            >
              Sanctuary
            </button>{" "}
            for the full testimony portal.
          </p>
        </section>

        {/* Secondary tools: collapsed so the home tab stays visually like Instagram */}
        <div className="mx-3 mb-10 space-y-3">
          <details className="group rounded-2xl border border-neutral-800 bg-neutral-950/90">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-neutral-200 [&::-webkit-details-marker]:hidden">
              <span>Your sanctuary &amp; tools</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500 transition group-open:rotate-180" />
            </summary>
            <div className="space-y-4 border-t border-neutral-800 px-3 py-4">
              <SanctuaryCommandHeader
                displayName={displayName}
                role={role}
                avatarUrl={avatarUrl}
                followingCount={followingIds.length}
                testimonyCount={testimonies.length}
              />
              <SanctuaryBioModule role={role} bioText={bioText} fullName={userProfile?.full_name} />
              <SanctuaryLiveStatusCard liveFollowed={liveFollowed} isLiveMock={false} />
              <SanctuaryCategoryUtility role={role} router={router} />
              <SanctuaryTestimonyWall posts={testimonies} formatRelativeTime={formatRelativeTime} />
              {testimonies.length > 0 && (
                <section className="rounded-xl border border-neutral-800 bg-black/50 px-3 py-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">Local archive</p>
                  <p className="mt-1 text-[11px] text-neutral-500">Emoji reactions on device-stored testimonies.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {testimonies.slice(0, 4).map((post) => (
                      <div
                        key={post.id}
                        className="flex flex-wrap items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/80 px-2 py-1.5"
                      >
                        <span className="text-[10px] text-neutral-500">#{post.id}</span>
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleTestimonyReaction(post.id, emoji)}
                            className="rounded px-1 py-0.5 text-sm hover:bg-white/10"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-200">Live lanes</h3>
                  <button
                    type="button"
                    onClick={() => router.push("/streamers")}
                    className="text-[11px] text-[#00f2ff] hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                  {LIVE_CHURCH_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => router.push("/streamers")}
                      className="relative min-h-[140px] w-[140px] shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-black text-left"
                    >
                      <div
                        className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${!cat.imageSrc ? `bg-gradient-to-br ${cat.gradient}` : ""}`}
                        style={cat.imageSrc ? { backgroundImage: `url('${cat.imageSrc}')` } : undefined}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
                      <div className="relative z-10 flex min-h-[140px] flex-col justify-end gap-1 p-2.5">
                        <p className="text-[8px] font-semibold uppercase tracking-wide text-[#00f2ff]/90">
                          {cat.subtitle}
                        </p>
                        <p className="line-clamp-2 text-xs font-bold leading-snug text-white">{cat.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
              <details className="rounded-xl border border-neutral-800 bg-black/40">
                <summary className="cursor-pointer list-none px-3 py-3 text-sm font-medium text-neutral-200 [&::-webkit-details-marker]:hidden">
                  Network · follows &amp; discover
                </summary>
                <div className="border-t border-neutral-800 px-1 pb-3 pt-1">
                  <SanctuaryFollowingPanel
                    allChannels={allFollowers}
                    followingIds={followingIds}
                    registeredSuggestions={registeredChannels}
                    registeredLoading={registeredLoading}
                    registeredError={registeredError}
                    onToggleFollow={handleToggleFollow}
                    onAddCustom={handleAddCustom}
                    onRemoveCustomChannel={handleRemoveCustomChannel}
                    onOpenStreamers={() => router.push("/streamers")}
                  />
                  <div className="mt-3 px-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {BROWSE_TAGS.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-neutral-800 bg-neutral-900/80 px-2.5 py-0.5 text-[10px] text-neutral-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
              <section className="rounded-xl border border-neutral-800 bg-black/30 px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Curated</p>
                <div className="mt-2 space-y-1">
                  {RECOMMENDED_SANCTUARY_CHANNELS.slice(0, 4).map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => router.push("/streamers")}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-white/[0.04]"
                    >
                      <span className="font-medium text-neutral-200">{channel.name}</span>
                      <span className="text-[10px] text-emerald-400">{channel.viewers}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}
