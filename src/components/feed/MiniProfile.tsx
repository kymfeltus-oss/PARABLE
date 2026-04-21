"use client";

import { useRouter } from "next/navigation";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { useAuth } from "@/hooks/useAuth";
import SuggestedFollowers from "./SuggestedFollowers";

type MiniProfileProps = {
  /** Logged-in user’s profile id — forwarded to {@link SuggestedFollowers}. */
  currentUserId?: string;
  /** Refetch the main feed after following someone from suggestions. */
  onFeedRefresh?: () => void;
};

export default function MiniProfile({ currentUserId, onFeedRefresh }: MiniProfileProps) {
  const router = useRouter();
  const { userProfile, avatarUrl, loading } = useAuth();

  const displayName =
    userProfile?.full_name?.trim() ||
    userProfile?.username?.trim() ||
    "You";
  const avatar =
    avatarUrl?.trim() ||
    "https://i.pravatar.cc/150?u=24";

  const uid = currentUserId ?? userProfile?.id ?? "";

  return (
    <div className="space-y-3 text-white">
      {/* User strip — same surface as Discord-style widgets */}
      <div className="rounded-xl border border-gray-800 bg-[#18191c] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]/50 rounded-full"
            title="Profile"
          >
            <img
              src={avatar}
              alt=""
              className="h-12 w-12 cursor-pointer rounded-full object-cover ring-2 ring-[#00f2fe]/25"
              onError={fallbackAvatarOnError}
            />
          </button>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {loading ? "…" : displayName}
            </p>
            <p className="text-sm text-white/45">
              Welcome to PARABLE
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 cursor-pointer text-sm font-semibold text-[#00f2fe] transition hover:text-[#00f2fe]/80"
          onClick={() => {
            window.location.assign("/logout");
          }}
        >
          Sign out
        </button>
      </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-[#18191c] p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-gray-400">Suggested for you</span>
          <button
            type="button"
            className="text-xs font-bold text-white transition hover:text-gray-400"
            onClick={() => router.push("/following")}
          >
            See all
          </button>
        </div>
        <SuggestedFollowers onFollowed={onFeedRefresh} compact />
      </div>
    </div>
  );
}
