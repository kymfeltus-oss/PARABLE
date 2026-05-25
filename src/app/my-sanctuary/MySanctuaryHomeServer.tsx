import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getProfileLayout } from "./actions";
import MySanctuaryHomeClientView from "./MySanctuaryHomeClientView";
import { fetchSanctuaryEventRegistrations } from "./event-actions";
import { fetchSanctuaryHomePayload } from "./home-data";

type Props = {
  loginNext: string;
};

/** Auth + layout prefetch for `/my-sanctuary` home feed (session unchanged). */
export default async function MySanctuaryHomeServer({ loginNext }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/login?next=${encodeURIComponent(loginNext)}`);
  }

  const layout = await getProfileLayout(user.id, user.id);
  const [registeredEventIds, homePayload] = await Promise.all([
    fetchSanctuaryEventRegistrations(user.id),
    fetchSanctuaryHomePayload(),
  ]);

  return (
    <MySanctuaryHomeClientView
      initialData={layout}
      currentUserId={user.id}
      initialRegisteredEventIds={registeredEventIds}
      initialHomePayload={homePayload}
    />
  );
}
