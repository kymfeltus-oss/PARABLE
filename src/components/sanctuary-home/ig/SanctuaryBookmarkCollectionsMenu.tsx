"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check } from "lucide-react";
import { SANCTUARY_BOOKMARK_COLLECTIONS, type BookmarkCollection } from "@/lib/sanctuary-post-interactions";

type Props = {
  open: boolean;
  anchorRect: DOMRect | null;
  activeCollectionId?: string | null;
  onSelect: (collection: BookmarkCollection) => void;
  onClose: () => void;
};

/** Long-press bookmark collections micro-menu. */
export default function SanctuaryBookmarkCollectionsMenu({
  open,
  anchorRect,
  activeCollectionId,
  onSelect,
  onClose,
}: Props) {
  const bottom = anchorRect ? window.innerHeight - anchorRect.top + 8 : 120;
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
            className="fixed inset-0 z-[2120] bg-transparent"
            aria-label="Close collections menu"
            onClick={onClose}
          />
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 440, damping: 34 }}
            style={{ bottom, right }}
            className="fixed z-[2130] min-w-[188px] overflow-hidden rounded-xl border border-[#06111E] bg-[#020712] py-1 shadow-2xl"
          >
            <p className="flex items-center gap-1.5 border-b border-[#06111E] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#00F2FE]">
              <Bookmark className="h-3.5 w-3.5" />
              Save to collection
            </p>
            {SANCTUARY_BOOKMARK_COLLECTIONS.map((collection) => {
              const active = activeCollectionId === collection.id;
              return (
                <button
                  key={collection.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelect(collection);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-[#06111E]/80 ${
                    active ? "text-[#00F2FE]" : "text-[#F8FAFC]"
                  }`}
                >
                  {collection.name}
                  {active ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
