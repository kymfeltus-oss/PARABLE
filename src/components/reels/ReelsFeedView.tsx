"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { REELS_REFRESH_EVENT } from "@/lib/reels/constants";
import type { ReelFeedItem } from "@/lib/reels/types";
import { ReelsAudioProvider } from "@/providers/ReelsAudioProvider";
import ReelsFeed from "@/components/reels/ReelsFeed";

export default function ReelsFeedView() {
  const { avatarUrl, userProfile } = useAuth();
  const [reels, setReels] = useState<ReelFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReels = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/reels", { credentials: "include" });
      const payload = (await res.json()) as { reels?: ReelFeedItem[]; error?: string };
      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to load reels.");
      }
      setReels(payload.reels ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reels.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReels();
  }, [loadReels]);

  useEffect(() => {
    const onRefresh = () => {
      void loadReels();
    };
    window.addEventListener(REELS_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(REELS_REFRESH_EVENT, onRefresh);
  }, [loadReels]);

  const handleLike = useCallback(async (reelId: string) => {
    if (reelId.startsWith("demo-reel-")) return;
    try {
      await fetch("/api/reels/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelId }),
      });
    } catch {
      /* optimistic UI already applied */
    }
  }, []);

  const handleViewLeave = useCallback(async (reelId: string, watchRatio: number) => {
    if (reelId.startsWith("demo-reel-")) return;
    try {
      await fetch("/api/reels/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reelId, watchRatio }),
      });
    } catch {
      /* non-blocking metric */
    }
  }, []);

  const username = userProfile?.username ?? userProfile?.email?.split("@")[0] ?? "you";
  const currentUserId = userProfile?.id ? String(userProfile.id) : null;

  const handleReelDeleted = useCallback((reelId: string) => {
    setReels((prev) => prev.filter((r) => r.id !== reelId));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#00F2FE]" />
      </div>
    );
  }

  return (
    <ReelsAudioProvider>
      <div className="relative flex h-full min-h-0 flex-1 flex-col bg-black">
        <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 py-3">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white">Reels</p>
          <Link
            href="/create/reel"
            aria-label="Create reel"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </header>

        {error ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-white">
            <p className="text-sm text-[#F87171]">{error}</p>
            <button
              type="button"
              onClick={() => void loadReels()}
              className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider"
            >
              Retry
            </button>
          </div>
        ) : (
          <ReelsFeed
            reels={reels}
            currentUserId={currentUserId}
            currentUserAvatar={avatarUrl}
            currentUsername={username}
            onLike={handleLike}
            onViewLeave={handleViewLeave}
            onReelDeleted={handleReelDeleted}
          />
        )}
      </div>
    </ReelsAudioProvider>
  );
}
