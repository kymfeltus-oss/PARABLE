export type HubId = 'pulpit' | 'green_room' | 'studio' | 'base' | 'sanctuary';

/** Canonical order for the Nav-Portal / Rolodex */
export const HUB_ORDER: HubId[] = [
  'sanctuary',
  'pulpit',
  'green_room',
  'studio',
  'base',
];

export type HubModuleLink = {
  title: string;
  description: string;
  href: string;
  badge?: string;
};

export type HubDefinition = {
  id: HubId;
  label: string;
  shortLabel: string;
  tagline: string;
  /** Hex for fog / accents in 3D + UI */
  accent: string;
  cameraTarget: [number, number, number];
  modules: HubModuleLink[];
};

export const HUB_DEFINITIONS: Record<HubId, HubDefinition> = {
  pulpit: {
    id: 'pulpit',
    label: 'Pulpit',
    shortLabel: 'Pulpit',
    tagline: 'Pastor & preacher · AI architect · ghost-script',
    accent: '#c4a574',
    cameraTarget: [5.2, 2.8, 6.2],
    modules: [
      {
        title: 'Virtual Study',
        description: 'AI-assisted sermon drafting, Greek/Hebrew pulls, message archive.',
        href: '/ai-sanctuary',
        badge: 'AI',
      },
      {
        title: 'Shepherd’s analytics',
        description: 'Member care dashboard — engagement & spiritual streaks (roadmap).',
        href: '/dashboard',
        badge: 'Live',
      },
      {
        title: 'Live broadcast suite',
        description: 'Go live, multi-cam Sunday flow, digital bulletins.',
        href: '/live-studio',
        badge: 'Broadcast',
      },
    ],
  },
  green_room: {
    id: 'green_room',
    label: 'Green Room',
    shortLabel: 'Green',
    tagline: 'Musicians & artists · shed rooms · ticketed nights',
    accent: '#7c3aed',
    cameraTarget: [-5.4, 2.4, 6.4],
    modules: [
      {
        title: 'Sound stage',
        description: 'Shed rooms & ticketed live events (staging).',
        href: '/music-hub',
        badge: 'Stage',
      },
      {
        title: 'Vocal harmony trainer',
        description: 'Rhythm gaming for fans · sheet-music AI for artists.',
        href: '/voices-of-praise',
        badge: 'Train',
      },
      {
        title: 'Gear locker',
        description: 'Imago skins & digital merch drops.',
        href: '/imago',
        badge: 'Gear',
      },
    ],
  },
  studio: {
    id: 'studio',
    label: 'Studio',
    shortLabel: 'Studio',
    tagline: 'Podcasters & influencers · velocity & community',
    accent: '#f97316',
    cameraTarget: [0.2, 3.6, 7.8],
    modules: [
      {
        title: 'Discussion huddle',
        description: 'Multi-user pods, AI transcription, clip generators.',
        href: '/streamer-hub',
        badge: 'Huddle',
      },
      {
        title: 'Brand manager',
        description: 'Virtual merch table & partner sponsorships.',
        href: '/profile',
        badge: 'Brand',
      },
      {
        title: 'Testify clips',
        description: 'Vertical micro-testimonies for the main feed.',
        href: '/testify',
        badge: 'Clips',
      },
    ],
  },
  base: {
    id: 'base',
    label: 'Base',
    shortLabel: 'Base',
    tagline: 'Gamers & streamers · launcher · Narrow Road',
    accent: '#22d3ee',
    cameraTarget: [-3.2, 1.8, 8.4],
    modules: [
      {
        title: 'Squad lobby',
        description: 'Squad up for Armor Up, Kingdom Hoops, and more.',
        href: '/play',
        badge: 'Squad',
      },
      {
        title: 'Streamer command',
        description: 'HUD, activity pulse, blessing ticker.',
        href: '/streamer-hub',
        badge: 'HUD',
      },
      {
        title: 'Esports circuit',
        description: 'Leagues of Light · leaderboards (roadmap).',
        href: '/gaming',
        badge: 'Circuit',
      },
    ],
  },
  sanctuary: {
    id: 'sanctuary',
    label: 'Sanctuary',
    shortLabel: 'Home',
    tagline: 'Member hub · faith journey · giving',
    accent: '#00f2ff',
    cameraTarget: [4.8, 1.6, 7.0],
    modules: [
      {
        title: 'Faith journey',
        description: 'Streaks, outreach ops, badges — trophy room (roadmap).',
        href: '/my-sanctuary',
        badge: 'Journey',
      },
      {
        title: 'Fellowship rail',
        description: 'Church community & huddle friends.',
        href: '/fellowship',
        badge: 'People',
      },
      {
        title: 'Giving gate',
        description: 'Seeds, tithes, mission partners.',
        href: '/contribution-tiers',
        badge: 'Give',
      },
    ],
  },
};
