"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Heart, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type FeedSwitcherMode = "for_you" | "following" | "favorites";

const MODES: { id: FeedSwitcherMode; label: string }[] = [
  { id: "for_you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "favorites", label: "Favorites" },
];

type Props = {
  mode: FeedSwitcherMode;
  onModeChange: (mode: FeedSwitcherMode) => void;
  onCreateClick?: () => void;
  onActivityClick?: () => void;
};

export default function SanctuaryIgFeedHeader({
  mode,
  onModeChange,
  onCreateClick,
  onActivityClick,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeLabel = MODES.find((m) => m.id === mode)?.label ?? "For You";

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#06111E]/80 bg-[#01040A]/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-[52px] w-full max-w-full items-center justify-center px-3">
        {onCreateClick ? (
          <button
            type="button"
            onClick={onCreateClick}
            className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[#06111E] text-[#F8FAFC] transition hover:border-[#00F2FE]/40 hover:text-[#00F2FE]"
            aria-label="Create post"
          >
            <Plus className="h-5 w-5" />
          </button>
        ) : null}

        <div ref={rootRef} className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 rounded-lg bg-transparent px-2 py-1 transition hover:bg-white/5"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={`Feed: ${activeLabel}`}
          >
            <Image
              src="/logo.png"
              alt=""
              width={120}
              height={32}
              priority
              className="h-8 w-auto bg-transparent object-contain drop-shadow-[0_0_16px_rgba(0,242,254,0.36)] drop-shadow-[0_0_54px_rgba(0,242,254,0.16)]"
            />
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[#94A3B8] transition ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="absolute left-1/2 top-full z-50 mt-2 w-44 -translate-x-1/2 overflow-hidden rounded-xl border border-[#06111E] bg-[#020712] py-1 shadow-2xl"
                role="listbox"
              >
                {MODES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={mode === item.id}
                    onClick={() => {
                      onModeChange(item.id);
                      setOpen(false);
                    }}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                      mode === item.id
                        ? "bg-[#00F2FE]/10 font-semibold text-[#00F2FE]"
                        : "text-[#CBD5E1] hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={onActivityClick}
          className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-xl text-[#F8FAFC] transition hover:text-[#00F2FE]"
          aria-label="Activity"
        >
          <Heart className="h-6 w-6" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
