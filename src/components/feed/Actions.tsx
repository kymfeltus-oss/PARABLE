"use client";

import { useRouter } from "next/navigation";
import { CirclePlus, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

/**
 * Instagram-style top actions: create, home (md+), profile avatar — PARABLE Sovereign styling.
 */
export default function Actions() {
  const router = useRouter();
  const { avatarUrl } = useAuth();

  const avatarSrc = avatarUrl?.trim() || "https://i.pravatar.cc/150?u=24";

  return (
    <div className="flex shrink-0 items-center gap-4 text-[#00f2fe]">
      <button
        type="button"
        onClick={() => router.push("/my-sanctuary")}
        className="rounded-lg p-1 transition-transform duration-200 ease-in-out hover:scale-[1.15] hover:text-[#00f2fe] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]/50"
        aria-label="Open Sanctuary feed"
      >
        <CirclePlus
          className="h-6 w-6"
          strokeWidth={2}
          absoluteStrokeWidth
        />
      </button>

      <button
        type="button"
        onClick={() => router.push("/sanctuary")}
        className="hidden rounded-lg p-1 transition-transform duration-200 ease-in-out hover:scale-[1.15] hover:text-[#00f2fe] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]/50 md:flex"
        aria-label="Sanctuary feed home"
      >
        <Home className="h-6 w-6" strokeWidth={2} absoluteStrokeWidth />
      </button>

      <button
        type="button"
        onClick={() => router.push("/profile")}
        className="rounded-full p-0.5 ring-2 ring-[#00f2fe]/35 transition-transform duration-200 ease-in-out hover:scale-[1.15] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f2fe]/60"
        aria-label="Profile"
      >
        <img
          src={avatarSrc}
          alt=""
          className="h-12 w-12 cursor-pointer rounded-full object-cover"
          onError={fallbackAvatarOnError}
        />
      </button>
    </div>
  );
}
