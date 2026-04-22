"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useIsSpeaking,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Headphones, Loader2, Mic, MicOff, Radio, VolumeX } from "lucide-react";
import type { RoomOptions } from "livekit-client";
import type { Participant } from "livekit-client";

const CYAN_BTN =
  "flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#00FFFF]/40 bg-[#0a0c0d] py-2.5 text-xs font-black uppercase tracking-wider text-[#00FFFF] transition hover:bg-[#00FFFF]/12 hover:shadow-[0_0_22px_rgba(0,255,255,0.35)] disabled:opacity-40";

const roomOptions: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  /** Mix through Web Audio — enables richer room-style playback (basis for spatial panning). */
  webAudioMix: true,
};

type Props = {
  token: string;
  serverUrl: string;
  roomName: string;
  onPeerIdentities: (ids: readonly string[]) => void;
  onConnected?: () => void;
  onDisconnected: () => void;
  onError?: (msg: string) => void;
  children: React.ReactNode;
};

/**
 * Wraps Gamers Hub body while connected to Gaming-Lobby: audio renderer, StartAudio,
 * and participant sync for the member list.
 */
export function GamersHubVoiceShell({
  token,
  serverUrl,
  roomName,
  onPeerIdentities,
  onConnected,
  onDisconnected,
  onError,
  children,
}: Props) {
  return (
    <LiveKitRoom
      audio
      video={false}
      token={token}
      serverUrl={serverUrl}
      connect
      data-lk-theme="default"
      options={roomOptions}
      onConnected={onConnected}
      onDisconnected={onDisconnected}
      onError={(e) => onError?.(e?.message ?? "LiveKit error")}
    >
      <VoiceParticipantBridge roomName={roomName} onPeerIdentities={onPeerIdentities} />
      <RoomAudioRenderer />
      <StartAudio label="Tap to enable voice audio" />
      {children}
    </LiveKitRoom>
  );
}

function VoiceParticipantBridge({
  roomName,
  onPeerIdentities,
}: {
  roomName: string;
  onPeerIdentities: (ids: readonly string[]) => void;
}) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const ids = useMemo(() => {
    const s = new Set<string>();
    if (localParticipant?.identity) s.add(localParticipant.identity);
    for (const p of participants) {
      if (p.identity) s.add(p.identity);
    }
    return [...s] as const;
  }, [localParticipant?.identity, participants]);

  useEffect(() => {
    onPeerIdentities(ids);
  }, [ids, onPeerIdentities]);

  useEffect(() => {
    return () => onPeerIdentities([]);
  }, [onPeerIdentities]);

  return (
    <span hidden aria-hidden>
      {roomName}
    </span>
  );
}

/** Stacked avatars + speaking rings (Discord-style) under the active voice channel. */
export function GamingVcAvatarStack({ className = "" }: { className?: string }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const ordered = useMemo(() => {
    const remotes = participants.filter((p) => p.sid !== localParticipant?.sid);
    const locals = localParticipant ? [localParticipant] : [];
    return [...locals, ...remotes];
  }, [localParticipant, participants]);

  if (ordered.length === 0) {
    return (
      <p className={`px-2 text-[10px] text-white/35 ${className}`}>No one connected yet — invite the squad.</p>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 px-2 pt-2 ${className}`}>
      {ordered.slice(0, 12).map((p) => (
        <SpeakingAvatar key={p.sid} participant={p} />
      ))}
      {ordered.length > 12 ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">
          +{ordered.length - 12}
        </span>
      ) : null}
    </div>
  );
}

function SpeakingAvatar({ participant }: { participant: Participant }) {
  const speaking = useIsSpeaking(participant);
  const initial = (participant.name || participant.identity || "?").slice(0, 2).toUpperCase();

  return (
    <div
      title={participant.name || participant.identity}
      className={[
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1b1d21] text-[10px] font-bold text-white/80 ring-2 transition",
        speaking ? "ring-[#00FFFF] shadow-[0_0_16px_rgba(0,255,255,0.55)] animate-pulse" : "ring-white/10",
      ].join(" ")}
    >
      {initial}
    </div>
  );
}

export function GamingVcTransportBar({
  onLeave,
  disabled,
}: {
  onLeave: () => void;
  disabled?: boolean;
}) {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [deafened, setDeafened] = useState(false);

  const setMic = useCallback(
    (enabled: boolean) => void localParticipant.setMicrophoneEnabled(enabled),
    [localParticipant],
  );

  const toggleDeafen = useCallback(() => {
    const next = !deafened;
    setDeafened(next);
    room.remoteParticipants.forEach((rp) => {
      try {
        rp.setVolume(next ? 0 : 1);
      } catch {
        /* ignore */
      }
    });
    if (next) setMic(false);
  }, [deafened, room.remoteParticipants, setMic]);

  return (
    <div className="mt-auto border-t border-white/[0.08] bg-[#0a0b0c]/95 p-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMic(!isMicrophoneEnabled)}
          className={CYAN_BTN}
          title={isMicrophoneEnabled ? "Mute" : "Unmute"}
        >
          {isMicrophoneEnabled ? <Mic size={16} /> : <MicOff size={16} />}
          {isMicrophoneEnabled ? "Mute" : "Unmute"}
        </button>
        <button type="button" disabled={disabled} onClick={toggleDeafen} className={CYAN_BTN} title="Deafen">
          {deafened ? <VolumeX size={16} /> : <Headphones size={16} />}
          {deafened ? "Undeafen" : "Deafen"}
        </button>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onLeave}
        className="mt-2 w-full rounded-lg border border-white/10 py-2 text-[10px] font-bold uppercase tracking-widest text-white/45 transition hover:border-red-500/40 hover:text-red-300"
      >
        Disconnect voice
      </button>
      <p className="mt-1.5 px-1 text-center text-[9px] text-white/25">
        Audio runs through Web Audio mixing for natural room presence.
      </p>
    </div>
  );
}

export function GamingVcConnecting() {
  return (
    <div className="flex items-center gap-2 px-2 py-2 text-[10px] text-[#00FFFF]/80">
      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      Connecting to Gaming-Lobby…
    </div>
  );
}

export function GamingVcNeedSignIn() {
  return (
    <div className="flex items-center gap-2 px-2 py-2 text-[10px] text-white/45">
      <Radio className="h-3.5 w-3.5 shrink-0 text-[#00FFFF]/60" />
      Sign in to join voice with LiveKit.
    </div>
  );
}
