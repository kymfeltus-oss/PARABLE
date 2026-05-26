"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, Link2, Share2, Trash2, UserMinus, VolumeX } from "lucide-react";

export type PostOptionsAction =
  | "delete-post"
  | "save-link"
  | "share"
  | "report"
  | "mute"
  | "unfollow";

type Props = {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  username: string;
  isOwnPost?: boolean;
  onAction: (action: PostOptionsAction) => void;
  onClose: () => void;
};

const OTHER_ITEMS: {
  action: PostOptionsAction;
  label: string;
  icon: typeof Link2;
  destructive?: boolean;
}[] = [
  { action: "save-link", label: "Save Link", icon: Link2 },
  { action: "share", label: "Share to…", icon: Share2 },
  { action: "report", label: "Report", icon: Flag, destructive: true },
  { action: "mute", label: "Mute", icon: VolumeX },
  { action: "unfollow", label: "Unfollow", icon: UserMinus, destructive: true },
];

/** Context menu anchored to the post header overflow button. */
export default function SanctuaryIgPostOptionsMenu({
  open,
  anchorRef,
  username,
  isOwnPost = false,
  onAction,
  onClose,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, anchorRef, onClose]);

  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const top = anchorRect ? anchorRect.bottom + 6 : 64;
  const right = anchorRect ? Math.max(8, window.innerWidth - anchorRect.right) : 12;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[2100] bg-transparent"
            aria-label="Close post options"
            onClick={onClose}
          />
          <motion.div
            ref={menuRef}
            role="menu"
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            style={{ top, right }}
            className="fixed z-[2110] min-w-[200px] overflow-hidden rounded-xl border border-[#06111E] bg-[#020712] py-1 shadow-2xl"
          >
            <p className="border-b border-[#06111E] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              @{username}
            </p>
            {isOwnPost ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onAction("delete-post");
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[#F87171] transition hover:bg-[#06111E]/80"
              >
                <Trash2 className="h-4 w-4 shrink-0 opacity-80" />
                Delete post
              </button>
            ) : null}
            {(isOwnPost
              ? OTHER_ITEMS.filter((item) => item.action === "save-link" || item.action === "share")
              : OTHER_ITEMS
            ).map(({ action, label, icon: Icon, destructive }) => (
              <button
                key={action}
                type="button"
                role="menuitem"
                onClick={() => {
                  onAction(action);
                  onClose();
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition hover:bg-[#06111E]/80 ${
                  destructive ? "text-[#F87171]" : "text-[#F8FAFC]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={onClose}
              className="mt-1 w-full border-t border-[#06111E] px-3 py-2.5 text-center text-sm font-semibold text-[#94A3B8] hover:bg-[#06111E]/60 hover:text-[#F8FAFC]"
            >
              Cancel
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
