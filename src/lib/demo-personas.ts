import type { SanctuaryLayoutData, SanctuaryPost, SanctuaryProfile } from "@/app/my-sanctuary/actions";
import {
  demoStreamMp4ForChannel,
  streamThumbnailPhoto,
} from "@/lib/black-church-demo-media";

/** Stable UUIDs shared with optional `supabase/seed-demo-personas.sql`. */
export const DEMO_PERSONA_IDS = {
  pastor_james: "a1000000-0000-4000-8000-000000000001",
  sister_sarah: "a1000000-0000-4000-8000-000000000002",
  gospel_vibe: "a1000000-0000-4000-8000-000000000003",
  kingdom_gamer: "a1000000-0000-4000-8000-000000000004",
  prophetic_voices: "a1000000-0000-4000-8000-000000000005",
} as const;

export type DemoPersonaUsername = keyof typeof DEMO_PERSONA_IDS;

export type DemoPersona = {
  id: string;
  username: DemoPersonaUsername;
  full_name: string;
  role: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
  is_live: boolean;
  followersCount: number;
  followingCount: number;
  posts: SanctuaryPost[];
};

/** Local initials avatar — never uses real-person stock photos. */
export function demoAvatarPath(username: string): string {
  const k = username.replace(/^@/, "").trim().toLowerCase();
  if (k in DEMO_PERSONA_IDS) {
    return `/demo/avatars/${k}.svg`;
  }
  return "/demo/avatars/default.svg";
}

function avatarUrl(username: DemoPersonaUsername): string {
  return `/demo/avatars/${username}.svg`;
}

export const DEMO_AVATAR_FALLBACK = "/demo/avatars/default.svg";

function demoPost(
  username: DemoPersonaUsername,
  n: number,
  opts: {
    content: string;
    media_type: "image" | "video";
    video?: boolean;
    likes?: number;
    comments?: number;
  },
): SanctuaryPost {
  const media =
    opts.video || opts.media_type === "video"
      ? demoStreamMp4ForChannel(username)
      : streamThumbnailPhoto(username, 800, 600);
  return {
    id: `demo-post-${username}-${n}`,
    media_url: media,
    media_type: opts.media_type,
    content: opts.content,
    likesCount: opts.likes ?? 120 + n * 47,
    commentsCount: opts.comments ?? 8 + n * 3,
  };
}

const PERSONA_DEFS: Omit<DemoPersona, "id" | "posts">[] = [
  {
    username: "pastor_james",
    full_name: "Pastor James Ruiz",
    role: "Pastor",
    bio: "Lead pastor · Dallas · Worship nights every Thursday. Teaching grace in a noisy world.",
    avatar_url: avatarUrl("pastor_james"),
    is_verified: true,
    is_live: true,
    followersCount: 12400,
    followingCount: 312,
  },
  {
    username: "sister_sarah",
    full_name: "Sarah Mitchell",
    role: "Worship Leader",
    bio: "Voice · keys · prayer room host. Building a community that sings through the hard seasons.",
    avatar_url: avatarUrl("sister_sarah"),
    is_verified: true,
    is_live: false,
    followersCount: 8900,
    followingCount: 445,
  },
  {
    username: "gospel_vibe",
    full_name: "Gospel Vibe Collective",
    role: "Gospel Artist",
    bio: "Live sessions · new singles · choir collabs. Spreading hope one chorus at a time.",
    avatar_url: avatarUrl("gospel_vibe"),
    is_verified: true,
    is_live: true,
    followersCount: 22100,
    followingCount: 189,
  },
  {
    username: "kingdom_gamer",
    full_name: "Kingdom Gamer",
    role: "Gamer & Creator",
    bio: "Biblical history breakdowns · co-op streams · faith + games without the cringe.",
    avatar_url: avatarUrl("kingdom_gamer"),
    is_verified: false,
    is_live: false,
    followersCount: 5600,
    followingCount: 902,
  },
  {
    username: "prophetic_voices",
    full_name: "Prophetic Voices",
    role: "Clergy",
    bio: "Intercession · teaching · global prayer rooms. Submit prayer requests in the comments.",
    avatar_url: avatarUrl("prophetic_voices"),
    is_verified: true,
    is_live: false,
    followersCount: 15700,
    followingCount: 267,
  },
];

