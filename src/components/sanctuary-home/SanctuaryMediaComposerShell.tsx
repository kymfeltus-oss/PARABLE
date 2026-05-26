"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Gauge,
  Grid3X3,
  Music2,
  Sparkles,
  Timer,
  X,
} from "lucide-react";

export type ComposerUtilityMode = "story" | "reel";

type Props = {
  open: boolean;
  mode: ComposerUtilityMode;
  previewUrl: string | null;
  onClose: () => void;
  onContinue?: () => void;
};

const LENGTH_OPTIONS = ["15s", "30s", "60s", "90s"] as const;
const SPEED_OPTIONS = ["0.5x", "1x", "2x", "3x"] as const;
const MOCK_TRACKS = ["Neon Worship Loop", "Kingdom Pulse", "Sanctuary Drift", "Prophetic Rise"];

function cycleValue<T extends string>(current: T, options: readonly T[]): T {
  const idx = options.indexOf(current);
  return options[(idx + 1) % options.length] ?? options[0];
}

/** Story/Reel preview shell with right-hand utility sidebar. */
export default function SanctuaryMediaComposerShell({
  open,
  mode,
  previewUrl,
  onClose,
  onContinue,
}: Props) {
  const [length, setLength] = useState<(typeof LENGTH_OPTIONS)[number]>("15s");
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>("1x");
  const [timerOn, setTimerOn] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(MOCK_TRACKS[0]);

  const utilities = useMemo(
    () => [
      { id: "audio", label: "Audio", icon: Music2, onClick: () => setAudioOpen(true) },
      { id: "effects", label: "Effects", icon: Sparkles, onClick: () => setEffectsOpen(true) },
      { id: "layout", label: "Layout", icon: Grid3X3, onClick: () => setLayoutOpen(true) },
      {
        id: "length",
        label: length,
        icon: Clock,
        onClick: () => setLength((v) => cycleValue(v, LENGTH_OPTIONS)),
      },
      {
        id: "speed",
        label: speed,
        icon: Gauge,
        onClick: () => setSpeed((v) => cycleValue(v, SPEED_OPTIONS)),
      },
      {
        id: "timer",
        label: timerOn ? "3s delay" : "Timer",
        icon: Timer,
        onClick: () => setTimerOn((v) => !v),
      },
    ],
    [length, speed, timerOn],
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2200] flex items-center justify-center bg-[#01040A]/90 p-4 backdrop-blur-md"
        >
          <div className="relative flex h-[min(88vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-[#020712] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
                {mode === "story" ? "Story Studio" : "Reel Studio"}
              </p>
              <button type="button" onClick={onClose} className="text-[#94A3B8] hover:text-[#F8FAFC]" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 px-3 pb-3">
              <div className="relative h-full overflow-hidden rounded-xl bg-[#06111E]">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#64748B]">
                    Select media to preview
                  </div>
                )}

                <aside className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
                  {utilities.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className="flex w-[58px] flex-col items-center gap-1 rounded-xl bg-[#01040A]/75 px-1 py-2 text-[9px] font-semibold text-[#CBD5E1] backdrop-blur-sm transition hover:text-[#00F2FE]"
                    >
                      <item.icon className="h-4 w-4 text-[#00F2FE]" />
                      {item.label}
                    </button>
                  ))}
                </aside>
              </div>
            </div>

            <div className="flex gap-2 px-4 pb-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-[#06111E] py-2.5 text-sm font-semibold text-[#CBD5E1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-2.5 text-sm font-black uppercase tracking-wider text-[#01040A]"
              >
                Continue
              </button>
            </div>
          </div>

          {audioOpen ? (
            <SubSheet title="Audio catalogue" onClose={() => setAudioOpen(false)}>
              <div className="space-y-2">
                {MOCK_TRACKS.map((track) => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => {
                      setSelectedTrack(track);
                      setAudioOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      selectedTrack === track ? "bg-[#00F2FE]/10 text-[#00F2FE]" : "text-[#CBD5E1] hover:bg-[#06111E]"
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </SubSheet>
          ) : null}

          {effectsOpen ? (
            <SubSheet title="Effects" onClose={() => setEffectsOpen(false)}>
              <div className="grid grid-cols-3 gap-2">
                {["Glow", "Mono", "Warm", "Cool", "Vivid", "Soft"].map((fx) => (
                  <button
                    key={fx}
                    type="button"
                    className="rounded-lg bg-[#06111E] px-2 py-6 text-xs font-semibold text-[#CBD5E1] hover:text-[#00F2FE]"
                  >
                    {fx}
                  </button>
                ))}
              </div>
            </SubSheet>
          ) : null}

          {layoutOpen ? (
            <SubSheet title="Layout templates" onClose={() => setLayoutOpen(false)}>
              <div className="grid grid-cols-2 gap-2">
                {["Single", "Split", "Grid 2x2", "Collage"].map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    className="rounded-lg border border-[#06111E] bg-[#06111E]/60 px-2 py-8 text-xs font-semibold text-[#CBD5E1] hover:border-[#00F2FE]/30"
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </SubSheet>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SubSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      className="absolute inset-x-4 bottom-4 z-[2210] rounded-2xl bg-[#020712] p-4 shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#F8FAFC]">{title}</p>
        <button type="button" onClick={onClose} aria-label="Close panel">
          <X className="h-4 w-4 text-[#94A3B8]" />
        </button>
      </div>
      {children}
    </motion.div>
  );
}
