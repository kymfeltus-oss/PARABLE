'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellOff,
  ChevronDown,
  ChevronRight,
  Radio,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import type { SanctuaryChannel } from '@/lib/sanctuary-following';
import { loadNotifChannelIds, saveNotifChannelIds } from '@/lib/sanctuary-following';
import {
  ChannelAvatar,
  SanctuaryDiscoverSection,
  getDiscoverSuggestionCount,
} from '@/components/sanctuary/SanctuaryDiscoverSection';

type Props = {
  allChannels: SanctuaryChannel[];
  followingIds: string[];
  /** Real profiles from Supabase (same user excluded server-side) */
  registeredSuggestions?: SanctuaryChannel[];
  registeredLoading?: boolean;
  registeredError?: string | null;
  onToggleFollow: (id: string) => void;
  onAddCustom: (name: string, handle: string) => void;
  onRemoveCustomChannel: (id: string) => void;
  onOpenStreamers: () => void;
};

export function SanctuaryFollowingPanel({
  allChannels,
  followingIds,
  registeredSuggestions = [],
  registeredLoading = false,
  registeredError = null,
  onToggleFollow,
  onAddCustom,
  onRemoveCustomChannel,
  onOpenStreamers,
}: Props) {
  const [mode, setMode] = useState<'following' | 'discover'>('following');
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [notifIds, setNotifIds] = useState<string[]>([]);

  useEffect(() => {
    setNotifIds(loadNotifChannelIds());
  }, []);

  const followedAccounts = useMemo(
    () => allChannels.filter((c) => followingIds.includes(c.id)),
    [allChannels, followingIds]
  );

  const liveFollowed = useMemo(() => followedAccounts.filter((c) => c.isLive), [followedAccounts]);

  const filteredFollowing = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return followedAccounts;
    return followedAccounts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.avatarLabel.toLowerCase().includes(q)
    );
  }, [followedAccounts, query]);

  const discoverTotalCount = useMemo(
    () => getDiscoverSuggestionCount(followingIds, registeredSuggestions),
    [followingIds, registeredSuggestions]
  );

  const toggleNotif = (id: string) => {
    setNotifIds((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      saveNotifChannelIds(next);
      return next;
    });
  };

  const submitAdd = () => {
    const name = newName.trim();
    const handle = newHandle.trim();
    if (!name || !handle) return;
    onAddCustom(name, handle);
    setNewName('');
    setNewHandle('');
    setShowAdd(false);
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-black/40 overflow-hidden shadow-[0_0_40px_rgba(0,242,255,0.06)]">
      {/* Stats — Twitch / IG style */}
      <div className="grid grid-cols-3 gap-px bg-white/10 border-b border-white/10">
        <div className="bg-black/50 px-3 py-3 text-center">
          <p className="text-lg font-black text-white tabular-nums">{followingIds.length}</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">Following</p>
        </div>
        <div className="bg-black/50 px-3 py-3 text-center">
          <p className="text-lg font-black text-emerald-400 tabular-nums flex items-center justify-center gap-1">
            <Radio className="h-4 w-4 animate-pulse" />
            {liveFollowed.length}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">Live now</p>
        </div>
        <button
          type="button"
          onClick={() => setMode('discover')}
          className="bg-black/50 px-3 py-3 text-center hover:bg-white/5 transition-colors"
        >
          <p className="text-lg font-black text-[#00f2ff] tabular-nums">{discoverTotalCount}</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#00f2ff]/70">Discover</p>
        </button>
      </div>

      {/* Stories strip — Instagram-style */}
      {followedAccounts.length > 0 && (
        <div className="border-b border-white/10 bg-black/30 px-3 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-3 px-1">
            Live & stories
          </p>
          <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
            {followedAccounts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => (c.isLive ? onOpenStreamers() : undefined)}
                className="flex flex-col items-center gap-1.5 shrink-0 min-w-[64px] group"
              >
                <div
                  className={`relative rounded-full p-[2px] ${
                    c.isLive
                      ? 'bg-gradient-to-tr from-fuchsia-500 via-orange-400 to-[#00f2ff]'
                      : 'bg-white/20'
                  }`}
                >
                  <div className="h-14 w-14 rounded-full bg-black border-2 border-black overflow-hidden">
                    <ChannelAvatar c={c} className="h-full w-full rounded-full border-0" />
                  </div>
                  {c.isLive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-lg">
                      LIVE
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-white/80 truncate max-w-[76px] group-hover:text-[#00f2ff] transition-colors text-center leading-tight">
                  {c.name}
                </span>
                <span className="text-[9px] text-white/40 truncate max-w-[76px] text-center">
                  {c.handle}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex p-1.5 gap-1 bg-black/40 border-b border-white/10">
        <button
          type="button"
          onClick={() => setMode('following')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
            mode === 'following'
              ? 'bg-[#00f2ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.35)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Following
        </button>
        <button
          type="button"
          onClick={() => setMode('discover')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
            mode === 'discover'
              ? 'bg-[#00f2ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.35)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Discover
        </button>
      </div>

      <div className="p-4 space-y-4">
        {mode === 'following' && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people & channels"
                className="w-full rounded-xl bg-black/60 border border-white/15 pl-10 pr-3 py-2.5 text-sm outline-none focus:border-[#00f2ff]/50 placeholder:text-white/30"
              />
            </div>

            {followedAccounts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/40 p-6 text-center">
                <Users className="h-10 w-10 text-[#00f2ff]/40 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">Your feed is empty</p>
                <p className="text-xs text-white/50 mt-1 mb-4">
                  Follow creators and ministries to see them here — like Twitch subs or IG follows.
                </p>
                <button
                  type="button"
                  onClick={() => setMode('discover')}
                  className="rounded-full bg-[#00f2ff] px-5 py-2 text-xs font-black uppercase tracking-wider text-black"
                >
                  Discover channels
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredFollowing.map((c) => {
                  const notifOn = notifIds.includes(c.id);
                  const isCustom = c.id.startsWith('custom-');
                  return (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/50 p-3 hover:border-[#00f2ff]/25 transition-colors"
                    >
                      <div className="relative shrink-0">
                        <ChannelAvatar c={c} className="h-11 w-11 rounded-full" />
                        {c.isLive && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-black animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{c.name}</p>
                        <p className="text-xs text-white/45 truncate">{c.handle}</p>
                        <p className="text-[10px] text-emerald-400/90 mt-0.5">
                          {c.isLive
                            ? `${c.viewers} watching`
                            : c.source === 'registered'
                              ? 'On Parable'
                              : 'Offline'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleNotif(c.id)}
                            title={notifOn ? 'Mute notifications' : 'Notify when live'}
                            className={`rounded-lg p-2 border transition-colors ${
                              notifOn
                                ? 'border-[#00f2ff]/40 bg-[#00f2ff]/10 text-[#00f2ff]'
                                : 'border-white/10 bg-white/5 text-white/40 hover:text-white/70'
                            }`}
                          >
                            {notifOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                          </button>
                          {isCustom && (
                            <button
                              type="button"
                              title="Remove channel"
                              onClick={() => onRemoveCustomChannel(c.id)}
                              className="rounded-lg p-2 border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="group relative">
                          <button
                            type="button"
                            onClick={() => onToggleFollow(c.id)}
                            className="min-w-[104px] rounded-full border px-4 py-1.5 text-xs font-bold transition-all border-white/25 bg-white/10 text-white hover:border-red-400/50 hover:bg-red-500/15 hover:text-red-200"
                          >
                            <span className="group-hover:hidden">Following</span>
                            <span className="hidden group-hover:inline">Unfollow</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Add channel — collapsible */}
            <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdd((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-[#00f2ff]" />
                  Add channel manually
                </span>
                {showAdd ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {showAdd && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t border-white/10">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Channel name"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-sm outline-none focus:border-[#00f2ff]/50"
                  />
                  <input
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    placeholder="@handle"
                    className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-sm outline-none focus:border-[#00f2ff]/50"
                  />
                  <button
                    type="button"
                    onClick={submitAdd}
                    className="w-full rounded-full bg-[#00f2ff] py-2.5 text-xs font-black uppercase tracking-wider text-black"
                  >
                    Follow channel
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'discover' && (
          <SanctuaryDiscoverSection
            followingIds={followingIds}
            registeredSuggestions={registeredSuggestions}
            registeredLoading={registeredLoading}
            registeredError={registeredError}
            onToggleFollow={onToggleFollow}
            onOpenStreamers={onOpenStreamers}
          />
        )}
      </div>
    </section>
  );
}
