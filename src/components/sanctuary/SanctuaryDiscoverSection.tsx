'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { RecommendedSanctuary, SanctuaryChannel } from '@/lib/sanctuary-following';
import { RECOMMENDED_SANCTUARY_CHANNELS } from '@/lib/sanctuary-following';
/** For stats badges (e.g. My Sanctuary Discover count). */
export function getDiscoverSuggestionCount(
  followingIds: string[],
  registeredSuggestions: SanctuaryChannel[]
): number {
  const curated = RECOMMENDED_SANCTUARY_CHANNELS.filter((c) => !followingIds.includes(c.id)).length;
  const people = registeredSuggestions.filter((c) => !followingIds.includes(c.id)).length;
  return curated + people;
}

/** Full URL, data URL, or Storage object path in `avatars` (no browser client — safe for SSR). */
function resolveAvatarDisplayUrl(raw: string | null | undefined): string {
  if (raw == null || raw === '') return '';
  const s = String(raw).trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) return s;
  const path = s.replace(/^\/+/, '').split('?')[0];
  if (!path || path.includes('://')) return s;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!base) return '';
  const encoded = path
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  return `${base}/storage/v1/object/public/avatars/${encoded}`;
}

export function ChannelAvatar({
  c,
  className = 'h-12 w-12 rounded-xl',
}: {
  c: SanctuaryChannel;
  className?: string;
}) {
  const [imgOk, setImgOk] = useState(true);
  const resolved = useMemo(() => resolveAvatarDisplayUrl(c.avatarUrl), [c.avatarUrl]);
  const showImg = Boolean(resolved && (resolved.startsWith('http') || resolved.startsWith('data:')));

  return (
    <div className={`overflow-hidden border border-white/10 shrink-0 bg-black ${className}`}>
      {showImg && imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgOk(false)}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[#00f2ff]/20 to-purple-500/20 flex items-center justify-center text-sm font-black">
          {c.avatarLabel}
        </div>
      )}
    </div>
  );
}

type DiscoverProps = {
  followingIds: string[];
  registeredSuggestions: SanctuaryChannel[];
  registeredLoading: boolean;
  /** Supabase / auth error — shown so RLS or network issues aren’t silent */
  registeredError?: string | null;
  onToggleFollow: (id: string) => void;
  onOpenStreamers: () => void;
  /** When false, omit outer intro line (e.g. Following page has its own header) */
  showIntro?: boolean;
  className?: string;
};

