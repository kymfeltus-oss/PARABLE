import type { PortalPost } from '@/components/testify/TestifyLivePortalFeed';

/** Sample MP4 (short, widely reachable) for vertical-style preview. */
const SAMPLE_VIDEO =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

function minsAgo(m: number): number {
  return Date.now() - m * 60_000;
}

/**
 * When to show seeded “community” posts (fake users) so the feed feels alive.
 * Default is off everywhere so local `next dev` matches production unless you opt in.
 * Set `NEXT_PUBLIC_TESTIFY_DEMO_FEED=true` in `.env.local` (or Amplify) to enable.
 */
export function shouldIncludeDemoFeed(): boolean {
  const v = process.env.NEXT_PUBLIC_TESTIFY_DEMO_FEED;
  if (v === 'false' || v === '0') return false;
  if (v === 'true' || v === '1') return true;
  return false;
}

export function isDemoPostId(id: string | number): boolean {
  return typeof id === 'string' && id.startsWith('demo-');
}

/**
 * Curated demo posts (deterministic ids) — merged with real remote/local posts.
 */
export function createDemoTestifyPosts(): PortalPost[] {
  return [
    {
      id: 'demo-01',
      user: 'Maya Chen',
      authorId: 'demo-profile-maya',
      time: 'LIVE NOW',
      tag: 'WORSHIP',
      text: 'Opening set tonight — grateful for this community.',
      mediaUrl: SAMPLE_VIDEO,
      mediaType: 'video',
      createdAt: minsAgo(4),
      stats: {
        amens: 1284,
        comments: 42,
        shares: 18,
        praiseBreaks: 6,
        claps: 12,
        dances: 4,
        shouts: 2,
      },
    },
    {
      id: 'demo-02',
      user: 'Jordan Lee',
      authorId: 'demo-profile-jordan',
      time: 'COMMUNITY',
      tag: 'TESTIMONY',
      text: 'He answered before I finished the sentence. Still processing it.',
      mediaUrl: 'https://picsum.photos/seed/parable-sunrise/1080/1920',
      mediaType: 'image',
      createdAt: minsAgo(11),
      stats: {
        amens: 892,
        comments: 103,
        shares: 56,
        praiseBreaks: 2,
        claps: 30,
        dances: 1,
        shouts: 0,
      },
    },
    {
      id: 'demo-03',
      user: 'Pastor Eli Ruiz',
      authorId: 'demo-profile-eli',
      time: 'COMMUNITY',
      tag: 'PRAYER',
      text: 'Prayer room is open — drop a name if you want us to agree with you.',
      mediaUrl: 'https://www.twitch.tv/twitch',
      mediaType: null,
      createdAt: minsAgo(18),
      stats: {
        amens: 2104,
        comments: 310,
        shares: 44,
        praiseBreaks: 14,
        claps: 22,
        dances: 0,
        shouts: 8,
      },
    },
    {
      id: 'demo-04',
      user: 'Sam Okonkwo',
      authorId: 'demo-profile-sam',
      time: 'COMMUNITY',
      tag: 'BREAKTHROUGH',
      text: 'First time sharing this publicly. The shame is gone.',
      mediaUrl: SAMPLE_VIDEO,
      mediaType: 'video',
      createdAt: minsAgo(26),
      stats: {
        amens: 3401,
        comments: 512,
        shares: 201,
        praiseBreaks: 9,
        claps: 44,
        dances: 12,
        shouts: 3,
      },
    },
    {
      id: 'demo-05',
      user: 'River North Church',
      authorId: 'demo-profile-river',
      time: 'LIVE NOW',
      tag: 'WORSHIP',
      text: 'Youth night recap — the energy was unreal.',
      mediaUrl: 'https://picsum.photos/seed/parable-crowd/1080/1920',
      mediaType: 'image',
      createdAt: minsAgo(33),
      stats: {
        amens: 756,
        comments: 28,
        shares: 9,
        praiseBreaks: 3,
        claps: 8,
        dances: 2,
        shouts: 0,
      },
    },
    {
      id: 'demo-06',
      user: 'Ava Williams',
      authorId: 'demo-profile-ava',
      time: 'COMMUNITY',
      tag: 'TESTIMONY',
      text: '',
      mediaUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      mediaType: null,
      createdAt: minsAgo(41),
      stats: {
        amens: 445,
        comments: 67,
        shares: 12,
        praiseBreaks: 1,
        claps: 5,
        dances: 0,
        shouts: 0,
      },
    },
    {
      id: 'demo-07',
      user: 'Diego Morales',
      authorId: 'demo-profile-diego',
      time: 'COMMUNITY',
      tag: 'PRAISE BREAK',
      text: 'Small group tonight — we laughed, we cried, we ate too many tacos.',
      mediaUrl: 'https://picsum.photos/seed/parable-tacos/1080/1920',
      mediaType: 'image',
      createdAt: minsAgo(52),
      stats: {
        amens: 623,
        comments: 41,
        shares: 7,
        praiseBreaks: 4,
        claps: 15,
        dances: 6,
        shouts: 1,
      },
    },
    {
      id: 'demo-08',
      user: 'Hope & Harbor',
      authorId: 'demo-profile-hope',
      time: 'COMMUNITY',
      tag: 'PRAYER',
      text: 'Sometimes the miracle is that you stayed. If that’s you — you’re not alone.',
      createdAt: minsAgo(64),
      stats: {
        amens: 1892,
        comments: 276,
        shares: 88,
        praiseBreaks: 11,
        claps: 40,
        dances: 3,
        shouts: 5,
      },
    },
    {
      id: 'demo-09',
      user: 'Nia Patel',
      authorId: 'demo-profile-nia',
      time: 'LIVE NOW',
      tag: 'WORSHIP',
      text: 'Kick stream — acoustic covers after this message.',
      mediaUrl: 'https://kick.com',
      mediaType: null,
      createdAt: minsAgo(72),
      stats: {
        amens: 334,
        comments: 19,
        shares: 6,
        praiseBreaks: 2,
        claps: 4,
        dances: 0,
        shouts: 0,
      },
    },
    {
      id: 'demo-10',
      user: 'Marcus Webb',
      authorId: 'demo-profile-marcus',
      time: 'COMMUNITY',
      tag: 'BREAKTHROUGH',
      text: 'Document finally came through. Thank you for praying with us.',
      mediaUrl: SAMPLE_VIDEO,
      mediaType: 'video',
      createdAt: minsAgo(88),
      stats: {
        amens: 2109,
        comments: 155,
        shares: 33,
        praiseBreaks: 5,
        claps: 18,
        dances: 0,
        shouts: 2,
      },
    },
  ];
}
