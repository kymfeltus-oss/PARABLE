"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfileLayoutData } from "@/hooks/useProfileLayoutData";
import { uploadUserAvatarFromDataUrl } from "@/lib/avatar-storage";
import { persistAvatarPublicUrlToProfile } from "@/lib/profile-avatar";
import SanctuaryCreationStudio, { type CreationType } from "@/components/my-sanctuary/SanctuaryCreationStudio";
import ProfileCustomizeModal from "@/components/my-sanctuary/ProfileCustomizeModal";
import ProfileAvatarCropModal from "@/components/my-sanctuary/ProfileAvatarCropModal";
import MySanctuaryInstagramLayout from "@/components/my-sanctuary/MySanctuaryInstagramLayout";
import SanctuaryInstagramProfileBridge from "@/components/profile/SanctuaryInstagramProfileBridge";
import { resolveProfilePostStat } from "@/lib/sanctuary-post-filters";
import {
  SANCTUARY_MEDIA_ACCEPT,
  isSanctuaryVideoFile,
  sanctuaryMediaLimitLabel,
  sanctuaryMediaTooLarge,
} from "@/lib/sanctuary-media-limits";
import { useProfilePostsLive } from "@/hooks/useProfilePostsLive";
import { toggleFollow, uploadAvatar, getProfileLayout, type SanctuaryLayoutData, type SanctuaryPost } from "./actions";
import "@/styles/my-sanctuary-instagram.css";

type Props = {
  initialData: SanctuaryLayoutData;
  currentUserId: string;
  /** Profile being viewed (defaults to current user). */
  targetUserId?: string;
  /** Static demo persona — follow is local-only; no create/edit controls. */
  isDemoProfile?: boolean;
};

function resolveAvatarSrc(
  profileUrl: string | null | undefined,
  authUrl: string | undefined,
  localPreview: string | null,
  preferAuth: boolean,
): string | null {
  if (localPreview) return localPreview;

  const raw = profileUrl?.trim();
  if (raw && raw !== "/logo.svg" && !raw.includes("logo.svg")) {
    if (!/^https?:\/\/(www\.)?unsplash\.com\/?$/i.test(raw)) {
      if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:") || raw.startsWith("/")) {
        return raw;
      }
      const { data } = createClient().storage.from("avatars").getPublicUrl(raw);
      if (data.publicUrl) return data.publicUrl;
    }
  }

  if (preferAuth && authUrl && authUrl !== "/logo.svg" && !authUrl.includes("logo.svg")) {
    return authUrl;
  }
  return null;
}

const CREATE_MEDIA_ACCEPT = SANCTUARY_MEDIA_ACCEPT;

