"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Bookmark, Grid3x3, Loader2, Plus, Settings, Tag, UserRound } from "lucide-react";
import {
  DEFAULT_INSTAGRAM_PROFILE_DATA,
  isUsableInstagramMediaUrl,
  type InstagramMediaItem,
  type InstagramProfileData,
  type InstagramProfileTab,
} from "@/lib/profile/instagram-profile-data";

export type { InstagramProfileData, InstagramProfileTab } from "@/lib/profile/instagram-profile-data";

export type InstagramProfileViewProps = {
  data?: InstagramProfileData;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  actionLoading?: boolean;
  loading?: boolean;
  tabLoading?: boolean;
  onEditProfile?: () => void;
  onSettingsClick?: () => void;
  onCreateMedia?: () => void;
  onAvatarClick?: () => void;
  avatarUploading?: boolean;
  onFollowToggle?: () => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  onTabChange?: (tab: InstagramProfileTab) => void;
  mediaHref?: (item: InstagramMediaItem) => string;
  storiesStrip?: ReactNode;
  className?: string;
};

const TAB_CONFIG: {
  id: InstagramProfileTab;
  label: string;
  Icon: typeof Grid3x3;
}[] = [
  { id: "posts", label: "POSTS", Icon: Grid3x3 },
  { id: "saved", label: "SAVED", Icon: Bookmark },
  { id: "tagged", label: "TAGGED", Icon: Tag },
];

function formatMetric(value: number | string): string {
  return typeof value === "number" ? value.toLocaleString() : value;
}

