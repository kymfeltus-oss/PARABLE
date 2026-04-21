"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import { createClient } from "@/utils/supabase/client";
import { uploadPostMediaFromFile } from "@/lib/post-media";

type SanctuaryPostComposerProps = {
  /** Instagram home–style slim row: avatar + caption cue + media + share. */
  variant?: "default" | "igHome";
  /** Sets `posts.category` when inserting (requires `category` column in DB). */
  category?: string | null;
};

/**
 * Quick composer for Sanctuary feed — photo/video + caption, posts to `posts` (same as Testify pipeline).
 */
export default function SanctuaryPostComposer({
  variant = "default",
  category: postCategory = null,
}: SanctuaryPostComposerProps) {
  const router = useRouter();
  const supabase = createClient();
  const { userProfile, avatarUrl } = useAuth();
  const userId = userProfile?.id as string | undefined;
  const showIg = variant === "igHome";

  /** Prefer `profiles.avatar_url` (DB), including Supabase Storage paths, then auth-resolved URL. */
  const composerAvatarSrc = useMemo(() => {
    const raw = userProfile?.avatar_url?.trim();
    if (raw) {
      if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
        return raw;
      }
      const { data } = createClient().storage.from("avatars").getPublicUrl(raw);
      return data.publicUrl || null;
    }
    if (avatarUrl && avatarUrl !== "/logo.svg") {
      return avatarUrl;
    }
    return null;
  }, [userProfile?.avatar_url, avatarUrl]);

  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setMessage(null);
  };

  const handlePublish = async () => {
    setMessage(null);
    if (!userId) {
      router.push("/login?next=/my-sanctuary");
      return;
    }
    if (!mediaFile) {
      setMessage("Add a photo or video.");
      return;
    }

    setPosting(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        router.push("/login?next=/my-sanctuary");
        return;
      }

      const up = await uploadPostMediaFromFile(supabase, user.id, mediaFile);
      if ("error" in up) {
        setMessage(up.error);
        return;
      }

      const isVideo =
        mediaFile.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(mediaFile.name);

      const { error } = await supabase.from("posts").insert({
        profile_id: user.id,
        content: caption.trim() || null,
        media_url: up.publicUrl,
        media_type: isVideo ? "video" : "image",
        is_praise_break: false,
        ...(postCategory ? { category: postCategory } : {}),
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setCaption("");
      clearMedia();
      setMessage("Shared.");
      window.dispatchEvent(new CustomEvent("parable:sanctuary-posted"));
    } finally {
      setPosting(false);
    }
  };

  if (showIg) {
    return (
      <section className="mb-2 border-b border-neutral-900 bg-black px-3 py-2.5 sm:px-4">
        <div className="flex items-start gap-2.5">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-neutral-900 ring-1 ring-white/[0.06]">
            {composerAvatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={composerAvatarSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={fallbackAvatarOnError}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/50">
                {(userProfile?.username || userProfile?.full_name || "?").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={1}
            className="max-h-24 min-h-[2.25rem] flex-1 resize-none bg-transparent text-[14px] text-neutral-100 placeholder:text-neutral-500 outline-none"
            placeholder="What’s on your mind?"
          />
          <input
            ref={mediaInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handlePick}
          />
          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            className="mt-0.5 shrink-0 rounded-lg p-2 text-neutral-400 transition hover:bg-white/5 hover:text-[#00f2ff]"
            aria-label="Add photo or video"
          >
            <Camera className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        {mediaPreview ? (
          <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
            {mediaFile?.type.startsWith("video/") ? (
              <video src={mediaPreview} controls className="max-h-52 w-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaPreview} alt="" className="max-h-52 w-full object-contain" />
            )}
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between gap-2">
          {mediaPreview ? (
            <button type="button" onClick={clearMedia} className="text-[11px] text-neutral-500 underline">
              Remove media
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handlePublish}
            disabled={posting || !mediaFile}
            className="rounded-lg bg-[#00f2ff] px-4 py-1.5 text-[12px] font-semibold text-black disabled:opacity-40"
          >
            {posting ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </span>
            ) : (
              "Share"
            )}
          </button>
        </div>
        {message ? <p className="mt-1 text-center text-[11px] text-neutral-500">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className="mb-6 rounded-xl border border-[#00f2fe]/20 bg-black/70 p-4 shadow-md shadow-black/40 md:p-5">
      <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00f2fe]/90">
        New post
      </h2>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={2}
        className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-[#00f2fe]/35 focus:ring-2 focus:ring-[#00f2fe]/15"
        placeholder="Caption…"
      />
      <input
        ref={mediaInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*"
        onChange={handlePick}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => mediaInputRef.current?.click()}
          className="rounded-full border border-[#00f2fe]/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#00f2fe] hover:bg-[#00f2fe]/10"
        >
          Photo / video
        </button>
        {mediaPreview && (
          <button type="button" onClick={clearMedia} className="text-[11px] text-white/45 underline">
            Remove
          </button>
        )}
      </div>
      {mediaPreview && (
        <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
          {mediaFile?.type.startsWith("video/") ? (
            <video src={mediaPreview} controls className="max-h-64 w-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaPreview} alt="" className="max-h-64 w-full object-contain" />
          )}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handlePublish}
          disabled={posting || !mediaFile}
          className="rounded-full bg-[#00f2ff] px-5 py-2 text-[10px] font-black uppercase tracking-wider text-black disabled:opacity-40"
        >
          {posting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sharing…
            </span>
          ) : (
            "Share"
          )}
        </button>
        {message && <span className="text-[11px] text-white/50">{message}</span>}
      </div>
    </section>
  );
}
