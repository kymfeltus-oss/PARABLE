"use client";

import { useRouter } from "next/navigation";
import { CirclePlus, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

/**
 * Instagram-style top actions: create, home (md+), profile avatar.
 */
export default function Actions({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const router = useRouter();
  const { avatarUrl } = useAuth();
  const isLight = variant === "light";

  const avatarSrc = avatarUrl?.trim() || "https://i.pravatar.cc/150?u=24";
  const iconClass = isLight
    ? "text-[#262626] hover:text-[#00f2ff]"
    : "text-[#00f2ff] hover:text-[#00f2ff]";
  const ringClass = isLight
    ? "ring-[#dbdbdb] hover:ring-[#00f2ff]/50"
    : "ring-[#00f2ff]/35 hover:ring-[#00f2ff]/60";

  return (
    <div className={`flex shrink-0 items-center gap-3 sm:gap-4 ${isLight ? "text-[#262626]" : "text-[#00f2ff]"}`}>
      <button
        type="button"
        onClick={() => router.push("/my-sanctuary")}
        className={`rounded-lg p-1 transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2ff]/50 ${iconClass}`}
        aria-label="Open Sanctuary feed"
      >
        <CirclePlus className="h-6 w-6" strokeWidth={2} absoluteStrokeWidth />
      </button>

      <button
        type="button"
        onClick={() => router.push("/sanctuary")}
        className={`hidden rounded-lg p-1 transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2ff]/50 md:flex ${iconClass}`}
        aria-label="Sanctuary feed home"
      >
        <Home className="h-6 w-6" strokeWidth={2} absoluteStrokeWidth />
      </button>

      <button
        type="button"
        onClick={() => router.push("/profile")}
        className={`rounded-full p-0.5 ring-2 transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2ff]/60 ${ringClass}`}
        aria-label="Profile"
      >
        <img
          src={avatarSrc}
          alt=""
          className="h-9 w-9 cursor-pointer rounded-full object-cover sm:h-10 sm:w-10"
          onError={fallbackAvatarOnError}
        />
      </button>
    </div>
  );
}
