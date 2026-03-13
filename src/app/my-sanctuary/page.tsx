'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Activity, Radio, Users, Settings } from 'lucide-react';
import SparkleOverlay from '@/components/SparkleOverlay';
import { useAuth } from '@/hooks/useAuth';

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
};

const TESTIMONY_STORAGE_KEY = 'parable:testimonies';

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

    const targetNames = [username, 'KYM THE CEO']
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

const featuredStreams = [
  {
    id: 1,
    title: 'Daily Testimony Hour',
    streamer: 'KYM THE CEO',
    viewers: '1.2K',
    category: 'Faith & Prayer',
    isLive: true,
  },
  {
    id: 2,
    title: 'Gospel Music Live',
    streamer: 'Sanctuary Choir',
    viewers: '856',
    category: 'Gospel Music',
    isLive: true,
  },
  {
    id: 3,
    title: 'Youth Revival Service',
    streamer: 'Youth Leader',
    viewers: '432',
    category: 'Youth Ministry',
    isLive: true,
  },
];

const categories = [
  'Faith & Prayer',
  'Testimonies',
  'Youth Ministry',
  'Worship',
  'Bible Study',
  'Healing',
  'Deliverance',
  'Gaming',
];

const FOLLOWING_STORAGE_KEY = 'parable:following';
const CUSTOM_FOLLOWERS_STORAGE_KEY = 'parable:custom-followers';

type Follower = {
  id: string;
  name: string;
  handle: string;
  avatarLabel: string;
  isLive: boolean;
  viewers: string;
};

const BASE_FOLLOWERS: Follower[] = [
  {
    id: 'black-church-tv',
    name: 'Black Church TV',
    handle: '@blackchurchtv',
    avatarLabel: 'BC',
    isLive: true,
    viewers: '524',
  },
  {
    id: 'sanctuary-sundays',
    name: 'Sanctuary Sundays',
    handle: '@sanctuarysundays',
    avatarLabel: 'SS',
    isLive: false,
    viewers: '0',
  },
  {
    id: 'faith-influencer',
    name: 'Faith Influencer',
    handle: '@faithinfluencer',
    avatarLabel: 'FI',
    isLive: true,
    viewers: '312',
  },
];

type RecommendedChannel = {
  id: string;
  name: string;
  tagline: string;
  viewers: string;
  avatarLabel: string;
};

