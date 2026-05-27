import { redirect } from "next/navigation";
import UnifiedHybridProfileClient from "@/app/stream/[streamId]/UnifiedHybridProfileClient";
import type { StreamProfileRow } from "@/components/StreamWorkspaceClient";
import { getDemoPersonaById } from "@/lib/demo-personas";
import {
  getParableGuestUserId,
  isParableGuestActiveOnServer,
} from "@/lib/parable-dev-guest";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const PROFILE_SELECT =
  "id, username, display_name, full_name, avatar_url, is_live, role, bio";

async function resolveStreamProfile(streamId: string): Promise<StreamProfileRow | null> {
  const demo = getDemoPersonaById(streamId);
  if (demo) {
    return {
      id: demo.id,
      username: demo.username,
      full_name: demo.full_name,
      avatar_url: demo.avatar_url,
      is_live: demo.is_live,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", streamId)
    .maybeSingle();

  return (data as StreamProfileRow | null) ?? null;
}

export default async function StreamPage({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const { streamId } = await params;
  const guestPreview = await isParableGuestActiveOnServer();
  const supabase = await createClient();

  const { data: userResponse } = await supabase.auth.getUser();
  const user = userResponse?.user ?? null;
  const viewerUserId = user?.id ?? (guestPreview ? getParableGuestUserId() : null);

  if (!viewerUserId) {
    redirect(`/login?next=${encodeURIComponent(`/stream/${streamId}`)}`);
  }

  const initialProfile = await resolveStreamProfile(streamId);

  return (
    <UnifiedHybridProfileClient
      streamId={streamId}
      initialProfile={initialProfile}
      viewerUserId={viewerUserId}
    />
  );
}
