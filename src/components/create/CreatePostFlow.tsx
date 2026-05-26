"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import CreateFlowShell from "@/components/create/CreateFlowShell";
import { publishFeedPost } from "@/lib/create-flow/publish";
import { SANCTUARY_MEDIA_ACCEPT, sanctuaryMediaTooLarge, sanctuaryMediaLimitLabel } from "@/lib/sanctuary-media-limits";
import { VISUAL_FILTERS, type VisualFilter } from "@/lib/post-studio-filters";

type Step = "pick" | "filter" | "share";

const STEPS: Step[] = ["pick", "filter", "share"];
const STEP_LABELS: Record<Step, string> = {
  pick: "Select assets",
  filter: "Edit filter",
  share: "Share to feed",
};

export default function CreatePostFlow() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<VisualFilter>(VISUAL_FILTERS[0]!);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(step) + 1;
  const isVideo = useMemo(
    () => Boolean(file && (file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name))),
    [file],
  );

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    if (sanctuaryMediaTooLarge(picked.size)) {
      setError(`File must be ${sanctuaryMediaLimitLabel()} or smaller.`);
      return;
    }
    setError(null);
    setFile(picked);
    setStep("filter");
  };

  const goBack = () => {
    if (step === "share") setStep("filter");
    else if (step === "filter") setStep("pick");
    else router.push("/my-sanctuary");
  };

  const handlePublish = async () => {
    if (!file || publishing) return;
    setPublishing(true);
    setError(null);
    const result = await publishFeedPost({
      file,
      creationType: "post",
      caption,
      locationTag: location,
      filter: isVideo ? undefined : activeFilter,
    });
    setPublishing(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/my-sanctuary");
  };

  return (
    <CreateFlowShell
      title="New post"
      step={stepIndex}
      totalSteps={STEPS.length}
      stepLabel={STEP_LABELS[step]}
      onBack={goBack}
      onClose={() => router.push("/my-sanctuary")}
    >
      <input ref={inputRef} type="file" accept={SANCTUARY_MEDIA_ACCEPT} multiple className="hidden" onChange={onPick} />

      {step === "pick" ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-28 w-28 items-center justify-center rounded-3xl border border-dashed border-[#00F2FE]/40 bg-[#06111E]/50 text-[#00F2FE] transition hover:bg-[#06111E]"
          >
            <ImagePlus className="h-10 w-10" />
          </button>
          <p className="mt-4 text-sm font-semibold text-[#F8FAFC]">Open gallery picker</p>
          <p className="mt-1 text-xs text-[#64748B]">Photos or videos · carousel supported in a future update</p>
          {error ? <p className="mt-4 text-sm text-[#F87171]">{error}</p> : null}
        </div>
      ) : null}

      {step === "filter" && previewUrl ? (
        <div className="px-4 py-4">
          <div className="mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-2xl bg-[#06111E]">
            {isVideo ? (
              <video src={previewUrl} controls className="h-full w-full object-cover" playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
                style={activeFilter.cssFilter !== "none" ? { filter: activeFilter.cssFilter } : undefined}
              />
            )}
          </div>
          {!isVideo ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {VISUAL_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-xl border px-2 py-2 text-center text-[10px] font-semibold ${
                    activeFilter.id === filter.id
                      ? "border-[#00F2FE] text-[#00F2FE]"
                      : "border-[#06111E] text-[#94A3B8]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt=""
                    className="mb-1 h-14 w-14 rounded-lg object-cover"
                    style={filter.cssFilter !== "none" ? { filter: filter.cssFilter } : undefined}
                  />
                  {filter.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-center text-xs text-[#64748B]">Video filters apply in-player during preview.</p>
          )}
          <button
            type="button"
            onClick={() => setStep("share")}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A]"
          >
            Next · Share to feed
          </button>
        </div>
      ) : null}

      {step === "share" && previewUrl ? (
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-[#06111E]">
            {isVideo ? (
              <video src={previewUrl} className="h-full w-full object-cover" muted playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
                style={activeFilter.cssFilter !== "none" ? { filter: activeFilter.cssFilter } : undefined}
              />
            )}
          </div>
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#64748B]">Caption</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Write a caption…"
              className="w-full rounded-xl bg-[#06111E] px-3 py-2 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B]"
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#64748B]">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="w-full rounded-xl bg-[#06111E] px-3 py-2 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B]"
            />
          </label>
          {error ? <p className="mb-3 text-sm text-[#F87171]">{error}</p> : null}
          <button
            type="button"
            disabled={publishing}
            onClick={() => void handlePublish()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A] disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Share to feed
          </button>
        </div>
      ) : null}
    </CreateFlowShell>
  );
}
