"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { Heart } from "lucide-react";

type FloatHeart = {
  id: string;
  tx: number;
  delay: number;
  rot: number;
};

type PraiseButtonProps = {
  liked: boolean;
  count: number;
  disabled?: boolean;
  /** Fired on tap; parent runs optimistic praise + Supabase. */
  onPraise: () => void;
  /** Brief glow ring after each action (parent can drive). */
  pulse?: boolean;
};

/**
 * Feed praise control: Tailwind “spring” pop on press, count label, and a short CSS-only
 * heart burst (5–10 particles) rising from the button when the user adds praise.
 */
export default function PraiseButton({ liked, count, disabled, onPraise, pulse }: PraiseButtonProps) {
  const likedRef = useRef(liked);
  likedRef.current = liked;

  const [hearts, setHearts] = useState<FloatHeart[] | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spawnBurst = useCallback(() => {
    const n = 5 + Math.floor(Math.random() * 6);
    const next: FloatHeart[] = Array.from({ length: n }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      tx: (Math.random() - 0.5) * 56,
      delay: Math.random() * 0.12,
      rot: (Math.random() - 0.5) * 40,
    }));
    if (clearTimer.current) clearTimeout(clearTimer.current);
    setHearts(next);
    clearTimer.current = setTimeout(() => {
      setHearts(null);
      clearTimer.current = null;
    }, 2050);
  }, []);

  const handleClick = () => {
    if (disabled) return;
    if (!likedRef.current) spawnBurst();
    onPraise();
  };

  return (
    <div className="relative flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-0">
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        aria-pressed={liked}
        aria-label={liked ? "Unlike" : "Praise"}
        className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full p-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform hover:scale-105 active:scale-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
      >
        {pulse && (
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-rose-400/25"
            style={{ animation: "parablePraisePulse 0.45s ease-out" }}
          />
        )}

        {hearts && (
          <span className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
            {hearts.map((h) => (
              <span
                key={h.id}
                className="praise-heart-particle absolute bottom-1/2 left-1/2 text-[11px] leading-none text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.85)]"
                style={
                  {
                    "--tx": `${h.tx}px`,
                    "--rot": `${h.rot}deg`,
                    animationDelay: `${h.delay}s`,
                  } as CSSProperties
                }
              >
                ♥
              </span>
            ))}
          </span>
        )}

        <Heart
          size={24}
          className={`relative z-[1] transition-colors duration-200 ${
            liked ? "fill-red-500 text-red-500" : "text-white hover:text-neutral-400"
          }`}
          strokeWidth={2}
        />
      </button>

      <span className="text-xs font-bold text-white sm:ml-2 sm:text-sm sm:font-normal sm:text-neutral-300">
        {count} <span className="text-neutral-500">{count === 1 ? "praise" : "praises"}</span>
      </span>

      <style jsx>{`
        @keyframes parablePraisePulse {
          0% {
            transform: scale(0.65);
            opacity: 0.85;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        span.praise-heart-particle {
          animation: praiseHeartFloat 2s ease-out forwards;
        }
        @keyframes praiseHeartFloat {
          0% {
            transform: translate(-50%, 0) rotate(0deg) scale(0.45);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx, 0px)), -88px) rotate(var(--rot, 0deg)) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
