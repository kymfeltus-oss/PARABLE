export const PLAY_GAMES = [
  {
    id: 'narrow-road',
    title: 'The Narrow Road',
    tag: 'Metropolis · outreach ops',
    shortBlurb: 'Drive the city, hit cyan outreach rings, press E to complete ops. Feels like a mini open-world activity.',
    accent: 'from-[#00f2ff]/20 to-purple-500/10',
    border: 'border-[#00f2ff]/35',
    accentBar: 'bg-gradient-to-b from-[#00f2ff] to-purple-500',
    bannerFrom: 'from-[#00f2ff]/25',
    bannerTo: 'to-purple-900/40',
  },
  {
    id: 'armor-up',
    title: 'Armor Up: The Last Stand',
    tag: 'Citadel · storm survival',
    shortBlurb: 'Harvest Truth, Spirit, and Grace, build your citadel, and outlast the storm before it hits 100.',
    accent: 'from-violet-500/20 to-cyan-500/10',
    border: 'border-violet-400/35',
    accentBar: 'bg-gradient-to-b from-violet-400 to-cyan-500',
    bannerFrom: 'from-violet-600/30',
    bannerTo: 'to-cyan-900/35',
  },
  {
    id: 'kingdom-hoops',
    title: 'Kingdom Hoops',
    tag: 'Rhythm · streetball',
    shortBlurb: 'Gather and release on the arc — defender shrinks your window. Time the beat for double points.',
    accent: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-400/35',
    accentBar: 'bg-gradient-to-b from-orange-400 to-amber-600',
    bannerFrom: 'from-orange-600/35',
    bannerTo: 'to-amber-900/40',
  },
  {
    id: 'gridiron-glory',
    title: 'Gridiron Glory',
    tag: 'Simulation · downs & Unity',
    shortBlurb: 'Pass power meter + lead reticle, time the run lane, stack Unity for inspired yards. First down at 8+.',
    accent: 'from-emerald-500/15 to-cyan-500/10',
    border: 'border-emerald-400/30',
    accentBar: 'bg-gradient-to-b from-emerald-400 to-cyan-500',
    bannerFrom: 'from-emerald-600/30',
    bannerTo: 'to-cyan-900/35',
  },
] as const;

export type PlayGameId = (typeof PLAY_GAMES)[number]['id'];

export function playHref(gameId: PlayGameId) {
  return `/gaming/play/${gameId}`;
}
