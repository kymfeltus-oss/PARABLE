"use client";

import StoriesFeature from "./StoriesFeature";

type ProfileStoryStripProps = {
  profileUserId: string;
  isOwnProfile?: boolean;
};

/**
 * Light-themed profile stories row — same viewer/upload flow as the Sanctuary feed.
 */
export default function ProfileStoryStrip({ profileUserId, isOwnProfile = false }: ProfileStoryStripProps) {
  return (
    <StoriesFeature
      theme="dark"
      focusUserId={profileUserId}
      className="profile-stories-feature border-b border-[#06111E] bg-[#01040A]"
      showUploadStatus={isOwnProfile}
    />
  );
}
