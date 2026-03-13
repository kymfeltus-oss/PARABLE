'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';

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

const DEFAULT_FEED: TestimonyPost[] = [
  {
    id: 1,
    user: 'KYM THE CEO',
    time: 'JUST NOW',
    tag: 'BREAKTHROUGH',
    text: 'Today I am choosing to testify before the manifestation fully arrives. I am honoring what God has already done, what He is doing now, and what He promised will not return void.',
    createdAt: Date.now() - 1000 * 60 * 2,
    stats: { amens: 284, comments: 41, shares: 12, praiseBreaks: 18, claps: 14, dances: 9, shouts: 21 },
  },
  {
    id: 2,
    user: 'SANCTUARY MEDIA',
    time: '12 MIN AGO',
    tag: 'WORSHIP',
    text: 'There is something powerful about a community that refuses to be silent. Every testimony becomes evidence. Every witness becomes a light for somebody still praying in the dark.',
    createdAt: Date.now() - 1000 * 60 * 12,
    stats: { amens: 198, comments: 27, shares: 9, praiseBreaks: 11, claps: 10, dances: 8, shouts: 12 },
  },
  {
    id: 3,
    user: 'FAITH STREAMER',
    time: '34 MIN AGO',
    tag: 'RESTORATION',
    text: 'I came back to this space just to say God restored what I thought was permanently broken. Relationships, peace, vision, and even my confidence. I had to come testify.',
    createdAt: Date.now() - 1000 * 60 * 34,
    stats: { amens: 463, comments: 88, shares: 31, praiseBreaks: 29, claps: 18, dances: 16, shouts: 33 },
  },
];

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
  window.localStorage.setItem(TESTIMONY_STORAGE_KEY, JSON.stringify(posts));
  window.dispatchEvent(new Event('parable:testimonies-updated'));
}