export function SanctuaryDiscoverSection({
  followingIds,
  registeredSuggestions,
  registeredLoading,
  registeredError = null,
  onToggleFollow,
  onOpenStreamers,
  showIntro = true,
  className = '',
}: DiscoverProps) {
  const curatedDiscover = useMemo(
    () => RECOMMENDED_SANCTUARY_CHANNELS.filter((c) => !followingIds.includes(c.id)),
    [followingIds]
  );

  const peopleDiscover = useMemo(
    () => registeredSuggestions.filter((c) => !followingIds.includes(c.id)),
    [registeredSuggestions, followingIds]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {showIntro && (
        <p className="text-xs text-white/55">
          People already on Parable appear first; featured channels below are curated picks.
        </p>
      )}

      {registeredError && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
          <p className="font-semibold text-amber-200">Couldn&apos;t load registered members</p>
          <p className="mt-1 text-xs text-amber-100/80">{registeredError}</p>
          {/schema cache|could not find the table|does not exist/i.test(registeredError) ? (
            <p className="mt-2 text-[11px] text-amber-100/70 leading-relaxed">
              The API doesn&apos;t see <code className="rounded bg-black/30 px-1 py-0.5">public.profiles</code> in{' '}
              <strong className="text-amber-200/90">this</strong> Supabase project. In the dashboard:{' '}
              <strong className="text-amber-200/90">Table Editor</strong> → confirm a{' '}
              <code className="rounded bg-black/30 px-1 py-0.5">profiles</code> table under{' '}
              <code className="rounded bg-black/30 px-1 py-0.5">public</code>. If it&apos;s missing, run{' '}
              <code className="rounded bg-black/30 px-1 py-0.5">supabase/schema-profiles-and-groups.sql</code>{' '}
              in the SQL editor. Then run{' '}
              <code className="rounded bg-black/30 px-1 py-0.5">notify pgrst, &apos;reload schema&apos;;</code>{' '}
              once. Also check <code className="rounded bg-black/30 px-1 py-0.5">.env.local</code> URL and anon key
              match that same project, then restart <code className="rounded bg-black/30 px-1 py-0.5">npm run dev</code>.
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-amber-100/60">
              If this mentions permission or RLS, run{' '}
              <code className="rounded bg-black/30 px-1 py-0.5">supabase/profiles-discovery-policy.sql</code>{' '}
              in the Supabase SQL editor (then refresh).
            </p>
          )}
        </div>
      )}

      {registeredLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-white/50 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#00f2ff]" />
          Loading people on Parable…
        </div>
      )}

      {!registeredLoading && peopleDiscover.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00f2ff]/80 px-1">
            People on Parable
          </p>
          <ul className="space-y-3">
            {peopleDiscover.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-[#00f2ff]/15 bg-[#00f2ff]/[0.04] p-3"
              >
                <ChannelAvatar c={c} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{c.name}</p>
                  <p className="text-xs text-white/50 truncate">{c.tagline || c.handle}</p>
                  <p className="text-[10px] text-emerald-400/90 mt-0.5 font-medium">Registered member</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFollow(c.id)}
                  className="shrink-0 rounded-full bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-wide hover:bg-[#00f2ff] transition-colors"
                >
                  Follow
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!registeredLoading &&
        !registeredError &&
        peopleDiscover.length === 0 &&
        registeredSuggestions.length === 0 && (
          <p className="text-[11px] text-white/45 px-1 rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2">
            <span className="block">
              <strong className="text-white/70">Still empty but you see other users in Supabase?</strong> The
              default schema only lets you read <em>your own</em> profile. Run{' '}
              <code className="rounded bg-black/30 px-1 py-0.5">
                supabase/profiles-discovery-policy.sql
              </code>{' '}
              in the SQL editor, then refresh — that is the usual fix.
            </span>
            <span className="block text-white/40">
              If <code className="text-[#00f2ff]/80">profiles</code> has fewer rows than{' '}
              <code className="text-[#00f2ff]/80">auth.users</code>, run{' '}
              <code className="rounded bg-black/30 px-1 py-0.5">supabase/backfill-profiles-from-auth.sql</code>.
              Log in once on each new account so the app can create their profile row.
            </span>
          </p>
        )}

      {!registeredLoading &&
        !registeredError &&
        peopleDiscover.length === 0 &&
        registeredSuggestions.length > 0 && (
          <p className="text-[11px] text-white/40 px-1">
            You&apos;re already following everyone on Parable in this list — or try Browse all to search.
          </p>
        )}

      {curatedDiscover.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 px-1">
            Featured channels
          </p>
          <ul className="space-y-3">
            {curatedDiscover.map((c: RecommendedSanctuary) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/45 p-3"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#00f2ff]/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-black">
                  {c.avatarLabel}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{c.name}</p>
                  <p className="text-xs text-white/50 truncate">{c.tagline}</p>
                  <p className="text-[10px] text-[#00f2ff]/80 mt-0.5">{c.viewers} avg viewers</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFollow(c.id)}
                  className="shrink-0 rounded-full bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-wide hover:bg-[#00f2ff] transition-colors"
                >
                  Follow
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!registeredLoading &&
        !registeredError &&
        peopleDiscover.length === 0 &&
        curatedDiscover.length === 0 &&
        registeredSuggestions.length > 0 && (
          <p className="text-sm text-white/45 text-center py-4">
            You&apos;re following every suggested person and channel. Browse{' '}
            <button type="button" onClick={onOpenStreamers} className="text-[#00f2ff] underline">
              Streamers
            </button>{' '}
            for more.
          </p>
        )}
      <button
        type="button"
        onClick={onOpenStreamers}
        className="w-full rounded-xl border border-[#00f2ff]/30 bg-[#00f2ff]/5 py-3 text-xs font-black uppercase tracking-wider text-[#00f2ff] hover:bg-[#00f2ff]/10"
      >
        Explore all streamers
      </button>
    </div>
  );
}
