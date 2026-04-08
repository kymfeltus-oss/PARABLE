'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type PresenceKind = 'listening' | 'watching' | 'huddle' | 'browsing';

export type PresencePulse = 'cyan' | 'purple' | 'pink';

export type PresenceActivity = {
  id: string;
  displayName: string;
  kind: PresenceKind;
  target: string;
  isFriend: boolean;
  joinMediaUrl: string | null;
  seekSeconds: number;
};

export type PersonnelCluster = {
  clusterKey: string;
  members: PresenceActivity[];
  pulseRing: PresencePulse;
  sharedStatus: string;
};

export function presenceStatusTag(row: PresenceActivity): string {
  switch (row.kind) {
    case 'listening':
      return `Vibing to ${row.target}`;
    case 'watching':
      return `Watching ${row.target}`;
    case 'huddle':
      return 'In a Huddle';
    default:
      return 'Browsing the feed';
  }
}

function pulseForCluster(members: PresenceActivity[]): PresencePulse {
  if (members.some((m) => m.kind === 'huddle')) return 'pink';
  if (members.every((m) => m.kind === 'browsing')) return 'purple';
  return 'cyan';
}

function buildPersonnelClusters(presence: PresenceActivity[]): PersonnelCluster[] {
  const groups = new Map<string, PresenceActivity[]>();
  for (const row of presence) {
    let key: string;
    if (row.kind === 'browsing') {
      key = `solo:${row.id}`;
    } else if (row.kind === 'huddle') {
      key = 'huddle:lobby';
    } else {
      key = `stream:${row.kind}:${row.target}`;
    }
    const arr = groups.get(key) ?? [];
    arr.push(row);
    groups.set(key, arr);
  }

  return [...groups.entries()].map(([clusterKey, members]) => {
    const lead = members[0];
    let sharedStatus: string;
    if (members.length > 1) {
      if (lead.kind === 'huddle') {
        sharedStatus = `In a Huddle · ${members.length} in lobby`;
      } else if (lead.kind === 'listening') {
        sharedStatus = `Vibing together · ${lead.target}`;
      } else {
        sharedStatus = `Same room · ${lead.target}`;
      }
    } else {
      sharedStatus = presenceStatusTag(lead);
    }
    return {
      clusterKey,
      members,
      pulseRing: pulseForCluster(members),
      sharedStatus,
    };
  });
}

export type TopicCloudItem = {
  word: string;
  weight: number;
};

export type PostRipple = {
  bookmarkLine: string;
  discussingCount: number;
  viewerInitials: string[];
};

export type AchievementToast = {
  id: string;
  userLabel: string;
  body: string;
  kind: 'streak' | 'milestone';
};

const SYNTHETIC_NAMES = [
  'Jordan K.',
  'Mia R.',
  'Eli T.',
  'Noah S.',
  'Zara L.',
  'Caleb M.',
  'Ruth P.',
  'Isaiah W.',
];

const STREAM_LABELS = [
  'The Sunday Service Live',
  'Midweek Prayer Room',
  'New Single — “Rivers”',
  'Night Watch Replay',
  'Youth Night Live',
  'Gospel Brunch Set',
];

