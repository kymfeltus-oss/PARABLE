/** Unified per-creator LiveKit room — viewers and publishers should target the same name. */
export function unifiedStreamRoomName(streamId: string): string {
  return `parable-live-${streamId}`;
}
