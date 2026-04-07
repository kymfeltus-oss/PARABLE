'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { kingdomXpToLevel, readKingdomXp } from '@/lib/kingdom-xp';

type Node = {
  id: string;
  label: string;
  requirement: string;
  unlocked: boolean;
};

const BASE_NODES: Omit<Node, 'unlocked'>[] = [
  {
    id: 'witness',
    label: 'Path of the Witness',
    requirement: 'Levels 1–10 · Testify clips & feed engagement',
  },
  {
    id: 'encourager',
    label: 'The Encourager',
    requirement: 'Level 11+ · 500 followers & 7-day streak → Influencer tools',
  },
  {
    id: 'trial_stream',
    label: 'Trial stream',
    requirement: 'Private huddles (≤5) · high vibe ratings',
  },
  {
    id: 'public_stream',
    label: 'Public access',
    requirement: '10 strong private sessions → Streamer hub',
  },
  {
    id: 'pastor_study',
    label: 'Pastor study unlock',
    requirement: 'Lead 5 outreach ops → Pulpit AI study',
  },
];

export default function GrowthMapPanel({ userId }: { userId: string | undefined }) {
  const [remoteIds, setRemoteIds] = useState<string[] | null>(null);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    setXp(readKingdomXp());
  }, []);

  useEffect(() => {
    if (!userId) {
      setRemoteIds(null);
      return;
    }
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('user_progression')
        .select('unlocked_nodes')
        .eq('user_id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setRemoteIds([]);
        return;
      }
      const raw = (data as { unlocked_nodes?: unknown }).unlocked_nodes;
      if (Array.isArray(raw)) {
        setRemoteIds(raw.filter((x): x is string => typeof x === 'string'));
      } else {
        setRemoteIds([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const { level } = kingdomXpToLevel(xp);

  const nodes: Node[] = BASE_NODES.map((n) => {
    let unlocked = false;
    if (remoteIds?.includes(n.id)) unlocked = true;
    if (n.id === 'witness' && level >= 1) unlocked = true;
    if (n.id === 'encourager' && level >= 11) unlocked = true;
    if (n.id === 'trial_stream' && level >= 3) unlocked = true;
    if (n.id === 'public_stream' && level >= 8) unlocked = true;
    if (n.id === 'pastor_study' && level >= 12) unlocked = true;
    return { ...n, unlocked };
  });

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-gradient-to-b from-violet-950/40 to-black/60 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-300/90">Kingdom path</p>
      <h3 className="mt-2 text-base font-bold text-white">Growth map</h3>
      <p className="mt-1 text-[11px] text-white/45">
        Skill nodes combine Supabase <code className="text-white/55">user_progression.unlocked_nodes</code> with live
        Kingdom XP level. 3D skill tree (drei) can mount here later.
      </p>
      <ul className="mt-4 space-y-2">
        {nodes.map((n) => (
          <li
            key={n.id}
            className={[
              'rounded-xl border px-3 py-2.5',
              n.unlocked
                ? 'border-emerald-500/35 bg-emerald-500/[0.07]'
                : 'border-white/[0.08] bg-black/30 opacity-70',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white">{n.label}</span>
              <span
                className={[
                  'shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider',
                  n.unlocked ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/45',
                ].join(' ')}
              >
                {n.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-white/45">{n.requirement}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
