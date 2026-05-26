"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Loader2, Trash2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { addComment } from "@/lib/feed";
import { canDeleteComment, deleteComment } from "@/lib/content-delete";
import { POST_COMMENT_SELECT, commentAuthorId } from "@/lib/post-comments";
import { isDemoHomePostId } from "@/lib/demo-personas";
import type { CommentRow } from "@/components/feed/CommentSection";

const EMOJI_ROW = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"] as const;

const DEMO_COMMENTS: CommentRow[] = [
  {
    id: "demo-c1",
    post_id: "demo",
    user_id: "demo-user-1",
    content: "This hit my spirit — thank you for sharing 🙌",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    profiles: { username: "sister_sarah", avatar_url: "/demo/avatars/sister_sarah.svg", full_name: "Sarah" },
  },
  {
    id: "demo-c2",
    post_id: "demo",
    user_id: "demo-user-2",
    content: "Needed this today. Glory to God!",
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    profiles: { username: "gospel_vibe", avatar_url: "/demo/avatars/gospel_vibe.svg", full_name: "Gospel Vibe" },
  },
];

type Props = {
  open: boolean;
  postId: string | null;
  currentUserId?: string;
  postOwnerId?: string | null;
  currentUsername: string;
  currentUserAvatar: string | null;
  injectedComments?: CommentRow[];
  autoFocusInput?: boolean;
  onClose: () => void;
  onCommentDeleted?: (commentId: string) => void;
};

/** Instagram-style comment drawer with emoji row and gated submit. */
export default function SanctuaryCommentSheet({
  open,
  postId,
  currentUserId,
  postOwnerId,
  currentUsername,
  currentUserAvatar,
  injectedComments = [],
  autoFocusInput = false,
  onClose,
  onCommentDeleted,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const isDemo = postId ? isDemoHomePostId(postId) : false;

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!open || !postId) return;

    setDraft("");
    if (isDemo) {
      setComments(DEMO_COMMENTS.map((c) => ({ ...c, post_id: postId })));
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      const { data, error } = await supabase
        .from("post_comments")
        .select(POST_COMMENT_SELECT)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (error) {
        console.error("SanctuaryCommentSheet load:", error.message);
        setComments([]);
      } else {
        setComments((data ?? []) as CommentRow[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel(`sanctuary-comment-sheet-${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` },
        (payload) => {
          const row = payload.new as CommentRow;
          setComments((prev) => (prev.some((c) => c.id === row.id) ? prev : [...prev, row]));
          window.setTimeout(scrollToBottom, 80);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` },
        (payload) => {
          const row = payload.old as { id?: string };
          if (!row?.id) return;
          setComments((prev) => prev.filter((c) => c.id !== row.id));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [open, postId, isDemo, supabase, scrollToBottom]);

  useEffect(() => {
    if (!open || !autoFocusInput) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(t);
  }, [open, autoFocusInput, postId]);

  const mergedComments = useMemo(() => {
    const injected = injectedComments.filter((c) => !postId || c.post_id === postId);
    const seen = new Set(comments.map((c) => c.id));
    const appended = injected.filter((c) => !seen.has(c.id));
    return [...comments, ...appended].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [comments, injectedComments, postId]);

  const appendEmoji = (emoji: string) => {
    setDraft((prev) => `${prev}${emoji}`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || submitting || !postId) return;

    setSubmitting(true);
    try {
      if (isDemo) {
        const row: CommentRow = {
          id: `demo-local-${Date.now()}`,
          post_id: postId,
          user_id: "local-user",
          content: text,
          created_at: new Date().toISOString(),
          profiles: {
            username: currentUsername,
            avatar_url: currentUserAvatar,
            full_name: currentUsername,
          },
        };
        setComments((prev) => [...prev, row]);
        setDraft("");
        window.setTimeout(scrollToBottom, 80);
        return;
      }

      await addComment(postId, text);
      setDraft("");
      window.setTimeout(scrollToBottom, 120);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not post comment.";
      window.alert(msg.includes("log") ? msg : "Please log in to comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const canPost = draft.trim().length > 0 && !submitting;

  const handleDeleteComment = async (commentId: string) => {
    if (deletingCommentId || !postId) return;

    if (isDemo) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentDeleted?.(commentId);
      return;
    }

    if (!window.confirm("Delete this comment permanently?")) return;

    setDeletingCommentId(commentId);
    try {
      await deleteComment(supabase, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentDeleted?.(commentId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete comment.";
      window.alert(msg);
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && postId ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-[#01040A]/70 backdrop-blur-sm"
            aria-label="Close comments"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-[2010] mx-auto flex max-h-[78vh] w-full max-w-[630px] flex-col overflow-hidden rounded-t-2xl bg-[#020712] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#06111E] px-4 py-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">Comments</h3>
              <button type="button" onClick={onClose} className="text-[#94A3B8] hover:text-[#F8FAFC]" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[#00F2FE]" />
                </div>
              ) : mergedComments.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#64748B]">No comments yet. Start the conversation.</p>
              ) : (
                <ul className="space-y-3">
                  {mergedComments.map((c) => {
                    const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
                    const name = p?.username?.trim() || p?.full_name?.trim() || "Member";
                    const href = isDemo ? "#" : `/profile/${commentAuthorId(c)}`;
                    const showDelete = canDeleteComment(
                      commentAuthorId(c),
                      postOwnerId,
                      currentUserId,
                    );
                    return (
                      <li key={c.id} className="flex gap-2 text-sm">
                        {p?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.avatar_url}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                            onError={fallbackAvatarOnError}
                          />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#06111E] text-[10px] font-bold text-[#CBD5E1]">
                            {name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="leading-relaxed">
                            <Link href={href} className="font-semibold text-[#F8FAFC] hover:text-[#00F2FE]">
                              {name}
                            </Link>{" "}
                            <span className="text-[#CBD5E1]">{c.content}</span>
                          </p>
                        </div>
                        {showDelete ? (
                          <button
                            type="button"
                            onClick={() => void handleDeleteComment(c.id)}
                            disabled={deletingCommentId === c.id}
                            className="shrink-0 self-start p-1 text-[#64748B] transition hover:text-[#F87171] disabled:opacity-40"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-[#06111E] bg-[#020712] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
              <div className="mb-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {EMOJI_ROW.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => appendEmoji(emoji)}
                    className="text-xl leading-none transition hover:scale-110"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => void handleSubmit(e)} className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={1}
                  placeholder="Add a comment..."
                  className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl bg-[#06111E] px-3 py-2 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B]"
                  maxLength={2000}
                />
                <button
                  type="submit"
                  disabled={!canPost}
                  className="shrink-0 pb-2 text-sm font-bold text-[#00F2FE] disabled:opacity-30"
                >
                  {submitting ? "…" : "Post"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
