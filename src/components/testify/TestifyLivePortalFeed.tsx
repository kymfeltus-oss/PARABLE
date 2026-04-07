'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  MessageCircle,
  Radio,
  Share2,
  X,
  Minimize2,
  Users,
  Scissors,
  Gem,
  Flame,
  Sparkles,
  ChevronRight,
  Send,
} from 'lucide-react';
import type { AchievementToast, PostRipple } from '@/hooks/useActivityPulse';

export type PortalPost = {
  id: number;
  user: string;
  authorId?: string;
  time: string;
  tag: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | null;
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

const REACTION_EMOJIS = ['🙏', '❤️', '👏', '🙌', '😭', '🔥'] as const;

function happeningNow(post: PortalPost): boolean {
  return post.mediaType === 'video' || post.tag === 'WORSHIP' || post.tag === 'PRAYER';
}

/** High-engagement music session → electric orange ring (live worship with strong reactions). */
function highEngagementMusic(post: PortalPost): boolean {
  if (!happeningNow(post) || post.tag !== 'WORSHIP') return false;
  const energy =
    post.stats.amens + post.stats.comments + post.stats.dances + post.stats.claps + post.stats.shouts;
  return energy >= 4;
}

type Props = {
  posts: PortalPost[];
  feedFilter: 'FOR YOU' | 'FOLLOWING' | 'LIVE';
  onFeedFilterChange: (f: 'FOR YOU' | 'FOLLOWING' | 'LIVE') => void;
  portalSection: 'pulse' | 'archive';
  onPortalSectionChange: (s: 'pulse' | 'archive') => void;
  streak: number;
  faithfulUnlocked: boolean;
  gems: number;
  onSpendGems?: (amount: number) => void;
  pipUrl: string | null;
  pipTitle: string | null;
  onSetPip: (url: string | null, title: string | null) => void;
  praiseBurstPostId: number | null;
  musicPulsePostId: number | null;
  formatRelativeTime: (createdAt: number) => string;
  onAmen: (id: number) => void;
  onComment: (id: number) => void;
  onShare: (id: number) => void;
  onPraiseBreak: (id: number) => void;
  onReaction: (id: number, emoji: string) => void;
  onPraiseAction: (id: number, action: 'CLAP' | 'DANCE' | 'SHOUT') => void;
  onOpenMenu: (user: string) => void;
  onStatusMessage: (msg: string) => void;
  emptyFeedFilter: 'FOR YOU' | 'FOLLOWING' | 'LIVE';
  onFocusComposer: () => void;
  onFindPeople: () => void;
  rippleByPostId: Map<number, PostRipple>;
  /** Seek PiP after join-from-sidebar (seconds); parent clears via onPipSeekConsumed. */
  pipSeekSeconds: number | null;
  onPipSeekConsumed: () => void;
  toasts: AchievementToast[];
  dismissToast: (id: string) => void;
  congratulateToast: (id: string) => void;
};

export function TestifyLivePortalFeed({
  posts,
  feedFilter,
  onFeedFilterChange,
  portalSection,
  onPortalSectionChange,
  streak,
  faithfulUnlocked,
  gems,
  onSpendGems,
  pipUrl,
  pipTitle,
  onSetPip,
  praiseBurstPostId,
  musicPulsePostId,
  formatRelativeTime,
  onAmen,
  onComment,
  onShare,
  onPraiseBreak,
  onReaction,
  onPraiseAction,
  onOpenMenu,
  onStatusMessage,
  emptyFeedFilter,
  onFocusComposer,
  onFindPeople,
  rippleByPostId,
  pipSeekSeconds,
  onPipSeekConsumed,
  toasts,
  dismissToast,
  congratulateToast,
}: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showJoinOverlay, setShowJoinOverlay] = useState(false);
  const [sentiment, setSentiment] = useState(50);
  const [branchPick, setBranchPick] = useState<'acoustic' | 'band' | null>(null);
  const [raidAccepted, setRaidAccepted] = useState(false);
  const [microChatPostId, setMicroChatPostId] = useState<number | null>(null);
  const [microChatDraft, setMicroChatDraft] = useState('');
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);

  const expanded = useMemo(
    () => (expandedId == null ? null : posts.find((p) => p.id === expandedId) ?? null),
    [expandedId, posts]
  );

  useEffect(() => {
    if (!pipUrl || !pipVideoRef.current) return;
    pipVideoRef.current.play().catch(() => {});
  }, [pipUrl]);

  useEffect(() => {
    const v = pipVideoRef.current;
    if (!v || pipSeekSeconds == null) return;
    const seekVal = pipSeekSeconds;
    const onMeta = () => {
      try {
        v.currentTime = seekVal;
      } catch {
        /* ignore */
      }
      onPipSeekConsumed();
    };
    v.addEventListener('loadedmetadata', onMeta, { once: true });
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [pipUrl, pipSeekSeconds, onPipSeekConsumed]);

  const handleHuddle = useCallback(() => {
    onStatusMessage('HUDDLE: Voice rooms are coming soon — invite friends from Following.');
  }, [onStatusMessage]);

  const handleClip = useCallback(
    (postId: number) => {
      onStatusMessage(`CLIP: 10s lyric/scripture reels for post #${postId} — pipeline coming soon.`);
    },
    [onStatusMessage]
  );

  const handleThrowGem = useCallback(() => {
    if (!onSpendGems) return;
    if (gems < 5) {
      onStatusMessage('Need more Gems — visit tomorrow to earn.');
      return;
    }
    onSpendGems(5);
    onStatusMessage('You sent 5 Gems — creators will cash out when live.');
  }, [gems, onSpendGems, onStatusMessage]);

  const minimizeCurrentToPip = useCallback(() => {
    if (!expanded?.mediaUrl || expanded.mediaType !== 'video') {
      onStatusMessage('PiP needs a video post — open a clip with video.');
      return;
    }
    onSetPip(expanded.mediaUrl, `${expanded.user} · ${expanded.tag}`);
    setExpandedId(null);
    onStatusMessage('Playing in mini player — scroll the portal freely.');
  }, [expanded, onSetPip, onStatusMessage]);

  return (
    <div className="space-y-4">
      {/* Pulse vs Archive */}
      <div className="rounded-2xl border border-[#00f2ff]/20 bg-gradient-to-r from-[#00f2ff]/10 via-black/40 to-fuchsia-500/10 p-1 flex gap-1">
        {(['pulse', 'archive'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onPortalSectionChange(key)}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
              portalSection === key
                ? 'bg-black/70 text-[#00f2ff] shadow-[0_0_24px_rgba(0,242,255,0.2)]'
                : 'text-white/45 hover:text-white/75'
            }`}
          >
            {key === 'pulse' ? 'The Pulse' : 'The Archive'}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-white/40 uppercase tracking-[6px] -mt-2 px-1">
        {portalSection === 'pulse'
          ? 'Trending energy · live-adjacent tiles first'
          : 'Slower scroll · deeper posts (AI picks coming)'}
      </p>

      {/* Streak + Gems + badge */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-black/50">
          <Flame className="h-4 w-4 text-orange-400 shrink-0" />
          <span className="text-[11px] font-bold text-white/90">
            Streak <span className="text-[#00f2ff] tabular-nums">{streak}</span> day{streak === 1 ? '' : 's'}
          </span>
        </div>
        {faithfulUnlocked ? (
          <span className="px-3 py-2 rounded-xl border border-amber-400/40 bg-amber-500/10 text-[10px] font-black uppercase tracking-wider text-amber-200">
            Faithful Listener
          </span>
        ) : (
          <span className="text-[10px] text-white/35 uppercase tracking-[6px]">
            5-day streak unlocks badge
          </span>
        )}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-violet-400/25 bg-violet-500/10 ml-auto">
          <Gem className="h-4 w-4 text-violet-300 shrink-0" />
          <span className="text-[11px] font-bold tabular-nums text-white/90">{gems}</span>
          <span className="text-[9px] text-white/40 uppercase tracking-wider hidden sm:inline">Gems</span>
        </div>
      </div>

      {/* Community raid demo */}
      <div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-transparent p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[8px] text-fuchsia-300/90">
              Community raid
            </p>
            <p className="text-sm text-white/85 mt-1 leading-snug">
              Service ended — send viewers to tonight’s artist?
            </p>
          </div>
          <Users className="h-5 w-5 text-fuchsia-400 shrink-0" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {!raidAccepted ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setRaidAccepted(true);
                  onStatusMessage('Raid accepted — your Pulse will bias music tiles (demo).');
                }}
                className="px-4 py-2 rounded-full bg-fuchsia-500 text-black text-[11px] font-bold"
              >
                Join raid
              </button>
              <button
                type="button"
                onClick={() => onStatusMessage('Raid dismissed')}
                className="px-4 py-2 rounded-full border border-white/15 text-[11px] text-white/70"
              >
                Not now
              </button>
            </>
          ) : (
            <p className="text-[11px] text-fuchsia-200/90">You’re in the raid wave — feed updates together.</p>
          )}
        </div>
      </div>

      {/* Story-stream prompt + branching demo */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
          <p className="text-[10px] text-[#00f2ff] uppercase tracking-[6px] flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Prompt of the day
          </p>
          <p className="text-sm text-white/85 mt-2 font-medium leading-relaxed">
            What are you thankful for? Reply with a 15s micro-testimony — chains into one story.
          </p>
          <button
            type="button"
            onClick={() => {
              onFocusComposer();
              onStatusMessage('Record micro-testimony from composer (video) — chains coming soon.');
            }}
            className="mt-3 text-[11px] font-bold text-[#00f2ff] flex items-center gap-1"
          >
            Add your link <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
          <p className="text-[10px] text-white/45 uppercase tracking-[6px]">Choose your path</p>
          <p className="text-sm text-white/85 mt-2">Next drop: acoustic or full band?</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setBranchPick('acoustic')}
              className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                branchPick === 'acoustic'
                  ? 'border-[#00f2ff] bg-[#00f2ff]/15 text-[#00f2ff]'
                  : 'border-white/15 text-white/70 hover:border-white/30'
              }`}
            >
              Acoustic teaser
            </button>
            <button
              type="button"
              onClick={() => setBranchPick('band')}
              className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                branchPick === 'band'
                  ? 'border-fuchsia-400 bg-fuchsia-500/15 text-fuchsia-200'
                  : 'border-white/15 text-white/70 hover:border-white/30'
              }`}
            >
              Full band
            </button>
          </div>
          {branchPick ? (
            <p className="mt-2 text-[10px] text-white/50">
              Branching playback unlocks when creators publish linked clips.
            </p>
          ) : null}
        </div>
      </div>

      {/* Sentiment slider demo */}
      <div className="rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 to-transparent p-4">
        <p className="text-[10px] font-black uppercase tracking-[6px] text-orange-200/90">
          Sentiment slider
        </p>
        <p className="text-xs text-white/60 mt-1">How much does this moment resonate? (demo aggregate)</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xl" aria-hidden>
            🙏
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={sentiment}
            onChange={(e) => setSentiment(Number(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none bg-white/10 accent-orange-400"
            aria-label="Sentiment"
          />
          <span className="text-xl" aria-hidden>
            🔥
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-black/50 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
            style={{ width: `${sentiment}%` }}
          />
          <div className="flex-1 bg-white/5 relative">
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white/30 uppercase tracking-widest">
              timeline heat
            </span>
          </div>
        </div>
      </div>

      {/* Sub-filters */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/40 border border-white/10">
        {(['FOR YOU', 'FOLLOWING', 'LIVE'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onFeedFilterChange(tab)}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all ${
              feedFilter === tab
                ? 'bg-[#00f2ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.35)]'
                : 'text-white/45 hover:text-white/80'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              {tab === 'LIVE' ? <Radio className="h-3.5 w-3.5 opacity-80 shrink-0" /> : null}
              {tab}
            </span>
          </button>
        ))}
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const live = happeningNow(post);
          const musicHot = highEngagementMusic(post);
          const burst = praiseBurstPostId === post.id;
          const musicPulse = musicPulsePostId === post.id;
          const ripple = rippleByPostId.get(post.id);
          const portalRing =
            live && musicHot
              ? 'border-transparent shadow-[0_0_22px_rgba(255,107,44,0.45),0_0_48px_rgba(255,140,60,0.2)] ring-2 ring-[#ff6b2c]/75 ring-offset-2 ring-offset-[#050508]'
              : live
                ? 'border-transparent shadow-[0_0_20px_rgba(0,242,255,0.35),0_0_40px_rgba(168,85,247,0.2)] ring-2 ring-[#00f2ff]/60 ring-offset-2 ring-offset-[#050508]'
                : 'border-white/10 hover:border-[#00f2ff]/30';
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => {
                setExpandedId(post.id);
                setShowJoinOverlay(false);
              }}
              className={`group text-left rounded-2xl overflow-hidden border bg-black/60 transition-all hover:scale-[1.02] active:scale-[0.98] ${portalRing}`}
            >
              <div className="relative aspect-[4/5] bg-gradient-to-b from-white/5 to-black/80">
                {post.mediaType === 'video' && post.mediaUrl ? (
                  <video
                    src={post.mediaUrl}
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                ) : post.mediaType === 'image' && post.mediaUrl ? (
                  <img
                    src={post.mediaUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    <p className="text-[11px] text-white/50 line-clamp-6 leading-relaxed">{post.text}</p>
                  </div>
                )}
                {ripple && (post.mediaUrl || post.mediaType === 'video') ? (
                  <div className="absolute top-2 right-2 flex -space-x-1.5 pointer-events-none">
                    {ripple.viewerInitials.map((ini, i) => (
                      <span
                        key={`${post.id}-v-${i}`}
                        className="w-7 h-7 rounded-full border-2 border-black/80 bg-gradient-to-br from-[#00f2ff]/40 to-fuchsia-500/30 text-[9px] font-black text-white flex items-center justify-center shadow-lg"
                      >
                        {ini}
                      </span>
                    ))}
                  </div>
                ) : null}
                {burst || musicPulse ? (
                  <div
                    className={`absolute inset-0 pointer-events-none ${
                      burst ? 'bg-[#00f2ff]/15 animate-pulse' : 'bg-fuchsia-500/10 animate-pulse'
                    }`}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                {live ? (
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-[2]">
                    <span className="px-2 py-0.5 rounded-md bg-red-500/90 text-[9px] font-black uppercase tracking-wider text-white">
                      Happening now
                    </span>
                    {musicHot ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#ff6b2c]/90 text-[9px] font-black uppercase tracking-wider text-white shadow-[0_0_12px_rgba(255,107,44,0.5)]">
                        Music surge
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {ripple && ripple.discussingCount >= 1 ? (
                  <div className="absolute bottom-[4.5rem] left-2 right-2 z-[2] flex justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMicroChatPostId(post.id);
                      }}
                      className="pointer-events-auto max-w-[95%] px-2.5 py-1 rounded-full bg-black/75 border border-[#00f2ff]/40 text-[9px] font-semibold text-[#00f2ff] backdrop-blur-md hover:bg-[#00f2ff]/15"
                    >
                      {ripple.discussingCount} friend{ripple.discussingCount === 1 ? '' : 's'} discussing — tap
                    </button>
                  </div>
                ) : null}
                <div className="absolute bottom-0 left-0 right-0 p-3 pt-2 bg-gradient-to-t from-black/95 to-transparent">
                  {ripple ? (
                    <p className="text-[8px] text-white/60 leading-tight line-clamp-2 mb-1.5">
                      {ripple.bookmarkLine}
                    </p>
                  ) : null}
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#00f2ff] truncate">
                    {post.tag}
                  </p>
                  <p className="text-sm font-bold text-white truncate">{post.user}</p>
                  <p className="text-[9px] text-white/45 mt-0.5">{formatRelativeTime(post.createdAt)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-6 text-center col-span-full">
          <p className="text-sm font-semibold text-white">
            {emptyFeedFilter === 'FOLLOWING'
              ? 'No posts from people you follow yet'
              : `${emptyFeedFilter} is quiet`}
          </p>
          <p className="mt-2 text-xs text-white/55 leading-relaxed">
            {emptyFeedFilter === 'FOLLOWING'
              ? 'Follow friends under My Sanctuary → Following or the Following page. New testimonies they add (with the same account) show here. Your own posts always appear in this tab.'
              : 'Be the first to share a testimony, photo, or clip.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => {
                onFocusComposer();
                onStatusMessage('COMPOSER READY');
              }}
              className="px-4 py-2 rounded-full bg-[#00f2ff] text-black text-xs font-bold"
            >
              Create post
            </button>
            {emptyFeedFilter === 'FOLLOWING' && (
              <button
                type="button"
                onClick={onFindPeople}
                className="px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white/80 hover:border-[#00f2ff]/40"
              >
                Find people
              </button>
            )}
          </div>
        </article>
      ) : null}

      {/* PiP dock */}
      {pipUrl ? (
        <div className="fixed bottom-24 left-3 z-40 w-[min(200px,42vw)] rounded-xl overflow-hidden border border-[#00f2ff]/40 bg-black shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between gap-1 px-2 py-1 bg-black/80 border-b border-white/10">
            <p className="text-[9px] text-white/70 truncate flex-1">{pipTitle || 'Now playing'}</p>
            <button
              type="button"
              onClick={() => onSetPip(null, null)}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
              aria-label="Close mini player"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <video ref={pipVideoRef} src={pipUrl} className="w-full aspect-video bg-black" controls playsInline />
        </div>
      ) : null}

      {/* Expanded post + join conversation */}
      {expanded ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md"
          role="dialog"
          aria-modal
          aria-label="Post detail"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#00f2ff] truncate pr-2">
              {expanded.user} · {expanded.tag}
            </p>
            <button
              type="button"
              onClick={() => setExpandedId(null)}
              className="p-2 rounded-xl border border-white/15 text-white/80 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-32">
            <p className="text-white/75 text-[15px] leading-relaxed whitespace-pre-line">{expanded.text}</p>
            {expanded.mediaUrl ? (
              <div className="mt-4 rounded-2xl border border-[#00f2ff]/20 overflow-hidden relative">
                {(() => {
                  const r = rippleByPostId.get(expanded.id);
                  return r ? (
                    <div className="absolute top-2 right-2 z-10 flex -space-x-2 pointer-events-none">
                      {r.viewerInitials.map((ini, i) => (
                        <span
                          key={`exp-${expanded.id}-${i}`}
                          className="w-9 h-9 rounded-full border-2 border-black/90 bg-gradient-to-br from-[#00f2ff]/50 to-fuchsia-500/40 text-[10px] font-black text-white flex items-center justify-center shadow-[0_0_12px_rgba(0,242,255,0.4)]"
                        >
                          {ini}
                        </span>
                      ))}
                      <span className="self-center ml-1 text-[9px] font-bold text-white/90 drop-shadow-md bg-black/50 px-1.5 py-0.5 rounded-md">
                        watching with you
                      </span>
                    </div>
                  ) : null;
                })()}
                {expanded.mediaType === 'video' ? (
                  <video src={expanded.mediaUrl} controls className="w-full max-h-[50vh] bg-black" playsInline />
                ) : expanded.mediaType === 'image' ? (
                  <img
                    src={expanded.mediaUrl}
                    alt={expanded.mediaName || ''}
                    className="w-full max-h-[50vh] object-contain bg-black"
                  />
                ) : null}
                {showJoinOverlay ? (
                  <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                    <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-[#00f2ff]/40 bg-black/85 p-4 shadow-[0_0_30px_rgba(0,242,255,0.2)]">
                      <p className="text-[10px] font-black uppercase tracking-[6px] text-[#00f2ff]">
                        Join the conversation
                      </p>
                      <p className="text-sm text-white/80 mt-1">React or comment without leaving full view.</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onAmen(expanded.id);
                            setShowJoinOverlay(false);
                          }}
                          className="flex-1 py-2 rounded-xl bg-[#00f2ff] text-black text-xs font-bold"
                        >
                          Amen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onComment(expanded.id);
                            setShowJoinOverlay(false);
                          }}
                          className="flex-1 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowJoinOverlay((v) => !v)}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-white"
              >
                {showJoinOverlay ? 'Hide prompt' : 'Join the conversation'}
              </button>
              <button
                type="button"
                onClick={handleHuddle}
                className="px-4 py-2 rounded-full border border-violet-400/40 text-[11px] font-bold text-violet-200"
              >
                Huddle
              </button>
              <button
                type="button"
                onClick={() => handleClip(expanded.id)}
                className="px-4 py-2 rounded-full border border-white/15 text-[11px] font-bold text-white/80 flex items-center gap-1"
              >
                <Scissors className="h-3.5 w-3.5" />
                Clip 10s
              </button>
              {expanded.mediaType === 'video' && expanded.mediaUrl ? (
                <button
                  type="button"
                  onClick={minimizeCurrentToPip}
                  className="px-4 py-2 rounded-full border border-[#00f2ff]/40 text-[11px] font-bold text-[#00f2ff] flex items-center gap-1"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  Mini player
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleThrowGem}
                className="px-4 py-2 rounded-full border border-violet-400/40 text-[11px] font-bold text-violet-200 flex items-center gap-1"
              >
                <Gem className="h-3.5 w-3.5" />
                Send Gems
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-[#00f2ff]/15 bg-white/[0.03] px-3 py-3">
              <p className="text-[10px] text-[#00f2ff] uppercase tracking-[6px]">PraiseBreak</p>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onPraiseBreak(expanded.id)}
                  className="py-2 rounded-lg bg-[#00f2ff]/15 text-[10px] font-black text-[#00f2ff]"
                >
                  Go {expanded.stats.praiseBreaks}
                </button>
                <button
                  type="button"
                  onClick={() => onPraiseAction(expanded.id, 'CLAP')}
                  className="py-2 rounded-lg border border-white/10 text-[10px] text-white/75"
                >
                  Clap
                </button>
                <button
                  type="button"
                  onClick={() => onPraiseAction(expanded.id, 'DANCE')}
                  className="py-2 rounded-lg border border-white/10 text-[10px] text-white/75"
                >
                  Dance
                </button>
                <button
                  type="button"
                  onClick={() => onPraiseAction(expanded.id, 'SHOUT')}
                  className="py-2 rounded-lg border border-white/10 text-[10px] text-white/75"
                >
                  Shout
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onReaction(expanded.id, emoji)}
                  className="text-lg p-2 rounded-full hover:bg-white/10"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => onAmen(expanded.id)}
                className="flex items-center gap-2 text-white/80"
              >
                <Heart className="h-5 w-5" />
                <span className="text-sm tabular-nums">{expanded.stats.amens}</span>
              </button>
              <button
                type="button"
                onClick={() => onComment(expanded.id)}
                className="flex items-center gap-2 text-white/80"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm tabular-nums">{expanded.stats.comments}</span>
              </button>
              <button
                type="button"
                onClick={() => onShare(expanded.id)}
                className="flex items-center gap-2 text-white/80"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => onOpenMenu(expanded.user)}
                className="ml-auto text-white/40 text-xl"
              >
                •••
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Achievement toasts (social graph) */}
      <div
        className="fixed bottom-28 right-3 z-[65] flex flex-col gap-2 w-[min(100%,300px)] pointer-events-none px-2 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-2xl border border-amber-400/35 bg-[#0c0a06]/95 backdrop-blur-xl p-3 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[6px] text-amber-300/90">Community win</p>
            <p className="text-sm text-white/90 mt-1 leading-snug">
              <span className="font-bold text-white">{t.userLabel}</span> {t.body} 🏆
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  congratulateToast(t.id);
                  onStatusMessage(`You cheered on ${t.userLabel} — they’ll see it when notifications ship.`);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 text-black text-[11px] font-bold"
              >
                Congratulate
              </button>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="px-3 py-2 rounded-xl border border-white/15 text-[11px] text-white/70"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Micro-conversation sheet */}
      {microChatPostId != null ? (
        <div className="fixed inset-0 z-[58] flex flex-col justify-end" role="dialog" aria-modal aria-label="Quick chat">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close chat"
            onClick={() => setMicroChatPostId(null)}
          />
          <div className="relative rounded-t-3xl border border-white/10 bg-[#0a0a0f] max-h-[55vh] flex flex-col shadow-[0_-12px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-[11px] font-bold text-[#00f2ff]">Friends on this clip</p>
              <button
                type="button"
                onClick={() => setMicroChatPostId(null)}
                className="p-2 rounded-xl text-white/60 hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Mia</p>
                <p className="text-white/85">This chorus hit different tonight 🔥</p>
              </div>
              <div className="rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/20 px-3 py-2">
                <p className="text-[10px] text-[#00f2ff] uppercase tracking-wider">Jordan</p>
                <p className="text-white/85">Sending to my small group.</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">You</p>
                <p className="text-white/55 text-xs">Realtime threads sync with Supabase next.</p>
              </div>
            </div>
            <form
              className="p-3 border-t border-white/10 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!microChatDraft.trim()) return;
                onStatusMessage(`Sent (demo): ${microChatDraft.slice(0, 40)}…`);
                setMicroChatDraft('');
              }}
            >
              <input
                value={microChatDraft}
                onChange={(e) => setMicroChatDraft(e.target.value)}
                placeholder="Quick reply…"
                className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#00f2ff]/40"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-[#00f2ff] text-black"
                aria-label="Send"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
