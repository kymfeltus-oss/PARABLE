"use client";
import React, { useState, useEffect } from "react";

export const Sparkles = () => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; duration: number }[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: "0 0 10px #00f2ff",
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
};