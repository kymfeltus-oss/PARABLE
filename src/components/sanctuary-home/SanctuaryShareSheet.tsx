"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Send, Sparkles, X } from "lucide-react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

export type ShareFollower = {
  id: string;
  username: string;
  avatar_url: string;
};

type Props = {
  open: boolean;
  postId: string | null;
  followers: ShareFollower[];
  onClose: () => void;
  onSend?: (followerIds: string[]) => void;
  onAddToStory?: (postId: string) => void;
};

/** Direct-message share sheet with follower checklist. */
export default function SanctuaryShareSheet({
  open,
  postId,
  followers,
  onClose,
  onSend,
  onAddToStory,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedCount = selected.size;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = () => {
    if (selectedCount === 0 || !postId) return;
    onSend?.([...selected]);
    setSelected(new Set());
    onClose();
  };

  const sortedFollowers = useMemo(
    () => [...followers].sort((a, b) => a.username.localeCompare(b.username)),
    [followers],
  );

  return (
    <AnimatePresence>
      {open && postId ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2150] bg-[#01040A]/75 backdrop-blur-sm"
            aria-label="Close share sheet"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-[2160] mx-auto max-h-[70vh] max-w-lg rounded-t-2xl bg-[#020712] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#06111E] px-4 py-3">
              <p className="text-sm font-bold text-[#F8FAFC]">Share</p>
              <button type="button" onClick={onClose} aria-label="Close">
                <X className="h-5 w-5 text-[#94A3B8]" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto overscroll-contain p-3">
              <button
                type="button"
                onClick={() => {
                  if (!postId) return;
                  onAddToStory?.(postId);
                  onClose();
                }}
                className="mb-2 flex w-full items-center gap-3 rounded-xl border border-[#00F2FE]/25 bg-[#00F2FE]/10 px-3 py-3 text-left transition hover:bg-[#00F2FE]/15"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#00F2FE] to-[#0EA5E9] text-[#01040A]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#F8FAFC]">Add post to your story</span>
                  <span className="block text-[11px] text-[#94A3B8]">Share this post as a story sticker</span>
                </span>
              </button>

              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {sortedFollowers.map((follower) => {
                  const checked = selected.has(follower.id);
                  return (
                    <button
                      key={follower.id}
                      type="button"
                      onClick={() => toggle(follower.id)}
                      className={`flex items-center gap-2 rounded-xl px-2 py-2 text-left transition ${
                        checked ? "bg-[#00F2FE]/10" : "hover:bg-[#06111E]/70"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={follower.avatar_url}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                        onError={fallbackAvatarOnError}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-[#F8FAFC]">@{follower.username}</span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          checked ? "border-[#00F2FE] bg-[#00F2FE] text-[#01040A]" : "border-[#334155]"
                        }`}
                      >
                        {checked ? <Check className="h-3 w-3" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[#06111E] p-4">
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={handleSend}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] py-3 text-sm font-black uppercase tracking-wider text-[#01040A] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                Send to {selectedCount || "…"}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