const POSTS_BY_USER: Record<DemoPersonaUsername, SanctuaryPost[]> = {
  pastor_james: [
    demoPost("pastor_james", 1, {
      content: "Worshipping live tonight in Dallas! Join the feed or grab a pass for the breakout session. 🙌",
      media_type: "image",
      likes: 342,
      comments: 18,
    }),
    demoPost("pastor_james", 2, {
      content: "Thursday night recap — the room was electric.",
      media_type: "video",
      video: true,
      likes: 891,
      comments: 44,
    }),
    demoPost("pastor_james", 3, {
      content: "Scripture study notes from Romans 8 — download in bio.",
      media_type: "image",
      likes: 210,
      comments: 31,
    }),
  ],
  sister_sarah: [
    demoPost("sister_sarah", 1, {
      content: "Morning worship loop — use this to start your day anchored.",
      media_type: "video",
      video: true,
      likes: 1204,
      comments: 67,
    }),
    demoPost("sister_sarah", 2, {
      content: "Prayer room open until midnight CST.",
      media_type: "image",
      likes: 456,
      comments: 22,
    }),
  ],
  gospel_vibe: [
    demoPost("gospel_vibe", 1, {
      content: "New single drop this Friday — preview from last night's session.",
      media_type: "image",
      likes: 2100,
      comments: 156,
    }),
    demoPost("gospel_vibe", 2, {
      content: "Choir rehearsal BTS — harmonies hitting different.",
      media_type: "video",
      video: true,
      likes: 980,
      comments: 88,
    }),
  ],
  kingdom_gamer: [
    demoPost("kingdom_gamer", 1, {
      content: "Late night stream — breaking down Biblical history in HD graphics. Let's dive in.",
      media_type: "video",
      video: true,
      likes: 1205,
      comments: 89,
    }),
    demoPost("kingdom_gamer", 2, {
      content: "Co-op night this Saturday — link in stories.",
      media_type: "image",
      likes: 334,
      comments: 41,
    }),
  ],
  prophetic_voices: [
    demoPost("prophetic_voices", 1, {
      content: "Global prayer room opens at 6 PM — all time zones welcome.",
      media_type: "image",
      likes: 780,
      comments: 112,
    }),
    demoPost("prophetic_voices", 2, {
      content: "Word for the week: stay planted.",
      media_type: "image",
      likes: 1450,
      comments: 203,
    }),
  ],
};

export const DEMO_PERSONAS: DemoPersona[] = PERSONA_DEFS.map((def) => ({
  ...def,
  id: DEMO_PERSONA_IDS[def.username],
  posts: POSTS_BY_USER[def.username],
}));

const byUsername = new Map(DEMO_PERSONAS.map((p) => [p.username, p]));
const byId = new Map(DEMO_PERSONAS.map((p) => [p.id, p]));

export const DEMO_PERSONA_USERNAMES = DEMO_PERSONAS.map((p) => p.username);

export function isDemoPersonaId(id: string): boolean {
  return byId.has(id) || id.startsWith("demo-");
}

export function isDemoPersonaUsername(username: string): boolean {
  return normalizeUsername(username) !== null;
}

export function normalizeUsername(value: string): DemoPersonaUsername | null {
  const k = value.replace(/^@/, "").trim().toLowerCase();
  return byUsername.has(k as DemoPersonaUsername) ? (k as DemoPersonaUsername) : null;
}

export function getDemoPersonaByUsername(username: string): DemoPersona | null {
  const key = normalizeUsername(username);
  return key ? (byUsername.get(key) ?? null) : null;
}

