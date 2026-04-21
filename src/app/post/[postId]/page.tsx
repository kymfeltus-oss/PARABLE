"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import CommentSection from "@/components/feed/CommentSection";
import { toggleLike, addComment } from "@/lib/feed";

type ProfileLite = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type PostRow = {
  id: string;
  profile_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  profiles?: ProfileLite | ProfileLite[] | null;
};

function normalizeProfile(p: ProfileLite | ProfileLite[] | null | undefined): ProfileLite | null {
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = String((params as { postId?: string }).postId ?? "");
  const supabase = useMemo(() => createClient(), []);

  const [post, setPost] = useState<PostRow | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refreshLikes = useCallback(async () => {
    if (!postId) return;
    const { count: lc } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    setLikesCount(typeof lc === "number" ? lc : 0);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: lk } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      setLiked(Boolean(lk?.id));
    } else {
      setLiked(false);
    }
  }, [postId, supabase]);

  const load = useCallback(async () => {
    if (!postId) return;
    setErr(null);
    setLoading(true);
    try {
      const { data: p, error: pErr } = await supabase
        .from("posts")
        .select(
          "id, profile_id, content, media_url, media_type, created_at, profiles:profile_id(id, username, full_name, avatar_url)",
        )
        .eq("id", postId)
        .maybeSingle();

      if (pErr) throw pErr;
      if (!p) {
        setPost(null);
        return;
      }
      setPost(p as PostRow);

      await refreshLikes();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load post.");
    } finally {
      setLoading(false);
    }
  }, [postId, supabase, refreshLikes]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!postId) return;
    const ch = supabase
      .channel(`post-detail-likes-${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "post_likes", filter: `post_id=eq.${postId}` },
        () => {
          void refreshLikes();
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "post_likes", filter: `post_id=eq.${postId}` },
        () => {
          void refreshLikes();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [postId, supabase, refreshLikes]);

  const author = post ? normalizeProfile(post.profiles as ProfileLite | ProfileLite[] | null) : null;
  const mainMedia = post?.media_url ?? null;
  const isVideo =
    post?.media_type === "video" ||
    (mainMedia && /\.(mp4|webm|mov)(\?|#|$)/i.test(mainMedia.split("?")[0] ?? ""));

  async function handleLike() {
    if (likeBusy) return;
    setLikeBusy(true);
    const was = liked;
    const prev = likesCount;
    setLiked(!was);
    setLikesCount((n) => Math.max(0, n + (was ? -1 : 1)));
    try {
      const r = await toggleLike(postId);
      setLiked(r.liked);
    } catch {
      setLiked(was);
      setLikesCount(prev);
    } finally {
      setLikeBusy(false);
    }
  }

  async function submitComment() {
    const t = draft.trim();
    if (!t) return;
    setSending(true);
    setErr(null);
    try {
      await addComment(postId, t);
      setDraft("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not post comment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-black text-white lg:h-screen lg:max-h-screen lg:flex-row">
      <div className="flex min-h-[40vh] flex-1 items-center justify-center bg-black lg:min-h-0 lg:w-1/2 lg:max-w-[50vw]">
        {loading ? (
          <div className="text-sm text-white/50">Loading…</div>
        ) : err && !post ? (
          <div className="px-4 text-center text-sm text-red-400">{err}</div>
        ) : mainMedia ? (
          isVideo ? (
            <video
              controls
              className="max-h-[85vh] w-full max-w-full object-contain lg:h-full lg:max-h-full"
              key={postId}
            >
              <source src={mainMedia} />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainMedia}
              alt=""
              className="max-h-[85vh] w-full object-contain lg:h-full"
            />
          )
        ) : (
          <p className="text-white/50">No media</p>
        )}
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-neutral-800 lg:w-1/2 lg:max-w-[50vw] lg:border-l lg:border-t-0">
        <div className="flex shrink-0 items-center gap-2 border-b border-neutral-800 px-3 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {author && (
            <Link href={`/profile/${author.id}`} className="flex min-w-0 flex-1 items-center gap-2">
              {author.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.avatar_url}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                  onError={fallbackAvatarOnError}
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold">
                  {(author.username || author.full_name || "?").slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="truncate text-sm font-semibold">
                {author.username || author.full_name || "Member"}
              </span>
            </Link>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          {post?.content ? <p className="text-sm leading-relaxed text-neutral-200">{post.content}</p> : null}

          <div className="mt-4 flex items-center gap-2 border-b border-neutral-800 pb-4">
            <button
              type="button"
              disabled={likeBusy}
              onClick={() => void handleLike()}
              className="inline-flex items-center gap-2 rounded-full p-1 hover:bg-white/5 disabled:opacity-50"
              aria-pressed={liked}
            >
              <Heart
                className={`h-7 w-7 ${liked ? "fill-rose-500 text-rose-500" : "text-white"}`}
                strokeWidth={2}
              />
              <span className="text-sm text-neutral-300">
                {likesCount} {likesCount === 1 ? "praise" : "praises"}
              </span>
            </button>
          </div>

          <div className="mt-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Comments</p>
            <CommentSection postId={postId} showComposer={false} noOuterFrame />
          </div>
        </div>

        <div className="shrink-0 border-t border-neutral-800 p-3">
          {err && post ? <p className="mb-2 text-xs text-red-400">{err}</p> : null}
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submitComment();
                }
              }}
              placeholder="Add a praise…"
              className="min-w-0 flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-[#00f2ff]/50 focus:outline-none"
              maxLength={2000}
            />
            <button
              type="button"
              disabled={sending || !draft.trim()}
              onClick={() => void submitComment()}
              className="shrink-0 rounded-md bg-[#00f2ff]/20 px-4 py-2 text-sm font-semibold text-[#00f2ff] disabled:opacity-40"
            >
              {sending ? "…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
