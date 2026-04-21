"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import FeedUserProfileHover from "./FeedUserProfileHover";
import type { PostCardProps } from "./PostCard";
import { createClient } from "@/utils/supabase/client";
import CommentSection from "./CommentSection";
import PraiseButton from "./PraiseButton";

/** Twitch-style pill; parent should position (e.g. bottom-center on avatar). */
export const LiveBadge = ({ isLive }: { isLive: boolean }) => {
  if (!isLive) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-sm border border-black bg-red-600 px-1 py-0.5 animate-pulse shadow-sm">
      <span className="text-[9px] font-black tracking-tight text-white">LIVE</span>
    </div>
  );
};

const JoinStreamButton = ({ isLive, userId }: { isLive: boolean; userId: string }) => {
  if (!isLive || !userId) return null;

  return (
    <Link
      href={`/stream/${userId}`}
      className="block w-full rounded-md bg-gradient-to-r from-red-600 to-purple-600 py-2.5 text-center text-xs font-black uppercase tracking-wide text-white shadow-lg animate-pulse transition-transform duration-200 hover:scale-[1.02] hover:from-red-500 hover:to-purple-500"
    >
      Join Stream
    </Link>
  );
};

function normalizeAuthor(
  author: PostCardProps["author"] | PostCardProps["author"][] | null | undefined,
) {
  if (!author) return null;
  if (Array.isArray(author)) return author[0] ?? null;
  return author;
}

/**
 * Instagram-style feed card — media links to `/post/:id`; praises use `public.post_likes`
 * (your Supabase “likes” stream for this app — enable Realtime INSERT on this table).
 */
