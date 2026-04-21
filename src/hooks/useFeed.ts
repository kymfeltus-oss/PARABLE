"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const POSTS_PER_PAGE = 20;

const POSTS_FEED_SELECT = [
  "id",
  "content",
  "created_at",
  "media_url",
  "profile_id",
  "profiles:profile_id(id, full_name, avatar_url, username, status_text, is_live)",
  "post_likes(count)",
].join(", ");

function inferMediaTypeFromUrl(url: string | null): "video" | "image" | null {
  if (!url) return null;
  const base = url.split("?")[0] ?? "";
  if (/\.(mp4|webm|mov|m4v)$/i.test(base)) return "video";
  if (/\.(jpe?g|png|gif|webp|avif)$/i.test(base)) return "image";
  return null;
}

function describeFeedError(e: unknown): string {
  if (e == null) return "null";
  if (typeof e !== "object") return String(e);
  const x = e as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };
  const line = [x.message, x.code && `code=${x.code}`, x.details, x.hint].filter(Boolean).join(" | ");
  if (line) return line;
  const name = Object.prototype.hasOwnProperty.call(e, "constructor")
    ? String((e as { constructor?: { name?: string } }).constructor?.name ?? "?")
    : "?";
  return `(object ${name}, no message — check Supabase URL/key and RLS)`;
}

export type FeedAuthor = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
  status_text?: string | null;
  is_live?: boolean | null;
};

export type FeedPostNormalized = {
  id: string;
  content: string | null;
  created_at: string;
  image_url: string | null;
  media_type?: string | null;
  author: FeedAuthor | null;
  /** Aggregate from `post_likes(count)`; 0 if relation missing. */
  likesCount: number;
};

function pickAuthor(row: Record<string, unknown>): FeedAuthor | null {
  const raw = row.author ?? row.profiles;
  const one = Array.isArray(raw) ? raw[0] : raw;
  if (!one || typeof one !== "object") return null;
  const o = one as Record<string, unknown>;
  const id = o.id;
  if (id == null) return null;
  return {
    id: String(id),
    full_name: (o.full_name as string) ?? null,
    avatar_url: (o.avatar_url as string) ?? null,
    username: (o.username as string) ?? null,
    status_text: (o.status_text as string | undefined) ?? null,
    is_live: typeof o.is_live === "boolean" ? o.is_live : null,
  };
}

function pickLikesCount(row: Record<string, unknown>): number {
  const raw = row.post_likes ?? row.likes;
  if (!Array.isArray(raw) || raw.length === 0) return 0;
  const first = raw[0] as { count?: number };
  return typeof first.count === "number" ? first.count : 0;
}

function normalizeRow(row: Record<string, unknown>): FeedPostNormalized {
  const imageUrl =
    (row.image_url as string | null | undefined) ??
    (row.media_url as string | null | undefined) ??
    null;
  const dbType = row.media_type as string | null | undefined;
  const media_type =
    dbType === "video" || dbType === "image"
      ? dbType
      : inferMediaTypeFromUrl(imageUrl);
  return {
    id: String(row.id),
    content: (row.content as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? ""),
    image_url: imageUrl,
    media_type,
    author: pickAuthor(row),
    likesCount: pickLikesCount(row),
  };
}

type HomeFilter =
  | { kind: "guest" }
  | { kind: "following"; ids: string[] }
  | { kind: "none" };

/**
 * Loads `posts` with nested `profiles` as `author`.
 *
 * **Home (no `userId`, signed in):** follow-to-see — only `posts` whose `profile_id` is in your
 * `public.follows` rows (`follower_id = auth.uid()`). Zero follows ⇒ empty feed until you follow someone
 * (e.g. from Suggested Followers); a new `follows` INSERT triggers an immediate refetch.
 *
 * **Guests (no session):** no follow filter — public timeline (RLS permitting).
 *
 * **Profile tab (`userId` set):** that profile’s posts only.
 *
 * Realtime: `posts` INSERT when the author is in the active filter; `follows` INSERT refetches home.
 */
