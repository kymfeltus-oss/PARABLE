import MySanctuaryProfileServer from "@/app/my-sanctuary/MySanctuaryProfileServer";

/**
 * Live preview for the Tailwind-only Instagram profile blueprint.
 * Uses the same auth + layout data as `/profile`, routed through `SanctuaryInstagramProfileBridge`.
 */
export default function ProfileBlueprintPage() {
  return <MySanctuaryProfileServer loginNext="/profile/blueprint" />;
}
