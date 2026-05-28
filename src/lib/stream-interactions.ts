export function streamInteractionChannelName(streamId: string): string {
  return `realtime-stream-interactions:${streamId}`;
}

export const AMEN_REACTION_EVENT = "amen_reaction";

/** Broadcast payload: `{ kind?: WorshipReactionKind; emoji?: string }` */
export const WORSHIP_REACTION_EVENT = "worship_reaction";
