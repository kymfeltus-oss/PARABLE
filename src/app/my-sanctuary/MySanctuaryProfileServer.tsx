import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getProfileLayout } from "./actions";
import MySanctuaryClientView from "./MySanctuaryClientView";

type Props = {
  /** Login redirect target when session is missing (preserves bottom-nav entry URL). */
  loginNext: string;
};

/** Shared Instagram-profile server shell for `/profile` and `/my-sanctuary`. */
export default async function MySanctuaryProfileServer({ loginNext }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/login?next=${encodeURIComponent(loginNext)}`);
  }

  const layout = await getProfileLayout(user.id, user.id);

  return <MySanctuaryClientView initialData={layout} currentUserId={user.id} />;
}
