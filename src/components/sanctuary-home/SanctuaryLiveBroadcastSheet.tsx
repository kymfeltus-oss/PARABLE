"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Radio, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Mock live broadcast initialization overlay. */
export default function SanctuaryLiveBroadcastSheet({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2250] bg-[#01040A]/85 backdrop-blur-md"
            aria-label="Close live setup"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="fixed left-1/2 top-1/2 z-[2260] w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#020712] p-6 text-center shadow-2xl"
          >
            <button type="button" onClick={onClose} className="absolute right-4 top-4 text-[#94A3B8]" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#00F2FE]/10">
              <Radio className="h-7 w-7 animate-pulse text-[#00F2FE]" />
            </div>
            <p className="text-lg font-bold text-[#F8FAFC]">Initializing Live Broadcast</p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Connecting encoder, verifying stream key, and preparing your sanctuary room…
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-[#00F2FE]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs font-semibold uppercase tracking-wider">Mock stream state</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A]"
            >
              End Setup
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
