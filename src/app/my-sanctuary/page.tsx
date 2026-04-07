'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Activity, Radio } from 'lucide-react';
import SparkleOverlay from '@/components/SparkleOverlay';
import { useAuth } from '@/hooks/useAuth';
import { loadAllTestimonies, saveTestimonies, TESTIMONY_STORAGE_KEY } from '@/lib/testimony-storage';
import { RECOMMENDED_SANCTUARY_CHANNELS, type SanctuaryChannel } from '@/lib/sanctuary-following';
import { SanctuaryFollowingPanel } from '@/components/sanctuary/SanctuaryFollowingPanel';
import { useRegisteredProfileSuggestions } from '@/hooks/useRegisteredProfileSuggestions';
import { useSanctuaryFollowGraph } from '@/hooks/useSanctuaryFollowGraph';
import SanctuaryCommandHeader from '@/components/sanctuary/SanctuaryCommandHeader';
import SanctuaryBioModule from '@/components/sanctuary/SanctuaryBioModule';
import SanctuaryCategoryUtility from '@/components/sanctuary/SanctuaryCategoryUtility';
import SanctuaryTestimonyWall from '@/components/sanctuary/SanctuaryTestimonyWall';
import SanctuaryLiveStatusCard from '@/components/sanctuary/SanctuaryLiveStatusCard';

