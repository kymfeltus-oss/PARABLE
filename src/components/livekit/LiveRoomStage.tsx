"use client";

import { useEffect, useState } from "react";
import { Track } from "livekit-client";
import { isTrackReference } from "@livekit/components-core";
import {
  RoomAudioRenderer,
  VideoTrack,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";

function LocalCameraView({ showDebug = false }: { showDebug?: boolean }) {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const cam = tracks.find((t) => t.source === Track.Source.Camera);

  if (!cam) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center opacity-90">
          <div className="text-[10px] font-black uppercase tracking-[6px] text-white/60">
            Camera not ready
          </div>
          <div className="text-sm font-bold italic text-white/70 mt-1">
            Check permissions + device
          </div>
          {showDebug && (
            <div className="mt-2 text-[10px] text-white/50">
              No camera track found yet.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {isTrackReference(cam) ? (
        <VideoTrack
          trackRef={cam}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center opacity-90">
            <div className="text-[10px] font-black uppercase tracking-[6px] text-white/60">
              Camera initializing
            </div>
            <div className="text-sm font-bold italic text-white/70 mt-1">
              Waiting for camera stream…
            </div>
            {showDebug && (
              <div className="mt-2 text-[10px] text-white/50">
                Placeholder track (not yet published/subscribed).
              </div>
            )}
          </div>
        </div>
      )}
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
  const [permissionHint, setPermissionHint] = useState<string | null>(null);

  // Turn on/off camera + mic (this is the missing piece)
  useEffect(() => {
    let cancelled = false;

    const enableMedia = async () => {
      try {
        setPermissionHint(null);

        // Camera
        await localParticipant.setCameraEnabled(camOn);

        // Mic
        await localParticipant.setMicrophoneEnabled(micOn);
      } catch (e: any) {
        if (cancelled) return;

        const msg =
          e?.message ||
          "Media start failed. Check camera/mic permissions in the browser.";

        // Helpful hint for common permission failures
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

        onError?.(msg);
        console.error("LiveRoomStage media error:", e);
      }
    };

    enableMedia();

    return () => {
      cancelled = true;
    };
  }, [camOn, micOn, localParticipant, onError]);

  return (
    <>
      <RoomAudioRenderer />

      <LocalCameraView />

      {permissionHint && (
        <div className="absolute left-3 right-3 bottom-3 rounded-sm border border-red-500/30 bg-red-500/10 p-3">
          <div className="text-[10px] font-black uppercase tracking-[4px] text-red-200">
            Permissions
          </div>
          <div className="text-sm font-bold italic text-white/75 mt-1">
            {permissionHint}
          </div>
        </div>
      )}
    </>
  );
}
