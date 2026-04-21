"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import FeedUserProfileHover from "./FeedUserProfileHover";

type Comment = {
  authorImg: string;
  authorName: string;
  commentText: string;
  timeAgo: string;
};

export interface PostCardProps {
  id: string;
  content: string;
  /** Primary image/video URL (maps from DB `image_url` or `media_url`). */
  image_url?: string;
  media_url?: string;
  media_type?: string | null;
  author?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    username?: string;
    status_text?: string | null;
    /** Live broadcast indicator (see `profiles.is_live`). */
    is_live?: boolean | null;
  } | null;
  created_at: string;
  /** Optional threaded comments (e.g. demo or future join). */
  comments?: Comment[];
  /** Like count from `post_likes` aggregate (feed). */
  likesCount?: number;
  /** @deprecated Use likesCount */
  praisesInitial?: number;
  /**
   * Optional: whether the current user already liked this post (e.g. from a server join).
   * {@link InstagramPost} still re-fetches `post_likes` on mount to stay authoritative.
   */
  initialLiked?: boolean;
}

function normalizeAuthor(
  author:
    | PostCardProps["author"]
    | PostCardProps["author"][]
    | null
    | undefined
) {
  if (!author) return null;
  if (Array.isArray(author)) return author[0] ?? null;
  return author;
}

export default function PostCard({
  id,
  content,
  image_url,
  media_url,
  media_type,
  author,
  created_at,
  comments = [],
  praisesInitial = 0,
}: PostCardProps) {
  const router = useRouter();
  const [praises, setPraises] = useState(praisesInitial);
  const [praised, setPraised] = useState(false);
  const [pulse, setPulse] = useState(false);

  const profile = normalizeAuthor(author);
  const authorName =
    profile?.full_name?.trim() || profile?.username?.trim() || "Anonymous";
  const authorAvatar = profile?.avatar_url;

  const mainMedia = image_url ?? media_url;
  const isVideo =
    media_type === "video" ||
    (mainMedia && /\.(mp4|webm|mov)(\?|#|$)/i.test(mainMedia.split("?")[0] ?? ""));

  const handlePraise = useCallback(() => {
    setPraises((p) => (praised ? Math.max(0, p - 1) : p + 1));
    setPraised((v) => !v);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 650);
  }, [praised]);

  return (
    <div className="h-full rounded-sm border border-[#00f2fe]/25 bg-black shadow-sm shadow-black/40">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FeedUserProfileHover
            name={authorName}
            handle={profile?.username}
            avatarUrl={authorAvatar}
            statusText={profile?.status_text}
          >
            <div className="flex min-w-0 cursor-default items-center gap-3">
              {authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={authorAvatar}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#00f2fe]/30"
                  onError={fallbackAvatarOnError}
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00f2fe]/40 to-black text-xs font-bold text-white/90">
                  {authorName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="min-w-0 truncate font-semibold text-white underline-offset-2 decoration-[#5865f2]/0 transition group-hover/feed-user:decoration-[#5865f2]/60">
                {authorName}
              </span>
            </div>
          </FeedUserProfileHover>
          <button
            type="button"
            onClick={() => router.push("/live-studio")}
            className="inline-flex shrink-0 items-center rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-[0_0_12px_rgba(220,38,38,0.45)] transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            title="Open Live Studio"
          >
            Live
          </button>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 rotate-90 text-[#00f2fe]/55"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </div>

      {mainMedia &&
        (isVideo ? (
          <video
            controls
            className="max-h-[min(70vh,500px)] w-full object-cover"
            key={id}
          >
            <source src={mainMedia} />
          </video>
        ) : (
          <img
            src={mainMedia}
            alt={content || "Post"}
            className="max-h-[min(70vh,500px)] w-full object-cover"
          />
        ))}

      <div className="px-4 py-3">
        <div className="relative mb-2 flex items-center">
          <button
            type="button"
            className="relative inline-flex cursor-pointer items-center justify-center rounded-full p-1 transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]/60"
            onClick={handlePraise}
            aria-pressed={praised}
            aria-label={praised ? "Remove praise" : "Praise"}
          >
            {pulse && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-teal-400/35"
                style={{ animation: "parablePraisePulse 0.65s ease-out" }}
              />
            )}
            <Sparkles
              className={`relative z-[1] h-7 w-7 ${
                praised ? "text-[#00f2fe]" : "text-[#00f2fe]/80"
              }`}
              strokeWidth={2}
              fill={praised ? "currentColor" : "none"}
              style={{ opacity: praised ? 1 : 0.92 }}
            />
          </button>
          <span className="ml-2 text-sm text-white/90">
            {praises}{" "}
            <span className="text-[#00f2fe]/90">
              {praises === 1 ? "praise" : "praises"}
            </span>
          </span>
        </div>

        <p className="text-lg text-white/95">
          <span className="font-semibold text-[#00f2fe]">{authorName}</span>{" "}
          <span className="text-white/85">{content}</span>
        </p>
        <p className="mt-1 text-xs text-[#00f2fe]/45">
          {new Date(created_at).toLocaleString()}
        </p>

        {comments.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-[#00f2fe]/15 pt-3">
            {comments.map((comment, idx) => (
              <div
                key={`${comment.authorName}-${idx}`}
                className="flex items-start justify-between gap-2"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <img
                    src={comment.authorImg}
                    alt={comment.authorName}
                    className="h-8 w-8 shrink-0 rounded-full ring-1 ring-[#00f2fe]/25"
                  />
                  <div className="min-w-0 text-sm text-white/80">
                    <span className="font-semibold text-[#00f2fe]/90">
                      {comment.authorName}
                    </span>{" "}
                    {comment.commentText}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[#00f2fe]/40">
                  {comment.timeAgo}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes parablePraisePulse {
          0% {
            transform: scale(0.65);
            opacity: 0.85;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