export default function MySanctuaryClientView({
  initialData,
  currentUserId,
  targetUserId: targetUserIdProp,
  isDemoProfile = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const useBlueprintIgView =
    process.env.NEXT_PUBLIC_PROFILE_IG_VIEW === "blueprint" ||
    pathname === "/profile/blueprint" ||
    pathname?.startsWith("/profile/blueprint/");
  const { avatarUrl, applyAvatarFromUpload, refreshProfile } = useAuth();
  const targetUserId = targetUserIdProp ?? currentUserId;

  const {
    layoutData,
    setLayoutData,
    setOptimisticFollowers,
    revertOptimisticFollowers,
    updateAvatarState,
    updateProfileFields,
    prependPublishedPost,
  } = useProfileLayoutData({ initialData });
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const [avatarCropUrl, setAvatarCropUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioFile, setStudioFile] = useState<File | null>(null);
  const [studioType, setStudioType] = useState<CreationType>("post");
  const [galleryTabFocus, setGalleryTabFocus] = useState<{ tab: "posts" | "reels" | "tagged"; token: number } | null>(
    null,
  );
  const [publishNotice, setPublishNotice] = useState<string | null>(null);
  const [publishNoticeTone, setPublishNoticeTone] = useState<"success" | "error">("success");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const pendingCreationType = useRef<CreationType>("post");
  const galleryTabTokenRef = useRef(0);

  const reloadLayout = useCallback(async () => {
    if (isDemoProfile) return;
    const fresh = await getProfileLayout(targetUserId, currentUserId);
    setLayoutData(fresh);
  }, [targetUserId, currentUserId, isDemoProfile, setLayoutData]);

  useEffect(() => {
    const onPosted = () => {
      void reloadLayout();
    };
    const onStoryPublished = () => {
      void reloadLayout();
    };
    window.addEventListener("parable:sanctuary-posted", onPosted);
    window.addEventListener("parable:story-published", onStoryPublished);
    return () => {
      window.removeEventListener("parable:sanctuary-posted", onPosted);
      window.removeEventListener("parable:story-published", onStoryPublished);
    };
  }, [reloadLayout]);

  const profile = layoutData.profile;
  const isOwnProfile = profile?.id === currentUserId;

  useProfilePostsLive(isOwnProfile && !isDemoProfile ? currentUserId : undefined, reloadLayout);

  const preferAuthAvatar = isOwnProfile && !isDemoProfile;
  const displayAvatar = resolveAvatarSrc(
    profile?.avatar_url,
    avatarUrl,
    localAvatarPreview,
    preferAuthAvatar,
  );

  const stats = {
    posts: resolveProfilePostStat(layoutData.posts, layoutData.totalPosts),
    followers: layoutData.followersCount,
    following: layoutData.followingCount,
  };

  const showNotice = (message: string, tone: "success" | "error" = "success") => {
    setPublishNoticeTone(tone);
    setPublishNotice(message);
    window.setTimeout(() => setPublishNotice(null), 4000);
  };

  const openCreateMedia = () => {
    if (!isOwnProfile || !mediaInputRef.current) return;
    mediaInputRef.current.accept = CREATE_MEDIA_ACCEPT;
    mediaInputRef.current.click();
  };

  const handleMediaSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !isOwnProfile) return;

    if (sanctuaryMediaTooLarge(file.size)) {
      showNotice(`File must be ${sanctuaryMediaLimitLabel()} or smaller.`, "error");
      return;
    }

    const creationType: CreationType = isSanctuaryVideoFile(file) ? "reel" : "post";
    pendingCreationType.current = creationType;
    setStudioType(creationType);
    setStudioFile(file);
    setStudioOpen(true);
  };

  const handlePublished = useCallback(
    (result: { creationType: CreationType; post: SanctuaryPost }) => {
      prependPublishedPost(result.post);
      if (result.creationType === "reel") {
        galleryTabTokenRef.current += 1;
        setGalleryTabFocus({ tab: "reels", token: galleryTabTokenRef.current });
        setPublishNoticeTone("success");
        setPublishNotice("Reel published! View it under the Reels tab.");
      } else {
        galleryTabTokenRef.current += 1;
        setGalleryTabFocus({ tab: "posts", token: galleryTabTokenRef.current });
        setPublishNoticeTone("success");
        setPublishNotice("Post published!");
      }
      window.setTimeout(() => setPublishNotice(null), 4000);
      void reloadLayout();
    },
    [prependPublishedPost, reloadLayout],
  );

  const closeStudio = () => {
    setStudioOpen(false);
    setStudioFile(null);
  };

  const handleFollowClick = () => {
    if (isOwnProfile || !profile) return;

    const wasFollowing = layoutData.isFollowingCurrentUser;
    const nextFollowing = !wasFollowing;
    setOptimisticFollowers(nextFollowing);

    if (isDemoProfile) return;

    startTransition(() => {
      void (async () => {
        const result = await toggleFollow(profile.id, currentUserId, wasFollowing);
        if (!result.ok) {
          revertOptimisticFollowers(wasFollowing);
          return;
        }
        router.refresh();
      })();
    });
  };

  const openAvatarPicker = () => {
    if (!isOwnProfile || avatarUploading) return;
    fileInputRef.current?.click();
  };

  const uploadAvatarDataUrl = async (dataUrl: string) => {
    if (!isOwnProfile || !profile) return;

    setAvatarUploading(true);
    setLocalAvatarPreview(dataUrl);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) return;

      const uploaded = await uploadUserAvatarFromDataUrl(supabase, user.id, dataUrl);
      if ("error" in uploaded) {
        console.error("Avatar upload failed:", uploaded.error);
        setLocalAvatarPreview(null);
        return;
      }

      const username = profile.username?.trim() || "member";
      const fullName = profile.full_name?.trim() || username;
      const saved = await persistAvatarPublicUrlToProfile(supabase, user.id, uploaded.publicUrl, {
        username,
        full_name: fullName,
      });
      if (!saved.ok) {
        console.error("Avatar profile save failed:", saved.error);
        setLocalAvatarPreview(null);
        return;
      }

      applyAvatarFromUpload(uploaded.publicUrl);

      startTransition(() => {
        void (async () => {
          const res = await uploadAvatar(user.id, uploaded.publicUrl);
          if (res.success) {
            updateAvatarState(uploaded.publicUrl);
            refreshProfile();
            router.refresh();
          }
        })();
      });
    } catch (err) {
      console.error("Avatar upload process failed:", err);
      setLocalAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !isOwnProfile || !profile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") return;
      setAvatarCropUrl(reader.result);
    };
    reader.onerror = () => {
      console.error("Could not read profile photo.");
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarCropCancel = () => {
    setAvatarCropUrl(null);
  };

  const handleAvatarCropConfirm = (dataUrl: string) => {
    setAvatarCropUrl(null);
    void uploadAvatarDataUrl(dataUrl);
  };

  if (!profile) {
    return (
      <div className="my-sanctuary-ig flex min-h-full items-center justify-center px-6 text-center">
        <p className="gallery-empty">Profile data setup pending…</p>
      </div>
    );
  }

  const displayHandle = profile.username?.trim() || profile.full_name?.trim() || "member";

  return (
    <>
      {publishNotice ? (
        <div
          className={
            publishNoticeTone === "error"
              ? "fixed left-1/2 top-20 z-[1200] -translate-x-1/2 rounded-full border border-[#00F2FE]/40 bg-[#06111E] px-5 py-2 text-sm font-medium text-[#F8FAFC] shadow-lg"
              : "fixed left-1/2 top-20 z-[1200] -translate-x-1/2 rounded-full border border-[#0EA5E9]/40 bg-[#020712] px-5 py-2 text-sm font-medium text-[#CBD5E1] shadow-lg"
          }
          role="status"
        >
          {publishNotice}
        </div>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      <input
        ref={mediaInputRef}
        type="file"
        className="hidden"
        onChange={handleMediaSelection}
      />
      {useBlueprintIgView ? (
        <SanctuaryInstagramProfileBridge
          profileUserId={profile.id}
          username={displayHandle}
          fullName={profile.full_name ?? null}
          bio={profile.bio ?? null}
          avatarUrl={displayAvatar}
          layoutData={layoutData}
          loading={false}
          isOwnProfile={isOwnProfile}
          isFollowing={layoutData.isFollowingCurrentUser}
          actionLoading={isPending || avatarUploading}
          onFollowToggle={handleFollowClick}
          onAvatarClick={isOwnProfile ? openAvatarPicker : undefined}
          avatarUploading={avatarUploading}
          onCreateMedia={isOwnProfile ? openCreateMedia : undefined}
          onCustomizePage={isOwnProfile ? () => setCustomizeOpen(true) : undefined}
        />
      ) : (
        <MySanctuaryInstagramLayout
          profileUserId={profile.id}
          username={displayHandle}
          fullName={profile.full_name ?? null}
          bio={profile.bio ?? null}
          avatarUrl={displayAvatar}
          stats={stats}
          posts={layoutData.posts}
          taggedPosts={layoutData.taggedPosts}
          loading={false}
          setupPending={false}
          isOwnProfile={isOwnProfile}
          isFollowing={layoutData.isFollowingCurrentUser}
          actionLoading={isPending || avatarUploading}
          galleryTabFocus={galleryTabFocus}
          onFollowToggle={handleFollowClick}
          onAvatarClick={isOwnProfile ? openAvatarPicker : undefined}
          avatarUploading={avatarUploading}
          onCreateMedia={isOwnProfile ? openCreateMedia : undefined}
          onCustomizePage={isOwnProfile ? () => setCustomizeOpen(true) : undefined}
        />
      )}
      <SanctuaryCreationStudio
        open={studioOpen}
        file={studioFile}
        creationType={studioType}
        onClose={closeStudio}
        onPublished={handlePublished}
      />
      <ProfileCustomizeModal
        open={customizeOpen}
        profileId={profile.id}
        displayHandle={profile.username ?? ""}
        fullName={profile.full_name ?? ""}
        bio={profile.bio ?? ""}
        onClose={() => setCustomizeOpen(false)}
        onSaved={(saved) => {
          updateProfileFields(saved);
          refreshProfile();
          void getProfileLayout(profile.id, currentUserId).then((fresh) => {
            setLayoutData(fresh);
          });
          window.dispatchEvent(new CustomEvent("parable:profile-updated"));
        }}
      />
      {avatarCropUrl ? (
        <ProfileAvatarCropModal
          imageUrl={avatarCropUrl}
          onCancel={handleAvatarCropCancel}
          onConfirm={handleAvatarCropConfirm}
        />
      ) : null}
    </>
  );
}
