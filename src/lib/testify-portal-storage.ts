/** Local gamification + PiP prefs for Testify Live-Portal (no server yet). */

const STREAK_KEY = 'parable:testify-streak-days';
const LAST_DAY_KEY = 'parable:testify-streak-last-day';
const GEMS_KEY = 'parable:testify-gems';
const PIP_URL_KEY = 'parable:testify-pip-url';
const PIP_TITLE_KEY = 'parable:testify-pip-title';

function yyyymmdd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function recordTestifyVisit(): { streak: number; faithfulUnlocked: boolean } {
  if (typeof window === 'undefined') return { streak: 0, faithfulUnlocked: false };
  const today = yyyymmdd(new Date());
  const last = window.localStorage.getItem(LAST_DAY_KEY);
  let streak = Number(window.localStorage.getItem(STREAK_KEY) || '0') || 0;

  if (last === today) {
    return { streak, faithfulUnlocked: streak >= 5 };
  }

  if (!last) {
    streak = 1;
  } else {
    const prev = new Date(last + 'T12:00:00');
    const diffDays = Math.round((Date.now() - prev.getTime()) / 86400000);
    if (diffDays === 1) streak += 1;
    else if (diffDays > 1) streak = 1;
    else streak = Math.max(1, streak);
  }

  window.localStorage.setItem(LAST_DAY_KEY, today);
  window.localStorage.setItem(STREAK_KEY, String(streak));
  return { streak, faithfulUnlocked: streak >= 5 };
}

export function getTestifyGems(): number {
  if (typeof window === 'undefined') return 0;
  return Number(window.localStorage.getItem(GEMS_KEY) || '120') || 0;
}

export function addTestifyGems(delta: number): number {
  if (typeof window === 'undefined') return 0;
  const next = Math.max(0, getTestifyGems() + delta);
  window.localStorage.setItem(GEMS_KEY, String(next));
  return next;
}

export function getPipPrefs(): { url: string | null; title: string | null } {
  if (typeof window === 'undefined') return { url: null, title: null };
  return {
    url: window.localStorage.getItem(PIP_URL_KEY),
    title: window.localStorage.getItem(PIP_TITLE_KEY),
  };
}

export function setPipPrefs(url: string | null, title: string | null) {
  if (typeof window === 'undefined') return;
  if (url) {
    window.localStorage.setItem(PIP_URL_KEY, url);
    window.localStorage.setItem(PIP_TITLE_KEY, title || 'Now playing');
  } else {
    window.localStorage.removeItem(PIP_URL_KEY);
    window.localStorage.removeItem(PIP_TITLE_KEY);
  }
}
