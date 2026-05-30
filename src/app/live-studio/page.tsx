export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import LiveStudioDashboardClient from "@/components/live-studio/LiveStudioDashboardClient";
import {
  getParableGuestUserId,
  isParableGuestActiveOnServer,
} from "@/lib/parable-dev-guest";
import { createClient } from "@/utils/supabase/server";

/** Kick-style creator studio: activity feed, stage monitor, live chat. */
export default async function LiveStudioPage() {
  const guestPreview = await isParableGuestActiveOnServer();
  let userId = getParableGuestUserId();

  if (!guestPreview) {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      redirect("/login?next=/live-studio");
    }
    userId = session.user.id;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#080a0c]">
      <LiveStudioDashboardClient userId={userId} />
    </div>
  );
}
