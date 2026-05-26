"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Film, Loader2, Upload } from "lucide-react";
import CreateFlowShell from "@/components/create/CreateFlowShell";
import { REELS_REFRESH_EVENT } from "@/lib/reels/constants";
import { extractVideoThumbnail } from "@/lib/reels/thumbnail";
import type { ReelUploadProgressStep } from "@/lib/reels/types";
import { REEL_ACCEPT_MIME, validateReelVideoFile } from "@/lib/reels/validation";

const PROGRESS_LABELS: Record<Exclude<ReelUploadProgressStep, "done" | "error">, string> = {
  validating: "Step 1/3: Validating Media",
  uploading: "Step 2/3: Uploading high-definition video assets",
  publishing: "Step 3/3: Publishing metadata record tables",
};

export default function CreateReelFlow() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [audioTitle, setAudioTitle] = useState("Original Audio");
  const [banner, setBanner] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<ReelUploadProgressStep | null>(null);
  const [busy, setBusy] = useState(false);

  const resetPicker = () => {
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
    setAudioTitle("Original Audio");
    setBanner(null);
    setProgressStep(null);
  };

  const processFile = useCallback(async (picked: File) => {
    setBanner(null);
    setProgressStep("validating");
    setBusy(true);

    const validation = await validateReelVideoFile(picked);
    if (!validation.ok) {
      setBanner(validation.message);
      setProgressStep("error");
      setBusy(false);
      return;
    }

    const url = URL.createObjectURL(picked);
    setFile(picked);
    setPreviewUrl(url);
    setProgressStep(null);
    setBusy(false);
  }, []);

  const onInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    await processFile(picked);
  };

  const onDrop = async (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragOver(false);
    const picked = event.dataTransfer.files?.[0];
    if (!picked) return;
    await processFile(picked);
  };

  const handlePublish = async () => {
    if (!file || busy) return;
    setBusy(true);
    setBanner(null);
    setProgressStep("validating");

    try {
      const validation = await validateReelVideoFile(file);
      if (!validation.ok) {
        setBanner(validation.message);
        setProgressStep("error");
        return;
      }

      setProgressStep("uploading");
      const thumbnailBlob = await extractVideoThumbnail(file, 1);

      const formData = new FormData();
      formData.append("video", file);
      formData.append("thumbnail", new File([thumbnailBlob], "thumbnail.jpg", { type: "image/jpeg" }));
      formData.append("caption", caption.trim());
      formData.append("audioTitle", audioTitle.trim() || "Original Audio");

      setProgressStep("publishing");
      const res = await fetch("/api/reels", { method: "POST", body: formData, credentials: "include" });
      const payload = (await res.json()) as { error?: string };

      if (!res.ok) {
        setBanner(payload.error ?? "Failed to publish reel.");
        setProgressStep("error");
        return;
      }

      setProgressStep("done");
      resetPicker();
      window.dispatchEvent(new Event(REELS_REFRESH_EVENT));
      router.push("/reels");
    } catch (err) {
      setBanner(err instanceof Error ? err.message : "Upload failed.");
      setProgressStep("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <CreateFlowShell
      title="New reel"
      step={file ? 2 : 1}
      totalSteps={2}
      stepLabel={file ? "Reel composer" : "Upload video"}
      onBack={() => (file ? resetPicker() : router.push("/my-sanctuary"))}
      onClose={() => router.push("/my-sanctuary")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={REEL_ACCEPT_MIME}
        className="hidden"
        onChange={(e) => void onInputChange(e)}
      />

      {!file ? (
        <div className="mx-auto max-w-md px-4 py-8">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => void onDrop(e)}
            className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
              dragOver
                ? "border-[#00F2FE] bg-[#00F2FE]/10"
                : "border-[#1E293B] bg-[#020712] hover:border-[#00F2FE]/50"
            }`}
          >
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#06111E]">
              <Upload className="h-7 w-7 text-[#00F2FE]" strokeWidth={1.5} />
            </span>
            <p className="text-sm font-semibold text-[#F8FAFC]">Drop a vertical video here</p>
            <p className="mt-2 text-xs text-[#94A3B8]">MP4 or MOV · up to 100MB · max 60 seconds</p>
          </button>
          {banner ? (
            <p className="mt-4 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-sm text-[#FCA5A5]">
              {banner}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-black">
            {previewUrl ? (
              <video src={previewUrl} controls className="h-full w-full object-cover" playsInline />
            ) : null}
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#64748B]">Caption</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="Write a caption…"
              className="w-full rounded-xl bg-[#06111E] px-3 py-2 text-sm text-[#F8FAFC] outline-none ring-[#00F2FE]/40 focus:ring-1"
            />
          </label>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Audio track label
            </span>
            <input
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              className="w-full rounded-xl bg-[#06111E] px-3 py-2 text-sm text-[#F8FAFC] outline-none ring-[#00F2FE]/40 focus:ring-1"
            />
          </label>

          {banner ? (
            <p className="mt-3 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-sm text-[#FCA5A5]">
              {banner}
            </p>
          ) : null}

          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePublish()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A] disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
            Publish reel
          </button>
        </div>
      )}

      {progressStep && progressStep !== "done" && progressStep !== "error" ? (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#01040A]/85 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#06111E] bg-[#020712] p-6 text-center shadow-2xl">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00F2FE]" />
            <p className="mt-4 text-sm font-semibold text-[#F8FAFC]">{PROGRESS_LABELS[progressStep]}</p>
          </div>
        </div>
      ) : null}
    </CreateFlowShell>
  );
}