type TestimonyPost = {
  id: number;
  user: string;
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

const REACTION_EMOJIS = ['🙏', '❤️', '👏'] as const;

function formatRelativeTime(createdAt: number) {
  const diffMs = Date.now() - createdAt;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'now';
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
          !post.mediaUrl.startsWith('data:') &&
          !post.mediaUrl.startsWith('http') &&
          !post.mediaUrl.startsWith('/')
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
  'Faith & Prayer',
  'Testimonies',
  'Youth Ministry',
  'Worship',
  'Bible Study',
  'Healing',
  'Deliverance',
  'Gaming',
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
    id: 'sunday-service',
    title: 'Sunday Service Live',
    subtitle: 'Sanctuary & Sermon',
    viewers: '181.3K watching',
    badges: ['Worship', 'Word'],
    gradient: 'from-emerald-500 via-teal-400 to-cyan-400',
    imageSrc: '/images/sunday-service-live.png',
  },
  {
    id: 'choir-nights',
    title: 'Choir Nights Live',
    subtitle: 'Black Church Choirs',
    viewers: '134.4K watching',
    badges: ['Choir', 'Music'],
    gradient: 'from-violet-500 via-purple-500 to-indigo-400',
    imageSrc: '/images/choir-nights-live.png',
  },
  {
    id: 'just-testifying',
    title: 'Just Testifying',
    subtitle: 'Praise Reports Only',
    viewers: '152.1K watching',
    badges: ['Testimony', 'Community'],
    gradient: 'from-fuchsia-500 via-pink-500 to-amber-400',
    imageSrc: '/images/just-testifying.png',
  },
  {
    id: 'youth-revival',
    title: 'Youth Revival',
    subtitle: 'Gen Z on Fire',
    viewers: '55.4K watching',
    badges: ['Youth', 'Revival'],
    gradient: 'from-sky-500 via-cyan-400 to-lime-400',
    imageSrc: '/images/youth-revival.png',
  },
  {
    id: 'creatives-real-talk',
    title: 'Creatives Real Talk',
    subtitle: 'Creators & Culture',
    viewers: '18.4K watching',
    badges: ['Creators', 'Culture'],
    gradient: 'from-cyan-500 via-blue-500 to-violet-500',
    imageSrc: '/images/creatives-real-talk.png',
  },
  {
    id: 'street-church',
    title: 'Street Church',
    subtitle: 'Outreach & IRL',
    viewers: '18.4K watching',
    badges: ['Outreach', 'Culture'],
    gradient: 'from-amber-500 via-lime-400 to-emerald-500',
    imageSrc: '/images/street-church.png',
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
  const displayName = userProfile?.username || userProfile?.full_name || 'Your Sanctuary';

  const [testimonies, setTestimonies] = useState<TestimonyPost[]>([]);

  useEffect(() => {
    if (loading) return;
    const refresh = () => {
      const username = userProfile?.username || null;
      setTestimonies(loadMyTestimonies(username));
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('parable:testimonies-updated', refresh as EventListener);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('parable:testimonies-updated', refresh as EventListener);
    };
  }, [loading, userProfile?.username]);

  useEffect(() => {
    if (loading) return;
    if (!userProfile) router.replace('/login?next=/my-sanctuary');
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
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const follower: SanctuaryChannel = {
      id,
      name,
      handle,
      avatarLabel,
      isLive: false,
      viewers: '0',
    };
    updateCustomFollowers([...customFollowers, follower]);
    updateFollowingIds((current) => [...current, id]);
  };

  const handleRemoveCustomChannel = (id: string) => {
    if (!id.startsWith('custom-')) return;
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
    return <div className="min-h-screen bg-[#010101]" />;
  }

  const role = userProfile?.role as string | undefined;
  const bioText = (userProfile as { bio?: string | null })?.bio ?? null;

  return (
    <div className="min-h-[100dvh] bg-[#010101] font-sans text-white relative overflow-x-hidden pb-parable-bottom">
      <SparkleOverlay />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,242,255,0.08)_0%,transparent_55%)]" />

      <main className="relative z-10 mx-auto min-w-0 max-w-full space-y-5 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <div className="relative h-8 w-28 shrink-0">
            <Image
              src="/fonts/parable-logo.svg"
              alt="Parable"
              fill
              className="object-contain object-left drop-shadow-[0_0_14px_rgba(0,242,255,0.75)]"
              priority
            />
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            <button
              type="button"
              onClick={() => router.push('/sanctuary-reader')}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-white/80"
            >
              <Activity className="h-3.5 w-3.5 text-[#00f2ff]" />
              Reader
            </button>
            <button
              type="button"
              onClick={() => router.push('/testify')}
              className="inline-flex items-center gap-1 rounded-full bg-[#00f2ff] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-black"
            >
              Testify
            </button>
            <button
              type="button"
              onClick={() => router.push('/live-studio')}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-white/75"
            >
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              Studio
            </button>
            <a
              href="/logout"
              className="inline-flex items-center rounded-full border border-red-400/25 bg-red-500/10 px-2.5 py-1.5 text-[10px] text-red-200"
            >
              Out
            </a>
          </div>
        </div>

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
          <section className="rounded-[20px] border border-white/[0.08] bg-black/40 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/35">Quick react</p>
            <p className="mt-1 text-[11px] text-white/45">Tap to add emoji reactions on your latest archive pieces (syncs with Testify storage).</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {testimonies.slice(0, 4).map((post) => (
                <div key={post.id} className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2">
                  <span className="text-[10px] text-white/50">#{post.id}</span>
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleTestimonyReaction(post.id, emoji)}
                      className="rounded-lg px-1.5 py-0.5 text-sm hover:bg-white/10"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Live church lanes</h3>
            <button type="button" onClick={() => router.push('/streamers')} className="text-[11px] text-[#00f2ff] hover:underline">
              View all
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {LIVE_CHURCH_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => router.push('/streamers')}
                className="relative w-[168px] min-h-[168px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black text-left shadow-lg"
              >
                <div
                  className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${!cat.imageSrc ? `bg-gradient-to-br ${cat.gradient}` : ''}`}
                  style={cat.imageSrc ? { backgroundImage: `url('${cat.imageSrc}')` } : undefined}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
                <div className="relative z-10 flex min-h-[168px] flex-col justify-end gap-2 p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#00f2ff]/90">{cat.subtitle}</p>
                  <p className="text-sm font-bold leading-snug text-white line-clamp-2">{cat.title}</p>
                  <p className="text-[11px] tabular-nums text-white/80">{cat.viewers}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <details className="group rounded-[22px] border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              Network · follows & discover
              <span className="text-[11px] font-normal text-[#00f2ff] group-open:rotate-0">▼</span>
            </span>
          </summary>
          <div className="border-t border-white/[0.06] px-2 pb-4 pt-2">
            <SanctuaryFollowingPanel
              allChannels={allFollowers}
              followingIds={followingIds}
              registeredSuggestions={registeredChannels}
              registeredLoading={registeredLoading}
              registeredError={registeredError}
              onToggleFollow={handleToggleFollow}
              onAddCustom={handleAddCustom}
              onRemoveCustomChannel={handleRemoveCustomChannel}
              onOpenStreamers={() => router.push('/streamers')}
            />
            <div className="mt-4 px-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {BROWSE_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </details>

        <section className="rounded-xl border border-white/10 bg-black/30 px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Curated</p>
          <div className="mt-3 space-y-2">
            {RECOMMENDED_SANCTUARY_CHANNELS.slice(0, 4).map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => router.push('/streamers')}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-2 text-left hover:border-white/10 hover:bg-white/[0.04]"
              >
                <span className="text-xs font-medium text-white">{channel.name}</span>
                <span className="text-[10px] text-emerald-400">{channel.viewers}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
