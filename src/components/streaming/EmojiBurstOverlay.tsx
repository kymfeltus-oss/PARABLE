"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export interface EmojiBurstHandle {
  triggerBurst: (emoji: string) => void;
}

type EmojiParticle = {
  id: string;
  emoji: string;
  xStart: string;
  swayDistance: string;
  yMid: string;
  yUpper: string;
  yEnd: string;
  scale: number;
  duration: string;
  durationMs: number;
};

const BUNCH_COUNT = 4;

function spawnBurstParticles(emoji: string): EmojiParticle[] {
  const items: EmojiParticle[] = [];
  for (let i = 0; i < BUNCH_COUNT; i++) {
    const randomXStart = Math.floor(Math.random() * 80 - 40);
    const randomSway = Math.floor(Math.random() * 100 - 50);
    const randomYMid = Math.floor(Math.random() * -100 - 80);
    const randomYUpper = Math.floor(Math.random() * -240 - 180);
    const randomYEnd = Math.floor(Math.random() * -480 - 400);
    const randomScale = Number((Math.random() * 0.6 + 0.8).toFixed(2));
    const randomDurationSec = Number((Math.random() * 0.3 + 1.2).toFixed(2));

    items.push({
      id: `${crypto.randomUUID()}-${i}`,
      emoji,
      xStart: `${randomXStart}px`,
      swayDistance: `${randomSway}px`,
      yMid: `${randomYMid}px`,
      yUpper: `${randomYUpper}px`,
      yEnd: `${randomYEnd}px`,
      scale: randomScale,
      duration: `${randomDurationSec}s`,
      durationMs: Math.ceil(randomDurationSec * 1000) + 80,
    });
  }
  return items;
}

export const EmojiBurstOverlay = forwardRef<EmojiBurstHandle, object>(function EmojiBurstOverlay(
  _,
  ref,
) {
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const timeoutIdsRef = useRef<number[]>([]);

  const scheduleRemoval = useCallback((id: string, ms: number) => {
    const timer = window.setTimeout(() => {
      setParticles((current) => current.filter((p) => p.id !== id));
      timeoutIdsRef.current = timeoutIdsRef.current.filter((t) => t !== timer);
    }, ms);
    timeoutIdsRef.current.push(timer);
  }, []);

  useImperativeHandle(ref, () => ({
    triggerBurst(emoji: string) {
      const newParticles = spawnBurstParticles(emoji);
      setParticles((current) => [...current, ...newParticles]);
      for (const particle of newParticles) {
        scheduleRemoval(particle.id, particle.durationMs);
      }
    },
  }));

  useEffect(() => {
    return () => {
      for (const t of timeoutIdsRef.current) window.clearTimeout(t);
      timeoutIdsRef.current = [];
    };
  }, []);

  if (particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden select-none"
      data-testid="emoji-burst-overlay"
      aria-hidden
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="animate-emoji-burst pointer-events-none absolute bottom-12 left-1/2 touch-none select-none text-2xl md:text-3xl"
          style={
            {
              "--x-start": particle.xStart,
              "--sway-distance": particle.swayDistance,
              "--y-mid": particle.yMid,
              "--y-upper": particle.yUpper,
              "--y-end": particle.yEnd,
              "--target-scale": particle.scale,
              "--burst-duration": particle.duration,
            } as CSSProperties
          }
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
});

EmojiBurstOverlay.displayName = "EmojiBurstOverlay";
