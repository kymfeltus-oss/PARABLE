'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useVideoPraiseBreak } from '@/hooks/useVideoPraiseBreak';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Sparkles,
  Music2,
  ExternalLink,
  Radio,
  Video,
} from 'lucide-react';
import type { PortalPost } from '@/components/testify/TestifyLivePortalFeed';

function looksLikeMediaFile(url: string): boolean {
  const u = url.split('?')[0]?.toLowerCase() ?? '';
  return /\.(jpg|jpeg|png|webp|gif|avif|mp4|webm|mov|m4v)$/.test(u);
}

function externalLinkPresentation(url: string): { label: string; liveish: boolean } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    if (host.endsWith('twitch.tv') || host === 'twitch.tv') return { label: 'Twitch', liveish: true };
    if (host.endsWith('kick.com') || host === 'kick.com') return { label: 'Kick', liveish: true };
    if (host.endsWith('youtube.com') || host === 'youtu.be')
      return { label: 'YouTube', liveish: true };
    if (u.protocol === 'http:' || u.protocol === 'https:') return { label: 'Link', liveish: false };
  } catch {
    /* ignore */
  }
  return null;
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Props = {
  posts: PortalPost[];
  feedFilter: 'FOR YOU' | 'FOLLOWING' | 'LIVE';
  onFeedFilterChange: (f: 'FOR YOU' | 'FOLLOWING' | 'LIVE') => void;
  /** Shown in the top bar (e.g. sanctuary / profile name). */
  userDisplayName: string;
  userAvatarUrl?: string | null;
  /** Opens live studio / broadcast flow. */
  onGoLive?: () => void;
  /** Open Sanctuary Following (browse + discover) — e.g. `/following?tab=discover`. */
  onFollowingNavigate?: () => void;
  /** From Supabase `profiles.anointing_level`; >1 enables neon aura on feed avatar. */
  anointingLevel?: number;
  formatRelativeTime: (createdAt: number) => string;
  onAmen: (id: string | number) => void;
  onComment: (id: string | number) => void;
  onShare: (id: string | number) => void;
  onPraiseBreak: (id: string | number) => void;
  onOpenMenu: (user: string) => void;
  onStatusMessage: (msg: string) => void;
  onFocusComposer: () => void;
  /** Fills parent flex area (viewport-style feed). */
  fillViewport?: boolean;
};

