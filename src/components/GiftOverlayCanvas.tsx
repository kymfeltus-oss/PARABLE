'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  AMEN_WORSHIP_EMOJIS,
  emojiForGiftSku,
  emojiForReactionKind,
  type WorshipReactionKind,
} from '@/lib/worship-reactions';
import {
  AMEN_REACTION_EVENT,
  WORSHIP_REACTION_EVENT,
  streamInteractionChannelName,
} from '@/lib/stream-interactions';

interface FloatingParticle {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
}

const PARTICLE_BURST_COUNT = 12;

const AMEN_WAVE_COUNT = 8;

function spawnAmenWave(): FloatingParticle[] {
  return Array.from({ length: AMEN_WAVE_COUNT }, () => ({
    id: crypto.randomUUID(),
    emoji: AMEN_WORSHIP_EMOJIS[Math.floor(Math.random() * AMEN_WORSHIP_EMOJIS.length)]!,
    x: 10 + Math.random() * 80,
    y: 90,
    scale: 1.2 + Math.random() * 1.8,
    speed: 1.5 + Math.random() * 3,
    opacity: 0.9,
  }));
}

function spawnParticleBurst(emoji: string): FloatingParticle[] {
  return Array.from({ length: PARTICLE_BURST_COUNT }, () => ({
    id: crypto.randomUUID(),
    emoji,
    x: 28 + Math.random() * 44,
    y: 100,
    scale: 1 + Math.random() * 1.5,
    speed: 2 + Math.random() * 4,
    opacity: 1,
  }));
}

type GiftOverlayCanvasProps = {
  streamId: string;
  enabled: boolean;
  /** Keep particle animations inside the 16:9 player box (mobile watch). */
  clipToPlayer?: boolean;
};

export default function GiftOverlayCanvas({
  streamId,
  enabled,
  clipToPlayer = false,
}: GiftOverlayCanvasProps) {
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

          const targetEmoji = emojiForGiftSku(gift?.sku);
          setParticles((prev) => [...prev, ...spawnParticleBurst(targetEmoji)]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(giftChannel);
    };
  }, [enabled, streamId, supabase]);

  useEffect(() => {
    if (!enabled || !streamId) return;

    const interactionChannel = supabase
      .channel(streamInteractionChannelName(streamId))
      .on('broadcast', { event: AMEN_REACTION_EVENT }, () => {
        setParticles((prev) => [...prev, ...spawnAmenWave()]);
      })
      .on(
        'broadcast',
        { event: WORSHIP_REACTION_EVENT },
        ({ payload }) => {
          const p = payload as { kind?: WorshipReactionKind; emoji?: string } | undefined;
          const emoji =
            p?.emoji ??
            (p?.kind ? emojiForReactionKind(p.kind) : "✨");
          if (p?.kind === "amen") {
            setParticles((prev) => [...prev, ...spawnAmenWave()]);
            return;
          }
          setParticles((prev) => [...prev, ...spawnParticleBurst(emoji)]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(interactionChannel);
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
    <div
      className={[
        "pointer-events-none absolute inset-0 z-30 select-none",
        clipToPlayer ? "overflow-hidden" : "overflow-hidden",
      ].join(" ")}
    >
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
