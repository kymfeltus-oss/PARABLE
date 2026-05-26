"use server";

import { createClient } from "@/utils/supabase/server";
import {
  fetchSanctuaryHomePostsPageWithCursor,
  type SanctuaryHomePostsPage,
} from "./home-data";

export async function loadMoreSanctuaryHomePosts(
  beforeCreatedAt?: string,
): Promise<SanctuaryHomePostsPage> {
  return fetchSanctuaryHomePostsPageWithCursor(beforeCreatedAt, 10);
}

export async function fetchSanctuaryEventRegistrations(
  userId: string,
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sanctuary_event_registrations")
    .select("event_id")
    .eq("user_id", userId);

  if (error) {
    console.error("fetchSanctuaryEventRegistrations:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.event_id as string);
}

export async function registerSanctuaryEvent(input: {
  eventId: string;
  userId: string;
  ticketPrice: number;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== input.userId) {
    return { ok: false, error: "Not authenticated." };
  }

  const { error } = await supabase.from("sanctuary_event_registrations").insert({
    event_id: input.eventId,
    user_id: input.userId,
    ticket_price: input.ticketPrice,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    console.error("registerSanctuaryEvent:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
