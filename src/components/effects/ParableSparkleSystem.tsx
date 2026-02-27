'use client';

import React, { useEffect, useMemo, useState } from 'react';

type DustParticle = {
  id: number;
  size: number;
  x: number;
  y: number;
  opacity: number;
  blur: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
};

type Twinkle = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
};

type Burst = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
};

export function ParableSparkleSystem() {
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(Boolean(mq?.matches));
    update();

    if (mq?.addEventListener) mq.addEventListener('change', update);
    else mq?.addListener?.(update);

    return () => {
      if (mq?.removeEventListener) mq.removeEventListener('change', update);
      else mq?.removeListener?.(update);
    };
  }, []);

  const particles = useMemo(() => {
    const colors = ['#00f2ff', '#8b5cf6', '#ffffff'];

    const dust: DustParticle[] = Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.25 + 0.12;
      const blur = Math.random() * 4 + 2;
      const duration = Math.random() * 8 + 6;
      const delay = Math.random() * 6;
      const driftX = (Math.random() - 0.5) * 30;
      const driftY = -1 * (Math.random() * 50 + 20);

      return {
        id: i,
        size,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity,
        blur,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration,
        delay,
        driftX,
        driftY,
      };
    });

    const twinkles: Twinkle[] = Array.from({ length: 5 }).map((_, i) => {
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 8,
        delay: Math.random() * 6,
        duration: Math.random() * 1.5 + 2.2,
        rotation: Math.random() * 30 - 15,
      };
    });

    const bursts: Burst[] = Array.from({ length: 6 }).map((_, i) => {
      const centerBiasX = 50 + (Math.random() - 0.5) * 40;
      const centerBiasY = 18 + (Math.random() - 0.5) * 24;

      return {
        id: i,
        x: Math.max(0, Math.min(100, centerBiasX)),
        y: Math.max(0, Math.min(100, centerBiasY)),
        size: Math.random() * 18 + 14,
        delay: Math.random() * 5,
        duration: Math.random() * 0.6 + 1.0,
      };
    });

    return { dust, twinkles, bursts };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.dust.map((p) => (
        <div
          key={`dust-${p.id}`}
          className="absolute rounded-full mix-blend-screen will-change-transform"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            opacity: p.opacity,
            filter: `blur(${p.blur}px)`,
            transform: 'translate3d(0,0,0)',
            animation: reduceMotion ? 'none' : `drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
            ['--dx' as any]: `${p.driftX}px`,
            ['--dy' as any]: `${p.driftY}px`,
          }}
        />
      ))}

      {particles.bursts.map((b) => (
        <div
          key={`burst-${b.id}`}
          className="absolute opacity-0 mix-blend-screen will-change-transform"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            transform: 'translate3d(-50%,-50%,0)',
            animation: reduceMotion ? 'none' : `burst ${b.duration}s ease-in-out ${b.delay}s infinite`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,242,255,0.55) 35%, rgba(0,242,255,0) 70%)',
              filter: 'blur(0.5px)',
            }}
          />
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: '120%',
              height: '2px',
              transform: 'translate3d(-50%,-50%,0)',
              background: 'rgba(0,242,255,0.65)',
              filter: 'blur(1px)',
            }}
          />
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: '2px',
              height: '120%',
              transform: 'translate3d(-50%,-50%,0)',
              background: 'rgba(0,242,255,0.65)',
              filter: 'blur(1px)',
            }}
          />
        </div>
      ))}

      {particles.twinkles.map((t) => (
        <div
          key={`twinkle-${t.id}`}
          className="absolute opacity-0 mix-blend-screen will-change-transform"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: `${t.size}px`,
            height: `${t.size}px`,
            transform: `translate3d(-50%,-50%,0) rotate(${t.rotation}deg)`,
            animation: reduceMotion ? 'none' : `twinkle ${t.duration}s ease-in-out ${t.delay}s infinite`,
          }}
        >
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: '100%',
              height: '1px',
              transform: 'translate3d(-50%,-50%,0)',
              background: 'rgba(0,242,255,0.7)',
              filter: 'blur(1px)',
            }}
          />
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: '1px',
              height: '100%',
              transform: 'translate3d(-50%,-50%,0)',
              background: 'rgba(0,242,255,0.7)',
              filter: 'blur(1px)',
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: '3px',
              height: '3px',
              transform: 'translate3d(-50%,-50%,0)',
              background: '#ffffff',
              boxShadow: '0 0 10px rgba(0,242,255,0.8)',
            }}
          />
        </div>
      ))}

      <div
        className="absolute top-1/4 -left-full w-full h-[2px] will-change-transform mix-blend-screen"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0), rgba(0,242,255,0.18), rgba(0,0,0,0))',
          filter: 'blur(0.5px)',
          transform: 'skewX(-45deg) translate3d(0,0,0)',
          animation: reduceMotion ? 'none' : 'sweep 4s cubic-bezier(0.4, 0, 0.2, 1) 0s infinite',
        }}
      />

      <style jsx>{`
        @keyframes drift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(var(--dx), var(--dy), 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes twinkle {
          0% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) scale(0.55) rotate(0deg);
          }
          45% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) scale(0.7) rotate(10deg);
          }
          60% {
            opacity: 0.85;
            transform: translate3d(-50%, -50%, 0) scale(1.05) rotate(45deg);
          }
          100% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) scale(0.6) rotate(70deg);
          }
        }

        @keyframes burst {
          0% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) scale(0.4);
          }
          35% {
            opacity: 0.95;
            transform: translate3d(-50%, -50%, 0) scale(1.08);
          }
          100% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) scale(0.7);
          }
        }

        @keyframes sweep {
          0% {
            transform: skewX(-45deg) translate3d(0, 0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: skewX(-45deg) translate3d(240%, 0, 0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}