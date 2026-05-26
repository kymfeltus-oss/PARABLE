/** Client-side creator / command-center state (extend with Supabase when columns exist). */

const STREAK_KEY = 'parable-sanctuary-streak-days';
const SEEDS_KEY = 'parable-sanctuary-seeds';

export function parseCreatorCategories(role: string | null | undefined): string[] {
  if (!role?.trim()) return ['Member'];
  return role
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Pick the most “signal” calling for command-center vibe (order = product priority). */
export function primaryCategory(categories: string[]): string {
  if (!categories.length) return 'Member';
  const rules: { test: RegExp }[] = [
    { test: /pastor|preacher/i },
    { test: /musician/i },
    { test: /artist/i },
    { test: /podcaster/i },
    { test: /influencer/i },
    { test: /gamer/i },
    { test: /streamer/i },
    { test: /member/i },
  ];
  for (const { test } of rules) {
    const hit = categories.find((c) => test.test(c));
    if (hit) return hit;
  }
  return categories[0];
}

export function readSanctuaryStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const n = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
    return Number.isFinite(n) && n >= 0 ? Math.min(n, 999) : 0;
  } catch {
    return 0;
  }
}

/** Welcome package default: 100 seeds on first read (local only until Supabase `user_seeds`). */
export function readSanctuarySeeds(): number {
  if (typeof window === 'undefined') return 100;
  try {
    const raw = localStorage.getItem(SEEDS_KEY);
    if (raw == null) {
      localStorage.setItem(SEEDS_KEY, '100');
      return 100;
    }
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? Math.min(n, 9_999_999) : 100;
  } catch {
    return 100;
  }
}

export type AuraKind = 'cyan' | 'gold';

export function auraFromStreak(streakDays: number): AuraKind {
  return streakDays >= 7 ? 'gold' : 'cyan';
}

export function estimateInfluence(testimonyCount: number, followingCount: number): number {
  return testimonyCount * 47 + followingCount * 18 + 120;
}