const RECOMMENDED_CHANNELS: RecommendedChannel[] = [
  {
    id: 'new-birth-live',
    name: 'New Birth Live',
    tagline: 'Sunday Worship & Word',
    viewers: '621',
    avatarLabel: 'NB',
  },
  {
    id: 'urban-faith-tv',
    name: 'Urban Faith TV',
    tagline: 'Just Testifying',
    viewers: '1.2K',
    avatarLabel: 'UF',
  },
  {
    id: 'praise-city',
    name: 'Praise City Network',
    tagline: 'Choir & Worship Nights',
    viewers: '10.3K',
    avatarLabel: 'PC',
  },
  {
    id: 'youth-fire',
    name: 'Youth on Fire',
    tagline: 'Youth & Young Adults',
    viewers: '10.6K',
    avatarLabel: 'YF',
  },
  {
    id: 'midweek-manna',
    name: 'Midweek Manna',
    tagline: 'Bible Study Live',
    viewers: '446',
    avatarLabel: 'MM',
  },
  {
    id: 'late-night-praise',
    name: 'Late Night Praise',
    tagline: 'IRL Fellowship',
    viewers: '1.6K',
    avatarLabel: 'LP',
  },
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
type TabKey = 'featured' | 'following' | 'categories';

export default function MySanctuaryFeedPage() {
  const router = useRouter();
  const { userProfile, avatarUrl, loading } = useAuth();
  const [testimonies, setTestimonies] = useState<TestimonyPost[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('featured');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [customFollowers, setCustomFollowers] = useState<Follower[]>([]);
  const [newFollowerName, setNewFollowerName] = useState('');
  const [newFollowerHandle, setNewFollowerHandle] = useState('');

  useEffect(() => {
    if (loading) return;

    const refreshPosts = () => {
      const username = userProfile?.username || null;
      setTestimonies(loadMyTestimonies(username));
    };

    refreshPosts();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshPosts();
      }
    };

    window.addEventListener('focus', refreshPosts);
    window.addEventListener('parable:testimonies-updated', refreshPosts as EventListener);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', refreshPosts);
      window.removeEventListener('parable:testimonies-updated', refreshPosts as EventListener);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loading, userProfile?.username]);

  useEffect(() => {
    try {
      const storedFollowing = window.localStorage.getItem(FOLLOWING_STORAGE_KEY);
      if (storedFollowing) {
        setFollowingIds(JSON.parse(storedFollowing));
      }

      const storedCustom = window.localStorage.getItem(CUSTOM_FOLLOWERS_STORAGE_KEY);
      if (storedCustom) {
        setCustomFollowers(JSON.parse(storedCustom));
      }
    } catch {
      // ignore
    }
  }, []);

  const allFollowers: Follower[] = [...BASE_FOLLOWERS, ...customFollowers];

  const saveFollowing = (ids: string[]) => {
    setFollowingIds(ids);
    try {
      window.localStorage.setItem(FOLLOWING_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const handleToggleFollow = (id: string) => {
    setFollowingIds((current) => {
      const next = current.includes(id)
        ? current.filter((fId) => fId !== id)
        : [...current, id];
      try {
        window.localStorage.setItem(FOLLOWING_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleAddFollower = () => {
    const name = newFollowerName.trim();
    const handle = newFollowerHandle.trim();

    if (!name || !handle) return;

    const id = `custom-${Date.now()}`;
    const avatarLabel = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const follower: Follower = {
      id,
      name,
      handle,
      avatarLabel,
      isLive: false,
      viewers: '0',
    };

    const nextCustom = [...customFollowers, follower];
    setCustomFollowers(nextCustom);

    try {
      window.localStorage.setItem(CUSTOM_FOLLOWERS_STORAGE_KEY, JSON.stringify(nextCustom));
    } catch {
      // ignore
    }

    setNewFollowerName('');
    setNewFollowerHandle('');
    saveFollowing([...followingIds, id]);
  };

  const followedAccounts = allFollowers.filter((f) => followingIds.includes(f.id));
  const liveFollowed = followedAccounts.filter((f) => f.isLive);

  if (loading) {
    return <div className="min-h-screen bg-[#010101]" />;
  }

  return (
    <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans">
      <SparkleOverlay />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 flex min-h-screen">
        {/* LEFT RAIL – KICK STYLE NAV + RECOMMENDED */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-black/40 backdrop-blur-md">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-2"
            >
              <div className="relative h-7 w-24">
                <Image
                  src="/fonts/parable-logo.svg"
                  alt="Parable"
                  fill
                  className="object-contain drop-shadow-[0_0_14px_rgba(0,242,255,0.7)]"
                />
              </div>
            </button>
          </div>

          {/* User summary */}
          <div className="px-4 pb-3">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2 hover:border-[#00f2ff]/60 w-full text-left"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl || '/logo.svg'}
                  alt={userProfile?.username || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold truncate">
                  {userProfile?.username || 'Guest'}
                </span>
                <span className="text-[11px] text-white/40 truncate">View sanctuary profile</span>
              </div>
            </button>
          </div>

          {/* Main nav */}
          <nav className="px-2 pb-3 space-y-1 text-sm">
            <button
              onClick={() => router.push('/my-sanctuary')}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-white/10 text-white font-medium"
            >
              <span className="w-5 text-center">🏠</span>
              <span>Home</span>
            </button>
            <button
              onClick={() => router.push('/streamers')}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white"
            >
              <span className="w-5 text-center">🎥</span>
              <span>Browse</span>
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white"
            >
              <span className="w-5 text-center">❤️</span>
              <span>Following</span>
            </button>
          </nav>

          <div className="mt-1 border-t border-white/10" />

          {/* Recommended list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 text-sm">
            <p className="text-[11px] uppercase tracking-[3px] text-white/40 px-1">
              Recommended
            </p>
            {RECOMMENDED_CHANNELS.map((channel) => (
              <button
                key={channel.id}
                className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-white/5 text-left"
                onClick={() => router.push('/streamers')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-[1px]">
                    {channel.avatarLabel}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-semibold text-white truncate">
                      {channel.name}
                    </span>
                    <span className="text-[11px] text-white/45 truncate">
                      {channel.tagline}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{channel.viewers}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Settings footer */}
          <div className="mt-auto px-3 py-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
            <button
              onClick={() => router.push('/settings')}
              className="inline-flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5"
            >
              <Settings className="w-4 h-4 text-[#00f2ff]" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* CENTER COLUMN – LIVE HERO + FEED (KICK / IG / FB HYBRID) */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
          {/* HEADER STRIP */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-10 w-40 sm:h-12 sm:w-52">
                <Image
                  src="/fonts/parable-logo.svg"
                  alt="Parable"
                  fill
                  className="object-contain drop-shadow-[0_0_18px_rgba(0,242,255,0.85)]"
                  priority
                />
              </div>
              <div>
                <p className="text-[9px] font-mono tracking-[4px] uppercase text-[#00f2ff]/70">
                  Sanctuary // Live_Feed
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  My Sanctuary
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/testify')}
                className="inline-flex items-center gap-2 rounded-full bg-[#00f2ff] px-4 py-2 text-xs font-black uppercase tracking-[2px] text-black shadow-[0_0_25px_rgba(0,242,255,0.7)] hover:bg-[#4df7ff]"
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Go Live
              </button>
              <button
                onClick={() => router.push('/live-studio')}
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 hover:border-[#00f2ff]/50"
              >
                <Radio className="w-4 h-4 text-emerald-400" />
                Studio
              </button>
            </div>
          </header>

          {/* LIVE HERO – KICK LIKE PLAYER WITH YOUTUBE THUMB + CTA */}
          <section className="rounded-xl border border-white/10 bg-gradient-to-r from-black via-black to-[#020b12] overflow-hidden relative">
            <button
              onClick={() => router.push('/testify')}
              className="group relative block w-full h-64 sm:h-72 lg:h-80 text-left"
            >
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://img.youtube.com/vi/mV-8ihJnwUc/maxresdefault.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.06] mix-blend-soft-light pointer-events-none" />

              <div className="absolute top-4 left-4 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-[3px] shadow-[0_0_20px_rgba(248,113,113,0.9)]">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Live
                </span>
                <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-mono uppercase tracking-[3px] text-white/70 border border-white/10">
                  1,234 viewing
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
                <p className="text-[10px] uppercase tracking-[4px] text-[#00f2ff]/80 font-black">
                  Sunday Service // Miracle Testimonies
                </p>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Conversations With Kym Podcast
                </h2>
                <div className="flex items-center justify-between gap-3 mt-1 flex-wrap">
                  <p className="text-xs sm:text-sm text-white/70 max-w-xl">
                    Share what God is doing in real-time. Pray, praise, and encourage believers
                    across the globe.
                  </p>
                  <a
                    href="https://www.youtube.com/watch?v=mV-8ihJnwUc"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/30 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-white/20"
                  >
                    Watch full clip on YouTube
                  </a>
                </div>
              </div>
            </button>
          </section>

          {/* TABS – LIKE IG / FB FILTERS */}
          <section className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center rounded-full bg-white/5 p-1 border border-white/10">
              {(['featured', 'following', 'categories'] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    activeTab === tab
                      ? 'bg-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.6)]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab === 'featured' && 'Featured'}
                  {tab === 'following' && 'Following'}
                  {tab === 'categories' && 'Categories'}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/40">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sanctuary status: Active</span>
              </div>
            </div>
          </section>

          {/* FEATURED / FOLLOWING / CATEGORIES ROW – KICK-LIKE CARDS WITH VIDEO PLACEHOLDERS */}
          {activeTab === 'featured' && (
            <section className="grid gap-4 md:grid-cols-3">
              {featuredStreams.map((stream) => (
                <article
                  key={stream.id}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between hover:border-[#00f2ff]/60 hover:bg-white/[0.05] transition-all"
                >
                  <div>
                    <div className="relative mb-3 overflow-hidden rounded-lg border border-white/10 bg-black/60 aspect-video">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={
                          stream.id === 1
                            ? 'https://www.youtube.com/embed/rkDk0n3bbPU?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=rkDk0n3bbPU'
                            : stream.id === 2
                            ? 'https://www.youtube.com/embed/Z8SPwT3nQZ8?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=Z8SPwT3nQZ8'
                            : 'https://www.youtube.com/embed/e_bEpQH0VTQ?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=e_bEpQH0VTQ'
                        }
                        title={stream.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-[2px] text-[#00f2ff]/80">
                        {stream.category}
                      </span>
                      {stream.isLive && (
                        <span className="flex items-center gap-1 text-[10px] text-red-400">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{stream.title}</h3>
                    <p className="text-[11px] text-white/60 mb-2">
                      with <span className="font-medium text-white">{stream.streamer}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/40 mt-2">
                    <span>{stream.viewers} watching</span>
                    <button
                      onClick={() => router.push('/testify')}
                      className="text-[#00f2ff] font-semibold hover:underline"
                    >
                      Join stream
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {activeTab === 'following' && (
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Following</h3>
                <span className="text-[11px] text-white/50">
                  {followingIds.length} channel{followingIds.length === 1 ? '' : 's'}
                </span>
              </div>

              {allFollowers.length > 0 && (
                <div className="space-y-3">
                  {allFollowers.map((account) => {
                    const isFollowing = followingIds.includes(account.id);
                    return (
                      <article
                        key={account.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/50 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-[2px]">
                            {account.avatarLabel}
                          </div>
                          <div>
                            <p className="text-xs font-semibold leading-tight">
                              {account.name}
                            </p>
                            <p className="text-[11px] text-white/45">{account.handle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {account.isLive && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              Live {account.viewers}
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleFollow(account.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${
                              isFollowing
                                ? 'border-white/20 bg-white/10 text-white'
                                : 'border-[#00f2ff]/40 bg-[#00f2ff]/10 text-[#00f2ff]'
                            }`}
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="pt-3 border-t border-white/10 space-y-2">
                <p className="text-[11px] text-white/50">Add a new channel to follow</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={newFollowerName}
                    onChange={(e) => setNewFollowerName(e.target.value)}
                    placeholder="Display name"
                    className="flex-1 rounded-full bg-black/60 border border-white/15 px-3 py-2 text-xs outline-none focus:border-[#00f2ff]/60"
                  />
                  <input
                    value={newFollowerHandle}
                    onChange={(e) => setNewFollowerHandle(e.target.value)}
                    placeholder="@handle"
                    className="flex-1 rounded-full bg-black/60 border border-white/15 px-3 py-2 text-xs outline-none focus:border-[#00f2ff]/60"
                  />
                  <button
                    onClick={handleAddFollower}
                    className="rounded-full bg-[#00f2ff] px-4 py-2 text-[11px] font-black uppercase tracking-[2px] text-black hover:bg-[#4df7ff]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'categories' && (
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <h3 className="text-sm font-semibold">Browse by category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs text-white/70 hover:border-[#00f2ff]/60 hover:text-white transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* TOP LIVE CATEGORIES – COLORFUL BLACK CHURCH SECTION */}
          <section className="mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Top Live Church Categories</h3>
              <button
                onClick={() => router.push('/streamers')}
                className="text-[11px] text-[#00f2ff] hover:underline"
              >
                View all
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
              {LIVE_CHURCH_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => router.push('/streamers')}
                  className="relative min-w-[170px] max-w-[190px] h-40 rounded-xl text-left shadow-[0_0_25px_rgba(0,0,0,0.5)] overflow-hidden bg-black"
                >
                  <div
                    className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${!cat.imageSrc ? `bg-gradient-to-br ${cat.gradient}` : ''}`}
                    style={
                      cat.imageSrc
                        ? { backgroundImage: `url('${cat.imageSrc}')` }
                        : undefined
                    }
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.45),transparent_60%)]" />
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-soft-light" />
                  <div className="relative h-full w-full flex flex-col justify-between p-3">
                    <div>
                      <p className="text-[10px] text-white/80 uppercase tracking-[3px]">
                        {cat.subtitle}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white leading-snug line-clamp-2">
                        {cat.title}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {cat.badges.map((badge) => (
                          <span
                            key={badge}
                            className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] text-white/85 uppercase tracking-[2px]"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-white/90">{cat.viewers}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* FEED – IG / FACEBOOK STYLE CARDS */}
          <section className="space-y-4 pt-2 pb-10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">My testimonies</h2>
              <button
                onClick={() => router.push('/testify')}
                className="text-[11px] font-semibold text-[#00f2ff] hover:underline"
              >
                Share a testimony
              </button>
            </div>

            {testimonies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/40 p-6 text-center text-xs text-white/50">
                When you go live and testify, your testimony replays, clips, and highlights will
                show up here in your personal Sanctuary feed.
              </div>
            ) : (
              <div className="space-y-4">
                {testimonies.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black uppercase tracking-[2px]">
                          {String(post.user).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-tight">{post.user}</p>
                          <p className="text-[11px] text-white/40">
                            {formatRelativeTime(post.createdAt)} • {post.tag}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-white/90">{post.text}</p>

                    {post.mediaUrl && (
                      <div className="mt-1">
                        {post.mediaType === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.mediaUrl}
                            alt={post.mediaName || 'Testimony media'}
                            className="rounded-lg max-h-72 w-full object-cover border border-white/10"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : post.mediaType === 'video' ? (
                          <video
                            src={post.mediaUrl}
                            controls
                            className="rounded-lg max-h-72 w-full object-cover border border-white/10"
                          />
                        ) : null}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-white/40">
                      <div className="flex items-center gap-4">
                        <span>🙌 {post.stats.amens}</span>
                        <span>💬 {post.stats.comments}</span>
                        <span>📣 {post.stats.shares}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/testify/${post.id}`)}
                        className="font-semibold text-[#00f2ff] hover:underline"
                      >
                        Open thread
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* RIGHT RAIL – DISCORD / SOCIAL PRESENCE */}
        <aside className="hidden xl:block w-72 border-l border-white/5 bg-black/40 backdrop-blur-md px-4 py-6 space-y-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[3px] text-white/40 mb-2">
              Sanctuary_Status
            </p>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Now streaming</span>
                <Activity className="w-4 h-4 text-[#00f2ff]" />
              </div>
              <p className="text-[11px] text-white/60">
                Sanctuary is online and ready to host live testimonies, worship, and prayer.
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-[3px] text-white/40 mb-2">
              Friends_Online
            </p>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 space-y-2 text-[11px] text-white/60">
              {liveFollowed.length === 0 ? (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-500" />
                  <span>No followed channels live yet. Follow a few to see them here.</span>
                </div>
              ) : (
                liveFollowed.map((account) => (
                  <div key={account.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{account.name}</span>
                    </div>
                    <span className="text-[10px] text-white/50">{account.viewers} watching</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-[3px] text-white/40 mb-2">
              Quick_Actions
            </p>
            <div className="space-y-2 text-[11px]">
              <button
                onClick={() => router.push('/profile')}
                className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 hover:border-[#00f2ff]/60"
              >
                <span>View profile</span>
                <Users className="w-4 h-4 text-[#00f2ff]" />
              </button>
              <button
                onClick={() => router.push('/parables')}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left hover:border-[#00f2ff]/60"
              >
                Explore more parables
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

