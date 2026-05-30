// Force dynamic rendering to bypass static pre-render and stale compilation passes
export const dynamic = "force-dynamic";

import { GoLiveCockpitLauncherButton } from "@/components/my-sanctuary/GoLiveCockpitLauncherButton";
import MySanctuaryHomeServer from "./MySanctuaryHomeServer";

/** Sanctuary tab — authenticated home feed (`SanctuaryHomeFeed`). */
export default function MySanctuaryPage() {
  return (
    <>
      <MySanctuaryHomeServer loginNext="/my-sanctuary" />
      <GoLiveCockpitLauncherButton />
    </>
  );
}
