import type { SyntheticEvent } from "react";

/** Prevent broken remote avatars from showing a torn icon; safe for <img onError>. */
export function fallbackAvatarOnError(
  e: SyntheticEvent<HTMLImageElement, Event>,
) {
  const el = e.currentTarget;
  el.onerror = null;
  el.src = "/logo.svg";
}
