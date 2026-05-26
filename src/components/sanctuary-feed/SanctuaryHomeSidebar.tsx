"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SanctuaryChannel } from "@/lib/sanctuary-following";
import { ChannelAvatar } from "@/components/sanctuary/SanctuaryDiscoverSection";
import { fallbackAvatarOnError } from "@/lib/avatar-display";

type Props = {
  username: string;
  displayLine?: string;
  suggestions: SanctuaryChannel[];
  avatarUrl?: string | null;
};

/**
 * Instagram “Suggestions for you” column (desktop), PARABLE styling.
 */
export default function SanctuaryHomeSidebar({ username, displayLine, suggestions, avatarUrl }: Props) {
  const router = useRouter();
  const top = suggestions.slice(0, 5);

  return (
    <aside className="hidden min-h-0 w-full min-w-0 shrink-0 border-l border-white/[0.08] bg-[#050506] px-3 py-4 lg:flex lg:w-[300px] lg:flex-col lg:overflow-hidden">
      <div className="space-y-4 lg:shrink-0">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-neutral-700 bg-neutral-900">
              {avatarUrl && avatarUrl !== "/logo.svg" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={fallbackAvatarOnError}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#00f2fe]">
                  {username.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-100">{username}</p>
              <p className="truncate text-sm text-neutral-500">{displayLine ?? "PARABLE"}</p>
            </div>
          </button>
          <Link
            href="/following?tab=discover"
            className="shrink-0 text-xs font-semibold text-[#00f2fe] hover:text-[#5ff4ff]"
          >
            Switch
          </Link>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-400">Suggestions for you</span>
            <Link href="/following?tab=discover" className="text-xs font-semibold text-neutral-100 hover:text-white">
              See all
            </Link>
          </div>
          <ul className="space-y-3">
            {top.length === 0 ? (
              <li className="text-sm text-neutral-500">Follow creators in Following → Discover.</li>
            ) : (
              top.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/following?tab=discover")}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <ChannelAvatar c={c} className="h-9 w-9 rounded-full" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-neutral-100">{c.name}</span>
                      <span className="block truncate text-xs text-neutral-500">{c.handle}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/following?tab=discover")}
                    className="shrink-0 text-xs font-semibold text-[#00f2fe] hover:text-[#5ff4ff]"
                  >
                    Follow
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <p className="text-[11px] leading-relaxed text-neutral-600">
          © PARABLE · Sanctuary home ·{" "}
          <Link href="/my-sanctuary" className="underline-offset-2 hover:text-neutral-400 hover:underline">
            My space
          </Link>
        </p>
      </div>
    </aside>
  );
}
