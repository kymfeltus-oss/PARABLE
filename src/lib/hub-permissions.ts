import { kingdomXpToLevel, readKingdomXp } from '@/lib/kingdom-xp';
import { HUB_ORDER, type HubId } from '@/lib/hub-registry';

/** Matches signup callings: Pastor/Preacher, Musician, Artist, Podcaster, Influencer, Gamer, Streamer, Member */
const ROLE_HUB_RULES: { test: (roleLower: string) => boolean; hub: HubId }[] = [
  { test: (r) => r.includes('pastor') || r.includes('preacher'), hub: 'pulpit' },
  { test: (r) => r.includes('musician') || r.includes('artist'), hub: 'green_room' },
  { test: (r) => r.includes('podcaster') || r.includes('influencer'), hub: 'studio' },
  { test: (r) => r.includes('gamer') || r.includes('streamer'), hub: 'base' },
  { test: (r) => r.includes('member'), hub: 'sanctuary' },
];

function parseUnlockedHubsColumn(raw: unknown): HubId[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((x): x is HubId => typeof x === 'string' && HUB_ORDER.includes(x as HubId));
  }
  if (typeof raw === 'string') {
    try {
      const j = JSON.parse(raw) as unknown;
      if (Array.isArray(j)) {
        return j.filter((x): x is HubId => typeof x === 'string' && HUB_ORDER.includes(x as HubId));
      }
    } catch {
      /* ignore */
    }
  }
  return [];
}

/**
 * Resolves which hub cards appear in the Nav-Portal.
 * Uses `profiles.role` (comma-separated callings), optional `unlocked_hubs` / `streamer_status` / `kingdom_xp`,
 * plus local Kingdom XP for progression demos when DB column is absent.
 */
export function getUnlockedHubIds(profile: Record<string, unknown> | null | undefined): HubId[] {
  const unlocked = new Set<HubId>();

  unlocked.add('sanctuary');

  const roleStr = String(profile?.role ?? '').toLowerCase();
  const segments = roleStr
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const haystack = segments.length ? segments.join(' ') : roleStr;

  for (const { test, hub } of ROLE_HUB_RULES) {
    if (test(haystack)) unlocked.add(hub);
  }

  for (const h of parseUnlockedHubsColumn(profile?.unlocked_hubs)) {
    unlocked.add(h);
  }

  if (profile?.streamer_status === true) {
    unlocked.add('base');
  }

  const xpFromDb =
    typeof profile?.kingdom_xp === 'number' && Number.isFinite(profile.kingdom_xp)
      ? profile.kingdom_xp
      : null;
  const xp = xpFromDb ?? (typeof window !== 'undefined' ? readKingdomXp() : 0);
  const { level } = kingdomXpToLevel(xp);

  // Kingdom Path — XP milestones (see docs; tune with product)
  if (level >= 15) unlocked.add('studio');
  if (level >= 22) unlocked.add('base');
  if (level >= 18) unlocked.add('green_room');
  if (level >= 12) unlocked.add('pulpit');

  return HUB_ORDER.filter((id) => unlocked.has(id));
}

export function defaultHubForUser(
  unlocked: HubId[],
  profile: Record<string, unknown> | null | undefined,
): HubId {
  if (unlocked.length === 0) return 'sanctuary';
  const roleStr = String(profile?.role ?? '').toLowerCase();
  if (roleStr.includes('pastor') || roleStr.includes('preacher')) {
    if (unlocked.includes('pulpit')) return 'pulpit';
  }
  if (roleStr.includes('musician') || roleStr.includes('artist')) {
    if (unlocked.includes('green_room')) return 'green_room';
  }
  if (roleStr.includes('podcaster') || roleStr.includes('influencer')) {
    if (unlocked.includes('studio')) return 'studio';
  }
  if (roleStr.includes('gamer') || roleStr.includes('streamer')) {
    if (unlocked.includes('base')) return 'base';
  }
  return unlocked[0] ?? 'sanctuary';
}
