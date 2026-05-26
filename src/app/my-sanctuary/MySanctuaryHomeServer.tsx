import { redirect } from "next/navigation";
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
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect(`/login?next=${encodeURIComponent(loginNext)}`);
    }
    userId = user.id;
  }

  const layout = guestPreview
    ? {
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
      }
    : await getProfileLayout(userId, userId);
  const [registeredEventIds, homePayload] = await Promise.all([
    guestPreview ? Promise.resolve([] as string[]) : fetchSanctuaryEventRegistrations(userId),
    fetchSanctuaryHomePayload(),
  ]);

  return (
    <MySanctuaryHomeClientView
      initialData={layout}
      currentUserId={userId}
      initialRegisteredEventIds={registeredEventIds}
      initialHomePayload={homePayload}
    />
  );
}
