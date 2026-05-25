import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SanctuaryActivityClient from "./SanctuaryActivityClient";

/** Auth gate for `/my-sanctuary/activity`. */
export default async function MySanctuaryActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/login?next=${encodeURIComponent("/my-sanctuary/activity")}`);
  }

  return <SanctuaryActivityClient />;
}
