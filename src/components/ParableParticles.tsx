"use client";
import React, { useState, useEffect } from "react";

export default function ParableParticles() {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; duration: number }[]>([]);

  useEffect(() => {
    // 150 stars for a dense, cinematic atmosphere
    const generatedStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 3 + 2,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5]">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: "0 0 15px #00f2ff",
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}