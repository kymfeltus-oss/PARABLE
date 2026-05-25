"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

type Props = {
  show: boolean;
};

/** Double-tap like burst — spring scale 0→1.2, fade out in 300ms total. */
export default function SanctuaryIgNeonHeart({ show }: Props) {
  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 1.2, opacity: 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 18, duration: 0.3 }}
      >
        <Heart
          className="h-24 w-24 fill-[#EF4444] text-[#EF4444] drop-shadow-[0_0_28px_rgba(239,68,68,0.65)]"
          strokeWidth={1.5}
        />
      </motion.div>
    </div>
  );
}
