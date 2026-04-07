/**
 * Shared testimony localStorage helpers with quota-safe save.
 * Used by testify and my-sanctuary to avoid QuotaExceededError.
 */

export const TESTIMONY_STORAGE_KEY = 'parable:testimonies';

const MAX_POSTS = 80;
const MAX_BYTES = 4 * 1024 * 1024; // ~4MB to stay under typical 5MB limit

export type TestimonyPostStored = {
  id: number;
  user: string;
  /** Supabase auth user id — used for Following feed */
  authorId?: string;
  time: string;
  tag: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | null;
  mediaName?: string;
  createdAt: number;
  stats: {
    amens: number;
    comments: number;
    shares: number;
    praiseBreaks: number;
    claps: number;
    dances: number;
    shouts: number;
  };
  reactions?: Record<string, number>;
};

function trimForQuota(posts: TestimonyPostStored[]): TestimonyPostStored[] {
  // Keep only the most recent posts
  let list = posts.length > MAX_POSTS ? posts.slice(0, MAX_POSTS) : [...posts];

  let json = JSON.stringify(list);
  if (json.length <= MAX_BYTES) return list;

  // Strip media from oldest posts to reduce size (keep text + stats)
  for (let i = list.length - 1; i >= 0 && json.length > MAX_BYTES; i--) {
    const post = list[i];
    if (post.mediaUrl) {
      list[i] = { ...post, mediaUrl: undefined, mediaType: null, mediaName: undefined };
      json = JSON.stringify(list);
    }
  }

  if (json.length <= MAX_BYTES) return list;

  // Still too big: keep fewer posts
  while (list.length > 10 && json.length > MAX_BYTES) {
    list = list.slice(0, Math.floor(list.length * 0.8));
    json = JSON.stringify(list);
  }

  return list;
}

export function saveTestimonies(posts: TestimonyPostStored[]): boolean {
  const trimmed = trimForQuota(posts);
  const json = JSON.stringify(trimmed);

  try {
    window.localStorage.setItem(TESTIMONY_STORAGE_KEY, json);
    window.dispatchEvent(new Event('parable:testimonies-updated'));
    return true;
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
      // Last resort: keep only first 20 posts without media
      const minimal = trimmed.slice(0, 20).map((p) => ({
        ...p,
        mediaUrl: undefined,
        mediaType: null,
        mediaName: undefined,
      }));
      try {
        window.localStorage.setItem(TESTIMONY_STORAGE_KEY, JSON.stringify(minimal));
        window.dispatchEvent(new Event('parable:testimonies-updated'));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export function loadAllTestimonies(): TestimonyPostStored[] {
  try {
    const raw = window.localStorage.getItem(TESTIMONY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TestimonyPostStored[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
