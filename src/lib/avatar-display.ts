import type { SyntheticEvent } from "react";

/** Prevent broken remote avatars from showing a torn icon; safe for <img onError>. */
export function fallbackAvatarOnError(
  e: SyntheticEvent<HTMLImageElement, Event>,
) {
  const el = e.currentTarget;
  el.onerror = null;
  el.src = "/logo.svg";
}

/** Initials for live channel / streamer avatars (1–2 characters). */
export function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  const single = parts[0] ?? "?";
  return single.slice(0, 2).toUpperCase();
}

/**
 * Live-feed avatar error handler — hides broken image and shows a sibling initials badge.
 * Parent must be `position: relative` and include `[data-avatar-initials]` placeholder or empty.
 */
export function fallbackLiveAvatarOnError(
  e: SyntheticEvent<HTMLImageElement, Event>,
  displayName: string,
) {
  const el = e.currentTarget;
  el.onerror = null;
  el.style.display = "none";
  const parent = el.parentElement;
  if (!parent) return;

  let badge = parent.querySelector<HTMLElement>("[data-avatar-initials]");
  if (!badge) {
    badge = document.createElement("span");
    badge.setAttribute("data-avatar-initials", "");
    badge.className =
      "absolute inset-0 flex items-center justify-center rounded-full bg-[#24272c] text-[10px] font-bold tracking-wide text-[#00f2fe]";
    parent.appendChild(badge);
  }
  badge.textContent = initialsFromDisplayName(displayName);
  badge.style.display = "flex";
}