export default function TestifyPage() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedTag, setSelectedTag] = useState('BREAKTHROUGH');
  const [feedFilter, setFeedFilter] = useState('FOR YOU');
  const [statusMessage, setStatusMessage] = useState('READY TO TESTIFY');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedMediaUrl, setSelectedMediaUrl] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | null>(null);
  const [praiseBurstPostId, setPraiseBurstPostId] = useState<number | null>(null);
  const [musicPulsePostId, setMusicPulsePostId] = useState<number | null>(null);
  const [feed, setFeed] = useState<TestimonyPost[]>(DEFAULT_FEED);

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

    const refreshFeed = () => {
      setFeed(loadStoredTestimonies());
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshFeed();
      }
    };

    window.addEventListener('focus', refreshFeed);
    window.addEventListener('parable:testimonies-updated', refreshFeed);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', refreshFeed);
      window.removeEventListener('parable:testimonies-updated', refreshFeed);
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

  if (!isMounted) {
    return <div className="min-h-screen bg-[#010101]" />;
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
    composerRef.current?.focus();
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      user: 'KYM THE CEO',
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

  const handleAmen = (id: number) => {
    updatePost(id, (post) => ({
      ...post,
      stats: { ...post.stats, amens: post.stats.amens + 1 },
    }));
    setStatusMessage('AMEN ADDED');
  };

  const handleComment = (id: number) => {
    const comment = window.prompt('Enter a quick comment for this testimony:');
    if (!comment || !comment.trim()) return;

    updatePost(id, (post) => ({
      ...post,
      stats: { ...post.stats, comments: post.stats.comments + 1 },
    }));
    setStatusMessage('COMMENT ADDED');
  };

  const handleShare = async (id: number) => {
    const post = feed.find((item) => item.id === id);
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

      updatePost(id, (item) => ({
        ...item,
        stats: { ...item.stats, shares: item.stats.shares + 1 },
      }));

      setStatusMessage('TESTIMONY SHARED');
    } catch {
      setStatusMessage('SHARE CANCELLED');
    }
  };

  const handleSupport = (id: number) => {
    updatePost(id, (post) => ({
      ...post,
      stats: { ...post.stats, amens: post.stats.amens + 1 },
    }));
    setStatusMessage('SUPPORT SENT');
  };

  const handlePraiseBreak = (id: number) => {
    updatePost(id, (post) => ({
      ...post,
      stats: { ...post.stats, praiseBreaks: post.stats.praiseBreaks + 1 },
    }));

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

  const handlePraiseAction = (id: number, action: 'CLAP' | 'DANCE' | 'SHOUT') => {
    updatePost(id, (post) => ({
      ...post,
      stats: {
        ...post.stats,
        claps: action === 'CLAP' ? post.stats.claps + 1 : post.stats.claps,
        dances: action === 'DANCE' ? post.stats.dances + 1 : post.stats.dances,
        shouts: action === 'SHOUT' ? post.stats.shouts + 1 : post.stats.shouts,
      },
    }));

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
      setSelectedMediaUrl(result);
      setSelectedMediaType(mediaType);
      setStatusMessage(`${typeLabel} ATTACHED`);
      focusComposer();
    };

    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const filteredFeed =
    feedFilter === 'LIVE'
      ? feed.filter((post) => post.tag === 'WORSHIP' || post.tag === 'BREAKTHROUGH' || post.tag === 'PRAYER')
      : feedFilter === 'FOLLOWING'
      ? feed.filter((post) => post.user === 'KYM THE CEO' || post.user === 'FAITH STREAMER')
      : feed;

  return (
    <main className="min-h-screen bg-[#010101] text-white selection:bg-[#00f2ff]/30">
      <Header title="TESTIFY" />

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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <aside className="xl:col-span-3 space-y-6">
            <section className="border border-[#00f2ff]/15 bg-black/60 rounded-[2rem] p-6 backdrop-blur-xl">
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-[10px] mb-4">
                LIVE SIGNAL
              </p>

              <h2 className="text-white text-2xl font-black italic uppercase tracking-[-0.08em] leading-none">
                A Living Feed
              </h2>

              <p className="text-white/55 text-sm leading-7 mt-4">
                TESTIFY is the community witness wall where believers share praise reports, live moments, encouragement, and media based testimony in real time.
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

          <section className="xl:col-span-6 space-y-6">
            <section className="border border-[#00f2ff]/15 bg-black/70 rounded-[2.25rem] p-5 md:p-6 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,242,255,0.06)]">
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-[10px] mb-4">
                RELEASE A TESTIMONY
              </p>

              <div className="border border-[#00f2ff]/10 rounded-[1.75rem] bg-white/[0.02] p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border border-[#00f2ff]/25 bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] font-black italic text-sm shrink-0">
                    KF
                  </div>

                  <div className="flex-1">
                    <textarea
                      ref={composerRef}
                      value={postText}
                      onChange={(e) => setPostText(e.target.value)}
                      placeholder="Share what God has done. Post a praise report, a written testimony, a live moment, or a witness for the community."
                      className="w-full min-h-[140px] rounded-[1.5rem] border border-[#00f2ff]/10 bg-black/40 px-5 py-4 text-white placeholder:text-white/35 text-sm leading-7 resize-none outline-none focus:border-[#00f2ff]/30"
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
                          <div className="relative w-full overflow-hidden rounded-[1rem] border border-[#00f2ff]/10 bg-black/40">
                            <img
                              src={selectedMediaUrl}
                              alt={selectedFileName || 'Selected upload preview'}
                              className="w-full max-h-[320px] object-cover"
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

            <section className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-[10px]">
                LATEST TESTIMONIES
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                {['FOR YOU', 'FOLLOWING', 'LIVE'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFeedFilter(tab)}
                    className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[6px] transition-all ${
                      feedFilter === tab
                        ? 'border-[#00f2ff]/25 bg-[#00f2ff]/10 text-[#00f2ff]'
                        : 'border-white/10 bg-white/[0.03] text-white/45 hover:text-white/70'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </section>

            <div className="space-y-6">
              {filteredFeed.map((post) => (
                <article
                  key={post.id}
                  className="relative border border-[#00f2ff]/12 bg-black/70 rounded-[2.25rem] overflow-hidden backdrop-blur-xl hover:border-[#00f2ff]/25 transition-all"
                >
                  {praiseBurstPostId === post.id ? (
                    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                      <div className="absolute inset-0 bg-[#00f2ff]/10 animate-pulse" />
                      <div className="absolute inset-x-0 top-6 flex items-center justify-center">
                        <div className="rounded-full border border-[#00f2ff]/30 bg-black/70 px-6 py-3 shadow-[0_0_30px_rgba(0,242,255,0.25)]">
                          <span className="text-[#00f2ff] font-black italic uppercase tracking-[0.25em] text-sm">
                            PRAISEBREAK
                          </span>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-6 opacity-80">
                          {Array.from({ length: 9 }).map((_, index) => (
                            <span
                              key={index}
                              className="text-[#00f2ff] text-xl font-black animate-bounce"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              ✦
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full border border-[#00f2ff]/20 bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] font-black italic text-sm shrink-0">
                          {post.user
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)}
                        </div>

                        <div>
                          <h3 className="text-white text-lg font-black italic uppercase tracking-[-0.08em]">
                            {post.user}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] text-white/35 uppercase tracking-[6px]">
                              {formatRelativeTime(post.createdAt)}
                            </p>
                            <span className="text-[10px] text-[#00f2ff] uppercase tracking-[6px]">
                              {post.tag}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenMenu(post.user)}
                        className="text-white/30 hover:text-[#00f2ff] text-xl transition-colors"
                      >
                        •••
                      </button>
                    </div>

                    <p className="text-white/78 text-[15px] leading-8 mt-5 whitespace-pre-line">
                      {post.text}
                    </p>

                    {post.mediaUrl ? (
                      <div className="mt-5 rounded-[1.75rem] border border-[#00f2ff]/10 bg-gradient-to-b from-[#00f2ff]/10 to-transparent overflow-hidden">
                        {post.mediaType === 'image' ? (
                          <div className="relative w-full bg-black/40">
                            <img
                              src={post.mediaUrl}
                              alt={post.mediaName || 'Uploaded testimony image'}
                              className="w-full max-h-[520px] object-cover"
                            />
                          </div>
                        ) : post.mediaType === 'video' ? (
                          <video
                            src={post.mediaUrl}
                            controls
                            className="w-full max-h-[520px] bg-black/40"
                          />
                        ) : (
                          <div className="aspect-[16/10] bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.12),transparent_55%)] flex items-center justify-center">
                            <div className="text-center px-6">
                              <p className="text-[#00f2ff] text-3xl font-black italic uppercase tracking-[-0.08em] opacity-85">
                                FILE ATTACHED
                              </p>
                              <p className="text-[10px] text-white/30 uppercase tracking-[8px] mt-3">
                                {post.mediaName || 'MEDIA READY'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[1.75rem] border border-[#00f2ff]/10 bg-gradient-to-b from-[#00f2ff]/10 to-transparent overflow-hidden">
                        <div className="aspect-[16/10] bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.12),transparent_55%)] flex items-center justify-center">
                          <div className="text-center px-6">
                            <p className="text-[#00f2ff] text-3xl font-black italic uppercase tracking-[-0.08em] opacity-85">
                              TESTIMONY STREAM
                            </p>
                            <p className="text-[10px] text-white/30 uppercase tracking-[8px] mt-3">
                              LIVE FEED PREVIEW
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 rounded-[1.25rem] border border-[#00f2ff]/10 bg-white/[0.02] px-4 py-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <p className="text-[10px] text-[#00f2ff] uppercase tracking-[6px]">
                          PRAISEBREAK ENERGY
                        </p>
                        <p className="text-[10px] text-white/45 uppercase tracking-[6px]">
                          MUSIC • DRUMS • DANCE
                        </p>
                      </div>

                      <div className="mt-3 h-3 rounded-full bg-black/50 overflow-hidden border border-[#00f2ff]/10">
                        <div
                          className={`h-full bg-gradient-to-r from-[#00f2ff] via-cyan-300 to-white transition-all duration-500 ${
                            musicPulsePostId === post.id ? 'animate-pulse' : ''
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (post.stats.praiseBreaks + post.stats.claps + post.stats.dances + post.stats.shouts) * 4
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2">
                        <button
                          onClick={() => handlePraiseBreak(post.id)}
                          className="px-3 py-3 rounded-[1rem] border border-[#00f2ff]/20 bg-[#00f2ff]/10 text-[10px] font-black uppercase tracking-[4px] text-[#00f2ff] hover:text-white transition-all"
                        >
                          PraiseBreak {post.stats.praiseBreaks}
                        </button>
                        <button
                          onClick={() => handlePraiseAction(post.id, 'CLAP')}
                          className="px-3 py-3 rounded-[1rem] border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-[4px] text-white/70 hover:text-[#00f2ff] transition-all"
                        >
                          Clap {post.stats.claps}
                        </button>
                        <button
                          onClick={() => handlePraiseAction(post.id, 'DANCE')}
                          className="px-3 py-3 rounded-[1rem] border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-[4px] text-white/70 hover:text-[#00f2ff] transition-all"
                        >
                          Dance {post.stats.dances}
                        </button>
                        <button
                          onClick={() => handlePraiseAction(post.id, 'SHOUT')}
                          className="px-3 py-3 rounded-[1rem] border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-[4px] text-white/70 hover:text-[#00f2ff] transition-all"
                        >
                          Shout {post.stats.shouts}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between flex-wrap gap-4 border-t border-[#00f2ff]/10 pt-4">
                      <div className="flex items-center gap-5 flex-wrap">
                        <button
                          onClick={() => handleAmen(post.id)}
                          className="text-[10px] text-white/60 uppercase tracking-[6px] hover:text-[#00f2ff] transition-colors"
                        >
                          Amen {post.stats.amens}
                        </button>
                        <button
                          onClick={() => handleComment(post.id)}
                          className="text-[10px] text-white/60 uppercase tracking-[6px] hover:text-[#00f2ff] transition-colors"
                        >
                          Comments {post.stats.comments}
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="text-[10px] text-white/60 uppercase tracking-[6px] hover:text-[#00f2ff] transition-colors"
                        >
                          Share {post.stats.shares}
                        </button>
                      </div>

                      <button
                        onClick={() => handleSupport(post.id)}
                        className="px-4 py-2 rounded-full border border-[#00f2ff]/20 bg-[#00f2ff]/5 text-[10px] font-black uppercase tracking-[6px] text-[#00f2ff] hover:bg-[#00f2ff]/10 transition-all"
                      >
                        Support
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="xl:col-span-3 space-y-6">
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

      <button
        onClick={() => {
          focusComposer();
          setStatusMessage('COMPOSER READY');
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#00f2ff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:scale-110 active:scale-95 transition-all z-50"
      >
        <span className="text-[#010101] font-black italic text-xl tracking-tighter">+</span>
      </button>
    </main>
  );
}