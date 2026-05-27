import type { SupabaseClient } from "@supabase/supabase-js";

/** Mirrors `user_follows` into legacy `follows` so home feed + sanctuary stay in sync. */
async function syncLegacyFollow(
  supabase: SupabaseClient,
  senderId: string,
  targetId: string,
  action: "insert" | "delete",
): Promise<void> {
  if (action === "insert") {
    const { error } = await supabase.from("follows").insert({
      follower_id: senderId,
      following_id: targetId,
    });
    if (error && !error.message.includes("duplicate")) {
      console.error("syncLegacyFollow insert:", error.message);
    }
    return;
  }
  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", senderId)
    .eq("following_id", targetId);
}

export async function countFollowers(
  supabase: SupabaseClient,
  targetProfileId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("user_follows")
    .select("*", { count: "exact", head: true })
    .eq("target_id", targetProfileId);

  if (!error && typeof count === "number") return count;

  const legacy = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", targetProfileId);

  return legacy.count ?? 0;
}

export async function countFollowing(
  supabase: SupabaseClient,
  profileId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("user_follows")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", profileId);

  if (!error && typeof count === "number") return count;

  const legacy = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profileId);

  return legacy.count ?? 0;
}

export async function isUserFollowing(
  supabase: SupabaseClient,
  senderId: string,
  targetProfileId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_follows")
    .select("id")
    .eq("sender_id", senderId)
    .eq("target_id", targetProfileId)
    .maybeSingle();

  if (!error) return Boolean(data);

  const legacy = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", senderId)
    .eq("following_id", targetProfileId)
    .maybeSingle();

  return Boolean(legacy.data);
}

export async function toggleUserFollow(
  supabase: SupabaseClient,
  senderId: string,
  targetProfileId: string,
  currentlyFollowing: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (senderId === targetProfileId) {
    return { ok: false, error: "You cannot follow yourself." };
  }

  if (currentlyFollowing) {
    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("sender_id", senderId)
      .eq("target_id", targetProfileId);

    if (error) {
      const legacy = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", senderId)
        .eq("following_id", targetProfileId);
      if (legacy.error) return { ok: false, error: legacy.error.message };
    } else {
      await syncLegacyFollow(supabase, senderId, targetProfileId, "delete");
    }
    return { ok: true };
  }

  const { error } = await supabase
    .from("user_follows")
    .insert({ sender_id: senderId, target_id: targetProfileId });

  if (error) {
    const legacy = await supabase.from("follows").insert({
      follower_id: senderId,
      following_id: targetProfileId,
    });
    if (legacy.error) return { ok: false, error: legacy.error.message };
    return { ok: true };
  }

  await syncLegacyFollow(supabase, senderId, targetProfileId, "insert");
  return { ok: true };
}