function hashSeed(n: number) {
  let x = n ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = x ^ (x >>> 15);
  return Math.abs(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function formatVibe(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function seedFromPostId(id: string | number): number {
  if (typeof id === 'number') return hashSeed(id);
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (Math.imul(s, 31) + id.charCodeAt(i)) | 0;
  return hashSeed(Math.abs(s));
}

export function useActivityPulse(
  friendDisplayNames: string[],
  postSummaries: { id: string | number; tag: string; text: string; stats: { amens: number; comments: number } }[],
  firstVideoUrl: string | null
) {
  const [tick, setTick] = useState(0);
  const [toasts, setToasts] = useState<AchievementToast[]>([]);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const reactionPulse = useMemo(() => {
    let sum = 0;
    for (const p of postSummaries) {
      sum += p.stats.amens + p.stats.comments * 2;
    }
    const wave = Math.round(400 * Math.sin(tick * 0.35) + 200 * Math.cos(tick * 0.22));
    return Math.max(320, sum * 8 + 900 + wave);
  }, [postSummaries, tick]);

  const presence: PresenceActivity[] = useMemo(() => {
    const rows: PresenceActivity[] = [];
    const friends = friendDisplayNames.filter(Boolean).slice(0, 6);
    const hotService = pick(STREAM_LABELS, tick);
    const hotTrack = 'New Single — “Rivers”';

    let i = 0;
    for (const name of friends) {
      const seed = hashSeed(tick * 17 + i * 31);
      const roll = seed % 10;
      let kind: PresenceKind;
      let target: string;
      let joinMediaUrl: string | null = firstVideoUrl;
      let seekSeconds = 12 + (seed % 120);

      if (roll === 0) {
        kind = 'huddle';
        target = 'Prayer Huddle #02';
        joinMediaUrl = null;
      } else if (roll === 1) {
        kind = 'browsing';
        target = 'Testify feed';
        joinMediaUrl = null;
        seekSeconds = 0;
      } else if (roll === 2 || roll === 3) {
        kind = 'listening';
        target = hotTrack;
      } else {
        kind = 'watching';
        target = i < 2 && friends.length >= 2 ? hotService : pick(STREAM_LABELS, seed);
      }

      rows.push({
        id: `f-${i}-${name}`,
        displayName: name.split(/\s+/)[0] || name,
        kind,
        target,
        isFriend: true,
        joinMediaUrl,
        seekSeconds,
      });
      i += 1;
    }

    const need = Math.max(0, 6 - rows.length);
    for (let j = 0; j < need; j++) {
      const seed = hashSeed(tick * 11 + j * 99 + 7);
      const roll = seed % 12;
      let kind: PresenceKind;
      let target: string;
      let joinMediaUrl: string | null = firstVideoUrl;
      let seekSeconds = 8 + (seed % 90);

      if (roll === 0) {
        kind = 'huddle';
        target = 'Prayer Huddle #02';
        joinMediaUrl = null;
      } else if (roll === 1) {
        kind = 'browsing';
        target = 'Discover';
        joinMediaUrl = null;
        seekSeconds = 0;
      } else if (roll <= 4) {
        kind = 'listening';
        target = pick(['New Single — “Rivers”', 'Worship Set Vol. 4', 'Acoustic Session'], seed);
      } else {
        kind = 'watching';
        target = j < 2 ? hotService : pick(STREAM_LABELS, seed + 1);
      }

      rows.push({
        id: `s-${j}-${tick}`,
        displayName: pick(SYNTHETIC_NAMES, seed),
        kind,
        target,
        isFriend: false,
        joinMediaUrl,
        seekSeconds,
      });
    }

    return rows.slice(0, 10);
  }, [friendDisplayNames, firstVideoUrl, tick]);

  const personnelClusters = useMemo(() => buildPersonnelClusters(presence), [presence]);

  const topicCloud: TopicCloudItem[] = useMemo(() => {
    const counts = new Map<string, number>();
    const bump = (w: string, n: number) => counts.set(w, (counts.get(w) || 0) + n);
    for (const p of postSummaries) {
      bump(p.tag, 3);
      const words = p.text.toUpperCase().split(/\s+/).filter((x) => x.length > 3);
      for (const w of words.slice(0, 4)) bump(w.slice(0, 18), 1);
    }
    bump('HEALING', 2 + (tick % 3));
    bump('GRATITUDE', 2);
    bump('WORSHIP', 3);
    bump('PRAYER', 2);
    bump('HOPE', 2);
    const list = [...counts.entries()]
      .map(([word, weight]) => ({ word, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 14);
    return list.length ? list : [{ word: 'COMMUNITY', weight: 4 }];
  }, [postSummaries, tick]);

  const rippleByPostId = useMemo(() => {
    const map = new Map<string | number, PostRipple>();
    const fn = friendDisplayNames[0]?.split(/\s+/)[0] || 'A friend';
    for (const p of postSummaries) {
      const h = seedFromPostId(p.id);
      const others = 12 + (h % 52);
      map.set(p.id, {
        bookmarkLine: `${fn} and ${others} others saved this moment`,
        discussingCount: 1 + (h % 5),
        viewerInitials: [
          pick(['SK', 'MR', 'JT', 'LP', 'AN'], h),
          pick(['DK', 'EW', 'CF', 'BG', 'RH'], h + 1),
          pick(['TM', 'VS', 'QZ', 'PL', 'XY'], h + 2),
        ],
      });
    }
    return map;
  }, [friendDisplayNames, postSummaries]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const congratulateToast = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    []
  );

  useEffect(() => {
    if (tick === 0 || tick % 6 !== 0) return;
    const demo: AchievementToast = {
      id: `ach-${Date.now()}`,
      userLabel: pick(SYNTHETIC_NAMES, tick),
      body: 'just hit a 30-day devotional streak',
      kind: 'streak',
    };
    setToasts((prev) => (prev.length >= 2 ? prev : [...prev, demo]));
  }, [tick]);

  const vibeFillPercent = Math.min(100, 18 + Math.log1p(reactionPulse) * 9);

  return {
    vibeDisplay: formatVibe(reactionPulse),
    vibeRaw: reactionPulse,
    vibeFillPercent,
    presence,
    personnelClusters,
    topicCloud,
    rippleByPostId,
    toasts,
    dismissToast,
    congratulateToast,
  };
}
