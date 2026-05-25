"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImagePlus, Loader2, Sticker } from "lucide-react";
import CreateFlowShell from "@/components/create/CreateFlowShell";
import { publishStoryFile } from "@/lib/create-flow/publish";
import { getDemoHomePostById } from "@/lib/demo-personas";
import { STORY_ACCEPT } from "@/lib/sanctuary-stories/constants";
import { sanctuaryMediaTooLarge, sanctuaryMediaLimitLabel } from "@/lib/sanctuary-media-limits";

type Step = "pick" | "edit" | "share";
const STEPS: Step[] = ["pick", "edit", "share"];
const STEP_LABELS: Record<Step, string> = {
  pick: "Camera roll",
  edit: "Stickers & text",
  share: "Share to story",
};

const STICKERS = ["🙌", "✨", "🔥", "❤️", "🎵", "📖", "🕊️", "⭐"] as const;

export default function CreateStoryFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState("");
  const [stickers, setStickers] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(step) + 1;

  useEffect(() => {
    const prefill = searchParams.get("prefill");
    if (!prefill) return;
    const post = getDemoHomePostById(prefill);
    if (post?.media_url) {
      setPreviewUrl(post.media_url);
      setStep("edit");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!file) return;
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
    setStep("edit");
  };

  const goBack = () => {
    if (step === "share") setStep("edit");
    else if (step === "edit") setStep("pick");
    else router.push("/my-sanctuary");
  };

  const addSticker = (emoji: string) => {
    setStickers((prev) => [...prev, emoji].slice(-6));
  };

  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);
    setError(null);

    if (file) {
      const result = await publishStoryFile(file);
      setPublishing(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/my-sanctuary");
      return;
    }

    if (previewUrl && !file) {
      setPublishing(false);
      window.alert("Story sticker preview shared (simulated — select media from camera roll to publish).");
      router.push("/my-sanctuary");
      return;
    }

    setPublishing(false);
    setError("Select a photo or video first.");
  };

  return (
    <CreateFlowShell
      title="New story"
      step={stepIndex}
      totalSteps={STEPS.length}
      stepLabel={STEP_LABELS[step]}
      onBack={goBack}
      onClose={() => router.push("/my-sanctuary")}
    >
      <input ref={inputRef} type="file" accept={STORY_ACCEPT} className="hidden" onChange={onPick} />

      {step === "pick" ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-28 w-28 items-center justify-center rounded-3xl border border-dashed border-[#00F2FE]/40 bg-[#06111E]/50 text-[#00F2FE]"
          >
            <ImagePlus className="h-10 w-10" />
          </button>
          <p className="mt-4 text-sm font-semibold">Activate camera roll</p>
          <p className="mt-1 text-xs text-[#64748B]">Capture or select a photo / video</p>
          {error ? <p className="mt-4 text-sm text-[#F87171]">{error}</p> : null}
        </div>
      ) : null}

      {(step === "edit" || step === "share") && previewUrl ? (
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-[#06111E]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            {overlayText ? (
              <p className="absolute inset-x-4 top-1/3 text-center text-lg font-bold text-white drop-shadow-lg">
                {overlayText}
              </p>
            ) : null}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1">
              {stickers.map((s, i) => (
                <span key={`${s}-${i}`} className="text-2xl drop-shadow-md">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {step === "edit" ? (
            <>
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Story text
                </span>
                <input
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Tap to add text"
                  className="w-full rounded-xl bg-[#06111E] px-3 py-2 text-sm text-[#F8FAFC] outline-none"
                />
              </label>
              <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-[#64748B]">Stickers</p>
              <div className="flex flex-wrap gap-2">
                {STICKERS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addSticker(emoji)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#06111E] text-xl hover:bg-[#06111E]/80"
                  >
                    {emoji}
                  </button>
                ))}
                <span className="flex items-center text-[#64748B]">
                  <Sticker className="mr-1 h-4 w-4" />
                  <span className="text-[11px]">Tap to place</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep("share")}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A]"
              >
                Next · Share to story
              </button>
            </>
          ) : (
            <>
              {error ? <p className="mt-4 text-sm text-[#F87171]">{error}</p> : null}
              <button
                type="button"
                disabled={publishing}
                onClick={() => void handlePublish()}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A] disabled:opacity-50"
              >
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Share to story
              </button>
            </>
          )}
        </div>
      ) : null}
    </CreateFlowShell>
  );
}
