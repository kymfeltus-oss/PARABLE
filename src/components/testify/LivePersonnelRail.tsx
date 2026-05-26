'use client';

import { Headphones, Radio, Users, Mic2, Compass, Flame } from 'lucide-react';
import {
  type PersonnelCluster,
  type PresenceActivity,
  type PresenceKind,
  type PresencePulse,
  presenceStatusTag,
} from '@/hooks/useActivityPulse';

function pulseForKind(kind: PresenceKind): PresencePulse {
  if (kind === 'huddle') return 'pink';
  if (kind === 'browsing') return 'purple';
  return 'cyan';
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function pulseClasses(pulse: PresencePulse) {
  switch (pulse) {
    case 'cyan':
      return 'shadow-[0_0_14px_3px_rgba(34,211,238,0.55)] ring-2 ring-cyan-400/90 ring-offset-2 ring-offset-[#06060a]';
    case 'pink':
      return 'shadow-[0_0_14px_3px_rgba(244,114,182,0.55)] ring-2 ring-pink-400/85 ring-offset-2 ring-offset-[#06060a]';
    default:
      return 'shadow-[0_0_12px_2px_rgba(168,85,247,0.5)] ring-2 ring-purple-400/75 ring-offset-2 ring-offset-[#06060a]';
  }
}

function KindIcon({ kind }: { kind: PresenceActivity['kind'] }) {
  const cls = 'h-3.5 w-3.5 shrink-0';
  if (kind === 'listening') return <Headphones className={`${cls} text-cyan-300`} />;
  if (kind === 'watching') return <Radio className={`${cls} text-cyan-300`} />;
  if (kind === 'huddle') return <Mic2 className={`${cls} text-pink-300`} />;
  return <Compass className={`${cls} text-purple-300`} />;
}

type Props = {
  clusters: PersonnelCluster[];
  onJoinMember: (row: PresenceActivity) => void;
  onOpenFullPulse: () => void;
  onlineCount: number;
  /** Daily streak days — drives community flame intensity (0–14+ maps to bar). */
  streakFlame?: number;
  /** `sidebar` = vertical stack for left column; `rail` = horizontal scroll strip */
  variant?: 'sidebar' | 'rail';
};

export function LivePersonnelRail({
  clusters,
  onJoinMember,
  onOpenFullPulse,
  onlineCount,
  streakFlame,
  variant = 'rail',
}: Props) {
  const isSidebar = variant === 'sidebar';
  const flamePct =
    typeof streakFlame === 'number' && streakFlame >= 0
      ? Math.min(100, Math.round((streakFlame / 14) * 100))
      : null;

  return (
    <section
      className={`rounded-2xl border border-[#00f2ff]/25 bg-gradient-to-b from-[#0a1218] via-[#07070c] to-black/80 overflow-hidden shadow-[0_0_32px_rgba(0,242,255,0.12)] ${isSidebar ? 'lg:h-fit' : ''}`}
      aria-label="Live personnel lobby"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#00f2ff] truncate">
              Live personnel
            </p>
            <p className="text-[10px] text-white/45 truncate">
              <span className="text-cyan-300/90 tabular-nums font-semibold">{onlineCount}</span> online ·
              {isSidebar ? ' presence rail' : ' scroll'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenFullPulse}
          className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-[#00f2ff] px-2 py-1.5 rounded-lg border border-white/10 hover:border-[#00f2ff]/40 transition-colors"
        >
          Pulse
        </button>
      </div>

      {flamePct !== null ? (
        <div className="px-3 py-2.5 border-b border-white/10 bg-gradient-to-r from-orange-950/40 to-black/40">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-200/90">
              Community streak
            </span>
            <Flame
              className="h-4 w-4 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.7)]"
              aria-hidden
            />
          </div>
          <div className="h-2 rounded-full bg-black/60 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-700 shadow-[0_0_14px_rgba(251,146,60,0.55)]"
              style={{ width: `${flamePct}%` }}
            />
          </div>
          <p className="text-[9px] text-white/40 mt-1.5 tabular-nums">
            Your run: {streakFlame} day{streakFlame === 1 ? '' : 's'} · bar fills as more people stay on-discovery
          </p>
        </div>
      ) : null}

      <div className="px-2 py-3">
        {clusters.length === 0 ? (
          <p className="text-center text-xs text-white/45 py-8 px-4 leading-relaxed">
            No live personnel yet — follow friends and add a video post so Watch along can sync.
          </p>
        ) : null}
        <div
          className={
            isSidebar
              ? 'flex flex-col gap-2.5 max-h-[min(72vh,calc(100vh-6.5rem))] overflow-y-auto overflow-x-hidden pr-0.5 scrollbar-hide'
              : 'flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory'
          }
        >
          {clusters.map((cluster) => {
            const n = cluster.members.length;
            const lead = cluster.members[0];

            const joinStream = cluster.members.find(
              (m) => m.joinMediaUrl && (m.kind === 'watching' || m.kind === 'listening')
            );
            const huddleMember = cluster.members.find((m) => m.kind === 'huddle');

            return (
              <div
                key={cluster.clusterKey}
                className={
                  isSidebar
                    ? 'w-full rounded-xl border border-white/10 bg-black/50 hover:border-[#00f2ff]/35 transition-colors shrink-0'
                    : 'snap-start shrink-0 w-[148px] sm:w-[168px] rounded-xl border border-white/10 bg-black/50 hover:border-[#00f2ff]/35 transition-colors'
                }
              >
                <div className="p-2.5">
                  <div className="flex items-center justify-center min-h-[52px]">
                    <div className="flex items-center -space-x-3 pl-2">
                      {cluster.members.slice(0, 4).map((m, idx) => (
                        <div
                          key={m.id}
                          style={{ zIndex: 10 - idx }}
                          className={`relative rounded-full bg-gradient-to-br from-[#1a2a32] to-[#0d1117] w-11 h-11 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#06060a] ${pulseClasses(pulseForKind(m.kind))}`}
                          title={presenceStatusTag(m)}
                        >
                          {initials(m.displayName)}
                        </div>
                      ))}
                      {n > 4 ? (
                        <div
                          style={{ zIndex: 0 }}
                          className="w-11 h-11 rounded-full bg-white/10 border-2 border-[#06060a] flex items-center justify-center text-[10px] font-bold text-white/80"
                        >
                          +{n - 4}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-2 flex items-start gap-1.5">
                    <KindIcon kind={lead.kind} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-white/90 leading-tight line-clamp-2">
                        {n > 1 ? (
                          <>
                            <span className="text-cyan-300 tabular-nums">{n}</span>{' '}
                            <span className="text-white/70">in this room</span>
                          </>
                        ) : (
                          <span className="text-white">{lead.displayName}</span>
                        )}
                      </p>
                      <p className="text-[9px] text-[#00f2ff]/85 mt-0.5 line-clamp-3 leading-snug">
                        {cluster.sharedStatus}
                      </p>
                    </div>
                  </div>

                  {n > 1 ? (
                    <p className="mt-1.5 text-[8px] uppercase tracking-wider text-white/35 flex items-center gap-1">
                      <Users className="h-3 w-3 shrink-0" />
                      Strength in numbers
                    </p>
                  ) : null}
                </div>

                <div className="border-t border-white/10 bg-black/60 px-2 py-2">
                  {joinStream ? (
                    <button
                      type="button"
                      onClick={() => onJoinMember(joinStream)}
                      className="w-full py-2 rounded-lg bg-cyan-500/25 border border-cyan-400/45 text-[10px] font-black uppercase tracking-wide text-cyan-100 hover:bg-cyan-500/35"
                    >
                      {joinStream.kind === 'listening' ? 'Listen along' : 'Watch along'}
                    </button>
                  ) : huddleMember ? (
                    <button
                      type="button"
                      onClick={() => onJoinMember(huddleMember)}
                      className="w-full py-2 rounded-lg bg-pink-500/25 border border-pink-400/45 text-[10px] font-black uppercase tracking-wide text-pink-100 hover:bg-pink-500/35"
                    >
                      Join huddle
                    </button>
                  ) : (
                    <p className="text-[9px] text-center text-white/40 py-1.5 leading-snug">
                      Browsing — say hi when DMs ship
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-white/35 text-center mt-2 px-2 leading-relaxed">
          {isSidebar
            ? 'Neon = listening / watching · purple = browsing · pink = huddle. Watch along on each card. Full graph: Pulse.'
            : 'Neon rings = listening / watching · purple = browsing · pink = huddle. Full graph: Pulse.'}
        </p>
      </div>
    </section>
  );
}