export default function InstagramPost({
  id,
  content,
  image_url,
  media_url,
  media_type,
  author,
  created_at,
  comments: _legacyComments = [],
  likesCount: likesCountProp,
  praisesInitial,
  initialLiked,
}: PostCardProps) {
  const supabase = useMemo(() => createClient(), []);
  const baseLikes = likesCountProp ?? praisesInitial ?? 0;
  const [displayLikes, setDisplayLikes] = useState(baseLikes);
  const [liked, setLiked] = useState(() => Boolean(initialLiked));
  const [likeBusy, setLikeBusy] = useState(false);
  const [pulse, setPulse] = useState(false);
  const sessionUserIdRef = useRef<string | null>(null);

  const profile = normalizeAuthor(author);
  const authorName =
    profile?.full_name?.trim() || profile?.username?.trim() || "Anonymous";
  const authorAvatar = profile?.avatar_url;
  const profileId = profile?.id;
  const profileHref = profileId ? `/profile/${profileId}` : "#";
  const isLive = Boolean(profile?.is_live);

  const mainMedia = image_url ?? media_url;
  const isVideo =
    media_type === "video" ||
    (mainMedia && /\.(mp4|webm|mov)(\?|#|$)/i.test(mainMedia.split("?")[0] ?? ""));

  useEffect(() => {
    setDisplayLikes(baseLikes);
  }, [baseLikes]);

  const refreshSelfLiked = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    sessionUserIdRef.current = user?.id ?? null;
    if (!user) {
      setLiked(false);
      return;
    }
    const { data } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    setLiked(Boolean(data?.id));
  }, [supabase, id]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refreshSelfLiked();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSelfLiked]);

  // Realtime: postgres_changes on `post_likes` — instant count when others praise (no refresh).
  useEffect(() => {
    const syncCount = async () => {
      const { count } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);
      if (typeof count === "number") setDisplayLikes(count);
    };

    const onInsert = (payload: { new?: Record<string, unknown> }) => {
      const row = payload.new;
      const uid = row?.user_id != null ? String(row.user_id) : null;
      if (!uid) {
        void syncCount();
        return;
      }
      const me = sessionUserIdRef.current;
      if (me && uid === me) {
        void syncCount();
        void refreshSelfLiked();
        return;
      }
      setDisplayLikes((n) => n + 1);
    };

    const onDelete = (payload: { old?: Record<string, unknown> }) => {
      const row = payload.old;
      const uid = row?.user_id != null ? String(row.user_id) : null;
      if (!uid) {
        void syncCount();
        return;
      }
      const me = sessionUserIdRef.current;
      if (me && uid === me) {
        void syncCount();
        void refreshSelfLiked();
        return;
      }
      setDisplayLikes((n) => Math.max(0, n - 1));
    };

    const ch = supabase
      .channel(`post-likes-rt-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_likes",
          filter: `post_id=eq.${id}`,
        },
        (payload) => onInsert(payload as { new?: Record<string, unknown> }),
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "post_likes",
          filter: `post_id=eq.${id}`,
        },
        (payload) => onDelete(payload as { old?: Record<string, unknown> }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [supabase, id, refreshSelfLiked]);

  const handleLike = useCallback(async () => {
    if (likeBusy) return;
    setLikeBusy(true);

    const wasLiked = liked;
    const prevCount = displayLikes;

    setLiked(!wasLiked);
    setDisplayLikes((n) => Math.max(0, n + (wasLiked ? -1 : 1)));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLiked(wasLiked);
        setDisplayLikes(prevCount);
        return;
      }

      if (wasLiked) {
        const { error } = await supabase.from("post_likes").delete().eq("post_id", id).eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_likes").insert({ post_id: id, user_id: user.id });
        if (error) throw error;
        console.log("Praise sent to the Sanctuary!");
      }
    } catch (e) {
      console.error("InstagramPost praise sync:", e);
      setLiked(wasLiked);
      setDisplayLikes(prevCount);
    } finally {
      setLikeBusy(false);
      setPulse(true);
      window.setTimeout(() => setPulse(false), 450);
    }
  }, [id, liked, likeBusy, displayLikes, supabase]);

  return (
    <article className="w-full border-b border-neutral-800 bg-black">
      <div className="flex items-start justify-between gap-2 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FeedUserProfileHover
            name={authorName}
            handle={profile?.username}
            avatarUrl={authorAvatar}
            statusText={profile?.status_text}
          >
            <div className="flex min-w-0 cursor-default items-center gap-3">
              {profileId ? (
                <div className="relative shrink-0">
                  <Link
                    href={profileHref}
                    className={[
                      "relative block shrink-0 rounded-full",
                      isLive
                        ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black"
                        : "ring-2 ring-transparent transition hover:ring-white/20",
                    ].join(" ")}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={authorAvatar}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                        onError={fallbackAvatarOnError}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-black text-[10px] font-bold text-white/90">
                        {authorName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  {isLive ? (
                    <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
                      <LiveBadge isLive />
                    </div>
                  ) : null}
                </div>
              ) : authorAvatar ? (
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={authorAvatar}
                    alt=""
                    className={[
                      "h-8 w-8 shrink-0 rounded-full object-cover",
                      isLive ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black" : "",
                    ].join(" ")}
                    onError={fallbackAvatarOnError}
                  />
                  {isLive ? (
                    <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
                      <LiveBadge isLive />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="relative shrink-0">
                  <div
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-bold",
                      isLive ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black" : "",
                    ].join(" ")}
                  >
                    {authorName.slice(0, 2).toUpperCase()}
                  </div>
                  {isLive ? (
                    <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
                      <LiveBadge isLive />
                    </div>
                  ) : null}
                </div>
              )}
              {profileId ? (
                <Link
                  href={profileHref}
                  className="min-w-0 truncate text-sm font-semibold text-white hover:text-neutral-200"
                >
                  {authorName}
                </Link>
              ) : (
                <span className="min-w-0 truncate text-sm font-semibold text-white">{authorName}</span>
              )}
            </div>
          </FeedUserProfileHover>
        </div>
        <button
          type="button"
          className="shrink-0 p-1 text-neutral-500 hover:text-white"
          aria-label="Post options"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </button>
      </div>

      {mainMedia &&
        (isVideo ? (
          <div className="relative bg-black">
            <Link
              href={`/post/${id}`}
              className="absolute right-2 top-2 z-10 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-black/90"
            >
              View post
            </Link>
            <video
              controls
              className="aspect-square w-full bg-black object-cover sm:aspect-auto sm:max-h-[min(85vh,560px)]"
              key={id}
            >
              <source src={mainMedia} />
            </video>
          </div>
        ) : (
          <div className="relative bg-black">
            <Link
              href={`/post/${id}`}
              className="relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainMedia}
                alt=""
                className="aspect-square w-full cursor-pointer bg-black object-cover sm:aspect-auto sm:max-h-[min(85vh,560px)]"
              />
            </Link>
          </div>
        ))}

      <div className="p-3 pb-4">
        <PraiseButton
          liked={liked}
          count={displayLikes}
          disabled={likeBusy}
          pulse={pulse}
          onPraise={() => void handleLike()}
        />

        <div className="mt-2 space-y-1">
          <p className="text-sm leading-relaxed text-white">
            {profileId ? (
              <Link href={profileHref} className="mr-2 font-bold text-white hover:underline">
                {profile?.username?.trim() || authorName}
              </Link>
            ) : (
              <span className="mr-2 font-bold text-white">{profile?.username?.trim() || authorName}</span>
            )}
            <span className="text-neutral-300">{content}</span>
          </p>
          <JoinStreamButton isLive={isLive} userId={profileId ?? ""} />
          <p className="mt-2 text-[10px] uppercase text-gray-500">
            {new Date(created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-3 border-t border-neutral-800 pt-3">
          <CommentSection
            postId={id}
            maxVisible={2}
            viewAllHref={`/post/${id}`}
            noOuterFrame
          />
        </div>
      </div>
    </article>
  );
}
