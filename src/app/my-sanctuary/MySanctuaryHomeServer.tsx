import { redirect } from "next/navigation";
import { agentDebugLogServer } from "@/lib/agent-debug-log-server";
import { createClient } from "@/utils/supabase/server";
import {
  getParableGuestUserId,
  isParableGuestActiveOnServer,
  PARABLE_GUEST_PROFILE,
} from "@/lib/parable-dev-guest";
import { getProfileLayout } from "./actions";
import MySanctuaryHomeClientView from "./MySanctuaryHomeClientView";
import { fetchSanctuaryEventRegistrations } from "./event-actions";
import { fetchSanctuaryHomePayload } from "./home-data";

type Props = {
  loginNext: string;
};

/** Auth + layout prefetch for `/my-sanctuary` home feed (session unchanged). */
export default async function MySanctuaryHomeServer({ loginNext }: Props) {
  const guestPreview = await isParableGuestActiveOnServer();
  const guestUserId = getParableGuestUserId();

  let userId = guestUserId;

  if (!guestPreview) {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      redirect(`/login?next=${encodeURIComponent(loginNext)}`);
    }
    userId = session.user.id;
  }

  const guestLayout = {
    profile: {
      id: PARABLE_GUEST_PROFILE.id,
      username: PARABLE_GUEST_PROFILE.username,
      full_name: PARABLE_GUEST_PROFILE.full_name,
      avatar_url: null,
      bio: null,
    },
    posts: [],
    taggedPosts: [],
    totalPosts: 0,
    followersCount: 0,
    followingCount: 0,
    isFollowingCurrentUser: false,
  };

  const sanctuaryT0 = Date.now();
  const [layout, registeredEventIds, homePayload] = await Promise.all([
    guestPreview ? Promise.resolve(guestLayout) : getProfileLayout(userId, userId),
    guestPreview ? Promise.resolve([] as string[]) : fetchSanctuaryEventRegistrations(userId),
    fetchSanctuaryHomePayload(),
  ]);
  // #region agent log
  agentDebugLogServer({
    runId: "post-fix-4",
    hypothesisId: "H4",
    location: "MySanctuaryHomeServer.tsx:prefetch",
    message: "sanctuary parallel prefetch done",
    data: { guestPreview, ms: Date.now() - sanctuaryT0 },
  });
  // #endregion

  return (
    <MySanctuaryHomeClientView
      initialData={layout}
      currentUserId={userId}
      initialRegisteredEventIds={registeredEventIds}
      initialHomePayload={homePayload}
    />
  );
}
