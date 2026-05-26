"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InstagramProfileView } from "@/components/profile/InstagramProfileView";
import ProfileFollowListModal from "@/components/my-sanctuary/ProfileFollowListModal";
import ProfileStoryStrip from "@/components/sanctuary-stories/ProfileStoryStrip";
import type { SanctuaryLayoutData } from "@/app/my-sanctuary/actions";
import { getTaggedPostsForProfile } from "@/app/my-sanctuary/actions";
import { fetchProfileSavedMedia } from "@/lib/profile/fetch-profile-saved-media";
import {
  mapSanctuaryToInstagramProfile,
} from "@/lib/profile/map-sanctuary-to-instagram-profile";
import type { InstagramMediaItem, InstagramProfileTab } from "@/lib/profile/instagram-profile-data";
import { isUsableInstagramMediaUrl } from "@/lib/profile/instagram-profile-data";
import { useTaggedPostsLive } from "@/hooks/useTaggedPostsLive";

type Props = {
  profileUserId: string;
  username: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  layoutData: SanctuaryLayoutData;
  loading?: boolean;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  actionLoading?: boolean;
  onFollowToggle?: () => void;
  onAvatarClick?: () => void;
  avatarUploading?: boolean;
  onCreateMedia?: () => void;
  onCustomizePage?: () => void;
};

function postsToMedia(posts: SanctuaryLayoutData["posts"]): InstagramMediaItem[] {
  return posts
    .filter((p) => isUsableInstagramMediaUrl(p.media_url))
    .map((p) => ({
      id: p.id,
      url: p.media_url!,
      isVideo: p.media_type === "video",
    }));
}

/**
 * Live-data bridge: maps sanctuary layout → InstagramProfileView without changing server actions.
 */
export default function SanctuaryInstagramProfileBridge({
  profileUserId,
  username,
  fullName,
  bio,
  avatarUrl,
  layoutData,
  loading = false,
  isOwnProfile = true,
  isFollowing = false,
  actionLoading = false,
  onFollowToggle,
  onAvatarClick,
  avatarUploading = false,
  onCreateMedia,
  onCustomizePage,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InstagramProfileTab>("posts");
  const [taggedPosts, setTaggedPosts] = useState(layoutData.taggedPosts ?? []);
  const [taggedLoading, setTaggedLoading] = useState(false);
  const [savedItems, setSavedItems] = useState<InstagramMediaItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    setTaggedPosts(layoutData.taggedPosts ?? []);
  }, [layoutData.taggedPosts]);

  const refreshTagged = useCallback(() => {
    if (activeTab !== "tagged") return;
    void getTaggedPostsForProfile(profileUserId, username).then(setTaggedPosts);
  }, [activeTab, profileUserId, username]);

  useTaggedPostsLive(profileUserId, username, activeTab === "tagged", refreshTagged);

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

  useEffect(() => {
    if (!isOwnProfile || activeTab !== "saved") return;
    let cancelled = false;
    setSavedLoading(true);
    void fetchProfileSavedMedia(profileUserId)
      .then((items) => {
        if (!cancelled) setSavedItems(items);
      })
      .finally(() => {
        if (!cancelled) setSavedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, isOwnProfile, profileUserId, layoutData.posts]);

  const profileData = useMemo(
    () =>
      mapSanctuaryToInstagramProfile(
        { ...layoutData, profile: layoutData.profile, taggedPosts },
        {
          avatarUrl,
          saved: savedItems,
          tagged: postsToMedia(taggedPosts),
        },
      ),
    [layoutData, avatarUrl, savedItems, taggedPosts],
  );

  if (!layoutData.profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#02040A] px-6 text-center text-sm text-[#94A3B8]">
        Profile data setup pending…
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <InstagramProfileView
          data={{
            ...profileData,
            username: username || profileData.username,
            fullName: fullName?.trim() || profileData.fullName,
            bio: bio?.trim() || profileData.bio,
          }}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          actionLoading={actionLoading}
          loading={loading}
          tabLoading={
            (activeTab === "tagged" && taggedLoading) || (activeTab === "saved" && savedLoading)
          }
          onEditProfile={onCustomizePage}
          onSettingsClick={() => router.push("/settings")}
          onCreateMedia={onCreateMedia}
          onAvatarClick={onAvatarClick}
          avatarUploading={avatarUploading}
          onFollowToggle={onFollowToggle}
          onFollowersClick={() => setFollowModal("followers")}
          onFollowingClick={() => setFollowModal("following")}
          onTabChange={setActiveTab}
          storiesStrip={
            isOwnProfile ? (
              <ProfileStoryStrip profileUserId={profileUserId} isOwnProfile={isOwnProfile} />
            ) : undefined
          }
        />
      </div>

      <ProfileFollowListModal
        open={followModal !== null}
        mode={followModal ?? "followers"}
        profileUserId={profileUserId}
        onClose={() => setFollowModal(null)}
      />
    </>
  );
}
