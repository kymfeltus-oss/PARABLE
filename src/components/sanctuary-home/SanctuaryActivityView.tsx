"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, Zap } from "lucide-react";
import { fallbackAvatarOnError } from "@/lib/avatar-display";
import {
  formatRelativeActivityTime,
  groupActivityNotifications,
} from "@/lib/sanctuary-activity/utils";
import { SANCTUARY_ACTIVITY_NAV_KEY, type ActivityNotification } from "@/lib/sanctuary-activity/types";
import { useSanctuaryActivityOptional } from "@/providers/SanctuaryActivityProvider";
import { debugSessionLog } from "@/lib/debug-session-log";

function navigateToPost(router: ReturnType<typeof useRouter>, notification: ActivityNotification) {
  sessionStorage.setItem(
    SANCTUARY_ACTIVITY_NAV_KEY,
    JSON.stringify({
      postId: notification.postId,
      openComments: notification.kind === "comment",
    }),
  );
  router.push("/my-sanctuary");
}

/** Activity / notifications full-screen view. */
export default function SanctuaryActivityView() {
  const router = useRouter();
  const activity = useSanctuaryActivityOptional();
  const hasMarkedReadRef = useRef(false);

  useEffect(() => {
    if (!activity || hasMarkedReadRef.current) return;
    hasMarkedReadRef.current = true;
    // #region agent log
    debugSessionLog(
      "SanctuaryActivityView:markAllRead",
      "markAllRead invoked once",
      { notificationCount: activity.notifications.length },
      "H-E",
    );
    // #endregion
    activity.markAllRead();
  }, [activity?.markAllRead]);

  if (!activity) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center bg-[#01040A] text-sm text-[#64748B]">
        Loading activity…
      </div>
    );
  }

  const { notifications, triggerDemoEvent } = activity;
  const groups = groupActivityNotifications(notifications);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#01040A] font-sans text-[#F8FAFC]">
      <header className="sticky top-0 z-40 flex h-[56px] items-center gap-3 bg-[#02040A]/90 px-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => router.push("/my-sanctuary")}
          className="flex h-10 w-10 items-center justify-center text-[#F8FAFC] transition hover:text-[#00F2FE]"
          aria-label="Back to home feed"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold tracking-tight">Activity</h1>
      </header>

      <div className="border-b border-[#06111E] px-4 py-3">
        <button
          type="button"
          onClick={triggerDemoEvent}
          className="inline-flex items-center gap-2 rounded-xl bg-[#06111E] px-3 py-2 text-xs font-semibold text-[#00F2FE] transition hover:bg-[#06111E]/80"
        >
          <Zap className="h-4 w-4" />
          Trigger Demo Event
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <Heart className="mb-3 h-10 w-10 text-[#334155]" />
            <p className="text-sm font-semibold text-[#CBD5E1]">No activity yet</p>
            <p className="mt-1 text-xs text-[#64748B]">
              Simulated likes and comments from the community will appear here.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.label} className="mb-4">
              <h2 className="px-2 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#64748B]">
                {group.label}
              </h2>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigateToPost(router, item)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-[#06111E]/60"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.actor.avatar_url}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                        onError={fallbackAvatarOnError}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-[#CBD5E1]">
                          <span className="font-semibold text-[#F8FAFC]">{item.actor.username}</span>{" "}
                          {item.kind === "like" ? (
                            <>
                              liked your post.{" "}
                              <Heart className="ml-0.5 inline h-3.5 w-3.5 fill-[#EF4444] text-[#EF4444]" />
                            </>
                          ) : (
                            <>
                              commented:{" "}
                              <span className="text-[#94A3B8]">
                                &quot;{item.commentText ?? "…"}&quot;
                              </span>
                            </>
                          )}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#64748B]">
                          {formatRelativeActivityTime(item.createdAt)}
                        </p>
                      </div>
                      {item.kind === "like" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.postMediaUrl}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-md object-cover ring-1 ring-[#06111E]"
                          onError={fallbackAvatarOnError}
                        />
                      ) : (
                        <MessageCircle className="h-5 w-5 shrink-0 text-[#64748B]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
