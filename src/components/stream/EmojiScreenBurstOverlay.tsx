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
import type { EmojiBurstItem } from "@/lib/go-live-layout-types";
import { createEmojiBurstCluster } from "@/lib/emoji-screen-burst";

export interface EmojiScreenBurstHandle {
  triggerBurst: (emoji: string) => void;
}

function BurstParticles({ items }: { items: EmojiBurstItem[] }) {
  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 touch-none overflow-hidden bg-transparent select-none"
      data-testid="emoji-screen-burst-overlay"
      aria-hidden
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="animate-emoji-screen-burst pointer-events-none absolute bottom-[16%] left-1/2 touch-none text-2xl select-none md:text-3xl"
          style={
            {
              "--burst-x": `${item.x}px`,
              "--burst-scale": item.scale,
              "--burst-duration": `${item.duration}ms`,
            } as CSSProperties
          }
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}

export const EmojiScreenBurstOverlay = forwardRef<EmojiScreenBurstHandle, object>(
  function EmojiScreenBurstOverlay(_, ref) {
    const [bursts, setBursts] = useState<EmojiBurstItem[]>([]);
    const timeoutIdsRef = useRef<number[]>([]);

    const scheduleBurst = useCallback((item: EmojiBurstItem) => {
      const addTimer = window.setTimeout(() => {
        setBursts((curr) => [...curr, item]);
        const removeTimer = window.setTimeout(() => {
          setBursts((curr) => curr.filter((b) => b.id !== item.id));
          timeoutIdsRef.current = timeoutIdsRef.current.filter((t) => t !== removeTimer);
        }, item.duration);
        timeoutIdsRef.current.push(removeTimer);
        timeoutIdsRef.current = timeoutIdsRef.current.filter((t) => t !== addTimer);
      }, item.delay);
      timeoutIdsRef.current.push(addTimer);
    }, []);

    useImperativeHandle(ref, () => ({
      triggerBurst(emoji: string) {
        const newItems = createEmojiBurstCluster(emoji);
        for (const item of newItems) {
          scheduleBurst(item);
        }
      },
    }));

    useEffect(() => {
      return () => {
        for (const t of timeoutIdsRef.current) window.clearTimeout(t);
        timeoutIdsRef.current = [];
        setBursts([]);
      };
    }, []);

    return <BurstParticles items={bursts} />;
  },
);

EmojiScreenBurstOverlay.displayName = "EmojiScreenBurstOverlay";

export function useEmojiScreenBurst() {
  const overlayRef = useRef<EmojiScreenBurstHandle | null>(null);
  const [bursts, setBursts] = useState<EmojiBurstItem[]>([]);
  const timeoutIdsRef = useRef<number[]>([]);

  const scheduleBurst = useCallback((item: EmojiBurstItem) => {
    const addTimer = window.setTimeout(() => {
      setBursts((curr) => [...curr, item]);
      const removeTimer = window.setTimeout(() => {
        setBursts((curr) => curr.filter((b) => b.id !== item.id));
        timeoutIdsRef.current = timeoutIdsRef.current.filter((t) => t !== removeTimer);
      }, item.duration);
      timeoutIdsRef.current.push(removeTimer);
      timeoutIdsRef.current = timeoutIdsRef.current.filter((t) => t !== addTimer);
    }, item.delay);
    timeoutIdsRef.current.push(addTimer);
  }, []);

  useEffect(() => {
    return () => {
      for (const t of timeoutIdsRef.current) window.clearTimeout(t);
      timeoutIdsRef.current = [];
    };
  }, []);

  const triggerEmojiBurst = useCallback(
    (emoji: string, count?: number) => {
      const items = createEmojiBurstCluster(emoji, count);
      for (const item of items) scheduleBurst(item);
    },
    [scheduleBurst],
  );

  const triggerAmenWave = useCallback(
    (emojis: readonly string[], waveCount = 8) => {
      for (let i = 0; i < waveCount; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)] ?? "🙏";
        triggerEmojiBurst(emoji, 1);
      }
    },
    [triggerEmojiBurst],
  );

  return { bursts, triggerEmojiBurst, triggerAmenWave, overlayRef };
}
