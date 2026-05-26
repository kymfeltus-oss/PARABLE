'use client';

import { Gamepad2 } from 'lucide-react';
import { useGamepadConnected } from '@/hooks/useGamepadConnected';

export default function ControllerStatusPill() {
  const connected = useGamepadConnected();

  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest',
        connected
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
          : 'border-white/12 bg-white/[0.04] text-white/45',
      ].join(' ')}
    >
      <Gamepad2 size={14} strokeWidth={1.25} />
      {connected ? 'Controller detected' : 'No controller · touch ready'}
    </div>
  );
}
