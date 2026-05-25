"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  PlusCircle,
  Radio,
  Share2,
  ShieldAlert,
  Ticket,
  Tv,
  UserCheck,
  Video,
  X,
} from "lucide-react";
import { DEMO_AVATAR_FALLBACK } from "@/lib/demo-personas";

export interface NetworkProfile {
  id: string;
  username: string;
  avatar_url: string;
  category_role: string;
  is_verified_badge: boolean;
}

export interface TrayMediaItem {
  id: string;
  profile: NetworkProfile;
  is_broadcasting_live: boolean;
  active_viewers_count?: number;
  has_unviewed_content?: boolean;
}

export interface PostSlide {
  id: string;
  media_url: string;
  media_type: "image" | "video";
}

export interface TimelinePost {
  id: string;
  profile: NetworkProfile;
  caption: string;
  media_content_url: string;
  slides?: PostSlide[];
  asset_format_mode: "image" | "video";
  total_likes: number;
  total_comments: number;
  has_user_liked?: boolean;
  time_stamp_label: string;
  is_simulated_persona?: boolean;
}

export interface PremiumStreamEvent {
  id: string;
  host_profile: NetworkProfile;
  event_title: string;
  event_details: string;
  cover_thumbnail_url: string;
  broadcast_time_string: string;
  ticket_cost_token: number;
  is_user_registered?: boolean;
}

