/** Local-only follow graph for My Sanctuary / Following (until backed by Supabase). */

export const FOLLOWING_STORAGE_KEY = 'parable:following';
export const CUSTOM_FOLLOWERS_STORAGE_KEY = 'parable:custom-followers';
export const FOLLOWING_NOTIF_KEY = 'parable:following-notifications';

export type SanctuaryChannel = {
  id: string;
  name: string;
  handle: string;
  avatarLabel: string;
  isLive: boolean;
  viewers: string;
  /** Profile photo when loaded from Supabase */
  avatarUrl?: string | null;
  /** Subtitle in Discover (e.g. role or curated tagline) */
  tagline?: string;
  source?: 'registered' | 'curated';
};

export type RecommendedSanctuary = {
  id: string;
  name: string;
  tagline: string;
  viewers: string;
  avatarLabel: string;
};

export const BASE_SANCTUARY_CHANNELS: SanctuaryChannel[] = [
  {
    id: 'black-church-tv',
    name: 'Black Church TV',
    handle: '@blackchurchtv',
    avatarLabel: 'BC',
    isLive: true,
    viewers: '524',
  },
  {
    id: 'sanctuary-sundays',
    name: 'Sanctuary Sundays',
    handle: '@sanctuarysundays',
    avatarLabel: 'SS',
    isLive: false,
    viewers: '0',
  },
  {
    id: 'faith-influencer',
    name: 'Faith Influencer',
    handle: '@faithinfluencer',
    avatarLabel: 'FI',
    isLive: true,
    viewers: '312',
  },
];

export const RECOMMENDED_SANCTUARY_CHANNELS: RecommendedSanctuary[] = [
  {
    id: 'new-birth-live',
    name: 'New Birth Live',
    tagline: 'Sunday Worship & Word',
    viewers: '621',
    avatarLabel: 'NB',
  },
  {
    id: 'urban-faith-tv',
    name: 'Urban Faith TV',
    tagline: 'Just Testifying',
    viewers: '1.2K',
    avatarLabel: 'UF',
  },
  {
    id: 'praise-city',
    name: 'Praise City Network',
    tagline: 'Choir & Worship Nights',
    viewers: '10.3K',
    avatarLabel: 'PC',
  },
];

export function loadFollowingIds(): string[] {
  try {
    const raw = window.localStorage.getItem(FOLLOWING_STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export function loadCustomChannels(): SanctuaryChannel[] {
  try {
    const raw = window.localStorage.getItem(CUSTOM_FOLLOWERS_STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export function loadNotifChannelIds(): string[] {
  try {
    const raw = window.localStorage.getItem(FOLLOWING_NOTIF_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export function saveFollowingIds(ids: string[]) {
  window.localStorage.setItem(FOLLOWING_STORAGE_KEY, JSON.stringify(ids));
  try {
    window.dispatchEvent(new Event('parable:following-updated'));
  } catch {
    /* ignore */
  }
}

export function saveCustomChannels(channels: SanctuaryChannel[]) {
  window.localStorage.setItem(CUSTOM_FOLLOWERS_STORAGE_KEY, JSON.stringify(channels));
}

export function saveNotifChannelIds(ids: string[]) {
  window.localStorage.setItem(FOLLOWING_NOTIF_KEY, JSON.stringify(ids));
}