export function getDemoPersonaById(id: string): DemoPersona | null {
  if (id === "test_broadcaster_4k") {
    return byUsername.get("kingdom_gamer") ?? null;
  }
  return byId.get(id) ?? null;
}

export function demoProfileHref(username: string): string {
  return `/profile/${username.replace(/^@/, "")}`;
}

const LIVE_PROFILE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Canonical profile URL — own profile uses `/profile`; live users use UUID when available. */
export function sanctuaryProfileHref(
  userId: string,
  username: string,
  currentUserId?: string | null,
): string {
  if (currentUserId && userId === currentUserId) return "/profile";
  if (LIVE_PROFILE_ID_RE.test(userId)) return `/profile/${userId}`;
  return demoProfileHref(username);
}

export function createDemoSanctuaryLayout(persona: DemoPersona): SanctuaryLayoutData {
  const profile: SanctuaryProfile = {
    id: persona.id,
    username: persona.username,
    full_name: persona.full_name,
    avatar_url: persona.avatar_url,
    bio: persona.bio,
  };
  return {
    profile,
    posts: persona.posts,
    taggedPosts: [],
    totalPosts: persona.posts.length,
    followersCount: persona.followersCount,
    followingCount: persona.followingCount,
    isFollowingCurrentUser: false,
  };
}

/** Home feed tray item shape (shared with SanctuaryHomeFeed). */
export type DemoHomeTrayItem = {
  id: string;
  userId: string;
  username: string;
  avatar_url: string;
  role: string;
  is_verified: boolean;
  is_live: boolean;
  viewer_count?: number;
  has_unviewed_story?: boolean;
};

export type DemoHomeFeedPost = {
  id: string;
  userId: string;
  username: string;
  avatar_url: string;
  role: string;
  is_verified: boolean;
  caption: string;
  media_url: string;
  post_type: "image" | "video";
  likes: number;
  comments: number;
  has_liked?: boolean;
  has_saved?: boolean;
  saved_collection_id?: string | null;
  audio?: { id: string; title: string } | null;
  created_at: string;
};

export type DemoHomeEvent = {
  id: string;
  hostUsername: DemoPersonaUsername;
  title: string;
  description: string;
  cover_image: string;
  scheduled_for: string;
  ticket_price: number;
  requires_registration: boolean;
  is_registered?: boolean;
};

export function createDemoHomeTray(): DemoHomeTrayItem[] {
  const james = byUsername.get("pastor_james")!;
  const vibe = byUsername.get("gospel_vibe")!;
  const gamer = byUsername.get("kingdom_gamer")!;
  const prophetic = byUsername.get("prophetic_voices")!;
  return [
    {
      id: "demo-tray-1",
      userId: james.id,
      username: james.username,
      avatar_url: james.avatar_url,
      role: james.role,
      is_verified: james.is_verified,
      is_live: true,
      viewer_count: 1420,
    },
    {
      id: "demo-tray-2",
      userId: vibe.id,
      username: vibe.username,
      avatar_url: vibe.avatar_url,
      role: vibe.role,
      is_verified: vibe.is_verified,
      is_live: true,
      viewer_count: 840,
    },
    {
      id: "demo-tray-3",
      userId: gamer.id,
      username: gamer.username,
      avatar_url: gamer.avatar_url,
      role: gamer.role,
      is_verified: gamer.is_verified,
      is_live: false,
      has_unviewed_story: true,
    },
    {
      id: "demo-tray-4",
      userId: prophetic.id,
      username: prophetic.username,
      avatar_url: prophetic.avatar_url,
      role: prophetic.role,
      is_verified: prophetic.is_verified,
      is_live: false,
      has_unviewed_story: true,
    },
  ];
}

