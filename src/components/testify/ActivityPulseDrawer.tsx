'use client';

import { X, Radio, Headphones, Users, Sparkles, Mic2, Compass } from 'lucide-react';
import { presenceStatusTag, type PresenceActivity, type TopicCloudItem } from '@/hooks/useActivityPulse';

type Props = {
  open: boolean;
  onClose: () => void;
  vibeDisplay: string;
  vibeFillPercent: number;
  presence: PresenceActivity[];
  topicCloud: TopicCloudItem[];
  onJoin: (row: PresenceActivity) => void;
  onStatusMessage: (msg: string) => void;
};

export function ActivityPulseDrawer({
  open,
  onClose,
  vibeDisplay,
  vibeFillPercent,
  presence,
  topicCloud,
  onJoin,
  onStatusMessage,
}: Props) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm sm:bg-black/40"
        aria-label="Close activity pulse"
        onClick={onClose}
      />
      <aside
        className="fixed z-[60] inset-x-0 bottom-0 top-[22%] sm:top-0 sm:right-0 sm:left-auto sm:w-[min(100%,380px)] sm:h-full rounded-t-3xl sm:rounded-none border border-white/10 bg-[#07070c]/95 backdrop-blur-xl shadow-[0_-12px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
        aria-label="Live social graph"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#00f2ff] flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              Activity Pulse
            </p>
            <p className="text-[11px] text-white/45 mt-0.5 truncate">Live momentum · your graph</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-white/15 text-white/70 hover:bg-white/10 shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-8 scrollbar-hide">
          <div className="rounded-2xl border border-[#00f2ff]/25 bg-gradient-to-br from-[#00f2ff]/12 to-fuchsia-500/5 p-4">
            <p className="text-[9px] font-black uppercase tracking-[8px] text-white/50">Vibe meter</p>
            <p className="text-lg font-black text-white mt-2 leading-tight">
              <span className="text-[#00f2ff] tabular-nums">{vibeDisplay}</span>{' '}
              <span className="text-white/80 text-base font-bold">people</span>
            </p>
            <p className="text-xs text-white/55 mt-1">
              feeling <span className="text-lg align-middle">🙏</span> · <span className="text-lg align-middle">🔥</span>{' '}
              across Parable right now (live aggregate demo).
            </p>
            <div className="mt-3 h-2 rounded-full bg-black/50 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#00f2ff] via-cyan-300 to-fuchsia-400 transition-all duration-700"
                style={{ width: `${vibeFillPercent}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[8px] text-white/45 mb-3 flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Presence
            </p>
            <ul className="space-y-2">
              {presence.map((row) => (
                <li
                  key={row.id}
                  className={`rounded-xl border px-3 py-3 flex flex-col gap-2 ${
                    row.isFriend
                      ? 'border-[#00f2ff]/30 bg-[#00f2ff]/8'
                      : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-[#00f2ff]">
                      {row.kind === 'listening' ? (
                        <Headphones className="h-4 w-4" />
                      ) : row.kind === 'watching' ? (
                        <Radio className="h-4 w-4" />
                      ) : row.kind === 'huddle' ? (
                        <Mic2 className="h-4 w-4 text-pink-400" />
                      ) : (
                        <Compass className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-[13px] text-white/90 leading-snug flex-1">
                      <span className="font-bold text-white">{row.displayName}</span>
                      <span className="text-white/55"> · </span>
                      <span className="text-[#00f2ff]/90 font-medium">{presenceStatusTag(row)}</span>
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onJoin(row);
                        onStatusMessage(`Joined ${row.displayName} — playback sync (demo).`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-bold hover:bg-[#00f2ff] transition-colors"
                    >
                      Join them
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[8px] text-white/45 mb-3">
              Trending topics
            </p>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 min-h-[120px] flex flex-wrap items-center justify-center gap-x-3 gap-y-2 content-center">
              {topicCloud.map((t) => (
                <span
                  key={t.word}
                  className="text-white/90 font-bold hover:text-[#00f2ff] transition-colors cursor-default"
                  style={{
                    fontSize: `${Math.min(22, 11 + t.weight * 1.4)}px`,
                    opacity: 0.35 + Math.min(0.55, t.weight * 0.06),
                  }}
                >
                  {t.word}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-white/35 mt-2 uppercase tracking-wider">
              Word cloud updates from feed tags & prompts (realtime wiring = Supabase later).
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
