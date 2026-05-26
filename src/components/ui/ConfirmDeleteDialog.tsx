"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Centered confirmation modal for irreversible deletes. */
export default function ConfirmDeleteDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
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
            className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm"
            aria-label="Cancel delete"
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-desc"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed left-1/2 top-1/2 z-[3010] w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0a0f18] p-5 shadow-2xl"
          >
            <h2 id="confirm-delete-title" className="text-base font-bold text-white">
              {title}
            </h2>
            <p id="confirm-delete-desc" className="mt-2 text-sm leading-relaxed text-white/60">
              {description}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#DC2626] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
