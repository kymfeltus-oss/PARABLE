import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  createDemoSanctuaryLayout,
  getDemoPersonaById,
  getDemoPersonaByUsername,
  isDemoPersonaId,
} from "@/lib/demo-personas";
import { getProfileLayout } from "./actions";
import MySanctuaryClientView from "./MySanctuaryClientView";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  handle: string;
  loginNext?: string;
};

async function resolveProfileHandle(handle: string): Promise<
  | { kind: "demo"; layout: ReturnType<typeof createDemoSanctuaryLayout> }
  | { kind: "live"; targetUserId: string }
  | null
> {
  const trimmed = handle.trim();
  if (!trimmed) return null;

  const demoByUsername = getDemoPersonaByUsername(trimmed);
  if (demoByUsername) {
    return { kind: "demo", layout: createDemoSanctuaryLayout(demoByUsername) };
  }

  if (isDemoPersonaId(trimmed)) {
    const demoById = getDemoPersonaById(trimmed);
    if (demoById) {
      return { kind: "demo", layout: createDemoSanctuaryLayout(demoById) };
    }
  }

  const supabase = await createClient();
  let targetUserId = trimmed;

  if (!UUID_RE.test(trimmed)) {
    const { data } = await supabase.from("profiles").select("id").eq("username", trimmed).maybeSingle();
    if (!data?.id) return null;
    targetUserId = data.id as string;
  }

  return { kind: "live", targetUserId };
}

/** Instagram-style public profile — UUID or username (including demo personas). */
export default async function MySanctuaryPublicProfileServer({ handle, loginNext }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const nextPath = loginNext ?? `/profile/${encodeURIComponent(handle)}`;
  if (error || !user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const resolved = await resolveProfileHandle(handle);
  if (!resolved) {
    notFound();
  }

  if (resolved.kind === "demo") {
    return (
      <MySanctuaryClientView
        initialData={resolved.layout}
        currentUserId={user.id}
        targetUserId={resolved.layout.profile!.id}
        isDemoProfile
      />
    );
  }

  const layout = await getProfileLayout(resolved.targetUserId, user.id);
  if (!layout.profile) {
    notFound();
  }

  return (
    <MySanctuaryClientView
      initialData={layout}
      currentUserId={user.id}
      targetUserId={resolved.targetUserId}
    />
  );
}
