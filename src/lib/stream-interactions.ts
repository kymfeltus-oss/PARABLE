export function streamInteractionChannelName(streamId: string): string {
  return `realtime-stream-interactions:${streamId}`;
}

export const AMEN_REACTION_EVENT = "amen_reaction";

/** Broadcast payload: `{ kind?: WorshipReactionKind; emoji?: string; timestamp?: number }` */
export const WORSHIP_REACTION_EVENT = "worship_reaction";

/** Alias used in product docs — handled by the same listener as `worship_reaction`. */
export const REACTION_BURST_EVENT = WORSHIP_REACTION_EVENT;

/** Same-tab immediate overlay when Realtime broadcast is not ready yet. */
export const LOCAL_WORSHIP_REACTION_EVENT = "parable-local-worship-reaction";

export type LocalWorshipReactionDetail = {
  kind: string;
  emoji: string;
};

export function dispatchLocalWorshipReaction(detail: LocalWorshipReactionDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<LocalWorshipReactionDetail>(LOCAL_WORSHIP_REACTION_EVENT, { detail }),
  );
}
