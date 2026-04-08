'use client';

import { Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SparkleOverlay from '@/components/SparkleOverlay';
import type { SanctuaryChannel } from '@/lib/sanctuary-following';
import { useRegisteredProfileSuggestions } from '@/hooks/useRegisteredProfileSuggestions';
import { useSanctuaryFollowGraph } from '@/hooks/useSanctuaryFollowGraph';
import { SanctuaryDiscoverSection } from '@/components/sanctuary/SanctuaryDiscoverSection';

type FollowingPageTab = 'browse' | 'discover';

function FollowingPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageTab: FollowingPageTab =
    searchParams.get('tab') === 'discover' ? 'discover' : 'browse';

  const setPageTab = (tab: FollowingPageTab) => {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };
  const { registeredChannels, registeredLoading, registeredError } = useRegisteredProfileSuggestions();
  const {
    followingIds,
    updateFollowingIds,
    customFollowers,
    updateCustomFollowers,
    allFollowers,
  } = useSanctuaryFollowGraph(registeredChannels);
  const [newFollowerName, setNewFollowerName] = useState('');
  const [newFollowerHandle, setNewFollowerHandle] = useState('');
  const [search, setSearch] = useState('');

  const filteredFollowers = useMemo(
    () =>
      allFollowers.filter((f) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          f.name.toLowerCase().includes(q) ||
          f.handle.toLowerCase().includes(q) ||
          f.avatarLabel.toLowerCase().includes(q)
        );
      }),
    [allFollowers, search]
  );

  const handleToggleFollow = (id: string) => {
    updateFollowingIds((current) =>
      current.includes(id) ? current.filter((fId) => fId !== id) : [...current, id]
    );
  };

  const handleAddFollower = () => {
    const name = newFollowerName.trim();
    const handle = newFollowerHandle.trim();
    if (!name || !handle) return;

    const id = `custom-${Date.now()}`;
    const avatarLabel = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const follower: SanctuaryChannel = {
      id,
      name,
      handle,
      avatarLabel,
      isLive: false,
      viewers: '0',
    };

    const nextCustom = [...customFollowers, follower];
    updateCustomFollowers(nextCustom);

    setNewFollowerName('');
    setNewFollowerHandle('');
    updateFollowingIds((cur) => [...cur, id]);
  };

  return (
    <main className="min-h-screen bg-[#010101] text-white relative overflow-hidden">
      <SparkleOverlay />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-full space-y-6 px-4 py-8 sm:px-4">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[6px] text-[#00f2ff]/70">
              Sanctuary // Following
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Your circle
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-white/60 max-w-xl">
              Search everyone, or open <strong className="text-white/80">Discover</strong> for people on
              Parable plus featured channels.
            </p>
          </div>
        </header>

        <div className="inline-flex rounded-full bg-white/5 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setPageTab('browse')}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              pageTab === 'browse'
                ? 'bg-[#00f2ff] text-black shadow-[0_0_16px_rgba(0,242,255,0.35)]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Browse all
          </button>
          <button
            type="button"
            onClick={() => setPageTab('discover')}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              pageTab === 'discover'
                ? 'bg-[#00f2ff] text-black shadow-[0_0_16px_rgba(0,242,255,0.35)]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Discover
          </button>
        </div>

        {pageTab === 'discover' && (
          <section className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-md p-4 sm:p-6 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#00f2ff]/80">Discover</p>
              <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-white">
                Suggested follows
              </h2>
              <p className="mt-1 text-xs text-white/50">
                Same lists as My Sanctuary → Following → Discover. Follow anyone to add them to your
                circle and search them under Browse all.
              </p>
            </div>
            <SanctuaryDiscoverSection
              followingIds={followingIds}
              registeredSuggestions={registeredChannels}
              registeredLoading={registeredLoading}
              registeredError={registeredError}
              onToggleFollow={handleToggleFollow}
              onOpenStreamers={() => router.push('/streamers')}
              showIntro={false}
            />
          </section>
        )}

        {pageTab === 'browse' && (
        <section className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-md p-4 sm:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or @handle"
                className="w-full rounded-full bg-black/70 border border-white/20 px-4 py-2 text-xs sm:text-sm outline-none focus:border-[#00f2ff]/70"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-[11px] text-white/45">
              <span>
                Following: <strong>{followingIds.length}</strong>
              </span>
              <span>
                Total channels: <strong>{allFollowers.length}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[4px] text-white/40">
              Add new channel
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={newFollowerName}
                onChange={(e) => setNewFollowerName(e.target.value)}
                placeholder="Display name (e.g. Sanctuary Media)"
                className="flex-1 rounded-full bg-black/70 border border-white/20 px-3 py-2 text-xs outline-none focus:border-[#00f2ff]/70"
              />
              <input
                value={newFollowerHandle}
                onChange={(e) => setNewFollowerHandle(e.target.value)}
                placeholder="@handle"
                className="flex-1 rounded-full bg-black/70 border border-white/20 px-3 py-2 text-xs outline-none focus:border-[#00f2ff]/70"
              />
              <button
                onClick={handleAddFollower}
                className="rounded-full bg-[#00f2ff] px-4 py-2 text-[11px] font-black uppercase tracking-[2px] text-black hover:bg-[#4df7ff]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <p className="text-[11px] uppercase tracking-[4px] text-white/40">
              Channels
            </p>

            {filteredFollowers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 bg-black/60 p-4 text-xs text-white/50 text-center">
                No channels match your search yet. Try a different name or add a new follower
                above.
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredFollowers.map((account) => {
                  const isFollowing = followingIds.includes(account.id);
                  return (
                    <article
                      key={account.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-[2px]">
                          {account.avatarLabel}
                        </div>
                        <div>
                          <p className="text-xs font-semibold leading-tight">
                            {account.name}
                          </p>
                          <p className="text-[11px] text-white/45">{account.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        {account.isLive && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            {account.viewers}
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleFollow(account.id)}
                          className={`px-3 py-1 rounded-full font-semibold border ${
                            isFollowing
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-[#00f2ff]/40 bg-[#00f2ff]/10 text-[#00f2ff]'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/my-sanctuary')}
            className="mt-4 text-[11px] text-[#00f2ff] hover:underline"
          >
            Back to My Sanctuary
          </button>
        </section>
        )}
      </div>
    </main>
  );
}

export default function FollowingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#010101] text-white">
          <p className="text-xs text-white/40">Loading…</p>
        </main>
      }
    >
      <FollowingPageContent />
    </Suspense>
  );
}
