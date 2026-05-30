import type { EmojiBurstItem } from "@/lib/go-live-layout-types";

export type { EmojiBurstItem } from "@/lib/go-live-layout-types";

export function createEmojiBurstCluster(emoji: string, count?: number): EmojiBurstItem[] {
  const spawnCount = count ?? Math.floor(Math.random() * 3) + 3;
  const cluster: EmojiBurstItem[] = [];

  for (let i = 0; i < spawnCount; i++) {
    cluster.push({
      id: `${crypto.randomUUID()}-${i}`,
      emoji,
      x: Math.floor(Math.random() * 80) - 40,
      scale: Number((Math.random() * 0.6 + 0.8).toFixed(2)),
      delay: Math.floor(Math.random() * 150),
      duration: Math.floor(Math.random() * 300) + 1200,
    });
  }

  return cluster;
}

/** @deprecated Use createEmojiBurstCluster — kept for internal hook compatibility. */
export function spawnEmojiBurstItems(emoji: string, count?: number): EmojiBurstItem[] {
  return createEmojiBurstCluster(emoji, count);
}
