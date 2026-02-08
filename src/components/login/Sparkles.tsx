"use client";

import { useMemo } from "react";

function frac(n: number) {
  return n - Math.floor(n);
}
function prand(seed: number) {
  return frac(Math.sin(seed * 9999.123) * 10000);
}
function pct(n01: number, digits = 4) {
  return `${(n01 * 100).toFixed(digits)}%`;
}
function f(n: number, digits = 4) {
  return Number(n.toFixed(digits));
}

export default function Sparkles() {
  // deterministic sparkles (SSR-safe) + show instantly
  const sparkles = useMemo(() => {
    const count = 64;
    return Array.from({ length: count }).map((_, i) => {
      const r1 = prand(i + 1);
      const r2 = prand(i + 101);
      const r3 = prand(i + 1001);
      const r4 = prand(i + 2001);
      const r5 = prand(i + 3001);

      const size = Math.max(1, Math.round(1 + r4 * 2)); // 1..3px
      const opacity = f(0.22 + r5 * 0.62, 6);
      const dur = f(4.2 + r3 * 3.6, 6);
      const delay = f(r2 * 2.2, 6);

      return {
        id: i,
        left: pct(r1, 4),
        top: pct(r2, 4),
        size,
        opacity,
        dur,
        delay,
      };
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.9)]"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `sparkleFloat ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes sparkleFloat {
          0% {
            transform: translate3d(0, 0, 0) scale(0.75);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: translate3d(0, -18px, 0) scale(1.25);
          }
          100% {
            transform: translate3d(0, -40px, 0) scale(0.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
