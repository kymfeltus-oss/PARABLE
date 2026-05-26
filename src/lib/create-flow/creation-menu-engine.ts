import { CREATE_ROUTES, type CreateFlowKind } from "@/lib/create-flow/routes";

/** Matches `CreationMenuAction` in SanctuaryCreationMenuSheet. */
export type CreationMenuAction = CreateFlowKind;

export const ACTIVE_CREATION_ACTION_KEY = "parable:active-creation-action";

export function setActiveCreationAction(action: CreationMenuAction | null): void {
  if (typeof window === "undefined") return;
  if (action) sessionStorage.setItem(ACTIVE_CREATION_ACTION_KEY, action);
  else sessionStorage.removeItem(ACTIVE_CREATION_ACTION_KEY);
}

export function getActiveCreationAction(): CreationMenuAction | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ACTIVE_CREATION_ACTION_KEY);
  if (raw === "post" || raw === "story" || raw === "reel" || raw === "live") return raw;
  return null;
}

export function getCreationRoute(action: CreationMenuAction): string {
  return CREATE_ROUTES[action];
}

type PermissionPrimeResult = {
  ok: boolean;
  offline?: boolean;
  galleryReady?: boolean;
};

async function warmMediaStream(constraints: MediaStreamConstraints): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

/**
 * Permission / capability priming per create option (non-blocking for routing).
 * Destination routes run full guard loops on mount.
 */
export async function primeCreationPermissions(action: CreationMenuAction): Promise<PermissionPrimeResult> {
  switch (action) {
    case "post":
      return { ok: true, galleryReady: true };
    case "story":
      await warmMediaStream({ video: { facingMode: "user" }, audio: true });
      return { ok: true };
    case "reel":
      await warmMediaStream({ video: { facingMode: "environment" }, audio: true });
      return { ok: true };
    case "live": {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      await warmMediaStream({ video: true, audio: true });
      return { ok: true, offline: offline || undefined };
    }
    default:
      return { ok: true };
  }
}

/** Full guard loop for create route initialization. */
export async function runCreationPermissionGuard(action: CreationMenuAction): Promise<PermissionPrimeResult> {
  return primeCreationPermissions(action);
}
