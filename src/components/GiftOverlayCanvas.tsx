'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface FloatingParticle {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
}

const GIFT_EMOJI_MAP: Record<string, string> = {
  gift_applause: '👏',
  gift_controller: '🎮',
  gift_trophy: '🏆',
};

const PARTICLE_BURST_COUNT = 12;

function spawnParticleBurst(emoji: string): FloatingParticle[] {
  return Array.from({ length: PARTICLE_BURST_COUNT }, () => ({
    id: crypto.randomUUID(),
    emoji,
    x: 20 + Math.random() * 60,
    y: 100,
    scale: 1 + Math.random() * 1.5,
    speed: 2 + Math.random() * 4,
    opacity: 1,
  }));
}

type GiftOverlayCanvasProps = {
  streamId: string;
  enabled: boolean;
};

export default function GiftOverlayCanvas({ streamId, enabled }: GiftOverlayCanvasProps) {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!enabled || !streamId) {
      setParticles([]);
      return;
    }

    const giftChannel = supabase
      .channel(`realtime-stream-gifts:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_gifts',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          const giftId = (payload.new as { gift_id?: string })?.gift_id;
          if (!giftId) return;

          const { data: gift } = await supabase
            .from('gift_catalog')
            .select('sku')
            .eq('id', giftId)
            .maybeSingle();

          const targetEmoji = GIFT_EMOJI_MAP[gift?.sku ?? ''] ?? '✨';
          setParticles((prev) => [...prev, ...spawnParticleBurst(targetEmoji)]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(giftChannel);
    };
  }, [enabled, streamId, supabase]);

  useEffect(() => {
    if (!enabled || particles.length === 0) return;

    let rafId = 0;
    const tick = () => {
      setParticles((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((p) => ({
            ...p,
            y: p.y - p.speed,
            opacity: p.opacity - 0.015,
          }))
          .filter((p) => p.opacity > 0);
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, particles.length]);

  if (!enabled || particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden select-none">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute font-sans text-3xl transition-transform duration-75 ease-out"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `scale(${p.scale}) translate3d(0,0,0)`,
            opacity: p.opacity,
            textShadow: '0 0 12px rgba(0,0,0,0.8)',
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
