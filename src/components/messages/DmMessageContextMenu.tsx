"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Smile, Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  isOwn: boolean;
  content: string;
  onClose: () => void;
  onCopy: () => void;
  onUnsend?: () => void;
  onReact: () => void;
};

export default function DmMessageContextMenu({
  open,
  isOwn,
  onClose,
  onCopy,
  onUnsend,
  onReact,
}: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2200] bg-[#01040A]/40"
            aria-label="Close message menu"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            className="fixed inset-x-4 bottom-24 z-[2210] mx-auto max-w-sm overflow-hidden rounded-2xl border border-[#06111E] bg-[#020712] py-1 shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-32 sm:left-auto"
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[#F8FAFC] hover:bg-[#06111E]/70"
              onClick={onCopy}
            >
              <Copy className="h-4 w-4" />
              Copy Text
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[#F8FAFC] hover:bg-[#06111E]/70"
              onClick={onReact}
            >
              <Smile className="h-4 w-4" />
              React
            </button>
            {isOwn && onUnsend ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[#F87171] hover:bg-[#06111E]/70"
                onClick={onUnsend}
              >
                <Trash2 className="h-4 w-4" />
                Unsend Message
              </button>
            ) : null}
            <button
              type="button"
              className="w-full border-t border-[#06111E] px-4 py-3 text-center text-sm font-semibold text-[#94A3B8]"
              onClick={onClose}
            >
              Cancel
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