export function createDemoHomeFeedPosts(): DemoHomeFeedPost[] {
  const james = byUsername.get("pastor_james")!;
  const gamer = byUsername.get("kingdom_gamer")!;
  const p1 = james.posts[0]!;
  const p2 = gamer.posts[0]!;
  return [
    {
      id: p1.id,
      userId: james.id,
      username: james.username,
      avatar_url: james.avatar_url,
      role: james.role,
      is_verified: james.is_verified,
      caption: p1.content ?? "",
      media_url: p1.media_url ?? streamThumbnailPhoto("pastor_james", 800, 600),
      post_type: "image",
      likes: p1.likesCount,
      comments: p1.commentsCount,
      has_liked: false,
      audio: { id: "audio-gospel-beats-02", title: "Gospel Beats — Morning Prayer" },
      created_at: "2 hours ago",
    },
    {
      id: p2.id,
      userId: gamer.id,
      username: gamer.username,
      avatar_url: gamer.avatar_url,
      role: gamer.role,
      is_verified: gamer.is_verified,
      caption: p2.content ?? "",
      media_url: p2.media_url ?? demoStreamMp4ForChannel("kingdom_gamer"),
      post_type: "video",
      likes: p2.likesCount,
      comments: p2.commentsCount,
      has_liked: true,
      audio: { id: "audio-worship-loop-01", title: "Worship Loop — Elevate" },
      created_at: "4 hours ago",
    },
  ];
}

export function createDemoHomeEvents(): DemoHomeEvent[] {
  return [
    {
      id: "demo-event-1",
      hostUsername: "pastor_james",
      title: "Global Prophetic Summit 2026",
      description:
        "Immersive online live event with session token validation. Full AV processing and digital download materials included.",
      cover_image: streamThumbnailPhoto("pastor_james", 600, 280),
      scheduled_for: "Tonight @ 7:30 PM CST",
      ticket_price: 25,
      requires_registration: true,
      is_registered: false,
    },
    {
      id: "demo-event-2",
      hostUsername: "gospel_vibe",
      title: "Interactive Ministry Masterclass",
      description:
        "Strategy roundtable on media integration workflows and broadcast distribution for ministries.",
      cover_image: streamThumbnailPhoto("gospel_vibe", 600, 280),
      scheduled_for: "May 28th @ 6:00 PM",
      ticket_price: 0,
      requires_registration: true,
      is_registered: false,
    },
  ];
}

export function demoEventHost(username: DemoPersonaUsername): DemoPersona {
  return byUsername.get(username)!;
}

export function isDemoHomePostId(id: string): boolean {
  return id.startsWith("demo-post-");
}

export function getDemoHomePostById(id: string): DemoHomeFeedPost | null {
  for (const post of createDemoHomeFeedPosts()) {
    if (post.id === id) return post;
  }
  for (const persona of DEMO_PERSONAS) {
    for (const p of persona.posts) {
      if (p.id === id) {
        return {
          id: p.id,
          userId: persona.id,
          username: persona.username,
          avatar_url: persona.avatar_url,
          role: persona.role,
          is_verified: persona.is_verified,
          caption: p.content ?? "",
          media_url: p.media_url ?? "",
          post_type: p.media_type === "video" ? "video" : "image",
          likes: p.likesCount,
          comments: p.commentsCount,
          has_liked: false,
          created_at: "Recently",
        };
      }
    }
  }
  return null;
}

/** Static story groups for demo tray users without Supabase stories rows. */
export function createDemoStoryGroups(): import("@/lib/sanctuary-stories/types").StoryUserGroup[] {
  const usernames: DemoPersonaUsername[] = ["kingdom_gamer", "prophetic_voices", "sister_sarah"];
  return usernames.map((username) => {
    const persona = byUsername.get(username)!;
    return {
      userId: persona.id,
      username: persona.username,
      avatarUrl: persona.avatar_url,
      hasUnviewed: true,
      stories: [
        {
          id: `demo-story-${username}-1`,
          mediaUrl: streamThumbnailPhoto(username, 1080, 1920),
          mediaType: "image" as const,
          createdAt: new Date(Date.now() - 3_600_000).toISOString(),
          viewed: false,
        },
      ],
    };
  });
}
