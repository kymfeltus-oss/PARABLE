"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { addComment } from "@/lib/feed";

type ProfileSnippet = {
  username: string | null;
  avatar_url: string | null;
  full_name?: string | null;
};

export type CommentRow = {
  id: string;
  post_id: string;
  profile_id: string;
  content: string;
  created_at: string;
  profiles?: ProfileSnippet | ProfileSnippet[] | null;
};

type Props = {
  postId: string;
  /** Extra classes on the outer wrapper */
  className?: string;
  /**
   * Feed-style preview: only the newest N comments (chronological among that window).
   * Omit for full thread (e.g. post detail page).
   */
  maxVisible?: number;
  /** Shown under the list when `maxVisible` is set (e.g. `/post/[id]`). */
  viewAllHref?: string;
  /** Parent already drew the top border (e.g. feed card) — omit outer frame spacing/border. */
  noOuterFrame?: boolean;
  /** Set false when the parent renders a sticky composer (e.g. post detail page). */
  showComposer?: boolean;
};

/**
 * Full comment thread for a post: loads `post_comments`, subscribes to Realtime `INSERT`,
 * and inserts via `addComment` (`profile_id` = auth user).
 */
export default function CommentSection({
  postId,
  className = "",
  maxVisible,
  viewAllHref,
  noOuterFrame = false,
  showComposer = true,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enteringIds, setEnteringIds] = useState<Record<string, boolean>>({});

  const isPreview = typeof maxVisible === "number" && maxVisible > 0;

  const markCommentEnter = useCallback((commentId: string) => {
    if (!commentId) return;
    setEnteringIds((m) => ({ ...m, [commentId]: true }));
    window.setTimeout(() => {
      setEnteringIds((m) => {
        if (!m[commentId]) return m;
        const { [commentId]: _, ...rest } = m;
        return rest;
      });
    }, 420);
  }, []);

  useEffect(() => {
    if (!postId) return;

    let cancelled = false;

    const fetchComments = async () => {
      let q = supabase
        .from("post_comments")
        .select(
          "id, post_id, profile_id, content, created_at, profiles:profile_id(username, avatar_url, full_name)",
        )
        .eq("post_id", postId);

      if (isPreview) {
        q = q.order("created_at", { ascending: false }).limit(maxVisible!);
      } else {
        q = q.order("created_at", { ascending: true });
      }

      const { data, error } = await q;

      if (error) {
        console.error("CommentSection load:", error.message);
        return;
      }
      const rows = (data ?? []) as CommentRow[];
      if (!cancelled) {
        setComments(isPreview ? [...rows].reverse() : rows);
      }
    };

    void fetchComments();

    const channel = supabase
      .channel(`post-comments-rt-${postId}${isPreview ? "-preview" : ""}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const row = payload.new as CommentRow | null;
          if (!row?.id) return;

          markCommentEnter(row.id);

          if (isPreview) {
            await fetchComments();
            return;
          }

          setComments((prev) => {
            if (prev.some((c) => c.id === row.id)) return prev;
            return [...prev, row];
          });

          const pid = row.profile_id;
          if (!pid) return;

          const { data: prof } = await supabase
            .from("profiles")
            .select("username, avatar_url, full_name")
            .eq("id", pid)
            .maybeSingle();

          if (!prof || cancelled) return;

          setComments((prev) =>
            prev.map((c) => (c.id === row.id ? { ...c, profiles: prof } : c)),
          );
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [postId, supabase, maxVisible, isPreview, markCommentEnter]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    try {
      await addComment(postId, text);
      setNewComment("");
    } catch (err) {
      console.error("CommentSection submit:", err);
      const msg = err instanceof Error ? err.message : "Could not post comment.";
      window.alert(msg.includes("log") ? msg : "Please log in to comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={[
        noOuterFrame ? "" : "mt-4 border-t border-neutral-800 pt-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "scrollbar-hide space-y-3",
          isPreview ? "mb-2" : "mb-4 max-h-60 overflow-y-auto",
        ].join(" ")}
      >
        {comments.length === 0 && !isPreview ? (
          <p className="text-sm text-neutral-500">No comments yet — add the first praise below.</p>
        ) : null}
        {comments.map((c) => {
          const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
          const name = p?.username?.trim() || p?.full_name?.trim() || "Member";
          const href = `/profile/${c.profile_id}`;
          return (
            <div
              key={c.id}
              className={["flex gap-2 text-sm", enteringIds[c.id] ? "parable-comment-enter" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <Link
                href={href}
                className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700"
                onClick={(e) => e.stopPropagation()}
              >
                {p?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={fallbackAvatarOnError}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/80">
                    {name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </Link>
              <p className="min-w-0 leading-relaxed">
                <Link href={href} className="font-bold text-white hover:underline" onClick={(e) => e.stopPropagation()}>
                  {name}
                </Link>{" "}
                <span className="text-neutral-300">{c.content}</span>
              </p>
            </div>
          );
        })}
      </div>

      {isPreview && viewAllHref ? (
        <Link
          href={viewAllHref}
          className="mb-3 inline-block text-xs font-semibold text-[#00f2ff] hover:underline"
        >
          View all comments
        </Link>
      ) : null}

      {showComposer ? (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex items-center gap-2 border-t border-neutral-800 pt-2"
        >
          <input
            type="text"
            placeholder="Add a praise…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            maxLength={2000}
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 text-sm font-bold text-cyan-500 disabled:opacity-50"
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? "…" : "Post"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
