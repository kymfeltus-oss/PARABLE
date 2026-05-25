import type { ShareFollower } from "@/components/sanctuary-home/SanctuaryShareSheet";
import { DEMO_PERSONA_IDS } from "@/lib/demo-personas";

/** Simulated follower profiles for share sheet checklist. */
export function getSanctuaryShareFollowers(): ShareFollower[] {
  const keys = Object.keys(DEMO_PERSONA_IDS) as (keyof typeof DEMO_PERSONA_IDS)[];
  return keys.map((username) => ({
    id: DEMO_PERSONA_IDS[username],
    username,
    avatar_url: `/demo/avatars/${username}.svg`,
  }));
}

export const SANCTUARY_CREATE_MENU_EVENT = "parable:open-creation-menu";

export function dispatchSanctuaryCreateMenu() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SANCTUARY_CREATE_MENU_EVENT));
}
