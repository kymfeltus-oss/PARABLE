'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Gamepad2 } from 'lucide-react';

/** Discord-style grays (approximate) for embedded “Activities” look */
const panel = 'bg-[#1e1f22] border-[#3f4147]';
const inner = 'bg-[#111214]';
const textMuted = 'text-[#b5bac1]';
const textHeading = 'text-[#f2f3f5]';
const textSub = 'text-[#949ba4]';

export function ActivityGameTile({
  title,
  tag,
  shortBlurb,
  href,
  accentBarClass,
  bannerFrom,
  bannerTo,
}: {
  title: string;
  tag: string;
  shortBlurb: string;
  href: string;
  accentBarClass: string;
  bannerFrom: string;
  bannerTo: string;
}) {
  return (
    <article
      className={`group relative flex overflow-hidden rounded-xl border ${panel} shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition hover:border-[#4e5058]`}
    >
      <div className={`w-1 shrink-0 rounded-l-[10px] ${accentBarClass}`} aria-hidden />
      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${panel} ${inner}`}
            >
              <Gamepad2 className="text-[#00f2ff]" size={20} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${textSub}`}>Parable activity</p>
              <h3 className={`mt-0.5 truncate text-[15px] font-bold leading-tight ${textHeading}`}>{title}</h3>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-[#23a559]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#23a559] opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-[#23a559]" />
            </span>
            Ready
          </span>
        </div>

        <div
          className={`mt-3 aspect-video w-full overflow-hidden rounded-lg border border-[#3f4147] ${inner}`}
        >
          <div className={`h-full w-full bg-gradient-to-br ${bannerFrom} ${bannerTo} opacity-90`} />
        </div>

        <p className={`mt-2 line-clamp-2 text-xs leading-relaxed ${textMuted}`}>{shortBlurb}</p>
        <div className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] ${textSub}`}>
          <span>Solo · instant play</span>
          <span className="text-[#4e5058]">·</span>
          <span>{tag}</span>
        </div>

        <Link
          href={href}
          className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#248046] py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2a9650] active:translate-y-px"
        >
          Launch
        </Link>
      </div>
    </article>
  );
}

export function ActivityGamePlayer({
  title,
  subtitle,
  backHref,
  backLabel = 'All games',
  accentBarClass,
  children,
}: {
  title: string;
  subtitle: string;
  backHref: string;
  backLabel?: string;
  accentBarClass: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-full">
      <div
        className={`overflow-hidden rounded-xl border ${panel} shadow-[0_12px_48px_rgba(0,0,0,0.5)]`}
      >
        <div className="flex">
          <div className={`w-1 shrink-0 ${accentBarClass}`} aria-hidden />
          <div className="min-w-0 flex-1">
            <div
              className={`flex flex-wrap items-center justify-between gap-3 border-b border-[#3f4147] px-4 py-3 ${inner}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#3f4147] bg-[#1e1f22]">
                  <Gamepad2 className="text-[#00f2ff]" size={18} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${textSub}`}>Playing on PARABLE</p>
                  <h1 className={`truncate text-base font-bold sm:text-lg ${textHeading}`}>{title}</h1>
                  <p className={`mt-0.5 line-clamp-2 text-xs ${textMuted}`}>{subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-[#23a559] sm:flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#23a559] opacity-40" />
                    <span className="relative h-2 w-2 rounded-full bg-[#23a559]" />
                  </span>
                  Active
                </span>
                <Link
                  href={backHref}
                  className={`rounded-lg border border-[#3f4147] px-3 py-1.5 text-xs font-semibold ${textMuted} transition hover:border-[#00f2ff]/40 hover:text-[#00f2ff]`}
                >
                  {backLabel}
                </Link>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <div
                className={`rounded-lg border border-[#3f4147] ${inner} p-3 sm:p-4`}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
