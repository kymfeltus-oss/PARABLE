"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Settings, Plus } from "lucide-react";
import { parsePostContent, likesVisibleForViewer } from "@/lib/post-content-meta";
import {
  filterFeedPosts,
  filterReelPosts,
  PROFILE_POST_FETCH_LIMIT,
} from "@/lib/sanctuary-post-filters";
import ProfileStoryStrip from "@/components/sanctuary-stories/ProfileStoryStrip";
import ProfileFollowListModal from "@/components/my-sanctuary/ProfileFollowListModal";
import {
  formatProfileMetric,
  PostsTabIcon,
  ReelsTabIcon,
  TaggedTabIcon,
} from "@/components/my-sanctuary/profile-tab-icons";
import type { SanctuaryPost } from "@/app/my-sanctuary/actions";
import { getTaggedPostsForProfile } from "@/app/my-sanctuary/actions";
import { useTaggedPostsLive } from "@/hooks/useTaggedPostsLive";

export type MySanctuaryGalleryPost = SanctuaryPost;

export type MySanctuaryProfileStats = {
  posts: number;
  followers: number;
  following: number;
};

type ProfileTab = "posts" | "reels" | "tagged";

type GalleryTabFocus = {
  tab: ProfileTab;
  token: number;
};

type Props = {
  profileUserId: string;
  username: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  stats: MySanctuaryProfileStats;
  posts: MySanctuaryGalleryPost[];
  taggedPosts?: MySanctuaryGalleryPost[];
  loading: boolean;
  setupPending?: boolean;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  actionLoading?: boolean;
  galleryTabFocus?: GalleryTabFocus | null;
  onFollowToggle?: () => void;
  onMessageUser?: () => void;
  onAvatarClick?: () => void;
  avatarUploading?: boolean;
  onCreateMedia?: () => void;
  onCustomizePage?: () => void;
};

function HeartIcon() {
  return (
    <svg className="ig-icon" viewBox="0 0 512 512" aria-hidden="true">
      <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.2 62.2-62.2 163 0 225.3L256 492.7l206.3-205.1c62.2-62.2 62.2-163 0-225.3z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg className="ig-icon ig-icon-comment" viewBox="0 0 512 512" aria-hidden="true">
      <path d="M256 32C132.3 32 32 124.7 32 224c0 35.3 11.5 68 31.3 95.4L32 480l164.8-29.8C221.2 458.9 238.4 464 256 464c123.7 0 224-92.7 224-208S379.7 32 256 32z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="ig-icon" viewBox="0 0 576 512" aria-hidden="true">
      <path d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zM525.6 64h-86.9L386.8 128h102.8c13.3 0 24 10.7 24 24v272c0 13.3-10.7 24-24 24H386.8l51.9 64h86.9c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48z" />
    </svg>
  );
}

