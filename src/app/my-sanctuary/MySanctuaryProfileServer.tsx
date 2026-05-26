import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  getParableGuestUserId,
  isParableGuestActiveOnServer,
  PARABLE_GUEST_PROFILE,
} from "@/lib/parable-dev-guest";
import { getProfileLayout } from "./actions";
import MySanctuaryClientView from "./MySanctuaryClientView";

type Props = {
  /** Login redirect target when session is missing (preserves bottom-nav entry URL). */
  loginNext: string;
};

/** Shared Instagram-profile server shell for `/profile` and `/my-sanctuary`. */
export default async function MySanctuaryProfileServer({ loginNext }: Props) {
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

  return <MySanctuaryClientView initialData={layout} currentUserId={userId} />;
}
