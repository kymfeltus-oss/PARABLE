"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic, Radio, Video, VideoOff } from "lucide-react";
import CreateFlowShell from "@/components/create/CreateFlowShell";

type Step = "permissions" | "settings" | "broadcast";
const STEPS: Step[] = ["permissions", "settings", "broadcast"];
const STEP_LABELS: Record<Step, string> = {
  permissions: "Camera & mic",
  settings: "Stream settings",
  broadcast: "Go live",
};

export default function LiveBroadcastFlow() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>("permissions");
  const [permState, setPermState] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"public" | "followers">("followers");
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(step) + 1;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  useEffect(() => {
    if (step !== "broadcast") return;
    const id = window.setInterval(() => setLiveSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== "broadcast" || !videoRef.current) return;
    if (streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => {});
    }
  }, [step]);

  const requestPermissions = async () => {
    setPermState("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPermState("granted");
      setStep("settings");
    } catch {
      setPermState("denied");
      setError("Camera and microphone access are required to go live.");
    }
  };

  const goBack = () => {
    if (step === "broadcast") {
      stopStream();
      setStep("settings");
    } else if (step === "settings") setStep("permissions");
    else router.push("/my-sanctuary");
  };

  const goLive = () => {
    if (!title.trim()) {
      setError("Add a stream title before going live.");
      return;
    }
    setError(null);
    setStep("broadcast");
  };

  const endLive = () => {
    stopStream();
    router.push("/my-sanctuary");
  };

  const formatLiveTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <CreateFlowShell
      title="Live broadcast"
      step={stepIndex}
      totalSteps={STEPS.length}
      stepLabel={STEP_LABELS[step]}
      onBack={step === "broadcast" ? undefined : goBack}
      onClose={() => {
        stopStream();
        router.push("/my-sanctuary");
      }}
    >
      {step === "permissions" ? (
        <div className="mx-auto max-w-md px-6 py-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#00F2FE]/10">
            <Radio className="h-9 w-9 text-[#00F2FE]" />
          </div>
          <p className="text-sm font-semibold text-[#F8FAFC]">Check camera & mic permissions</p>
          <p className="mt-2 text-xs text-[#64748B]">
            PARABLE needs access to your camera and microphone for live worship streams.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-[#94A3B8]">
            <Video className="h-6 w-6" />
            <Mic className="h-6 w-6" />
          </div>
          {error ? <p className="mt-4 text-sm text-[#F87171]">{error}</p> : null}
          <button
            type="button"
            disabled={permState === "requesting"}
            onClick={() => void requestPermissions()}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A] disabled:opacity-50"
          >
            {permState === "requesting" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Allow access
          </button>
          {permState === "denied" ? (
            <button
              type="button"
              onClick={() => setStep("settings")}
              className="mt-3 w-full text-xs text-[#64748B] hover:text-[#94A3B8]"
            >
              Continue without preview (simulated)
            </button>
          ) : null}
          <video ref={videoRef} className="mt-4 hidden" muted playsInline />
        </div>
      ) : null}

      {step === "settings" ? (
        <div className="mx-auto max-w-md space-y-4 px-4 py-6">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Stream title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tonight's worship room"
              className="w-full rounded-xl bg-[#06111E] px-3 py-2.5 text-sm text-[#F8FAFC] outline-none"
            />
          </label>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#64748B]">Visibility</p>
            <div className="flex gap-2">
              {(["followers", "public"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize ${
                    visibility === v ? "bg-[#00F2FE]/15 text-[#00F2FE]" : "bg-[#06111E] text-[#CBD5E1]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-[#F87171]">{error}</p> : null}
          <button
            type="button"
            onClick={goLive}
            className="w-full rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A]"
          >
            Go live
          </button>
        </div>
      ) : null}

      {step === "broadcast" ? (
        <div className="relative flex min-h-[70vh] flex-col bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            muted
            playsInline
          />
          {!streamRef.current ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#06111E]">
              <VideoOff className="h-12 w-12 text-[#64748B]" />
            </div>
          ) : null}
          <div className="relative z-10 flex items-start justify-between p-4">
            <span className="flex items-center gap-2 rounded-full bg-[#EF4444] px-3 py-1 text-xs font-black uppercase text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Live · {formatLiveTime(liveSeconds)}
            </span>
            <button
              type="button"
              onClick={endLive}
              className="rounded-full bg-[#01040A]/80 px-4 py-2 text-xs font-bold text-[#F8FAFC]"
            >
              End
            </button>
          </div>
          <div className="relative z-10 mt-auto p-4">
            <p className="text-lg font-bold text-white drop-shadow">{title}</p>
            <p className="text-xs text-white/70 capitalize">{visibility} stream</p>
          </div>
        </div>
      ) : null}
    </CreateFlowShell>
  );
}
