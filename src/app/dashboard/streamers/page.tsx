export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import StreamerDashboardClient from "@/components/streamers/StreamerDashboardClient";
import StreamControlDeck from "@/components/stream/StreamControlDeck";
import { unifiedStreamRoomName } from "@/lib/livekit-unified-room";
import {
  getParableGuestUserId,
  isParableGuestActiveOnServer,
} from "@/lib/parable-dev-guest";
import { createClient } from "@/utils/supabase/server";

/** Standalone Go Live / Creator Command Center — does not modify `/streamers` discovery. */
export default async function StandaloneStreamerDashboardPage() {
  const guestPreview = await isParableGuestActiveOnServer();
  let currentActiveStreamerId = getParableGuestUserId();

  if (!guestPreview) {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      redirect("/login?next=/dashboard/streamers");
    }
    currentActiveStreamerId = session.user.id;
  }

  const roomName = unifiedStreamRoomName(currentActiveStreamerId);

  return (
    <div className="min-h-screen w-full space-y-8 bg-[#080a0c] px-4 py-8 lg:px-8">
      <StreamControlDeck roomName={roomName} userId={currentActiveStreamerId} />
      <StreamerDashboardClient userId={currentActiveStreamerId} />
    </div>
  );
}
