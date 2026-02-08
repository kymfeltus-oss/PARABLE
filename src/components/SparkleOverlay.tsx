"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Sparkle {
  x: string; y: string; delay: number; size: number; duration: number; drift: string;
}

export default function SparkleOverlay() {
  const [mounted, setMounted] = useState(false);
  const [sparkleData, setSparkleData] = useState<Sparkle[]>([]);

  useEffect(() => {
    // BACK TO ORIGINAL LOGIC: 300 Living Particles
    const newSparkles = Array.from({ length: 300 }).map(() => ({
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 110}%`,
      delay: Math.random() * 5,
      size: Math.random() * 3 + 0.5, 
      duration: Math.random() * 4 + 2,
      drift: `${(Math.random() - 0.5) * 60}px`
    }));
    
    setSparkleData(newSparkles);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {sparkleData.map((s, i) => (
        <motion.div
          key={i}
          className="absolute bg-[#00f2ff] rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0.5, 1, 0],
            scale: [0, 1.5, 1, 1.5, 0],
            y: ["0px", "-250px"], // High-velocity upward drift
            x: ["0px", s.drift]
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: s.delay
          }}
          style={{
            left: s.x,
            top: s.y,
            width: `${s.size}px`,
            height: `${s.size}px`,
            filter: "blur(1px) drop-shadow(0 0 8px #00f2ff)",
          }}
        />
      ))}
    </div>
  );
}