type Props = {
  initialPosts?: TimelinePost[];
  activeStreams?: TrayMediaItem[];
  premiumEvents?: PremiumStreamEvent[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  currentUserProfile?: NetworkProfile;
};

const STUDIO_MAX_BYTES = 10 * 1024 * 1024;

function picsum(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function avatarSeed(username: string): string {
  const key = username.replace(/^@/, "").trim().toLowerCase();
  const demoKeys = ["pastor_james", "sister_sarah", "gospel_vibe", "kingdom_gamer", "prophetic_voices"];
  if (demoKeys.includes(key)) return `/demo/avatars/${key}.svg`;
  return "/demo/avatars/default.svg";
}

function mediaFallback(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEMO_AVATAR_FALLBACK;
}

/**
 * Step 2 feed engine: timeline, carousel slides, upload studio, ticketing sidebar.
 */
export default function SanctuaryHomeFeedEngine({
  initialPosts = [],
  activeStreams = [],
  premiumEvents = [],
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  currentUserProfile,
}: Props) {
  const [trayCollection, setTrayCollection] = useState<TrayMediaItem[]>([]);
  const [timelineFeed, setTimelineFeed] = useState<TimelinePost[]>([]);
  const [eventDirectory, setEventDirectory] = useState<PremiumStreamEvent[]>([]);
  const [focusedEvent, setFocusedEvent] = useState<PremiumStreamEvent | null>(null);
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});

  const [isTicketingModalOpen, setIsTicketingModalOpen] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const [studioCaption, setStudioCaption] = useState("");
  const [studioFormat, setStudioFormat] = useState<"image" | "video">("image");
  const [studioFile, setStudioFile] = useState<File | null>(null);
  const [studioFilePreview, setStudioFilePreview] = useState<string | null>(null);
  const [studioAlert, setStudioAlert] = useState<string | null>(null);
  const [isPublishingPost, setIsPublishingPost] = useState(false);

  const [heartBurstPostId, setHeartBurstPostId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{ postId: string; t: number } | null>(null);
  const studioPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeStreams.length > 0 || initialPosts.length > 0 || premiumEvents.length > 0) {
      if (activeStreams.length > 0) setTrayCollection(activeStreams);
      if (initialPosts.length > 0) setTimelineFeed(initialPosts);
      if (premiumEvents.length > 0) setEventDirectory(premiumEvents);
      return;
    }

    const simulationPersonas: NetworkProfile[] = [
      {
        id: "a1000000-0000-4000-8000-000000000001",
        username: "pastor_james",
        avatar_url: avatarSeed("pastor_james"),
        category_role: "Pastor",
        is_verified_badge: true,
      },
      {
        id: "a1000000-0000-4000-8000-000000000003",
        username: "gospel_vibe",
        avatar_url: avatarSeed("gospel_vibe"),
        category_role: "Worship Leader",
        is_verified_badge: true,
      },
      {
        id: "a1000000-0000-4000-8000-000000000004",
        username: "kingdom_gamer",
        avatar_url: avatarSeed("kingdom_gamer"),
        category_role: "Gamer",
        is_verified_badge: false,
      },
    ];

    setTrayCollection([
      {
        id: "tray_sim_1",
        profile: simulationPersonas[0],
        is_broadcasting_live: true,
        active_viewers_count: 1420,
      },
      {
        id: "tray_sim_2",
        profile: simulationPersonas[1],
        is_broadcasting_live: true,
        active_viewers_count: 840,
      },
      {
        id: "tray_sim_3",
        profile: simulationPersonas[2],
        is_broadcasting_live: false,
        has_unviewed_content: true,
      },
    ]);

    setTimelineFeed([
      {
        id: "post_sim_carousel_1",
        profile: simulationPersonas[0],
        caption:
          "Slide left to review visual design updates and layouts for our sanctuary app launch! Let me know your thoughts down below in the comments section.",
        media_content_url: "",
        asset_format_mode: "image",
        slides: [
          { id: "sl_1", media_url: picsum("carousel-slide-1", 1280, 720), media_type: "image" },
          { id: "sl_2", media_url: picsum("carousel-slide-2", 1280, 720), media_type: "image" },
          { id: "sl_3", media_url: picsum("carousel-slide-3", 1280, 720), media_type: "image" },
        ],
        total_likes: 489,
        total_comments: 42,
        has_user_liked: false,
        time_stamp_label: "45 mins ago",
        is_simulated_persona: true,
      },
      {
        id: "post_sim_2",
        profile: simulationPersonas[1],
        caption:
          "Worshipping live tonight in Dallas! Join the feed or grab a pass for the breakout session inside the events panel.",
        media_content_url: picsum("engine-worship-feed", 800, 600),
        asset_format_mode: "image",
        total_likes: 342,
        total_comments: 18,
        has_user_liked: false,
        time_stamp_label: "2 hours ago",
        is_simulated_persona: true,
      },
      {
        id: "post_sim_3",
        profile: simulationPersonas[2],
        caption: "Late night stream breakdown with high definition layout graphics.",
        media_content_url: picsum("engine-gamer-video", 1280, 720),
        asset_format_mode: "video",
        total_likes: 1205,
        total_comments: 89,
        has_user_liked: true,
        time_stamp_label: "4 hours ago",
        is_simulated_persona: true,
      },
    ]);

    setEventDirectory([
      {
        id: "evt_sim_1",
        host_profile: simulationPersonas[0],
        event_title: "Global Prophetic Summit 2026",
        event_details:
          "Immersive online live event requiring mandatory session token validation. Full audio visual processing and digital download materials included.",
        cover_thumbnail_url: picsum("engine-event-cover", 600, 280),
        broadcast_time_string: "Tonight @ 7:30 PM CST",
        ticket_cost_token: 25,
        is_user_registered: false,
      },
    ]);
  }, [activeStreams, initialPosts, premiumEvents]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loadingMore]);

  useEffect(() => {
    return () => {
      if (studioPreviewUrlRef.current) {
        URL.revokeObjectURL(studioPreviewUrlRef.current);
      }
    };
  }, []);

  const runOptimisticLikeToggle = (targetId: string, forceLike = false) => {
    setTimelineFeed((curr) =>
      curr.map((post) => {
        if (post.id !== targetId) return post;
        const wasLiked = Boolean(post.has_user_liked);
        if (forceLike && wasLiked) return post;
        const nextLiked = forceLike ? true : !wasLiked;
        return {
          ...post,
          has_user_liked: nextLiked,
          total_likes: nextLiked
            ? post.total_likes + (wasLiked ? 0 : 1)
            : Math.max(0, post.total_likes - 1),
        };
      }),
    );
  };

  const handleCarouselNavigate = (postId: string, direction: "prev" | "next", maxIndex: number) => {
    setCarouselIndices((prev) => {
      const currentIndex = prev[postId] ?? 0;
      let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= maxIndex) nextIndex = maxIndex - 1;
      return { ...prev, [postId]: nextIndex };
    });
  };

  const handleMediaTap = (postId: string, isVideo: boolean) => {
    if (isVideo) {
      window.location.href = `/parables/${postId}`;
      return;
    }

    const now = Date.now();
    const last = lastTapRef.current;
    if (last?.postId === postId && now - last.t < 320) {
      lastTapRef.current = null;
      setHeartBurstPostId(postId);
      window.setTimeout(() => setHeartBurstPostId(null), 750);
      runOptimisticLikeToggle(postId, true);
      return;
    }
    lastTapRef.current = { postId, t: now };
  };

  const resetStudioPreview = () => {
    if (studioPreviewUrlRef.current) {
      URL.revokeObjectURL(studioPreviewUrlRef.current);
      studioPreviewUrlRef.current = null;
    }
    setStudioFile(null);
    setStudioFilePreview(null);
  };

  const handleStudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudioAlert(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > STUDIO_MAX_BYTES) {
      setStudioAlert("File rejected! The chosen asset exceeds our strict 10MB platform upload limit.");
      resetStudioPreview();
      return;
    }

    if (studioPreviewUrlRef.current) {
      URL.revokeObjectURL(studioPreviewUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(selectedFile);
    studioPreviewUrlRef.current = previewUrl;
    setStudioFile(selectedFile);
    setStudioFilePreview(previewUrl);
  };

  const closeStudio = () => {
    setIsStudioOpen(false);
    setStudioAlert(null);
    setStudioCaption("");
    resetStudioPreview();
  };

  const handlePublishStudioPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioFilePreview) {
      setStudioAlert("Validation failed: Please attach an image or video asset before publishing.");
      return;
    }

    setIsPublishingPost(true);

    window.setTimeout(() => {
      const author: NetworkProfile = currentUserProfile ?? {
        id: "current_user",
        username: "kym_the_ceo",
        avatar_url: avatarSeed("kym_the_ceo"),
        category_role: "App Creator",
        is_verified_badge: true,
      };

      const newPostItem: TimelinePost = {
        id: `user_post_${Date.now()}`,
        profile: author,
        caption: studioCaption,
        media_content_url: studioFilePreview,
        asset_format_mode: studioFormat,
        total_likes: 0,
        total_comments: 0,
        has_user_liked: false,
        time_stamp_label: "Just now",
      };

      setTimelineFeed((prevFeed) => [newPostItem, ...prevFeed]);
      setIsPublishingPost(false);
      closeStudio();
    }, 1200);
  };

  const executeTicketOrderValidation = () => {
    if (!focusedEvent || isPaymentProcessing) return;
    setIsPaymentProcessing(true);
    window.setTimeout(() => {
      setEventDirectory((curr) =>
        curr.map((evt) => (evt.id === focusedEvent.id ? { ...evt, is_user_registered: true } : evt)),
      );
      setIsPaymentProcessing(false);
      setIsTicketingModalOpen(false);
      setFocusedEvent(null);
    }, 1500);
  };

  const publisherProfile = currentUserProfile ?? {
    id: "current_user",
    username: "kym_the_ceo",
    avatar_url: avatarSeed("kym_the_ceo"),
    category_role: "Creator",
    is_verified_badge: true,
  };

  return (
    <div className="min-h-screen bg-[#01040A] pb-24 font-sans text-[#F8FAFC] antialiased">
      {/* TOP BRAND STICKY BANNER */}
      <header className="sticky top-0 z-40 border-b border-[#06111E] bg-[#01040A]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4">
          <span className="bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] bg-clip-text text-xl font-black tracking-tighter text-transparent">
            MY SANCTUARY
          </span>
          <button
            type="button"
            onClick={() => setIsStudioOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#06111E] bg-[#06111E] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#00F2FE] transition-all hover:border-[#00F2FE]/40"
          >
            <PlusCircle className="h-4 w-4" />
            Create Post
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-4 pt-6 lg:grid-cols-3">
        {/* TIMELINE FEED PANEL */}
        <div className="space-y-6 lg:col-span-2">
          {/* HORIZONTAL STORIES TRAY */}
          <div className="flex items-center gap-4 overflow-x-auto overflow-y-hidden rounded-2xl border border-[#06111E] bg-[#06111E] p-4 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setIsStudioOpen(true)}
              className="group flex min-w-[76px] shrink-0 cursor-pointer flex-col items-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#94A3B8]/20 p-px" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publisherProfile.avatar_url}
                  alt=""
                  className="relative z-10 h-14 w-14 rounded-full bg-[#01040A] object-cover p-1"
                  onError={mediaFallback}
                />
                <span className="absolute -bottom-0.5 -right-0.5 z-20 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#06111E] bg-[#00F2FE] text-[#01040A]">
                  <PlusCircle className="h-3 w-3" strokeWidth={3} />
                </span>
              </div>
              <span className="mt-2 max-w-[76px] truncate text-[10px] font-medium text-[#CBD5E1] group-hover:text-[#F8FAFC]">
                Add Post
              </span>
            </button>

            {trayCollection.map((avatarItem) => (
              <button
                key={avatarItem.id}
                type="button"
                onClick={() => {
                  if (avatarItem.is_broadcasting_live) {
                    window.location.href = `/stream/${avatarItem.profile.id}`;
                  }
                }}
                className="group flex min-w-[76px] shrink-0 cursor-pointer select-none flex-col items-center"
              >
                <div className="relative">
                  {avatarItem.is_broadcasting_live ? (
                    <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-[#00F2FE] via-[#0EA5E9] to-[#00F2FE] p-[3px]" />
                  ) : avatarItem.has_unviewed_content ? (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#00F2FE] to-[#06111E] p-[2px]" />
                  ) : (
                    <div className="absolute inset-0 rounded-full bg-[#94A3B8]/20 p-px" />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarItem.profile.avatar_url}
                    alt=""
                    className="relative z-10 h-14 w-14 rounded-full bg-[#01040A] object-cover p-1 transition-transform group-hover:scale-105"
                    onError={mediaFallback}
                  />
                  {avatarItem.is_broadcasting_live ? (
                    <span className="absolute -bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-md border border-[#01040A] bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                      <Radio className="h-2.5 w-2.5 animate-ping" aria-hidden />
                      Live
                    </span>
                  ) : null}
                </div>
                <span className="mt-2 max-w-[72px] truncate text-[11px] font-medium text-[#CBD5E1]">
                  @{avatarItem.profile.username}
                </span>
              </button>
            ))}
          </div>

          {/* CHRONOLOGICAL TIMELINE MATRIX */}
          <div className="space-y-6">
            {timelineFeed.map((postCard) => {
              const activeSlideIdx = carouselIndices[postCard.id] ?? 0;
              const hasSlides = Boolean(postCard.slides && postCard.slides.length > 0);
              const slideCount = postCard.slides?.length ?? 0;
              const activeSlide = hasSlides ? postCard.slides![activeSlideIdx] : null;
              const isVideo = hasSlides
                ? activeSlide?.media_type === "video"
                : postCard.asset_format_mode === "video";

              return (
                <article
                  key={postCard.id}
                  className="overflow-hidden rounded-2xl border border-[#06111E]/40 bg-[#06111E] shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-[#01040A]/50 p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={postCard.profile.avatar_url}
                        alt=""
                        className="h-9 w-9 rounded-full border border-[#00F2FE]/20 object-cover"
                        onError={mediaFallback}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold tracking-tight text-[#F8FAFC]">
                            {postCard.profile.username}
                          </span>
                          {postCard.profile.is_verified_badge ? (
                            <UserCheck className="h-3 w-3 text-[#00F2FE]" aria-label="Verified" />
                          ) : null}
                          {postCard.is_simulated_persona ? (
                            <span className="rounded border border-[#00F2FE]/20 bg-[#00F2FE]/10 px-1 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-[#00F2FE]">
                              Sim
                            </span>
                          ) : null}
                        </div>
                        <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wider text-[#00F2FE]">
                          {postCard.profile.category_role}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#94A3B8]">{postCard.time_stamp_label}</span>
                  </div>

                  {/* MEDIA DISPLAY WINDOW (CAROUSEL VS SINGLE ASSET) */}
                  <div className="relative aspect-video w-full bg-[#020712]">
                    {hasSlides && activeSlide ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeSlide.media_url}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={mediaFallback}
                        />

                        {activeSlideIdx > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleCarouselNavigate(postCard.id, "prev", slideCount)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-[#06111E] bg-[#01040A]/80 p-2 text-[#F8FAFC] transition-colors hover:text-[#00F2FE]"
                            aria-label="Previous slide"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                        ) : null}

                        {activeSlideIdx < slideCount - 1 ? (
                          <button
                            type="button"
                            onClick={() => handleCarouselNavigate(postCard.id, "next", slideCount)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#06111E] bg-[#01040A]/80 p-2 text-[#F8FAFC] transition-colors hover:text-[#00F2FE]"
                            aria-label="Next slide"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        ) : null}

                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                          {postCard.slides!.map((_, dIdx) => (
                            <div
                              key={`dot-${postCard.id}-${dIdx}`}
                              className={`h-1.5 rounded-full transition-all ${
                                dIdx === activeSlideIdx ? "w-4 bg-[#00F2FE]" : "w-1.5 bg-[#94A3B8]/40"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMediaTap(postCard.id, isVideo)}
                        className="group relative flex h-full w-full cursor-pointer items-center justify-center"
                        aria-label={isVideo ? "Play video" : "Double tap to like"}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={postCard.media_content_url}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={mediaFallback}
                        />
                        {isVideo ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="rounded-full border border-[#00F2FE]/30 bg-[#01040A]/90 p-4 shadow-lg transition-transform group-hover:scale-110">
                              <Tv className="h-8 w-8 text-[#00F2FE]" />
                            </div>
                          </div>
                        ) : null}
                        {heartBurstPostId === postCard.id ? (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <Heart className="h-24 w-24 animate-ping fill-red-500 text-red-500 opacity-90" />
                          </div>
                        ) : null}
                      </button>
                    )}
                  </div>

                  {/* Actions Interaction Desk */}
                  <div className="flex items-center gap-4 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => runOptimisticLikeToggle(postCard.id)}
                      className="transition-transform focus:outline-none active:scale-125"
                      aria-pressed={postCard.has_user_liked}
                    >
                      <Heart
                        className={`h-6 w-6 ${
                          postCard.has_user_liked
                            ? "fill-red-500 text-red-500"
                            : "text-[#F8FAFC] hover:text-red-400"
                        }`}
                      />
                    </button>
                    <button type="button" className="text-[#CBD5E1] hover:text-[#00F2FE]" aria-label="Comment">
                      <MessageCircle className="h-5 w-5" />
                    </button>
                    <button type="button" className="text-[#CBD5E1] hover:text-[#00F2FE]" aria-label="Share">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button type="button" className="ml-auto text-[#CBD5E1] hover:text-[#00F2FE]" aria-label="Save">
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-1 px-4 pb-4">
                    <p className="text-sm font-semibold text-[#F8FAFC]">
                      {postCard.total_likes.toLocaleString()} likes · {postCard.total_comments} comments
                    </p>
                    <p className="text-sm text-[#CBD5E1]">
                      <span className="mr-2 font-semibold text-[#F8FAFC]">@{postCard.profile.username}</span>
                      {postCard.caption}
                    </p>
                  </div>
                </article>
              );
            })}

            {hasMore ? (
              <div ref={loadMoreRef} className="flex justify-center py-6">
                {loadingMore ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[#00F2FE]" aria-label="Loading more" />
                ) : (
                  <span className="text-xs uppercase tracking-wider text-[#64748B]">Scroll for more</span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* SIDEBAR EVENT CONSOLE */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#06111E] bg-[#020712] p-4 shadow-xl">
            <div className="mb-4 flex items-center gap-2 border-b border-[#06111E] pb-3">
              <Ticket className="h-4 w-4 text-[#00F2FE]" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#00F2FE]">Ticketed Actions</h2>
            </div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Active Events</p>

            <div className="space-y-4">
              {eventDirectory.map((eventRecord) => (
                <div
                  key={eventRecord.id}
                  className="overflow-hidden rounded-xl border border-[#06111E] bg-[#06111E]/40 transition hover:border-[#00F2FE]/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={eventRecord.cover_thumbnail_url}
                    alt=""
                    className="h-28 w-full object-cover"
                    onError={mediaFallback}
                  />
                  <div className="space-y-2 p-3">
                    <h3 className="text-sm font-bold text-[#F8FAFC]">{eventRecord.event_title}</h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">{eventRecord.event_details}</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-[#CBD5E1]">
                      <Calendar className="h-3.5 w-3.5 text-[#0EA5E9]" />
                      {eventRecord.broadcast_time_string}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-black text-[#00F2FE]">
                        {eventRecord.ticket_cost_token > 0
                          ? `$${eventRecord.ticket_cost_token.toFixed(2)}`
                          : "FREE ADMISSION"}
                      </span>
                      {eventRecord.is_user_registered ? (
                        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                          ✓ Registered
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setFocusedEvent(eventRecord);
                            setIsTicketingModalOpen(true);
                          }}
                          className="rounded-md bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#01040A] shadow-md"
                        >
                          Get Pass
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* TICKETING MODAL */}
      {isTicketingModalOpen && focusedEvent ? (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#01040A]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#06111E] bg-[#020712] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsTicketingModalOpen(false)}
              className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#F8FAFC]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex items-center gap-2 text-[#00F2FE]">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="text-sm font-black uppercase tracking-wider">Secure Verification System</h3>
            </div>

            <p className="text-lg font-bold text-[#F8FAFC]">{focusedEvent.event_title}</p>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Stream Room Management Ledger · @{focusedEvent.host_profile.username}
            </p>

            <div className="mt-6 space-y-3 rounded-xl border border-[#06111E] bg-[#06111E]/50 p-4 text-sm">
              <div className="flex justify-between text-[#CBD5E1]">
                <span>Broadcast Admission Token</span>
                <span className="font-semibold text-[#F8FAFC]">${focusedEvent.ticket_cost_token.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#CBD5E1]">
                <span>Platform Processing Clearing Fee</span>
                <span className="font-semibold text-[#F8FAFC]">$0.00</span>
              </div>
              <div className="flex justify-between border-t border-[#06111E] pt-3 font-bold text-[#00F2FE]">
                <span>Total Billed Base</span>
                <span>${focusedEvent.ticket_cost_token.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={executeTicketOrderValidation}
              disabled={isPaymentProcessing}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A] disabled:opacity-60"
            >
              {isPaymentProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                "Authorize & Claim Secure Access"
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* SANCTUARY CREATION STUDIO UPLOAD PANEL */}
      {isStudioOpen ? (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-[#01040A]/85 p-4 backdrop-blur-sm">
          <form
            onSubmit={handlePublishStudioPost}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#06111E] bg-[#020712] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={closeStudio}
              className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#F8FAFC]"
              aria-label="Close studio"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-black tracking-tight text-[#F8FAFC]">Sanctuary Creation Studio</h2>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Publish custom full-fidelity media payloads down to the social matrix feed.
            </p>

            {studioAlert ? (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">
                {studioAlert}
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setStudioFormat("image");
                  resetStudioPreview();
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-black uppercase tracking-widest transition-all ${
                  studioFormat === "image"
                    ? "border-[#00F2FE] bg-[#00F2FE]/10 text-[#00F2FE]"
                    : "border-[#06111E] bg-[#01040A] text-[#94A3B8]"
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Static Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudioFormat("video");
                  resetStudioPreview();
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-black uppercase tracking-widest transition-all ${
                  studioFormat === "video"
                    ? "border-[#00F2FE] bg-[#00F2FE]/10 text-[#00F2FE]"
                    : "border-[#06111E] bg-[#01040A] text-[#94A3B8]"
                }`}
              >
                <Video className="h-4 w-4" />
                Motion Video
              </button>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-xl border border-dashed border-[#06111E] bg-[#01040A]">
              {studioFilePreview ? (
                studioFormat === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={studioFilePreview} alt="Preview" className="aspect-video w-full object-cover" />
                ) : (
                  <video src={studioFilePreview} controls className="aspect-video w-full bg-black object-cover" />
                )
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 px-4 text-center">
                  <p className="text-xs font-semibold text-[#CBD5E1]">Choose target file asset map</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                    Max allowable scale capacity constraint: 10MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept={studioFormat === "image" ? "image/*" : "video/*"}
                onChange={handleStudioFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>

            <label className="mt-4 block text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
              Caption Message
              <textarea
                value={studioCaption}
                onChange={(e) => setStudioCaption(e.target.value)}
                placeholder="Type an engaging script or commentary context for this post..."
                className="mt-2 min-h-[80px] w-full resize-none rounded-xl border border-[#06111E] bg-[#01040A] p-3 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#00F2FE]/50 focus:outline-none"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isPublishingPost}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A] disabled:opacity-60"
            >
              {isPublishingPost ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                "Publish to Sanctuary Timeline"
              )}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
