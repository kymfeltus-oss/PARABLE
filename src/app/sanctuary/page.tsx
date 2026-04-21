'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Sparkles, Users, LayoutGrid, Smartphone } from 'lucide-react';
import { saveTestimonies } from '@/lib/testimony-storage';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';
import { useRegisteredProfileSuggestions } from '@/hooks/useRegisteredProfileSuggestions';
import { useSanctuaryFollowGraph } from '@/hooks/useSanctuaryFollowGraph';
import { ChannelAvatar } from '@/components/sanctuary/SanctuaryDiscoverSection';
import type { SanctuaryChannel } from '@/lib/sanctuary-following';
import { TestifyLivePortalFeed } from '@/components/testify/TestifyLivePortalFeed';
import { TestifyTikTokFeed } from '@/components/testify/TestifyTikTokFeed';
import { GlobalPulseGlobe } from '@/components/testify/GlobalPulseGlobe';
import { LivePersonnelRail } from '@/components/testify/LivePersonnelRail';
import { ActivityPulseDrawer } from '@/components/testify/ActivityPulseDrawer';
import { useActivityPulse, type PresenceActivity } from '@/hooks/useActivityPulse';
import {
  recordTestifyVisit,
  getTestifyGems,
  addTestifyGems,
  getPipPrefs,
  setPipPrefs,
} from '@/lib/testify-portal-storage';
import { fetchCommunityTestifyPosts } from '@/lib/testify-supabase-feed';
import {
  createDemoTestifyPosts,
  shouldIncludeDemoFeed,
  isDemoPostId,
} from '@/lib/testify-demo-feed';
import { toggleLike } from '@/lib/feed';
import type { PortalPost } from '@/components/testify/TestifyLivePortalFeed';
import SanctuaryHomeSidebar from '@/components/sanctuary-feed/SanctuaryHomeSidebar';
import Feed from '@/components/feed/Feed';
import SanctuaryFeedTopBar from '@/components/feed/SanctuaryFeedTopBar';
import SanctuaryPostComposer from '@/components/sanctuary/SanctuaryPostComposer';

