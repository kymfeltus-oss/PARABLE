"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getDemoHomePostById, isDemoHomePostId } from "@/lib/demo-personas";

type PostLite = {
  id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
};

export default function ParableVideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const postId = String((params as { postId?: string }).postId ?? "");
  const supabase = useMemo(() => createClient(), []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [post, setPost] = useState<PostLite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);

      if (isDemoHomePostId(postId)) {
        const demo = getDemoHomePostById(postId);
        if (!cancelled) {
          setPost(
            demo
              ? {
                  id: demo.id,
                  content: demo.caption,
                  media_url: demo.media_url,
                  media_type: demo.post_type,
                }
              : null,
          );
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("posts")
        .select("id, content, media_url, post_type")
        .eq("id", postId)
        .maybeSingle();

      if (!cancelled) {
        setPost(
          data
            ? {
                id: data.id as string,
                content: (data.content as string | null) ?? null,
                media_url: (data.media_url as string | null) ?? null,
                media_type: (data.post_type as string | null) ?? null,
              }
            : null,
        );
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId, supabase]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !post?.media_url) return;
    void video.play().catch(() => undefined);
  }, [post?.media_url]);

  const isVideo =
    post?.media_type === "video" ||
    (post?.media_url && /\.(mp4|webm|mov)(\?|#|$)/i.test(post.media_url.split("?")[0] ?? ""));

  return (
    <div className="fixed inset-0 z-[3000] flex flex-col bg-black text-white">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/80 to-transparent px-4 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full p-2 text-white/80 hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">Parable</span>
      </header>

      <div className="flex flex-1 items-center justify-center">
        {loading ? (
          <p className="text-sm text-white/50">Loading…</p>
        ) : !post?.media_url ? (
          <p className="text-sm text-white/50">Video not found.</p>
        ) : isVideo ? (
          <video
            ref={videoRef}
            key={post.id}
            src={post.media_url}
            className="h-full w-full object-contain"
            controls
            autoPlay
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.media_url} alt="" className="max-h-full max-w-full object-contain" />
        )}
      </div>

      {post?.content ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-8 pt-12">
          <p className="text-sm leading-relaxed text-white/90">{post.content}</p>
        </div>
      ) : null}
    </div>
  );
}
