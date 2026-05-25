"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type Props = {
  onRefresh?: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
};

const THRESHOLD_PX = 72;

/** Pull-down refresh at scroll top — fires existing reload hooks. */
export default function SanctuaryIgPullRefresh({ onRefresh, children, className = "" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0 || !onRefresh) return;
    startY.current = e.touches[0]?.clientY ?? 0;
    pulling.current = true;
  }, [onRefresh]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const y = e.touches[0]?.clientY ?? 0;
    const delta = Math.max(0, y - startY.current);
    setPullDistance(Math.min(delta, THRESHOLD_PX + 24));
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= THRESHOLD_PX && onRefresh && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [onRefresh, pullDistance, refreshing]);

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col ${className}`}>
      <motion.div
        className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-center"
        animate={{ height: refreshing ? 44 : pullDistance * 0.55, opacity: pullDistance > 8 || refreshing ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        <div className="flex h-11 items-center justify-center">
          <Loader2
            className={`h-5 w-5 text-[#00F2FE] ${refreshing || pullDistance >= THRESHOLD_PX ? "animate-spin" : ""}`}
          />
        </div>
      </motion.div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => void onTouchEnd()}
      >
        {children}
      </div>
    </div>
  );
}