function PlayMetricIcon() {
  return (
    <svg className="ig-icon ig-icon-play-metric" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function CloneIcon() {
  return (
    <svg className="ig-icon ig-icon-clone" viewBox="0 0 512 512" aria-hidden="true">
      <path d="M464 0H144c-26.5 0-48 21.5-48 48v48H48C21.5 96 0 117.5 0 144v320c0 26.5 21.5 48 48 48h320c26.5 0 48-21.5 48-48v-48h48c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM96 144h320v320H96V144z" />
    </svg>
  );
}

function isVideoPost(post: MySanctuaryGalleryPost): boolean {
  if (post.media_type === "video") return true;
  if (!post.media_url) return false;
  return /\.(mp4|webm|mov)(\?|$)/i.test(post.media_url.split("?")[0] ?? "");
}

function profileAvatarFallback(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=152&background=dbdbdb&color=262626`;
}

function profileAvatarOnError(name: string) {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const el = e.currentTarget;
    el.onerror = null;
    el.src = profileAvatarFallback(name);
  };
}

function galleryBadge(post: MySanctuaryGalleryPost): "video" | "carousel" | null {
  if (isVideoPost(post)) return "video";
  if (post.media_type === "carousel" || post.media_type === "gallery") return "carousel";
  return null;
}

function isUsableProfileAvatarUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "/logo.svg" || trimmed.includes("logo.svg")) return false;
  if (/^https?:\/\/(www\.)?unsplash\.com\/?$/i.test(trimmed)) return false;
  return true;
}

export default function MySanctuaryInstagramLayout({
  profileUserId,
  username,
  fullName,
  bio,
  avatarUrl,
  stats,
  posts,
  taggedPosts: initialTaggedPosts = [],
  loading,
  setupPending = false,
  isOwnProfile = true,
  isFollowing = false,
  actionLoading = false,
  galleryTabFocus = null,
  onFollowToggle,
  onMessageUser,
  onAvatarClick,
  avatarUploading = false,
  onCreateMedia,
  onCustomizePage,
}: Props) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [taggedPosts, setTaggedPosts] = useState<MySanctuaryGalleryPost[]>(initialTaggedPosts);
  const [taggedLoading, setTaggedLoading] = useState(false);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  useEffect(() => {
    setTaggedPosts(initialTaggedPosts);
  }, [initialTaggedPosts]);

  useEffect(() => {
    if (activeTab !== "tagged") return;
    let cancelled = false;
    setTaggedLoading(true);
    void getTaggedPostsForProfile(profileUserId, username)
      .then((rows) => {
        if (!cancelled) setTaggedPosts(rows);
      })
      .finally(() => {
        if (!cancelled) setTaggedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, profileUserId, username]);

  const refreshTaggedPosts = useCallback(() => {
    if (activeTab !== "tagged") return;
    void getTaggedPostsForProfile(profileUserId, username).then(setTaggedPosts);
  }, [activeTab, profileUserId, username]);

  useTaggedPostsLive(profileUserId, username, activeTab === "tagged", refreshTaggedPosts);

  useEffect(() => {
    if (galleryTabFocus) setActiveTab(galleryTabFocus.tab);
  }, [galleryTabFocus]);

  const handleShareProfile = useCallback(async () => {
    const url = `${window.location.origin}/profile`;
    const title = username || "My Sanctuary";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNotice("Profile link copied.");
    } catch {
      setShareNotice("Could not share profile.");
    }
    window.setTimeout(() => setShareNotice(null), 2200);
  }, [username]);
  const handle = username || "member";
  const realName = fullName?.trim() || handle;
  const bioText = bio?.trim();
  const avatarFallbackSrc = profileAvatarFallback(realName);
  const resolvedAvatarSrc = isUsableProfileAvatarUrl(avatarUrl) ? avatarUrl : null;

  const feedPosts = filterFeedPosts(posts);
  const reelPosts = filterReelPosts(posts);
  const tabPostCount = feedPosts.length + reelPosts.length;
  const headerPostCount =
    posts.length < PROFILE_POST_FETCH_LIMIT ? tabPostCount : Math.max(tabPostCount, stats.posts);

  const renderStats = (className: string) => (
    <div className={className}>
      <ul>
        <li>
          <span className="profile-stat-count">{headerPostCount}</span>
          <span className="profile-stat-label">posts</span>
        </li>
        <li>
          <button type="button" className="btn profile-stat-btn" onClick={() => setFollowModal("followers")}>
            <span className="profile-stat-count">{stats.followers}</span>
            <span className="profile-stat-label">followers</span>
          </button>
        </li>
        <li>
          <button type="button" className="btn profile-stat-btn" onClick={() => setFollowModal("following")}>
            <span className="profile-stat-count">{stats.following}</span>
            <span className="profile-stat-label">following</span>
          </button>
        </li>
      </ul>
    </div>
  );

  if (setupPending) {
    return (
      <div className="my-sanctuary-ig flex min-h-full items-center justify-center px-6 text-center">
        <p className="gallery-empty">Profile data setup pending…</p>
      </div>
    );
  }

  return (
    <div className="my-sanctuary-ig min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-hide pb-parable-bottom">
      <header className="profile-header">
        <div className="container profile-header-inner">
          <div className="profile profile--instagram">
            <div className="profile-top-row">
              <div className="profile-image">
                <div className="profile-image-shell">
                  {onAvatarClick ? (
                    <button
                      type="button"
                      className="btn profile-image-trigger group"
                      onClick={onAvatarClick}
                      disabled={avatarUploading}
                      aria-label="Change profile photo"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolvedAvatarSrc ?? avatarFallbackSrc}
                        alt=""
                        className="profile-avatar-img"
                        onError={profileAvatarOnError(realName)}
                      />
                      {!avatarUploading ? (
                        <span className="profile-image-change-overlay" aria-hidden="true">
                          CHANGE
                        </span>
                      ) : null}
                      {avatarUploading ? <span className="profile-image-loading" aria-hidden="true" /> : null}
                    </button>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolvedAvatarSrc ?? avatarFallbackSrc}
                      alt=""
                      className="profile-avatar-img profile-avatar-img--static"
                      onError={profileAvatarOnError(realName)}
                    />
                  )}
                </div>
              </div>

              {renderStats("profile-stats profile-stats--mobile")}
            </div>

            <div className="profile-mobile-toolbar">
              <h1 className="profile-user-name profile-user-name--mobile">{handle}</h1>
              {isOwnProfile && onCreateMedia ? (
                <button
                  type="button"
                  className="btn profile-create-btn profile-create-btn--mobile"
                  onClick={onCreateMedia}
                  aria-label="Create post or reel"
                >
                  <Plus size={20} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="profile-desktop-meta">
              <div className="profile-user-settings">
                <h1 className="profile-user-name">{handle}</h1>
                {isOwnProfile && onCreateMedia ? (
                  <button
                    type="button"
                    className="btn profile-create-btn"
                    onClick={onCreateMedia}
                    aria-label="Create post or reel"
                  >
                    <Plus size={22} strokeWidth={2} aria-hidden="true" />
                  </button>
                ) : null}
                {isOwnProfile ? (
                  <Link href="/settings" className="btn profile-settings-btn profile-settings-btn--desktop" aria-label="Account settings">
                    <Settings size={20} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
              {renderStats("profile-stats profile-stats--desktop")}
            </div>

            <div className="profile-identity">
              <p className="profile-real-name">{realName}</p>
              {bioText ? (
                <p className="profile-bio-text">{bioText}</p>
              ) : isOwnProfile ? (
                <p className="profile-bio-empty">No bio yet.</p>
              ) : null}
            </div>

            <div className="profile-actions">
              {isOwnProfile ? (
                <>
                  {onCreateMedia ? (
                    <button type="button" className="profile-action-btn profile-action-btn--create" onClick={onCreateMedia}>
                      <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                      Create
                    </button>
                  ) : null}
                  <button type="button" className="profile-action-btn" onClick={onCustomizePage}>
                    Edit profile
                  </button>
                  <button type="button" className="profile-action-btn" onClick={() => void handleShareProfile()}>
                    Share profile
                  </button>
                  <Link href="/settings" className="btn profile-settings-btn profile-settings-btn--mobile" aria-label="Account settings">
                    <Settings size={18} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`profile-action-btn ${isFollowing ? "profile-action-btn--secondary" : "profile-action-btn--primary"}`}
                    onClick={onFollowToggle}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "…" : isFollowing ? "Following" : "Follow"}
                  </button>
                  {onMessageUser ? (
                    <button type="button" className="profile-action-btn profile-action-btn--secondary" onClick={onMessageUser}>
                      Message
                    </button>
                  ) : null}
                </>
              )}
            </div>

            {shareNotice ? <p className="profile-share-notice">{shareNotice}</p> : null}
          </div>
        </div>
      </header>

      <ProfileStoryStrip profileUserId={profileUserId} isOwnProfile={isOwnProfile} />

      <nav className="profile-tabs" aria-label="Profile sections">
        <div className="container">
          <ul className="profile-tabs-list">
            <li>
              <button
                type="button"
                className={activeTab === "posts" ? "profile-tabs-item profile-tabs-item--active" : "profile-tabs-item"}
                onClick={() => setActiveTab("posts")}
                aria-label="Posts"
                aria-current={activeTab === "posts" ? "page" : undefined}
              >
                <PostsTabIcon className="profile-tabs-icon" />
              </button>
            </li>
            <li>
              <button
                type="button"
                className={activeTab === "reels" ? "profile-tabs-item profile-tabs-item--active" : "profile-tabs-item"}
                onClick={() => setActiveTab("reels")}
                aria-label="Reels"
                aria-current={activeTab === "reels" ? "page" : undefined}
              >
                <ReelsTabIcon className="profile-tabs-icon" />
              </button>
            </li>
            <li>
              <button
                type="button"
                className={activeTab === "tagged" ? "profile-tabs-item profile-tabs-item--active" : "profile-tabs-item"}
                onClick={() => setActiveTab("tagged")}
                aria-label="Tagged"
                aria-current={activeTab === "tagged" ? "page" : undefined}
              >
                <TaggedTabIcon className="profile-tabs-icon" />
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main>
        <div className="container">
          {activeTab === "posts" ? (
            feedPosts.length === 0 && !loading ? (
              <p className="gallery-empty">
                No posts yet.{isOwnProfile ? " Tap Create (+) to share your first photo." : ""}
              </p>
            ) : (
              <div className="gallery">
                {feedPosts.map((post) => {
                  const badge = galleryBadge(post);
                  const { display: captionPreview } = parsePostContent(post.content);
                  const showLikes = likesVisibleForViewer(post.content, isOwnProfile);
                  return (
                    <Link key={post.id} href={`/sanctuary/${post.id}`} className="gallery-item" tabIndex={0}>
                      {post.media_url ? (
                        isVideoPost(post) ? (
                          <video src={post.media_url} className="gallery-image" muted playsInline />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.media_url} alt="" className="gallery-image" />
                        )
                      ) : (
                        <div className="gallery-placeholder">{captionPreview.slice(0, 80)}</div>
                      )}

                      {badge === "carousel" ? (
                        <div className="gallery-item-type">
                          <span className="visually-hidden">Gallery</span>
                          <CloneIcon />
                        </div>
                      ) : null}
                      {badge === "video" ? (
                        <div className="gallery-item-type">
                          <span className="visually-hidden">Video</span>
                          <VideoIcon />
                        </div>
                      ) : null}

                      <div className="gallery-item-info">
                        <ul>
                          {showLikes ? (
                            <li className="gallery-item-likes">
                              <span className="visually-hidden">Likes:</span>
                              <HeartIcon /> {post.likesCount}
                            </li>
                          ) : null}
                          <li className="gallery-item-comments">
                            <span className="visually-hidden">Comments:</span>
                            <CommentIcon /> {post.commentsCount}
                          </li>
                        </ul>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          ) : activeTab === "reels" ? (
            reelPosts.length === 0 && !loading ? (
              <p className="gallery-empty">
                No reels yet.{isOwnProfile ? " Tap Create (+) and pick a video under 10 MB." : ""}
              </p>
            ) : (
              <div className="gallery gallery--reels">
                {reelPosts.map((post) => {
                  const reelMetric = Math.max(post.likesCount, post.commentsCount, 0);
                  return (
                  <Link key={post.id} href={`/sanctuary/${post.id}`} className="gallery-item gallery-item--reel" tabIndex={0}>
                    {post.media_url ? (
                      <video src={post.media_url} className="gallery-image" muted playsInline />
                    ) : (
                      <div className="gallery-placeholder">{parsePostContent(post.content).display.slice(0, 80)}</div>
                    )}
                    <div className="gallery-item-type gallery-item-type--play gallery-reel-play-badge" aria-hidden="true">
                      <PlayMetricIcon />
                    </div>
                    {reelMetric > 0 ? (
                      <div className="gallery-reel-metric" aria-label={`${reelMetric} views`}>
                        <PlayMetricIcon />
                        <span>{formatProfileMetric(reelMetric)}</span>
                      </div>
                    ) : null}
                  </Link>
                  );
                })}
              </div>
            )
          ) : activeTab === "tagged" ? (
            taggedPosts.length === 0 && !taggedLoading && !loading ? (
              <p className="gallery-empty">
                No photos or videos featuring @{handle}.
                {isOwnProfile ? " When someone tags you in a caption, posts appear here." : ""}
              </p>
            ) : (
              <div className="gallery">
                {taggedPosts.map((post) => {
                  const badge = galleryBadge(post);
                  const { display: captionPreview } = parsePostContent(post.content);
                  const showLikes = likesVisibleForViewer(post.content, isOwnProfile);
                  return (
                    <Link key={post.id} href={`/sanctuary/${post.id}`} className="gallery-item" tabIndex={0}>
                      {post.media_url ? (
                        isVideoPost(post) ? (
                          <video src={post.media_url} className="gallery-image" muted playsInline />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.media_url} alt="" className="gallery-image" />
                        )
                      ) : (
                        <div className="gallery-placeholder">{captionPreview.slice(0, 80)}</div>
                      )}
                      {badge === "carousel" ? (
                        <div className="gallery-item-type">
                          <span className="visually-hidden">Gallery</span>
                          <CloneIcon />
                        </div>
                      ) : null}
                      {badge === "video" ? (
                        <div className="gallery-item-type gallery-item-type--play">
                          <span className="visually-hidden">Video</span>
                          <PlayMetricIcon />
                        </div>
                      ) : null}
                      <div className="gallery-item-info">
                        <ul>
                          {showLikes ? (
                            <li className="gallery-item-likes">
                              <span className="visually-hidden">Likes:</span>
                              <HeartIcon /> {post.likesCount}
                            </li>
                          ) : null}
                          <li className="gallery-item-comments">
                            <span className="visually-hidden">Comments:</span>
                            <CommentIcon /> {post.commentsCount}
                          </li>
                        </ul>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          ) : (
            <p className="gallery-empty">No photos or videos featuring this user.</p>
          )}

          {loading || (activeTab === "tagged" && taggedLoading) ? (
            <div className="loader" aria-label="Loading" />
          ) : null}
        </div>
      </main>

      <ProfileFollowListModal
        open={followModal !== null}
        mode={followModal ?? "followers"}
        profileUserId={profileUserId}
        onClose={() => setFollowModal(null)}
      />
    </div>
  );
}