type TestimonyPost = {
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

const TESTIMONY_STORAGE_KEY = 'parable:testimonies';

const DEFAULT_FEED: TestimonyPost[] = [];

function formatRelativeTime(createdAt: number) {
  const diffMs = Date.now() - createdAt;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return 'JUST NOW';
  if (minutes < 60) return `${minutes} MIN AGO`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} HR AGO`;

  const days = Math.floor(hours / 24);
  return `${days} DAY AGO`;
}

function loadStoredTestimonies(): TestimonyPost[] {
  try {
    const raw = window.localStorage.getItem(TESTIMONY_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_FEED;
    }

    const parsed = JSON.parse(raw) as TestimonyPost[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_FEED;
    }

    return parsed;
  } catch {
    return DEFAULT_FEED;
  }
}

function saveStoredTestimonies(posts: TestimonyPost[]) {
  saveTestimonies(posts);
}

async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area
): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}

function postMatchesFollowing(
  post: Pick<TestimonyPost, 'user' | 'authorId'>,
  followingIds: string[],
  currentUserId: string | null,
  followedAccounts: SanctuaryChannel[]
): boolean {
  if (currentUserId && post.authorId && post.authorId === currentUserId) return true;
  if (post.authorId && followingIds.includes(post.authorId)) return true;
  const u = String(post.user).trim().toLowerCase();
  for (const c of followedAccounts) {
    if (!followingIds.includes(c.id)) continue;
    const name = c.name.trim().toLowerCase();
    const handle = c.handle.replace(/^@/, '').trim().toLowerCase();
    if (u === name || u === handle) return true;
    if (name.split(/\s+/).some((w) => w && u === w)) return true;
  }
  return false;
}

export default function SanctuaryPage() {
  const router = useRouter();
  const { avatarUrl: myAvatarUrl, userProfile } = useAuth();
  const anointingLevel = Number(userProfile?.anointing_level ?? 1);
  const { registeredChannels } = useRegisteredProfileSuggestions();
  const { followingIds, allFollowers } = useSanctuaryFollowGraph(registeredChannels);

  const [isMounted, setIsMounted] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedTag, setSelectedTag] = useState('BREAKTHROUGH');
  const [feedFilter, setFeedFilter] = useState<'FOR YOU' | 'FOLLOWING' | 'LIVE'>('FOR YOU');
  const [statusMessage, setStatusMessage] = useState('READY TO TESTIFY');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedMediaUrl, setSelectedMediaUrl] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | null>(null);
  const [praiseBurstPostId, setPraiseBurstPostId] = useState<string | number | null>(null);
  const [musicPulsePostId, setMusicPulsePostId] = useState<string | number | null>(null);
  const [remotePosts, setRemotePosts] = useState<PortalPost[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(true);
  const [demoPosts, setDemoPosts] = useState<PortalPost[]>(() =>
    shouldIncludeDemoFeed() ? createDemoTestifyPosts() : []
  );
  const [feed, setFeed] = useState<TestimonyPost[]>(DEFAULT_FEED);
  const [currentUsername, setCurrentUsername] = useState('Guest');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [cropModalImageUrl, setCropModalImageUrl] = useState<string | null>(null);
  const [cropModalFileName, setCropModalFileName] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropBusy, setCropBusy] = useState(false);
  const croppedAreaPixelsRef = useRef<Area | null>(null);

  const [portalSection, setPortalSection] = useState<'pulse' | 'archive'>('pulse');
  const [streakDays, setStreakDays] = useState(0);
  const [faithfulUnlocked, setFaithfulUnlocked] = useState(false);
  const [gemsBalance, setGemsBalance] = useState(0);
  const [pipMediaUrl, setPipMediaUrl] = useState<string | null>(null);
  const [pipLabel, setPipLabel] = useState<string | null>(null);
  const [pulseOpen, setPulseOpen] = useState(false);
  const [pipSeekSeconds, setPipSeekSeconds] = useState<number | null>(null);
  const [feedViewMode, setFeedViewMode] = useState<'tiktok' | 'portal'>('portal');
  /** Default: Instagram-style Supabase feed; switch to full Testify portal (TikTok / grid / pulse). */
  const [sanctuaryExperience, setSanctuaryExperience] = useState<'home' | 'testify'>('home');
  const [composerExpanded, setComposerExpanded] = useState(false);

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setFeed(loadStoredTestimonies());
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    let cancelled = false;
    (async () => {
      setRemoteLoading(true);
      const rows = await fetchCommunityTestifyPosts(80);
      if (!cancelled) {
        setRemotePosts(rows);
        setRemoteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const refresh = () => {
      void (async () => {
        const rows = await fetchCommunityTestifyPosts(80);
        setRemotePosts(rows);
      })();
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [isMounted]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setCurrentUserId(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .maybeSingle();

      const name =
        profile?.username ||
        profile?.full_name ||
        user.user_metadata?.username ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Guest';
      setCurrentUsername(String(name));
      setCurrentUserId(user.id);
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (feedViewMode === 'portal') {
      setComposerExpanded(true);
    } else {
      setComposerExpanded(false);
    }
  }, [feedViewMode]);

  useEffect(() => {
    if (!isMounted) return;
    const v = recordTestifyVisit();
    setStreakDays(v.streak);
    setFaithfulUnlocked(v.faithfulUnlocked);
    setGemsBalance(getTestifyGems());
    const pip = getPipPrefs();
    setPipMediaUrl(pip.url);
    setPipLabel(pip.title);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const refreshFeed = () => {
      setFeed(loadStoredTestimonies());
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshFeed();
      }
    };

    const onFollowing = () => refreshFeed();

    window.addEventListener('focus', refreshFeed);
    window.addEventListener('parable:testimonies-updated', refreshFeed);
    window.addEventListener('parable:following-updated', onFollowing);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', refreshFeed);
      window.removeEventListener('parable:testimonies-updated', refreshFeed);
      window.removeEventListener('parable:following-updated', onFollowing);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!statusMessage) return;

    const timer = setTimeout(() => {
      setStatusMessage('READY TO TESTIFY');
    }, 3000);

    return () => clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    return () => {
      if (selectedMediaUrl && selectedMediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(selectedMediaUrl);
      }
    };
  }, [selectedMediaUrl]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    croppedAreaPixelsRef.current = croppedAreaPixels;
  }, []);

  const followedAccounts = useMemo(
    () => allFollowers.filter((c) => followingIds.includes(c.id)),
    [allFollowers, followingIds]
  );

  const storyRingPeople = useMemo(() => {
    const me: SanctuaryChannel = {
      id: 'me',
      name: currentUsername,
      handle: '@you',
      avatarLabel: String(currentUsername || 'U')
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      isLive: false,
      viewers: 'You',
      avatarUrl: myAvatarUrl && myAvatarUrl !== '/logo.svg' ? myAvatarUrl : undefined,
    };
    return [me, ...followedAccounts.slice(0, 24)];
  }, [currentUsername, followedAccounts, myAvatarUrl]);

  const mergedFeed = useMemo(() => {
    const localAsPortal: PortalPost[] = feed.map((p) => ({ ...p }));
    return [...demoPosts, ...remotePosts, ...localAsPortal].sort((a, b) => b.createdAt - a.createdAt);
  }, [feed, remotePosts, demoPosts]);

  const filteredFeed = useMemo(() => {
    const sorted = [...mergedFeed];
    if (feedFilter === 'LIVE') {
      return sorted.filter((post) => {
        if (post.tag === 'WORSHIP' || post.tag === 'BREAKTHROUGH' || post.tag === 'PRAYER') return true;
        if (post.mediaType === 'video') return true;
        const u = post.mediaUrl?.toLowerCase() ?? '';
        if (
          u.includes('twitch.tv') ||
          u.includes('kick.com') ||
          u.includes('youtube.com/live') ||
          u.includes('youtu.be/live')
        ) {
          return true;
        }
        return false;
      });
    }
    if (feedFilter === 'FOLLOWING') {
      return sorted.filter((post) =>
        postMatchesFollowing(post, followingIds, currentUserId, followedAccounts)
      );
    }
    return sorted;
  }, [mergedFeed, feedFilter, followingIds, currentUserId, followedAccounts]);

  /** Full-screen TikTok feed: chronological only — filter tabs must not use portal “pulse” reorder. */
  const tiktokFeedPosts = useMemo(
    () => [...filteredFeed].sort((a, b) => b.createdAt - a.createdAt),
    [filteredFeed]
  );

  const gridPosts = useMemo(() => {
    const base = filteredFeed;
    if (portalSection === 'pulse') {
      return [...base].sort(
        (a, b) =>
          b.stats.amens +
          b.stats.comments +
          (b.mediaType === 'video' ? 3 : 0) -
          (a.stats.amens + a.stats.comments + (a.mediaType === 'video' ? 3 : 0))
      );
    }
    return [...base].sort((a, b) => a.createdAt - b.createdAt);
  }, [filteredFeed, portalSection]);

  const activityPostSummaries = useMemo(
    () =>
      gridPosts.map((p) => ({
        id: p.id,
        tag: p.tag,
        text: p.text,
        stats: { amens: p.stats.amens, comments: p.stats.comments },
      })),
    [gridPosts]
  );

  const activityFirstVideoUrl = useMemo(
    () => gridPosts.find((p) => p.mediaType === 'video' && p.mediaUrl)?.mediaUrl ?? null,
    [gridPosts]
  );

  const friendActivityNames = useMemo(
    () => followedAccounts.map((c) => c.name),
    [followedAccounts]
  );

  const {
    vibeDisplay,
    vibeFillPercent,
    presence,
    personnelClusters,
    topicCloud,
    rippleByPostId,
    toasts,
    dismissToast,
    congratulateToast,
  } = useActivityPulse(friendActivityNames, activityPostSummaries, activityFirstVideoUrl);

  const handleSetPip = useCallback((url: string | null, title: string | null) => {
    setPipPrefs(url, title);
    setPipMediaUrl(url);
    setPipLabel(title);
  }, []);

  const handleSpendGems = useCallback((amount: number) => {
    const next = addTestifyGems(-amount);
    setGemsBalance(next);
  }, []);

  const handleJoinPresence = useCallback(
    (row: PresenceActivity) => {
      if (row.kind === 'huddle') {
        setStatusMessage('Joining huddle — voice lobby (LiveKit / Daily) ships next.');
        setPulseOpen(false);
        return;
      }
      if (row.kind === 'browsing') {
        setStatusMessage(`${row.displayName} is browsing — wave when DMs land.`);
        setPulseOpen(false);
        return;
      }
      if (row.joinMediaUrl) {
        handleSetPip(row.joinMediaUrl, `${row.displayName} · ${row.target}`);
        setPipSeekSeconds(row.seekSeconds);
      } else {
        setStatusMessage('No shared stream URL yet — go live or attach a video post.');
      }
      setPulseOpen(false);
    },
    [handleSetPip]
  );

  const handlePipSeekConsumed = useCallback(() => {
    setPipSeekSeconds(null);
  }, []);

  /** Following feed tab + header: Sanctuary Following with Browse all + Discover (deep-link `?tab=`). */
  const goToFollowingDiscover = useCallback(() => {
    setFeedFilter('FOLLOWING');
    router.push('/following?tab=discover');
  }, [router]);

  const avatarInitials = String(currentUsername || 'U')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!isMounted) {
    return <div className="min-h-screen bg-[#010101]" />;
  }

  /* Instagram-style home (shared Feed + useFeed) — same stack as /my-sanctuary */
  if (sanctuaryExperience === 'home') {
    return (
      <main className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-black text-white selection:bg-[#00f2ff]/30">
        <header className="sticky top-0 z-30 shrink-0 border-b border-neutral-800 bg-black">
          <SanctuaryFeedTopBar />
          <div className="flex items-center justify-between gap-2 border-t border-neutral-900/80 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Home</span>
            <button
              type="button"
              onClick={() => setSanctuaryExperience('testify')}
              className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#00f2ff] transition hover:border-[#00f2ff]/40 hover:bg-[#00f2ff]/10"
            >
              Testify portal
            </button>
          </div>
        </header>
        <SanctuaryPostComposer variant="igHome" />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-hide pb-parable-bottom">
          <Feed hideMiniProfile />
        </div>
      </main>
    );
  }

  const quickActions = ['WRITE', 'VIDEO', 'PHOTO', 'GO LIVE', 'PRAYER'];

  const storyChips = [
    'HEALING',
    'BREAKTHROUGH',
    'RESTORATION',
    'WORSHIP',
    'DELIVERANCE',
    'PROVISION',
    'PRAYER',
  ];

  const focusComposer = () => {
    if (feedViewMode === 'tiktok') {
      setFeedViewMode('portal');
    }
    setComposerExpanded(true);
    setTimeout(() => {
      composerRef.current?.focus();
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  const clearSelectedMedia = () => {
    if (selectedMediaUrl) {
      URL.revokeObjectURL(selectedMediaUrl);
    }
    setSelectedFileName('');
    setSelectedMediaUrl('');
    setSelectedMediaType(null);
  };

  const handlePublish = () => {
    const trimmed = postText.trim();

    if (!trimmed && !selectedMediaUrl) {
      setStatusMessage('WRITE YOUR TESTIMONY OR ADD MEDIA FIRST');
      focusComposer();
      return;
    }

    const createdAt = Date.now();

    const newPost: TestimonyPost = {
      id: createdAt,
      user: currentUsername,
      authorId: currentUserId ?? undefined,
      time: 'JUST NOW',
      tag: selectedTag,
      text: trimmed || 'A new testimony has been shared.',
      mediaUrl: selectedMediaUrl || undefined,
      mediaType: selectedMediaType,
      mediaName: selectedFileName || undefined,
      createdAt,
      stats: {
        amens: 0,
        comments: 0,
        shares: 0,
        praiseBreaks: 0,
        claps: 0,
        dances: 0,
        shouts: 0,
      },
      reactions: {},
    };

    const updated = [newPost, ...feed];
    setFeed(updated);
    saveStoredTestimonies(updated);

    setPostText('');
    setSelectedFileName('');
    setSelectedMediaUrl('');
    setSelectedMediaType(null);
    setStatusMessage('TESTIMONY PUBLISHED');
  };

  const updatePost = (id: number, updater: (post: TestimonyPost) => TestimonyPost) => {
    const updated = feed.map((post) => (post.id === id ? updater(post) : post));
    setFeed(updated);
    saveStoredTestimonies(updated);
  };

  const bumpRemoteShare = (id: string) => {
    setRemotePosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stats: { ...p.stats, shares: p.stats.shares + 1 } } : p
      )
    );
  };

  const handleAmen = async (id: string | number) => {
    if (typeof id === 'string' && isDemoPostId(id)) {
      setDemoPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, stats: { ...p.stats, amens: p.stats.amens + 1 } } : p
        )
      );
      setStatusMessage('AMEN');
      return;
    }
    if (typeof id === 'string') {
      try {
        await toggleLike(id);
        setRemotePosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, stats: { ...p.stats, amens: p.stats.amens + 1 } } : p
          )
        );
        setStatusMessage('AMEN SAVED');
      } catch {
        setStatusMessage('Sign in to react to community posts');
      }
      return;
    }
    updatePost(id, (post) => ({
      ...post,
      stats: { ...post.stats, amens: post.stats.amens + 1 },
    }));
    setStatusMessage('AMEN ADDED');
  };

  const handleComment = (id: string | number) => {
    if (typeof id === 'string' && isDemoPostId(id)) {
      const comment = window.prompt('Enter a quick comment for this testimony:');
      if (!comment || !comment.trim()) return;
      setDemoPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } } : p
        )
      );
      setStatusMessage('COMMENT ADDED');
      return;
    }
    if (typeof id === 'string') {
      router.push(`/sanctuary/${id}`);
      setStatusMessage('OPENING COMMENTS');
      return;
    }
    const comment = window.prompt('Enter a quick comment for this testimony:');
    if (!comment || !comment.trim()) return;

    updatePost(id, (post) => ({
      ...post,
      stats: { ...post.stats, comments: post.stats.comments + 1 },
    }));
    setStatusMessage('COMMENT ADDED');
  };

  const handleShare = async (id: string | number) => {
    const post = mergedFeed.find((item) => item.id === id);
    if (!post) return;

    const shareText = `${post.user} • ${post.tag}\n\n${post.text}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Parable Testimony',
          text: shareText,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }

      if (typeof id === 'string' && isDemoPostId(id)) {
        setDemoPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, stats: { ...p.stats, shares: p.stats.shares + 1 } } : p
          )
        );
      } else if (typeof id === 'number') {
        updatePost(id, (item) => ({
          ...item,
          stats: { ...item.stats, shares: item.stats.shares + 1 },
        }));
      } else {
        bumpRemoteShare(id);
      }

      setStatusMessage('TESTIMONY SHARED');
    } catch {
      setStatusMessage('SHARE CANCELLED');
    }
  };

  const handleSupport = (id: string | number) => {
    if (typeof id === 'string') {
      void handleAmen(id);
      return;
    }
    updatePost(id, (post) => ({
      ...post,
      stats: { ...post.stats, amens: post.stats.amens + 1 },
    }));
    setStatusMessage('SUPPORT SENT');
  };

  const bumpRemotePraise = (id: string) => {
    setRemotePosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, stats: { ...p.stats, praiseBreaks: p.stats.praiseBreaks + 1 } }
          : p
      )
    );
  };

  const handlePraiseBreak = (id: string | number) => {
    if (typeof id === 'string' && isDemoPostId(id)) {
      setDemoPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, stats: { ...p.stats, praiseBreaks: p.stats.praiseBreaks + 1 } }
            : p
        )
      );
    } else if (typeof id === 'string') {
      bumpRemotePraise(id);
    } else {
      updatePost(id, (post) => ({
        ...post,
        stats: { ...post.stats, praiseBreaks: post.stats.praiseBreaks + 1 },
      }));
    }

    setPraiseBurstPostId(id);
    setMusicPulsePostId(id);
    setStatusMessage('PRAISEBREAK ACTIVATED');

    setTimeout(() => {
      setPraiseBurstPostId((current) => (current === id ? null : current));
    }, 1800);

    setTimeout(() => {
      setMusicPulsePostId((current) => (current === id ? null : current));
    }, 2600);
  };

  const handleReaction = (id: string | number, emoji: string) => {
    if (typeof id === 'string' && isDemoPostId(id)) {
      setDemoPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const reactions = { ...(p.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...p, reactions };
        })
      );
      setStatusMessage('REACTION SENT');
      return;
    }
    if (typeof id === 'string') {
      setStatusMessage('Emoji reactions on device posts — use Amen or open post');
      return;
    }
    updatePost(id, (post) => {
      const reactions = { ...(post.reactions || {}) };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...post, reactions };
    });
  };

  const handlePraiseAction = (id: string | number, action: 'CLAP' | 'DANCE' | 'SHOUT') => {
    if (typeof id === 'string' && isDemoPostId(id)) {
      setDemoPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            stats: {
              ...p.stats,
              claps: action === 'CLAP' ? p.stats.claps + 1 : p.stats.claps,
              dances: action === 'DANCE' ? p.stats.dances + 1 : p.stats.dances,
              shouts: action === 'SHOUT' ? p.stats.shouts + 1 : p.stats.shouts,
            },
          };
        })
      );
    } else if (typeof id === 'string') {
      setStatusMessage('Open the post for full reactions');
      return;
    } else {
      updatePost(id, (post) => ({
        ...post,
        stats: {
          ...post.stats,
          claps: action === 'CLAP' ? post.stats.claps + 1 : post.stats.claps,
          dances: action === 'DANCE' ? post.stats.dances + 1 : post.stats.dances,
          shouts: action === 'SHOUT' ? post.stats.shouts + 1 : post.stats.shouts,
        },
      }));
    }

    setPraiseBurstPostId(id);
    setMusicPulsePostId(id);
    setStatusMessage(`${action} JOINED THE PRAISEBREAK`);

    setTimeout(() => {
      setPraiseBurstPostId((current) => (current === id ? null : current));
    }, 1400);

    setTimeout(() => {
      setMusicPulsePostId((current) => (current === id ? null : current));
    }, 2200);
  };

  const handleOpenMenu = (postUser: string) => {
    setStatusMessage(`POST OPTIONS FOR ${postUser}`);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'WRITE') {
      focusComposer();
      setStatusMessage('COMPOSER READY');
      return;
    }

    if (action === 'VIDEO') {
      videoInputRef.current?.click();
      setStatusMessage('SELECT A VIDEO');
      return;
    }

    if (action === 'PHOTO') {
      imageInputRef.current?.click();
      setStatusMessage('SELECT A PHOTO');
      return;
    }

    if (action === 'GO LIVE') {
      router.push('/live-studio');
      setStatusMessage('OPENING LIVE STUDIO');
      return;
    }

    if (action === 'PRAYER') {
      setSelectedTag('PRAYER');
      focusComposer();
      setStatusMessage('PRAYER CATEGORY SELECTED');
    }
  };

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>, typeLabel: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (selectedMediaUrl && selectedMediaUrl.startsWith('blob:')) {
      URL.revokeObjectURL(selectedMediaUrl);
    }

    const mediaType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
      ? 'video'
      : null;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;

      setSelectedFileName(file.name);
      setSelectedMediaType(mediaType);

      if (mediaType === 'image') {
        setCropModalImageUrl(result);
        setCropModalFileName(file.name);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        croppedAreaPixelsRef.current = null;
        setStatusMessage('CROP YOUR IMAGE');
      } else {
        setSelectedMediaUrl(result);
        setStatusMessage(`${typeLabel} ATTACHED`);
        focusComposer();
      }
    };

    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const handleCropCancel = () => {
    setCropModalImageUrl(null);
    setCropModalFileName('');
    setStatusMessage('CROP CANCELLED');
  };

  const handleCropApply = async () => {
    const imageUrl = cropModalImageUrl;
    const pixels = croppedAreaPixelsRef.current;
    if (!imageUrl || !pixels) {
      setSelectedMediaUrl(imageUrl || '');
      setCropModalImageUrl(null);
      return;
    }
    setCropBusy(true);
    try {
      const dataUrl = await getCroppedImageDataUrl(imageUrl, pixels);
      setSelectedMediaUrl(dataUrl);
      setSelectedFileName(cropModalFileName);
      setStatusMessage('IMAGE CROPPED');
      focusComposer();
    } catch {
      setStatusMessage('CROP FAILED');
    } finally {
      setCropModalImageUrl(null);
      setCropModalFileName('');
      setCropBusy(false);
    }
  };

  return (
    <main
      className={
        feedViewMode === 'tiktok'
          ? 'flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-black text-white selection:bg-[#00f2ff]/30 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]'
          : 'relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#0a0a0a] text-white selection:bg-[#00f2ff]/30'
      }
    >
      <div
        className={
          feedViewMode === 'tiktok'
            ? 'sticky top-0 z-[45] flex shrink-0 items-center gap-2 border-b border-white/10 bg-black/95 px-3 py-2 backdrop-blur-md'
            : 'sticky top-0 z-[45] flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#0a0a0a]/95 px-3 py-2 backdrop-blur-md'
        }
      >
        <button
          type="button"
          onClick={() => setSanctuaryExperience('home')}
          className="text-[11px] font-semibold text-[#00f2ff] transition hover:underline"
        >
          ← Home feed
        </button>
        <span className="text-[10px] text-white/35">Testify · pulse & grid</span>
      </div>
      {/* Image crop modal */}
      {cropModalImageUrl ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#010101]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-[10px] text-[#00f2ff] uppercase tracking-[6px]">
              Drag to position · Pinch or use slider to zoom
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-4 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[6px] text-white/80 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropApply}
                disabled={cropBusy}
                className="px-4 py-2 rounded-full bg-[#00f2ff] text-[#010101] text-[10px] font-black uppercase tracking-[6px] disabled:opacity-50"
              >
                {cropBusy ? 'Applying…' : 'Use crop'}
              </button>
            </div>
          </div>
          <div className="flex-1 relative min-h-0">
            <Cropper
              image={cropModalImageUrl}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{ containerStyle: { backgroundColor: '#010101' } }}
              classes={{}}
            />
          </div>
          <div className="px-4 py-3 border-t border-white/10 flex items-center gap-4">
            <span className="text-[10px] text-white/50 uppercase tracking-[6px]">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none bg-white/10 accent-[#00f2ff]"
            />
          </div>
        </div>
      ) : null}

      <input
        ref={mediaInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx,.mp4,.mov,.png,.jpg,.jpeg"
        onChange={(e) => handleMediaSelect(e, 'MEDIA')}
      />

      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleMediaSelect(e, 'PHOTO')}
      />

      <input
        ref={videoInputRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={(e) => handleMediaSelect(e, 'VIDEO')}
      />

      {feedViewMode === 'tiktok' ? (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-black/95 px-3 py-2.5 backdrop-blur-xl sm:gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="mr-1 flex rounded-xl border border-white/10 bg-black/50 p-0.5"
                role="group"
                aria-label="Feed layout"
              >
                <button
                  type="button"
                  onClick={() => setFeedViewMode('tiktok')}
                  className="flex items-center gap-1 rounded-lg bg-[#00f2ff] px-2 py-1.5 text-[9px] font-black uppercase tracking-wide text-black transition"
                  title="TikTok-style full-screen feed"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Feed
                </button>
                <button
                  type="button"
                  onClick={() => setFeedViewMode('portal')}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-black uppercase tracking-wide text-white/45 transition hover:text-white/75"
                  title="Classic portal with grid and tools"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Portal
                </button>
              </div>
              <button
                type="button"
                onClick={() => router.push('/following?tab=discover')}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:border-[#00f2ff]/40 hover:text-[#00f2ff] transition-colors"
                title="Following & Discover"
              >
                <Users className="h-4 w-4" />
              </button>
            </div>
            <span className="hidden text-[10px] text-white/40 sm:inline">
              {followingIds.length} following
            </span>
          </header>
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <GlobalPulseGlobe />
            <TestifyTikTokFeed
              posts={tiktokFeedPosts}
              feedFilter={feedFilter}
              onFeedFilterChange={setFeedFilter}
              userDisplayName={currentUsername}
              userAvatarUrl={myAvatarUrl && myAvatarUrl !== '/logo.svg' ? myAvatarUrl : null}
              anointingLevel={anointingLevel}
              onGoLive={() => {
                router.push('/live-studio');
                setStatusMessage('OPENING LIVE STUDIO');
              }}
              onFollowingNavigate={goToFollowingDiscover}
              formatRelativeTime={formatRelativeTime}
              onAmen={handleAmen}
              onComment={handleComment}
              onShare={handleShare}
              onPraiseBreak={handlePraiseBreak}
              onOpenMenu={handleOpenMenu}
              onStatusMessage={setStatusMessage}
              onFocusComposer={focusComposer}
              fillViewport
            />
          </div>
        </div>
      ) : (
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-hide pb-6">
      <div className="mx-auto w-full min-w-0 max-w-full px-3 pt-2 sm:px-4">
          <div className="flex min-w-0 w-full flex-col gap-5">
        <aside className="order-2 z-20 w-full shrink-0 md:order-2">
          <LivePersonnelRail
            variant="sidebar"
            clusters={personnelClusters}
            onJoinMember={handleJoinPresence}
            onOpenFullPulse={() => setPulseOpen(true)}
            onlineCount={presence.length}
            streakFlame={streakDays}
          />
        </aside>

        <div className="order-1 mx-auto min-w-0 w-full max-w-full flex-1">
        <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
            <div
              className="flex rounded-xl border border-white/10 bg-black/50 p-0.5"
              role="group"
              aria-label="Feed layout"
            >
              <button
                type="button"
                onClick={() => setFeedViewMode('tiktok')}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-black uppercase tracking-wide text-white/45 transition hover:text-white/75"
                title="Full-screen TikTok-style feed"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Feed
              </button>
              <button
                type="button"
                onClick={() => setFeedViewMode('portal')}
                className="flex items-center gap-1 rounded-lg bg-[#00f2ff] px-2 py-1.5 text-[9px] font-black uppercase tracking-wide text-black transition"
                title="Portal grid with pulse & archive"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Portal
              </button>
            </div>
            <button
              type="button"
              onClick={() => router.push('/following?tab=discover')}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:border-[#00f2ff]/40 hover:text-[#00f2ff] transition-colors"
              title="Following & Discover"
            >
              <Users className="h-4 w-4" />
            </button>
            <span className="text-[10px] text-white/35">
              {followingIds.length} following
            </span>
        </div>

        <div className="flex flex-col gap-4">
          <aside className="hidden space-y-6" aria-hidden>
            <section className="border border-[#00f2ff]/15 bg-black/60 rounded-[2rem] p-6 backdrop-blur-xl">
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-[10px] mb-4">
                LIVE SIGNAL
              </p>

              <h2 className="text-white text-2xl font-black italic uppercase tracking-[-0.08em] leading-none">
                A Living Feed
              </h2>

              <p className="text-white/55 text-sm leading-7 mt-4">
                Sanctuary is the community witness wall where believers share praise reports, live moments, encouragement, and media based testimony in real time.
              </p>

              <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-transparent via-[#00f2ff]/40 to-transparent" />

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border border-[#00f2ff]/10 rounded-2xl px-4 py-4 bg-[#00f2ff]/5">
                  <span className="text-[10px] uppercase tracking-[8px] text-white/45">
                    LIVE NOW
                  </span>
                  <span className="text-[#00f2ff] font-black italic text-lg tracking-[-0.08em]">
                    08
                  </span>
                </div>

                <div className="flex items-center justify-between border border-[#00f2ff]/10 rounded-2xl px-4 py-4 bg-white/[0.02]">
                  <span className="text-[10px] uppercase tracking-[8px] text-white/45">
                    TOTAL POSTS
                  </span>
                  <span className="text-white font-black italic text-lg tracking-[-0.08em]">
                    {feed.length}
                  </span>
                </div>

                <div className="flex items-center justify-between border border-[#00f2ff]/10 rounded-2xl px-4 py-4 bg-white/[0.02]">
                  <span className="text-[10px] uppercase tracking-[8px] text-white/45">
                    STATUS
                  </span>
                  <span className="text-white font-black italic text-sm tracking-[-0.04em] text-right">
                    {statusMessage}
                  </span>
                </div>
              </div>
            </section>

            <section className="border border-[#00f2ff]/15 bg-black/60 rounded-[2rem] p-6 backdrop-blur-xl">
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-[10px] mb-5">
                TRENDING THEMES
              </p>

              <div className="flex flex-wrap gap-3">
                {storyChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedTag(chip)}
                    className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[6px] transition-all ${
                      selectedTag === chip
                        ? 'border-[#00f2ff]/40 bg-[#00f2ff]/12 text-[#00f2ff]'
                        : 'border-[#00f2ff]/20 bg-[#00f2ff]/5 text-white/70 hover:text-[#00f2ff] hover:border-[#00f2ff]/40'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <section className="space-y-4 w-full">
            <div className="rounded-sm border border-neutral-800 bg-[#0a0a0a] shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
            <div className="flex gap-3 overflow-x-auto p-3 [scrollbar-width:thin]">
              {storyRingPeople.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => (c.id === 'me' ? focusComposer() : undefined)}
                  className="flex flex-col items-center gap-1.5 shrink-0 w-[72px] group"
                >
                  <div
                    className={`rounded-full p-[2.5px] transition-transform group-active:scale-95 ${
                      c.isLive
                        ? 'bg-gradient-to-tr from-fuchsia-500 via-orange-400 to-[#00f2ff]'
                        : 'bg-gradient-to-tr from-white/30 to-white/10'
                    }`}
                  >
                    <div className="rounded-full bg-[#0a0a0f] p-[3px]">
                      <ChannelAvatar c={c} className="h-[52px] w-[52px] rounded-full border-0" />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-white/75 truncate w-full text-center leading-tight">
                    {c.id === 'me' ? 'Your story' : c.name}
                  </span>
                  {c.id !== 'me' ? (
                    <span className="text-[9px] text-white/40 truncate w-full text-center">
                      {c.handle}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            </div>

            <section className="overflow-hidden rounded-sm border border-neutral-800 bg-[#0a0a0a] shadow-[0_1px_3px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between bg-[#0a0a0a]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#00f2fe]/90 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  New post
                </p>
                <span className="text-[10px] text-white/35">{statusMessage}</span>
              </div>

              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full border border-[#00f2ff]/30 bg-gradient-to-br from-[#00f2ff]/20 to-purple-500/10 flex items-center justify-center text-xs font-bold text-[#00f2ff] shrink-0">
                    {avatarInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <textarea
                      ref={composerRef}
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      placeholder="What’s God doing in your life?"
                      className="w-full min-h-[100px] rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/35 leading-relaxed resize-none outline-none focus:border-[#00f2ff]/40 focus:ring-1 focus:ring-[#00f2ff]/20"
                    />

                    {selectedMediaUrl ? (
                      <div className="mt-4 rounded-[1.25rem] border border-[#00f2ff]/15 bg-[#00f2ff]/8 p-3">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <p className="text-[10px] text-[#00f2ff] uppercase tracking-[6px]">
                            ATTACHED: {selectedFileName}
                          </p>
                          <button
                            onClick={() => {
                              clearSelectedMedia();
                              setStatusMessage('ATTACHMENT REMOVED');
                            }}
                            className="text-[10px] text-white/60 uppercase tracking-[6px] hover:text-[#00f2ff] transition-colors"
                          >
                            Remove
                          </button>
                        </div>

                        {selectedMediaType === 'image' ? (
                          <div className="relative w-full overflow-hidden rounded-[1rem] border border-[#00f2ff]/10 bg-black/40 flex items-center justify-center">
                            <img
                              src={selectedMediaUrl}
                              alt={selectedFileName || 'Selected upload preview'}
                              className="max-w-full max-h-[320px] w-auto h-auto object-contain"
                            />
                          </div>
                        ) : selectedMediaType === 'video' ? (
                          <div className="overflow-hidden rounded-[1rem] border border-[#00f2ff]/10 bg-black/40">
                            <video
                              src={selectedMediaUrl}
                              controls
                              className="w-full max-h-[320px]"
                            />
                          </div>
                        ) : (
                          <div className="rounded-[1rem] border border-[#00f2ff]/10 bg-black/40 px-4 py-6 text-center">
                            <p className="text-[10px] text-white/45 uppercase tracking-[6px]">
                              FILE READY TO POST
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-3 mt-4">
                      {quickActions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleQuickAction(action)}
                          className="px-4 py-2 rounded-full border border-[#00f2ff]/20 bg-[#00f2ff]/5 text-[10px] font-black uppercase tracking-[6px] text-white/75 hover:text-[#00f2ff] hover:border-[#00f2ff]/40 transition-all"
                        >
                          {action}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-5 gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-[10px] text-white/25 uppercase tracking-[6px]">
                          Category
                        </p>
                        <div className="px-4 py-2 rounded-full border border-[#00f2ff]/25 bg-[#00f2ff]/10 text-[10px] font-black uppercase tracking-[6px] text-[#00f2ff]">
                          {selectedTag}
                        </div>
                      </div>

                      <button
                        onClick={handlePublish}
                        className="px-6 py-3 rounded-full bg-[#00f2ff] text-[#010101] font-black italic uppercase tracking-tight shadow-[0_0_20px_rgba(0,242,255,0.35)] hover:scale-105 active:scale-95 transition-all"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

              <TestifyLivePortalFeed
                posts={gridPosts}
                feedFilter={feedFilter}
                onFeedFilterChange={setFeedFilter}
                portalSection={portalSection}
                onPortalSectionChange={setPortalSection}
                streak={streakDays}
                faithfulUnlocked={faithfulUnlocked}
                gems={gemsBalance}
                onSpendGems={handleSpendGems}
                pipUrl={pipMediaUrl}
                pipTitle={pipLabel}
                onSetPip={handleSetPip}
                praiseBurstPostId={praiseBurstPostId}
                musicPulsePostId={musicPulsePostId}
                formatRelativeTime={formatRelativeTime}
                onAmen={handleAmen}
                onComment={handleComment}
                onShare={handleShare}
                onPraiseBreak={handlePraiseBreak}
                onReaction={handleReaction}
                onPraiseAction={handlePraiseAction}
                onOpenMenu={handleOpenMenu}
                onStatusMessage={setStatusMessage}
                emptyFeedFilter={feedFilter}
                onFocusComposer={focusComposer}
                onFindPeople={() => router.push('/following?tab=discover')}
                onFollowingNavigate={goToFollowingDiscover}
                rippleByPostId={rippleByPostId}
                pipSeekSeconds={pipSeekSeconds}
                onPipSeekConsumed={handlePipSeekConsumed}
                toasts={toasts}
                dismissToast={dismissToast}
                congratulateToast={congratulateToast}
              />
          </section>

          <aside className="hidden space-y-6" aria-hidden>
            <section className="border border-[#00f2ff]/15 bg-black/60 rounded-[2rem] p-6 backdrop-blur-xl">
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-[10px] mb-5">
                START HERE
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    focusComposer();
                    setStatusMessage('COMPOSER READY');
                  }}
                  className="w-full text-left px-5 py-4 rounded-[1.25rem] border border-[#00f2ff]/15 bg-[#00f2ff]/8 hover:border-[#00f2ff]/35 transition-all"
                >
                  <p className="text-white font-black italic uppercase tracking-[-0.08em] text-lg">
                    Write Testimony
                  </p>
                  <p className="text-[10px] text-white/35 uppercase tracking-[6px] mt-2">
                    POST A WRITTEN WITNESS
                  </p>
                </button>

                <button
                  onClick={() => {
                    mediaInputRef.current?.click();
                    setStatusMessage('SELECT MEDIA');
                  }}
                  className="w-full text-left px-5 py-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] hover:border-[#00f2ff]/25 transition-all"
                >
                  <p className="text-white font-black italic uppercase tracking-[-0.08em] text-lg">
                    Upload Media
                  </p>
                  <p className="text-[10px] text-white/35 uppercase tracking-[6px] mt-2">
                    VIDEO • PHOTO • REPLAY
                  </p>
                </button>

                <button
                  onClick={() => {
                    router.push('/live-studio');
                    setStatusMessage('OPENING LIVE STUDIO');
                  }}
                  className="w-full text-left px-5 py-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] hover:border-[#00f2ff]/25 transition-all"
                >
                  <p className="text-white font-black italic uppercase tracking-[-0.08em] text-lg">
                    Go Live
                  </p>
                  <p className="text-[10px] text-white/35 uppercase tracking-[6px] mt-2">
                    START A LIVE TESTIMONY
                  </p>
                </button>
              </div>
            </section>

            <section className="border border-[#00f2ff]/15 bg-black/60 rounded-[2rem] p-6 backdrop-blur-xl">
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-[10px] mb-5">
                COMMUNITY PULSE
              </p>

              <div className="space-y-4">
                {[
                  'A testimony can shift a room',
                  'Your witness becomes somebody else’s hope',
                  'Go live when the moment is still burning',
                ].map((line) => (
                  <button
                    key={line}
                    onClick={() => {
                      setPostText(line);
                      focusComposer();
                      setStatusMessage('PROMPT LOADED');
                    }}
                    className="w-full text-left rounded-[1.25rem] border border-[#00f2ff]/10 bg-white/[0.02] px-4 py-4 hover:border-[#00f2ff]/25 transition-all"
                  >
                    <p className="text-white/65 text-sm leading-7">
                      {line}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className="border border-[#00f2ff]/15 bg-black/60 rounded-[2rem] p-6 backdrop-blur-xl">
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-[10px] mb-5">
                CELEBRATE
              </p>

              <button
                onClick={() => {
                  if (filteredFeed.length > 0) {
                    handlePraiseBreak(filteredFeed[0].id);
                  }
                }}
                className="w-full rounded-[1.25rem] border border-[#00f2ff]/20 bg-[#00f2ff]/8 px-5 py-5 hover:border-[#00f2ff]/35 transition-all"
              >
                <p className="text-[#00f2ff] font-black italic uppercase tracking-[-0.08em] text-xl">
                  Trigger PraiseBreak
                </p>
                <p className="text-[10px] text-white/35 uppercase tracking-[6px] mt-2">
                  LET THE COMMUNITY CELEBRATE
                </p>
              </button>
            </section>
          </aside>
        </div>
        </div>
        </div>
      </div>
          </div>
        </div>
        <SanctuaryHomeSidebar
          username={currentUsername}
          displayLine={userProfile?.full_name ?? userProfile?.username ?? undefined}
          avatarUrl={myAvatarUrl && myAvatarUrl !== '/logo.svg' ? myAvatarUrl : null}
          suggestions={allFollowers.filter((c) => c.id !== 'me').slice(0, 8)}
        />
      </div>
      )}

      <ActivityPulseDrawer
        open={pulseOpen}
        onClose={() => setPulseOpen(false)}
        vibeDisplay={vibeDisplay}
        vibeFillPercent={vibeFillPercent}
        presence={presence}
        topicCloud={topicCloud}
        onJoin={handleJoinPresence}
        onStatusMessage={setStatusMessage}
      />

      <button
        type="button"
        onClick={() => {
          focusComposer();
          setStatusMessage('COMPOSER READY');
        }}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black/20 bg-[#00f2ff] shadow-[0_0_24px_rgba(0,242,255,0.45)] transition-all hover:scale-105 active:scale-95 sm:right-6 sm:h-16 sm:w-16 lg:bottom-8 lg:right-6"
      >
        <span className="text-black font-black text-2xl leading-none">+</span>
      </button>

    </main>
  );
}