export function TestifyTikTokFeed({
  posts,
  feedFilter,
  onFeedFilterChange,
  formatRelativeTime,
  onAmen,
  onComment,
  onShare,
  onPraiseBreak,
  onOpenMenu,
  onStatusMessage,
  onFocusComposer,
  userDisplayName,
  userAvatarUrl,
  onGoLive,
  onFollowingNavigate,
  anointingLevel = 1,
  fillViewport = true,
}: Props) {
  const [activeId, setActiveId] = useState<string | number | null>(posts[0]?.id ?? null);
  const [muted, setMuted] = useState(true);
  const [activeVideoEl, setActiveVideoEl] = useState<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string | number, HTMLVideoElement>>(new Map());
  const scrollObsRef = useRef<IntersectionObserver | null>(null);
  const prevFeedFilterRef = useRef(feedFilter);

  const praiseBreakActive = useVideoPraiseBreak(activeVideoEl, Boolean(activeVideoEl));

  useEffect(() => {
    if (activeId == null) {
      setActiveVideoEl(null);
      return;
    }
    const sync = () => setActiveVideoEl(videoRefs.current.get(activeId) ?? null);
    sync();
    const r = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(r);
  }, [activeId, posts]);

  const setVideoRef = useCallback((id: string | number, el: HTMLVideoElement | null) => {
    const m = videoRefs.current;
    if (el) m.set(id, el);
    else m.delete(id);
  }, []);

  useEffect(() => {
    if (posts.length && !posts.some((p) => p.id === activeId)) {
      setActiveId(posts[0].id);
    }
  }, [posts, activeId]);

  useEffect(() => {
    const id = activeId;
    videoRefs.current.forEach((video, vid) => {
      if (vid === id) {
        video.muted = muted;
        video.play().catch(() => {});
      } else {
        video.pause();
        try {
          video.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    });
  }, [activeId, muted, posts]);

  /** When the user switches For you / Following / Live, jump to the top and focus the first slide. */
  useEffect(() => {
    if (prevFeedFilterRef.current === feedFilter) return;
    prevFeedFilterRef.current = feedFilter;
    setActiveId(posts[0]?.id ?? null);
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [feedFilter, posts]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || posts.length === 0) return;

    const frame = requestAnimationFrame(() => {
      scrollObsRef.current?.disconnect();
      const obs = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.5)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible?.target) return;
          const raw = (visible.target as HTMLElement).dataset.postId;
          if (raw === undefined || raw === '') return;
          const match = posts.find((p) => String(p.id) === raw);
          if (match) setActiveId(match.id);
        },
        { root, threshold: [0.35, 0.5, 0.65, 0.8] }
      );
      scrollObsRef.current = obs;
      root.querySelectorAll('[data-tiktok-slide]').forEach((el) => obs.observe(el));
    });

    return () => {
      cancelAnimationFrame(frame);
      scrollObsRef.current?.disconnect();
      scrollObsRef.current = null;
    };
  }, [posts]);

  const feedHeader = (
    <div
      className={`z-40 flex shrink-0 flex-col border-b border-white/10 bg-black/75 backdrop-blur-xl ${
        fillViewport ? '' : 'sticky top-0'
      }`}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div
          className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-800 ${
            anointingLevel > 1
              ? 'border-2 border-cyan-400 shadow-[0_0_22px_rgba(34,211,238,0.7)] animate-pulse'
              : 'border border-white/15'
          }`}
          aria-hidden
        >
          {userAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white/70">
              {userInitials(userDisplayName)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-tight text-white">{userDisplayName}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">Testify feed</p>
        </div>
        {onGoLive ? (
          <button
            type="button"
            onClick={onGoLive}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/45 bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_0_18px_rgba(239,68,68,0.35)] transition hover:brightness-110 active:scale-[0.98]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <Video className="h-3.5 w-3.5 opacity-95" strokeWidth={2.5} />
            Go Live
          </button>
        ) : null}
      </div>

      <div
        className="flex gap-2 overflow-x-auto border-t border-white/5 px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Feed scope"
      >
        {(['FOR YOU', 'FOLLOWING', 'LIVE'] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={feedFilter === f}
            id={`testify-feed-tab-${f.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => {
              onFeedFilterChange(f);
              if (f === 'FOLLOWING') onFollowingNavigate?.();
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${
              feedFilter === f
                ? 'bg-[#00f2ff] text-black'
                : 'bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            {f === 'LIVE' ? 'Live' : f}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            onFocusComposer();
            onStatusMessage('CREATE — vertical video works best here');
          }}
          className="ml-auto shrink-0 rounded-full border border-[#00f2ff]/35 bg-[#00f2ff]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#00f2ff]"
        >
          Create
        </button>
      </div>
    </div>
  );

  const shellClass = fillViewport
    ? 'flex h-full min-h-0 w-full flex-1 flex-col bg-black'
    : 'flex max-h-[85vh] min-h-[420px] w-full flex-col overflow-hidden rounded-2xl border border-[#00f2ff]/20 bg-black shadow-[0_0_40px_rgba(0,242,255,0.08)]';

  const scrollWrapClass =
    'snap-y snap-mandatory overflow-y-auto overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

  if (posts.length === 0) {
    return (
      <div className={shellClass}>
        {feedHeader}
        <div
          className={`flex flex-col items-center justify-center gap-4 px-6 text-center ${fillViewport ? 'min-h-0 flex-1' : ''}`}
        >
          <Music2 className="h-12 w-12 text-[#00f2ff]/40" strokeWidth={1.25} />
          <p className="text-sm font-semibold text-white/80">No testimonies yet</p>
          <p className="max-w-xs text-xs text-white/45">
            Swipe-style feed is ready. Post a vertical video or photo — it will fill the screen like TikTok.
          </p>
          <button
            type="button"
            onClick={() => {
              onFocusComposer();
              onStatusMessage('READY TO CREATE');
            }}
            className="rounded-full bg-[#00f2ff] px-6 py-3 text-sm font-bold text-black"
          >
            Share first
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      {feedHeader}

      <div
        ref={containerRef}
        className={`${scrollWrapClass} h-full min-h-0 flex-1`}
        style={{ scrollSnapType: 'y mandatory' }}
        aria-label="Testimony feed — swipe up and down"
      >
        {posts.map((post) => {
          const streamOrLink =
            post.mediaUrl &&
            post.mediaType !== 'video' &&
            post.mediaType !== 'image' &&
            !looksLikeMediaFile(post.mediaUrl)
              ? externalLinkPresentation(post.mediaUrl)
              : null;

          return (
            <article
              key={post.id}
              data-tiktok-slide
              data-post-id={String(post.id)}
              className={`relative flex w-full shrink-0 snap-start snap-always flex-col bg-black ${
                fillViewport ? 'h-full min-h-full' : 'min-h-[min(85vh,720px)]'
              } ${praiseBreakActive && activeId === post.id ? 'animate-praise-shake' : ''}`}
            >
              <div className="absolute inset-0 overflow-hidden bg-zinc-950">
                {post.mediaType === 'video' && post.mediaUrl ? (
                  <video
                    ref={(el) => setVideoRef(post.id, el)}
                    src={post.mediaUrl}
                    className="h-full w-full object-cover"
                    loop
                    playsInline
                    muted={muted}
                    preload="metadata"
                  />
                ) : post.mediaType === 'image' && post.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />
                ) : streamOrLink && post.mediaUrl ? (
                  <div
                    className="relative flex h-full w-full flex-col items-center justify-center gap-5 bg-gradient-to-br from-violet-950 via-black to-[#0a1628] px-8"
                    style={{
                      backgroundImage:
                        'radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.2), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(0,242,255,0.12), transparent 45%)',
                    }}
                  >
                    {streamOrLink.liveish ? (
                      <span className="flex items-center gap-2 rounded-full border border-red-500/50 bg-red-600/25 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-100">
                        <Radio className="h-3.5 w-3.5 animate-pulse" />
                        Live / stream
                      </span>
                    ) : null}
                    <p className="text-center text-sm font-semibold text-white/80">
                      Opens in {streamOrLink.label}
                    </p>
                    {post.text ? (
                      <p className="line-clamp-6 text-center text-base leading-relaxed text-white/90">
                        {post.text}
                      </p>
                    ) : null}
                    <a
                      href={post.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#00f2ff] px-6 py-3 text-sm font-bold text-black shadow-[0_0_24px_rgba(0,242,255,0.35)] transition hover:brightness-110"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Watch or open
                    </a>
                  </div>
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-[#0a1628] px-6"
                    style={{
                      backgroundImage:
                        'radial-gradient(ellipse at 30% 20%, rgba(0,242,255,0.15), transparent 50%)',
                    }}
                  >
                    <p className="line-clamp-14 text-center text-lg font-medium leading-relaxed text-white/90">
                      {post.text}
                    </p>
                  </div>
                )}
              </div>

            {praiseBreakActive && activeId === post.id ? (
              <div
                className="pointer-events-none absolute inset-0 z-[22] bg-gradient-to-b from-amber-200/30 via-amber-400/20 to-amber-600/25 mix-blend-screen"
                aria-hidden
              />
            ) : null}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/95" />

            {post.mediaType === 'video' && post.mediaUrl ? (
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="pointer-events-auto absolute left-3 top-14 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            ) : null}

            <div className="pointer-events-auto absolute bottom-28 right-1 z-30 flex flex-col items-center gap-5 sm:right-2">
              <button
                type="button"
                onClick={() => {
                  onAmen(post.id);
                  onStatusMessage('AMEN');
                }}
                className="flex flex-col items-center gap-1 text-white"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition active:scale-90">
                  <Heart
                    className="h-6 w-6 text-[#00f2ff]"
                    fill={post.stats.amens > 0 ? 'currentColor' : 'none'}
                    strokeWidth={2}
                  />
                </span>
                <span className="text-[10px] font-bold tabular-nums text-white/90">
                  {post.stats.amens || 'Amen'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onComment(post.id)}
                className="flex flex-col items-center gap-1 text-white"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition active:scale-90">
                  <MessageCircle className="h-6 w-6 text-white" strokeWidth={2} />
                </span>
                <span className="text-[10px] font-bold tabular-nums text-white/90">
                  {post.stats.comments || '—'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onShare(post.id)}
                className="flex flex-col items-center gap-1 text-white"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition active:scale-90">
                  <Share2 className="h-6 w-6 text-white" strokeWidth={2} />
                </span>
                <span className="text-[10px] font-bold tabular-nums text-white/90">
                  {post.stats.shares || 'Share'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onPraiseBreak(post.id)}
                className="flex flex-col items-center gap-1 text-white"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/20 backdrop-blur-md transition active:scale-90">
                  <Sparkles className="h-6 w-6 text-amber-200" strokeWidth={2} />
                </span>
                <span className="text-[10px] font-bold text-amber-100/90">Praise</span>
              </button>
            </div>

            <div className="pointer-events-auto absolute bottom-0 left-0 right-14 z-30 p-3 pb-8 sm:right-16 sm:pb-10">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold leading-tight text-white drop-shadow-md">
                  @{post.user.replace(/\s+/g, '')}
                </span>
                <span className="rounded-full border border-[#00f2ff]/40 bg-[#00f2ff]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#00f2ff]">
                  {post.tag}
                </span>
              </div>
              {post.text && post.mediaUrl ? (
                <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-white/95 drop-shadow-md">
                  {post.text}
                </p>
              ) : null}
              <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40">
                {formatRelativeTime(post.createdAt)}
              </p>
              <button
                type="button"
                onClick={() => onOpenMenu(post.user)}
                className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white/35 underline-offset-2 hover:text-white/55"
              >
                More
              </button>
            </div>

            {activeId === post.id && post.mediaType === 'video' && post.mediaUrl ? (
              <div className="pointer-events-none absolute right-2 top-14 z-20 rounded-full border border-red-500/50 bg-red-600/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                Playing
              </div>
            ) : null}
          </article>
          );
        })}
      </div>

      <p className="shrink-0 border-t border-white/10 bg-black/90 px-2 py-1.5 text-center text-[9px] text-white/35">
        <span className="hidden sm:inline">Scroll or swipe · </span>
        <Link href="/sanctuary/praise-breaks" className="text-[#00f2ff]/80 underline-offset-2 hover:underline">
          Praise breaks
        </Link>
      </p>
    </div>
  );
}
