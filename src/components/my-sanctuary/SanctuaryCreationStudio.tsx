"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { buildPostContent, type PostStudioMeta } from "@/lib/post-content-meta";
import { blobToUploadFile, compressImageWithFilter } from "@/lib/post-studio-compress";
import { VISUAL_FILTERS, type VisualFilter } from "@/lib/post-studio-filters";
import { uploadPostMediaFromFile } from "@/lib/post-media";
import { publishSanctuaryPost } from "@/app/my-sanctuary/actions";
import type { SanctuaryPost } from "@/app/my-sanctuary/actions";
import { SANCTUARY_MEDIA_MAX_BYTES } from "@/lib/sanctuary-media-limits";

export type CreationType = "post" | "reel";

type PublishedResult = {
  creationType: CreationType;
  post: SanctuaryPost;
};

type Props = {
  open: boolean;
  file: File | null;
  creationType: CreationType;
  onClose: () => void;
  onPublished?: (result: PublishedResult) => void;
};

const MAX_MEDIA_BYTES = SANCTUARY_MEDIA_MAX_BYTES;

function formatMegabytes(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

function resolvePostType(creationType: CreationType, file: File): string {
  const isVideo =
    file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name.split("?")[0] ?? "");
  if (creationType === "reel" || isVideo) return "video";
  return "image";
}

export default function SanctuaryCreationStudio({
  open,
  file,
  creationType,
  onClose,
  onPublished,
}: Props) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<VisualFilter>(VISUAL_FILTERS[0]);
  const [caption, setCaption] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [hideLikes, setHideLikes] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishPhase, setPublishPhase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isVideo = useMemo(() => {
    if (!file) return false;
    return file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
  }, [file]);

  useEffect(() => {
    if (!file || !open) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setActiveFilter(VISUAL_FILTERS[0]);
    setCaption("");
    setLocationTag("");
    setAllowComments(true);
    setHideLikes(false);
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file, open]);

  if (!open || !file || !previewUrl) return null;

  const handleDiscard = () => {
    if (publishing) return;
    onClose();
  };

  const handlePublish = async () => {
    if (publishing) return;

    setPublishing(true);
    setError(null);
    setPublishPhase(isVideo ? "Uploading video…" : "Uploading image…");

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        router.push("/login?next=/my-sanctuary");
        return;
      }

      let uploadFile: File = file;

      if (!isVideo) {
        setPublishPhase("Compressing image…");
        const blob = await compressImageWithFilter(file, activeFilter);
        uploadFile = blobToUploadFile(blob, file.name);
        if (uploadFile.size > MAX_MEDIA_BYTES) {
          setError(
            `Compressed image is still over ${formatMegabytes(MAX_MEDIA_BYTES)}. Try a smaller photo.`,
          );
          return;
        }
      } else if (file.size > MAX_MEDIA_BYTES) {
        setError(`Selected video exceeds the ${formatMegabytes(MAX_MEDIA_BYTES)} limit.`);
        return;
      }

      const up = await uploadPostMediaFromFile(supabase, user.id, uploadFile);
      if ("error" in up) {
        setError(up.error);
        return;
      }

      const meta: PostStudioMeta = {
        allowComments,
        hideLikes,
        filterId: activeFilter.id,
        location: locationTag.trim() || undefined,
        creationType,
      };

      const postType = resolvePostType(creationType, file);
      setPublishPhase("Saving post…");

      const saved = await publishSanctuaryPost({
        mediaUrl: up.publicUrl,
        content: buildPostContent(caption, meta),
        postType,
      });

      if (!saved.ok) {
        setError(saved.error);
        return;
      }

      onPublished?.({ creationType, post: saved.post });
      window.dispatchEvent(new CustomEvent("parable:sanctuary-posted"));
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publish failed.";
      setError(message);
    } finally {
      setPublishing(false);
      setPublishPhase(null);
    }
  };

  return (
    <div className="studio-overlay" role="dialog" aria-modal="true" aria-label="Creation studio">
      <div className="studio-overlay-backdrop" onClick={handleDiscard} aria-hidden="true" />
      <div className="studio-shell">
        <header className="studio-header">
          <h2 className="studio-title">Create {creationType}</h2>
          <button type="button" className="studio-close" onClick={handleDiscard} aria-label="Close studio">
            <X size={22} strokeWidth={1.75} />
          </button>
        </header>

        <div className="studio-body">
          <section className="studio-preview-panel">
            <div className="studio-preview-frame">
              {isVideo ? (
                <video src={previewUrl} controls className="studio-preview-media" playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview"
                  className={`studio-preview-media ${activeFilter.previewClass}`}
                  style={activeFilter.cssFilter !== "none" ? { filter: activeFilter.cssFilter } : undefined}
                />
              )}
            </div>

            {!isVideo ? (
              <div className="studio-filters">
                <p className="studio-filters-label">Filters</p>
                <div className="studio-filters-row">
                  {VISUAL_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={
                        activeFilter.id === filter.id
                          ? "studio-filter-chip studio-filter-chip--active"
                          : "studio-filter-chip"
                      }
                      onClick={() => setActiveFilter(filter)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt=""
                        className={`studio-filter-thumb ${filter.previewClass}`}
                        style={filter.cssFilter !== "none" ? { filter: filter.cssFilter } : undefined}
                      />
                      <span>{filter.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="studio-video-note">Video filters preview in-player; reels publish as uploaded video.</p>
            )}
          </section>

          <section className="studio-options-panel">
            <h3 className="studio-options-title">Publication details</h3>

            <label className="studio-field">
              <span>Caption</span>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption, add #hashtags, or mention someone…"
              />
            </label>

            <label className="studio-field">
              <span>Location</span>
              <input
                type="text"
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                placeholder="e.g. Los Angeles, California"
              />
            </label>

            <div className="studio-toggles">
              <label className="studio-toggle">
                <div>
                  <strong>Allow comments</strong>
                  <p>Let others comment on this {creationType}.</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                />
              </label>

              <label className="studio-toggle">
                <div>
                  <strong>Hide like counts</strong>
                  <p>Only you see the total likes on this post.</p>
                </div>
                <input type="checkbox" checked={hideLikes} onChange={(e) => setHideLikes(e.target.checked)} />
              </label>
            </div>

            {error ? <p className="studio-error">{error}</p> : null}
            {publishPhase ? <p className="studio-status">{publishPhase}</p> : null}

            <div className="studio-actions">
              <button type="button" className="studio-btn studio-btn--ghost" onClick={handleDiscard} disabled={publishing}>
                Discard
              </button>
              <button type="button" className="studio-btn studio-btn--primary" onClick={() => void handlePublish()} disabled={publishing}>
                {publishing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {publishPhase ?? "Publishing…"}
                  </span>
                ) : (
                  "Publish"
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
