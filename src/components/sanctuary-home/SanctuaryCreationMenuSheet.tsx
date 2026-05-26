"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Radio, Sparkles, Video, type LucideIcon } from "lucide-react";
import type { CreationMenuAction } from "@/lib/create-flow/creation-menu-engine";

export type { CreationMenuAction };

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (action: CreationMenuAction) => void;
};

type CreateMenuOption = {
  id: CreationMenuAction;
  title: string;
  description: string;
  Icon: LucideIcon;
  defaultActive?: boolean;
};

const ICON_CLASS = "h-5 w-5 text-[#00F2FE]";
const ICON_STROKE = 1.5;

const CREATE_MENU_OPTIONS: CreateMenuOption[] = [
  {
    id: "post",
    title: "Post",
    description: "Share photos or a carousel to your feed",
    Icon: ImageIcon,
    defaultActive: true,
  },
  {
    id: "story",
    title: "Story",
    description: "Share a moment that disappears in 24 hours",
    Icon: Sparkles,
  },
  {
    id: "reel",
    title: "Reel",
    description: "Create a short vertical video",
    Icon: Video,
  },
  {
    id: "live",
    title: "Live",
    description: "Start a real-time broadcast",
    Icon: Radio,
  },
];

const ROW_BASE =
  "flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-all duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F2FE]/30";
const ROW_DEFAULT_ACTIVE = "bg-slate-900/60 ring-1 ring-slate-700/50";
const ROW_IDLE = "bg-transparent hover:bg-slate-900/50 focus-visible:bg-slate-900/50";

function rowSurfaceClass(defaultActive?: boolean): string {
  return [ROW_BASE, defaultActive ? ROW_DEFAULT_ACTIVE : ROW_IDLE].join(" ");
}

/** Instagram-style slide-up creation menu. */
export default function SanctuaryCreationMenuSheet({ open, onClose, onSelect }: Props) {
  const selectLockRef = useRef(false);

  const activateOption = (action: CreationMenuAction) => {
    if (selectLockRef.current) return;
    selectLockRef.current = true;
    onSelect(action);
    window.setTimeout(() => {
      selectLockRef.current = false;
    }, 500);
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-[2100] bg-[#01040A]/80 backdrop-blur-sm"
            aria-label="Close creation menu"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-menu-title"
            initial={{ y: "100%", scale: 0.98, opacity: 0.92 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: "100%", scale: 0.98, opacity: 0.92 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-[2110] mx-auto max-w-lg rounded-t-2xl bg-[#020712] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_64px_rgba(0,0,0,0.55)] ring-1 ring-slate-800/40"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-800/90" aria-hidden />

            <header className="relative mb-3 flex min-h-[1.25rem] items-center justify-center">
              <h2
                id="create-menu-title"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                CREATE
              </h2>
            </header>

            <nav aria-label="Create content">
              <ul className="flex flex-col gap-1">
                {CREATE_MENU_OPTIONS.map((option) => {
                  const { Icon } = option;
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => activateOption(option.id)}
                        onTouchStart={() => activateOption(option.id)}
                        className={rowSurfaceClass(option.defaultActive)}
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900/80 ring-1 ring-slate-800/70">
                          <Icon className={ICON_CLASS} strokeWidth={ICON_STROKE} aria-hidden />
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-semibold leading-tight text-slate-50">{option.title}</span>
                          <span className="text-xs leading-snug text-slate-400">{option.description}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
