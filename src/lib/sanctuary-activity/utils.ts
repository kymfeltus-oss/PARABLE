import type { ActivityNotification } from "@/lib/sanctuary-activity/types";

export function formatRelativeActivityTime(timestamp: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return `${Math.max(1, diffSec)}s`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

export type ActivityGroupLabel = "Today" | "Yesterday" | "Earlier";

export function groupActivityNotifications(
  notifications: ActivityNotification[],
): { label: ActivityGroupLabel; items: ActivityNotification[] }[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const buckets: Record<ActivityGroupLabel, ActivityNotification[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  for (const item of notifications) {
    const t = new Date(item.createdAt);
    if (t >= startOfToday) buckets.Today.push(item);
    else if (t >= startOfYesterday) buckets.Yesterday.push(item);
    else buckets.Earlier.push(item);
  }

  return (["Today", "Yesterday", "Earlier"] as const)
    .map((label) => ({ label, items: buckets[label] }))
    .filter((group) => group.items.length > 0);
}