function avatarFallback(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=320&background=1A1F2C&color=F8FAFC`;
}

function MediaTile({
  item,
  index,
  href,
}: {
  item: InstagramMediaItem;
  index: number;
  href?: string;
}) {
  const usable = isUsableInstagramMediaUrl(item.url);
  const inner = (
    <>
      {usable ? (
        item.isVideo ? (
          <video src={item.url} className="h-full w-full object-cover" muted playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
        )
      ) : (
        <div
          className="flex h-full w-full items-end justify-start bg-gradient-to-br from-[#1A1F2C] via-[#0f1419] to-[#02040A] p-2"
          aria-hidden
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]/80">
            {index + 1}
          </span>
        </div>
      )}
      {item.isVideo && usable ? (
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 text-[#F8FAFC] drop-shadow">
          ▶
        </span>
      ) : null}
    </>
  );

  const className = "relative block aspect-square w-full overflow-hidden bg-[#1A1F2C]";

  if (href) {
    return (
      <Link href={href} className={className} aria-label={`Open post ${item.id}`}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={className} aria-label={`Media item ${item.id}`}>
      {inner}
    </div>
  );
}

function StatBlock({
  postsCount,
  followersCount,
  followingCount,
  className = "",
  onFollowersClick,
  onFollowingClick,
}: Pick<InstagramProfileData, "postsCount" | "followersCount" | "followingCount"> & {
  className?: string;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}) {
  const items = [
    { label: "posts", value: postsCount, onClick: undefined },
    { label: "followers", value: followersCount, onClick: onFollowersClick },
    { label: "following", value: followingCount, onClick: onFollowingClick },
  ] as const;

  return (
    <ul className={`flex items-center justify-around gap-2 text-center ${className}`}>
      {items.map(({ label, value, onClick }) => (
        <li key={label} className="min-w-0 flex-1">
          {onClick ? (
            <button type="button" onClick={onClick} className="w-full text-center">
              <p className="text-base font-semibold leading-none text-[#F8FAFC] min-[735px]:text-lg">
                {formatMetric(value)}
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">{label}</p>
            </button>
          ) : (
            <>
              <p className="text-base font-semibold leading-none text-[#F8FAFC] min-[735px]:text-lg">
                {formatMetric(value)}
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">{label}</p>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function AvatarButton({
  src,
  username,
  onAvatarClick,
  avatarUploading,
}: {
  src: string;
  username: string;
  onAvatarClick?: () => void;
  avatarUploading?: boolean;
}) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="h-full w-full object-cover"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = avatarFallback(username);
      }}
    />
  );

  if (!onAvatarClick) {
    return image;
  }

  return (
    <button
      type="button"
      onClick={onAvatarClick}
      disabled={avatarUploading}
      className="relative h-full w-full overflow-hidden rounded-full"
      aria-label="Change profile photo"
    >
      {image}
      {avatarUploading ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-6 w-6 animate-spin text-[#F8FAFC]" />
        </span>
      ) : null}
    </button>
  );
}

/**
 * Encapsulated Instagram-style profile shell. Tailwind-only; safe inside `ClientRootShell`.
 */
export function InstagramProfileView({
  data = DEFAULT_INSTAGRAM_PROFILE_DATA,
  isOwnProfile = true,
  isFollowing = false,
  actionLoading = false,
  loading = false,
  tabLoading = false,
  onEditProfile,
  onSettingsClick,
  onCreateMedia,
  onAvatarClick,
  avatarUploading = false,
  onFollowToggle,
  onFollowersClick,
  onFollowingClick,
  onTabChange,
  mediaHref = (item) => `/sanctuary/${item.id}`,
  storiesStrip,
  className = "",
}: InstagramProfileViewProps) {
  const [activeTab, setActiveTab] = useState<InstagramProfileTab>("posts");

  const visibleTabs = useMemo(
    () => (isOwnProfile ? TAB_CONFIG : TAB_CONFIG.filter((tab) => tab.id !== "saved")),
    [isOwnProfile],
  );

  useEffect(() => {
    if (!isOwnProfile && activeTab === "saved") {
      setActiveTab("posts");
      onTabChange?.("posts");
    }
  }, [isOwnProfile, activeTab, onTabChange]);

  const tabItems = useMemo(() => {
    if (activeTab === "saved") return data.saved;
    if (activeTab === "tagged") return data.tagged;
    return data.posts;
  }, [activeTab, data.posts, data.saved, data.tagged]);

  const avatarSrc =
    isUsableInstagramMediaUrl(data.avatarUrl) && data.avatarUrl
      ? data.avatarUrl
      : avatarFallback(data.fullName || data.username);

  const emptyCopy =
    activeTab === "saved"
      ? isOwnProfile
        ? "Save posts from the feed to revisit them here."
        : "No saved posts to show."
      : activeTab === "tagged"
        ? `No photos or videos featuring @${data.username}.`
        : isOwnProfile
          ? "Share your first post to fill this grid."
          : "No posts yet.";

  const selectTab = (tab: InstagramProfileTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div
      className={[
        "relative min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain",
        "bg-[#02040A] text-[#F8FAFC]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-ig-profile-view
    >
      <div className="mx-auto w-full max-w-[935px] px-4 pb-24 pt-6 min-[735px]:px-8 min-[735px]:pt-10">
        <header className="min-[735px]:flex min-[735px]:items-start min-[735px]:gap-8 min-[735px]:pb-8">
          <div className="mx-auto flex w-[88px] shrink-0 justify-center min-[735px]:mx-0 min-[735px]:w-[150px]">
            <div className="relative h-[88px] w-[88px] overflow-hidden rounded-full border border-[#1A1F2C] bg-[#1A1F2C] min-[735px]:h-[150px] min-[735px]:w-[150px]">
              <AvatarButton
                src={avatarSrc}
                username={data.username}
                onAvatarClick={isOwnProfile ? onAvatarClick : undefined}
                avatarUploading={avatarUploading}
              />
            </div>
          </div>

          <div className="mt-4 min-w-0 flex-1 min-[735px]:mt-2">
            <div className="hidden min-[735px]:flex min-[735px]:flex-wrap min-[735px]:items-center min-[735px]:gap-3">
              <h1 className="text-xl font-light tracking-tight text-[#F8FAFC]">{data.username}</h1>
              {isOwnProfile ? (
                <>
                  {onCreateMedia ? (
                    <button
                      type="button"
                      onClick={onCreateMedia}
                      className="rounded-lg border border-[#1A1F2C] p-2 text-[#F8FAFC] transition hover:bg-[#1A1F2C]"
                      aria-label="Create post or reel"
                    >
                      <Plus className="h-5 w-5" strokeWidth={2} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="rounded-lg bg-[#1A1F2C] px-4 py-1.5 text-sm font-semibold text-[#F8FAFC] transition hover:bg-[#252b3a]"
                  >
                    Edit profile
                  </button>
                  <button
                    type="button"
                    onClick={onSettingsClick}
                    className="rounded-lg border border-[#1A1F2C] p-2 text-[#F8FAFC] transition hover:bg-[#1A1F2C]"
                    aria-label="Profile settings"
                  >
                    <Settings className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onFollowToggle}
                  disabled={actionLoading}
                  className={[
                    "rounded-lg px-4 py-1.5 text-sm font-semibold transition",
                    isFollowing
                      ? "border border-[#1A1F2C] bg-transparent text-[#F8FAFC]"
                      : "bg-[#0EA5E9] text-[#F8FAFC]",
                  ].join(" ")}
                >
                  {actionLoading ? "…" : isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            <div className="hidden min-[735px]:mt-5 min-[735px]:block">
              <StatBlock
                postsCount={data.postsCount}
                followersCount={data.followersCount}
                followingCount={data.followingCount}
                className="max-w-md justify-start gap-8"
                onFollowersClick={onFollowersClick}
                onFollowingClick={onFollowingClick}
              />
            </div>

            <div className="hidden min-[735px]:mt-4 min-[735px]:block">
              <p className="text-sm font-semibold text-[#F8FAFC]">{data.fullName}</p>
              {data.bio ? (
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[#CBD5E1]">
                  {data.bio}
                </p>
              ) : isOwnProfile ? (
                <p className="mt-1 text-sm text-[#94A3B8]">No bio yet.</p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between min-[735px]:hidden">
          <h1 className="text-lg font-semibold text-[#F8FAFC]">{data.username}</h1>
          {isOwnProfile ? (
            <div className="flex items-center gap-2">
              {onCreateMedia ? (
                <button
                  type="button"
                  onClick={onCreateMedia}
                  className="rounded-md border border-[#1A1F2C] p-1.5 text-[#F8FAFC]"
                  aria-label="Create post or reel"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onEditProfile}
                className="rounded-md bg-[#1A1F2C] px-3 py-1 text-xs font-semibold text-[#F8FAFC]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onSettingsClick}
                className="rounded-md border border-[#1A1F2C] p-1.5 text-[#F8FAFC]"
                aria-label="Profile settings"
              >
                <Settings className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onFollowToggle}
              disabled={actionLoading}
              className={[
                "rounded-md px-3 py-1 text-xs font-semibold",
                isFollowing ? "border border-[#1A1F2C] text-[#F8FAFC]" : "bg-[#0EA5E9] text-white",
              ].join(" ")}
            >
              {actionLoading ? "…" : isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="mt-3 min-[735px]:hidden">
          <p className="text-sm font-semibold text-[#F8FAFC]">{data.fullName}</p>
          {data.bio ? (
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[#CBD5E1]">
              {data.bio}
            </p>
          ) : isOwnProfile ? (
            <p className="mt-1 text-sm text-[#94A3B8]">No bio yet.</p>
          ) : null}
        </div>

        <div className="-mx-4 mt-4 border-y border-[#1A1F2C] bg-[#020712]/80 px-4 py-3 min-[735px]:hidden">
          <StatBlock
            postsCount={data.postsCount}
            followersCount={data.followersCount}
            followingCount={data.followingCount}
            onFollowersClick={onFollowersClick}
            onFollowingClick={onFollowingClick}
          />
        </div>

        {storiesStrip ? <div className="mt-4 min-[735px]:mt-6">{storiesStrip}</div> : null}

        {data.highlights.length > 0 ? (
          <section className="mt-6 min-[735px]:mt-8" aria-label="Story highlights">
            <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {data.highlights.map((highlight) => (
                <button
                  key={highlight.id}
                  type="button"
                  className="flex w-[72px] shrink-0 flex-col items-center gap-2 text-center"
                >
                  <span className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border border-[#1A1F2C] bg-gradient-to-br from-[#1A1F2C] to-[#0f1419]">
                    {isUsableInstagramMediaUrl(highlight.img) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={highlight.img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-6 w-6 text-[#94A3B8]" strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="w-full truncate text-[11px] text-[#CBD5E1]">
                    {highlight.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <nav className="mt-6 border-t border-[#1A1F2C]" aria-label="Profile media filters">
          <ul className="flex">
            {visibleTabs.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <li key={id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => selectTab(id)}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex w-full items-center justify-center gap-2 border-t py-3 text-[11px] font-semibold tracking-[0.12em] transition",
                      active
                        ? "border-[#F8FAFC] text-[#F8FAFC]"
                        : "border-transparent text-[#94A3B8] hover:text-[#CBD5E1]",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" strokeWidth={active ? 2 : 1.5} aria-hidden />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="mt-1">
          {tabItems.length === 0 && !loading && !tabLoading ? (
            <p className="py-16 text-center text-sm text-[#94A3B8]">{emptyCopy}</p>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
              {tabItems.map((item, index) => (
                <MediaTile key={item.id} item={item} index={index} href={mediaHref(item)} />
              ))}
            </div>
          )}
          {loading || tabLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#94A3B8]" aria-label="Loading" />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default InstagramProfileView;
