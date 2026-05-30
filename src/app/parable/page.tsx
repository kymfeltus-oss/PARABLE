export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import ParableStudioClient from "@/components/parable/ParableStudioClient";
import {
  getParableGuestUserId,
  isParableGuestActiveOnServer,
} from "@/lib/parable-dev-guest";
import { createClient } from "@/utils/supabase/server";

/** Standalone AI Film Studio + vertical shorts catalogue — does not modify streaming routes. */
export default async function ParableStudioPage() {
  const guestPreview = await isParableGuestActiveOnServer();
  let userId = getParableGuestUserId();

  if (!guestPreview) {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      redirect("/login?next=/parable");
    }
    userId = session.user.id;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#080a0c]">
      <ParableStudioClient userId={userId} />
    </div>
  );
}
