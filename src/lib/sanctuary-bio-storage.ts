export type SanctuaryQuickInfo = {
  location: string;
  ministryBrand: string;
  mantra: string;
  mission: string;
  socialInstagram: string;
  socialFacebook: string;
  socialYoutube: string;
  socialWebsite: string;
};

const KEY = (userId: string) => `parable-sanctuary-quick-info:${userId}`;

const DEFAULT_LOCATION = 'Sanctuary · Digital';

const FALLBACK_MANTRA =
  'Your mission lives here — a short story of calling, culture, and what you’re building in the Kingdom.';

export function defaultQuickInfo(fullName: string | null | undefined, bioText: string | null | undefined): SanctuaryQuickInfo {
  const raw = (bioText || '').trim();
  let mantra = FALLBACK_MANTRA;
  let mission = `${FALLBACK_MANTRA} Add depth anytime from your public profile.`;

  if (raw) {
    const parts = raw.split(/\n\n+/);
    if (parts.length >= 2) {
      mantra = parts[0].slice(0, 160);
      mission = parts.slice(1).join('\n\n').trim() || mission;
    } else if (raw.length <= 160) {
      mantra = raw;
      mission = `${raw} Add depth anytime from your public profile.`;
    } else {
      mantra = `${raw.slice(0, 157)}…`;
      mission = raw;
    }
  }

  return {
    location: DEFAULT_LOCATION,
    ministryBrand: (fullName || '').trim() || 'PARABLE creator',
    mantra,
    mission,
    socialInstagram: '',
    socialFacebook: '',
    socialYoutube: '',
    socialWebsite: '',
  };
}

export function loadQuickInfo(userId: string, fullName: string | null | undefined, bioText: string | null | undefined): SanctuaryQuickInfo {
  if (typeof window === 'undefined') return defaultQuickInfo(fullName, bioText);
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (!raw) return defaultQuickInfo(fullName, bioText);
    const j = JSON.parse(raw) as Partial<SanctuaryQuickInfo>;
    const base = defaultQuickInfo(fullName, bioText);
    return {
      location: typeof j.location === 'string' ? j.location : base.location,
      ministryBrand: typeof j.ministryBrand === 'string' ? j.ministryBrand : base.ministryBrand,
      mantra: typeof j.mantra === 'string' ? j.mantra : base.mantra,
      mission: typeof j.mission === 'string' ? j.mission : base.mission,
      socialInstagram: typeof j.socialInstagram === 'string' ? j.socialInstagram : '',
      socialFacebook: typeof j.socialFacebook === 'string' ? j.socialFacebook : '',
      socialYoutube: typeof j.socialYoutube === 'string' ? j.socialYoutube : '',
      socialWebsite: typeof j.socialWebsite === 'string' ? j.socialWebsite : '',
    };
  } catch {
    return defaultQuickInfo(fullName, bioText);
  }
}

export function saveQuickInfoLocal(userId: string, data: SanctuaryQuickInfo) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY(userId), JSON.stringify(data));
}

/** Combine mantra + mission for `profiles.bio`. */
export function quickInfoToProfileBio(data: SanctuaryQuickInfo): string {
  return `${data.mantra.trim()}\n\n${data.mission.trim()}`.trim();
}
