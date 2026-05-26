"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Music2, Play } from "lucide-react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { getAudioTrackById, getPostsByAudioId } from "@/lib/sanctuary-post-interactions";
import { sanctuaryProfileHref } from "@/lib/demo-personas";

/** Audio hub — lists reels/posts using a shared sound asset. */
export default function AudioHubPage() {
  const params = useParams();
  const audioId = decodeURIComponent(String((params as { audioId?: string }).audioId ?? ""));
  const track = getAudioTrackById(audioId);
  const posts = getPostsByAudioId(audioId);

  return (
    <div className="min-h-full bg-[#01040A] pb-8 font-sans text-[#F8FAFC]">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#06111E] bg-[#02040A]/95 px-4 py-3 backdrop-blur-md">
        <Link href="/my-sanctuary" className="text-[#94A3B8] hover:text-[#00F2FE]" aria-label="Back to feed">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Music2 className="h-5 w-5 shrink-0 text-[#00F2FE]" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold">{track?.title ?? "Audio"}</h1>
            <p className="truncate text-[11px] text-[#64748B]">{posts.length} posts · Reels</p>
          </div>
        </div>
      </header>

      {!track ? (
        <p className="px-6 py-16 text-center text-sm text-[#64748B]">This audio track is not available.</p>
      ) : (
        <>
          <div className="border-b border-[#06111E]/80 px-4 py-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl border border-[#00F2FE]/25 bg-[#00F2FE]/10 px-4 py-3 text-left"
              onClick={() => window.alert(`Playing preview for "${track.title}" (simulated).`)}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00F2FE] text-[#01040A]">
                <Play className="h-5 w-5 fill-current" />
              </span>
              <span>
                <span className="block text-sm font-bold">{track.title}</span>
                <span className="block text-[11px] text-[#94A3B8]">Tap to preview audio</span>
              </span>
            </button>
          </div>

          <ul className="grid grid-cols-3 gap-0.5 p-0.5 sm:grid-cols-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={post.post_type === "video" ? `/parables/${post.id}` : `/post/${post.id}`}
                  className="group relative block aspect-[9/16] overflow-hidden bg-[#06111E]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.media_url}
                    alt=""
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    onError={fallbackAvatarOnError}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="truncate text-[10px] font-semibold">@{post.username}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {posts.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[#64748B]">No posts use this sound yet.</p>
          ) : null}

          <div className="mt-6 px-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Creators using this audio</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[...new Map(posts.map((p) => [p.userId, p])).values()].map((post) => (
                <Link
                  key={post.userId}
                  href={sanctuaryProfileHref(post.userId, post.username)}
                  className="rounded-full border border-[#06111E] px-3 py-1 text-xs text-[#CBD5E1] hover:border-[#00F2FE]/40 hover:text-[#00F2FE]"
                >
                  @{post.username}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
