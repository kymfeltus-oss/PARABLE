const STORAGE_KEY = 'parable-kingdom-xp';

export function readKingdomXp(): number {
  if (typeof window === 'undefined') return 1840;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : 1840;
  } catch {
    return 1840;
  }
}

export function writeKingdomXp(xp: number) {
  if (typeof window === 'undefined') return;
  const clamped = Math.min(999_999, Math.max(0, Math.floor(xp)));
  localStorage.setItem(STORAGE_KEY, String(clamped));
  window.dispatchEvent(new CustomEvent('parable-kingdom-xp', { detail: clamped }));
}

/** XP band per level after level 1; tune for product later. */
const XP_PER_LEVEL = 720;

export function kingdomXpToLevel(xp: number) {
  const level = 1 + Math.floor(xp / XP_PER_LEVEL);
  const into = xp % XP_PER_LEVEL;
  const progressPct = (into / XP_PER_LEVEL) * 100;
  return { level, into, progressPct, need: XP_PER_LEVEL - into };
}

export function addKingdomXp(delta: number) {
  const next = readKingdomXp() + delta;
  writeKingdomXp(next);
  return next;
}
