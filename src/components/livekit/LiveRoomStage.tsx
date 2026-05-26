"use client";

import { useEffect, useRef, useState } from "react";
import { ConnectionState } from "livekit-client";
import { RoomAudioRenderer, useConnectionState, useLocalParticipant } from "@livekit/components-react";

function LocalCameraView({ camOn }: { camOn: boolean }) {
  const { cameraTrack, lastCameraError } = useLocalParticipant();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    const vt = cameraTrack?.videoTrack;
    if (!camOn || !el || !vt) return;
    vt.attach(el);
    el.muted = true;
    return () => {
      vt.detach(el);
    };
  }, [camOn, cameraTrack]);

  if (!camOn) {
    return (
      <div className="absolute inset-0 z-[1] flex items-center justify-center bg-black/80">
        <div className="text-center opacity-90 px-4">
          <div className="text-[10px] font-black uppercase tracking-[6px] text-white/50">Camera off</div>
          <div className="text-sm font-bold italic text-white/65 mt-1">Tap Cam to show your feed</div>
        </div>
      </div>
    );
  }

  if (lastCameraError) {
    return (
      <div className="absolute inset-0 z-[1] flex items-center justify-center px-4">
        <div className="text-center max-w-[280px]">
          <div className="text-[10px] font-black uppercase tracking-[6px] text-red-300/90">Camera error</div>
          <p className="text-sm font-bold italic text-white/75 mt-2">{lastCameraError.message}</p>
          <p className="text-[11px] text-white/45 mt-2 leading-relaxed">
            Check site permissions (lock icon) and that no other app is using the camera.
          </p>
        </div>
      </div>
    );
  }

  const hasVideo = Boolean(cameraTrack?.videoTrack);

  return (
    <div className="absolute inset-0 z-[1] bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        className={`h-full w-full object-cover ${hasVideo ? "opacity-100" : "opacity-0"}`}
      />
      {!hasVideo ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center opacity-90 px-4">
            <div className="text-[10px] font-black uppercase tracking-[6px] text-white/60">
              Starting camera…
            </div>
            <div className="text-sm font-bold italic text-white/70 mt-1">
              Allow access if the browser asks
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function LiveRoomStage({
  camOn,
  micOn,
  onError,
}: {
  camOn: boolean;
  micOn: boolean;
  onError?: (msg: string) => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [permissionHint, setPermissionHint] = useState<string | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Single path for mic/camera: LiveKitRoom uses audio={false} video={false} so SignalConnected does not fight this.
  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;

    let cancelled = false;

    const enableMedia = async () => {
      try {
        setPermissionHint(null);
        await localParticipant.setCameraEnabled(camOn);
        await localParticipant.setMicrophoneEnabled(micOn);
      } catch (e: unknown) {
        if (cancelled) return;

        const msg =
          e instanceof Error
            ? e.message
            : "Media start failed. Check camera/mic permissions in the browser.";

        if (
          typeof msg === "string" &&
          (msg.toLowerCase().includes("permission") ||
            msg.toLowerCase().includes("denied") ||
            msg.toLowerCase().includes("notallowederror"))
        ) {
          setPermissionHint(
            "Permission blocked. Click the lock icon in the address bar → allow Camera + Microphone → refresh."
          );
        }

        onErrorRef.current?.(msg);
        console.error("LiveRoomStage media error:", e);
      }
    };

    void enableMedia();

    return () => {
      cancelled = true;
    };
  }, [camOn, micOn, connectionState, localParticipant]);

  return (
    <>
      <RoomAudioRenderer />

      <LocalCameraView camOn={camOn} />

      {permissionHint ? (
        <div className="absolute left-3 right-3 bottom-3 z-20 rounded-sm border border-red-500/30 bg-red-500/10 p-3">
          <div className="text-[10px] font-black uppercase tracking-[4px] text-red-200">Permissions</div>
          <div className="text-sm font-bold italic text-white/75 mt-1">{permissionHint}</div>
        </div>
      ) : null}
    </>
  );
}
