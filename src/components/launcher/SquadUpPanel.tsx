'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';

type Friend = { id: string; name: string; status: 'in_game' | 'online' | 'idle'; game?: string };

const MOCK_SQUAD: Friend[] = [
  { id: '1', name: 'JORDAN_K', status: 'in_game', game: 'Kingdom Hoops' },
  { id: '2', name: 'MIA_GRACE', status: 'online' },
  { id: '3', name: 'ELI_TRUTH', status: 'idle' },
  { id: '4', name: 'PASTOR_C', status: 'in_game', game: 'Armor Up lobby' },
];

function statusLabel(f: Friend) {
  if (f.status === 'in_game') return f.game ?? 'In game';
  if (f.status === 'online') return 'Online';
  return 'Away';
}

function statusDotClass(f: Friend) {
  if (f.status === 'in_game') return 'bg-emerald-400';
  if (f.status === 'online') return 'bg-[#00f2ff]';
  return 'bg-amber-400';
}

export default function SquadUpPanel() {
  const [toast, setToast] = useState<string | null>(null);

  const invite = (name: string) => {
    setToast(`Lobby invite sent to ${name}`);
    window.setTimeout(() => setToast(null), 2800);
  };

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-black/50 backdrop-blur-md overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Squad up</p>
        <p className="mt-1 text-sm font-semibold text-white">Who&apos;s online</p>
      </div>
      <ul className="divide-y divide-white/[0.06] max-h-[320px] overflow-y-auto">
        {MOCK_SQUAD.map((f) => (
          <li key={f.id} className="px-4 py-3 flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-full border border-white/15 bg-white/[0.06] flex items-center justify-center text-[10px] font-black text-white/50">
                {f.name.slice(0, 2)}
              </div>
              <span
                className={[
                  'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-black',
                  statusDotClass(f),
                ].join(' ')}
                aria-hidden
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{f.name}</p>
              <p className="text-[11px] truncate text-white/55">{statusLabel(f)}</p>
            </div>
            <button
              type="button"
              onClick={() => invite(f.name)}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#00f2ff]/35 bg-[#00f2ff]/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#00f2ff] hover:bg-[#00f2ff]/20 transition-colors"
            >
              <UserPlus size={12} strokeWidth={2} />
              Invite
            </button>
          </li>
        ))}
      </ul>
      {toast ? (
        <div className="px-4 py-2 text-center text-[11px] text-emerald-400/95 bg-emerald-500/10 border-t border-emerald-500/20">
          {toast}
        </div>
      ) : (
        <p className="px-4 py-3 text-[10px] text-white/35 border-t border-white/[0.06]">
          One tap pulls friends into Hoops, Gridiron, or an Armor Up build—party presence matches your hybrid feed.
        </p>
      )}
    </div>
  );
}
