"use client";

import Link from "next/link";
import { Calendar, Ticket } from "lucide-react";
import { DEMO_AVATAR_FALLBACK, demoProfileHref, type DemoHomeEvent } from "@/lib/demo-personas";

type SidebarEvent = DemoHomeEvent & {
  host: {
    id: string;
    username: string;
    avatar_url: string;
    role: string;
    is_verified: boolean;
  };
};

type Props = {
  events: SidebarEvent[];
  onGetPass: (event: SidebarEvent) => void;
};

function mediaFallback(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEMO_AVATAR_FALLBACK;
}

export default function SanctuaryIgEventsSidebar({ events, onGetPass }: Props) {
  if (events.length === 0) return null;

  return (
    <aside className="hidden min-w-0 lg:block lg:w-[232px] lg:shrink-0">
      <div className="sticky top-[52px] rounded-xl border border-[#06111E] bg-[#020712] p-3 shadow-xl">
        <div className="mb-3 flex items-center gap-2 border-b border-[#06111E] pb-2.5">
          <Ticket className="h-3.5 w-3.5 text-[#00F2FE]" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00F2FE]">Ticketed Actions</h2>
        </div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Active Events</p>

        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="overflow-hidden rounded-lg border border-[#06111E] bg-[#06111E]/40 transition hover:border-[#00F2FE]/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={evt.cover_image}
                alt=""
                className="h-20 w-full object-cover"
                onError={mediaFallback}
              />
              <div className="space-y-1.5 p-2.5">
                <h3 className="line-clamp-2 text-xs font-bold leading-snug text-[#F8FAFC]">{evt.title}</h3>
                <p className="line-clamp-2 text-[10px] leading-relaxed text-[#94A3B8]">{evt.description}</p>
                <p className="flex items-center gap-1 text-[10px] text-[#CBD5E1]">
                  <Calendar className="h-3 w-3 shrink-0 text-[#0EA5E9]" />
                  <span className="truncate">{evt.scheduled_for}</span>
                </p>
                <p className="truncate text-[10px] text-[#64748B]">
                  Host{" "}
                  <Link href={demoProfileHref(evt.host.username)} className="text-[#00F2FE] hover:underline">
                    @{evt.host.username}
                  </Link>
                </p>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-xs font-black text-[#00F2FE]">
                    {evt.ticket_price > 0 ? `$${evt.ticket_price.toFixed(2)}` : "FREE"}
                  </span>
                  {evt.is_registered ? (
                    <span className="shrink-0 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                      ✓ Registered
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onGetPass(evt)}
                      className="shrink-0 rounded bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#01040A] shadow-md"
                    >
                      Get Pass
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