export function useFeed(userId?: string) {
  const supabase = createClient();
  const [posts, setPosts] = useState<FeedPostNormalized[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);

  const homeFilterRef = useRef<HomeFilter>({ kind: "guest" });

  const fetchPage = useCallback(
    async (mode: "initial" | "more") => {
      if (mode === "initial") {
        cursorRef.current = null;
        setHasMore(true);
      }
      if (mode === "more") {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        let filterProfileIds: string[] | null = null;
        let homeMode: HomeFilter = { kind: "guest" };

        if (userId) {
          homeFilterRef.current = { kind: "guest" };
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            homeMode = { kind: "guest" };
            homeFilterRef.current = homeMode;
          } else {
            const { data: followRows, error: followErr } = await supabase
              .from("follows")
              .select("following_id")
              .eq("follower_id", user.id);
            if (followErr) {
              console.error("useFeed follows:", describeFeedError(followErr));
              homeFilterRef.current = { kind: "none" };
              if (mode === "initial") {
                setPosts([]);
                cursorRef.current = null;
                setHasMore(false);
              }
              return;
            }
            const ids = (followRows ?? []).map((r: { following_id: string }) => r.following_id);
            if (ids.length === 0) {
              homeMode = { kind: "none" };
              homeFilterRef.current = homeMode;
              if (mode === "initial") {
                setPosts([]);
                cursorRef.current = null;
                setHasMore(false);
              }
              return;
            }
            homeMode = { kind: "following", ids };
            homeFilterRef.current = homeMode;
            filterProfileIds = ids;
          }
        }

        let q = supabase
          .from("posts")
          .select(POSTS_FEED_SELECT)
          .order("created_at", { ascending: false })
          .limit(POSTS_PER_PAGE);

        if (userId) {
          q = q.eq("profile_id", userId);
        } else if (filterProfileIds) {
          q = q.in("profile_id", filterProfileIds);
        }

        if (mode === "more" && cursorRef.current) {
          q = q.lt("created_at", cursorRef.current);
        }

        const { data, error } = await q;
        if (error) {
          console.error("useFeed fetch failed:", describeFeedError(error));
          if (mode === "initial") {
            setPosts([]);
            cursorRef.current = null;
            setHasMore(false);
          }
          return;
        }

        const rows = (data ?? []) as unknown as Record<string, unknown>[];
        const normalized = rows.map(normalizeRow);

        if (mode === "initial") {
          setPosts(normalized);
        } else {
          setPosts((prev) => [...prev, ...normalized]);
        }

        if (rows.length) {
          const last = rows[rows.length - 1];
          cursorRef.current = String(last.created_at ?? "");
          setHasMore(rows.length === POSTS_PER_PAGE);
        } else {
          if (mode === "initial") {
            cursorRef.current = null;
          }
          setHasMore(false);
        }
      } catch (e) {
        console.error("useFeed unexpected:", describeFeedError(e));
        if (mode === "initial") {
          setPosts([]);
          cursorRef.current = null;
          setHasMore(false);
        }
      } finally {
        if (mode === "more") {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [supabase, userId],
  );

  const refresh = useCallback(() => fetchPage("initial"), [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    if (!cursorRef.current) return;
    return fetchPage("more");
  }, [fetchPage, hasMore, loading, loadingMore]);

  useEffect(() => {
    void fetchPage("initial");
  }, [fetchPage]);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | undefined;

    const onComposerPost = () => {
      void refresh();
    };

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      const handleInsertPost = async (newRow: Record<string, unknown>) => {
        if (userId) {
          if ((newRow.profile_id as string | undefined) !== userId) return;
        } else {
          const h = homeFilterRef.current;
          if (h.kind === "following") {
            const pid = String(newRow.profile_id ?? "");
            if (!h.ids.includes(pid)) return;
          } else if (h.kind === "none") {
            return;
          }
        }

        const id = newRow.id as string | undefined;
        if (!id) return;
        const { data, error } = await supabase
          .from("posts")
          .select(POSTS_FEED_SELECT)
          .eq("id", id)
          .maybeSingle();
        if (error) {
          console.error("useFeed realtime row:", describeFeedError(error));
          return;
        }
        if (!data) return;
        const row = normalizeRow(data as unknown as Record<string, unknown>);
        setPosts((prev) => {
          if (prev.some((p) => p.id === row.id)) return prev;
          return [row, ...prev];
        });
      };

      const ch = supabase
        .channel(`use-feed-posts-${userId ?? "home"}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "posts" },
          async (payload) => {
            if (cancelled) return;
            await handleInsertPost((payload.new ?? {}) as Record<string, unknown>);
          },
        );

      if (user && !userId) {
        ch.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "follows",
            filter: `follower_id=eq.${user.id}`,
          },
          () => {
            if (cancelled) return;
            void fetchPage("initial");
          },
        );
      }

      ch.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_likes" },
        (payload) => {
          if (cancelled) return;
          const postId = (payload.new as { post_id?: string })?.post_id;
          if (!postId) return;
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, likesCount: (p.likesCount ?? 0) + 1 } : p,
            ),
          );
        },
      );
      ch.on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_likes" },
        (payload) => {
          if (cancelled) return;
          const postId = (payload.old as { post_id?: string })?.post_id;
          if (!postId) return;
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, likesCount: Math.max(0, (p.likesCount ?? 0) - 1) }
                : p,
            ),
          );
        },
      );

      ch.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          if (cancelled) return;
          const row = payload.new as {
            id?: string;
            is_live?: boolean;
            status_text?: string | null;
            username?: string | null;
            full_name?: string | null;
            avatar_url?: string | null;
          };
          const pid = row.id;
          if (!pid) return;

          setPosts((prev) =>
            prev.map((p) => {
              if (p.author?.id !== pid) return p;
              return {
                ...p,
                author: p.author
                  ? {
                      ...p.author,
                      ...(typeof row.is_live === "boolean" ? { is_live: row.is_live } : {}),
                      ...(row.status_text !== undefined ? { status_text: row.status_text } : {}),
                      ...(row.username !== undefined ? { username: row.username } : {}),
                      ...(row.full_name !== undefined ? { full_name: row.full_name } : {}),
                      ...(row.avatar_url !== undefined ? { avatar_url: row.avatar_url } : {}),
                    }
                  : null,
              };
            }),
          );
        },
      );

      ch.subscribe();
      channel = ch;
      window.addEventListener("parable:sanctuary-posted", onComposerPost);
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("parable:sanctuary-posted", onComposerPost);
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [supabase, userId, fetchPage, refresh]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
  };
}
