'use client';

import type { ReactNode } from 'react';

/**
 * In-game chrome: reads like a native / Discord Activity viewport — not a blog card.
 */
export default function GameShell({
  label,
  children,
  className = '',
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={['mx-auto w-full max-w-full min-w-0', className].filter(Boolean).join(' ')}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#949ba4]">{label}</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#23a559]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#23a559] opacity-50" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[#23a559]" />
            </span>
            Live
          </span>
        </div>
      ) : null}
      <div className="relative rounded-xl border-2 border-[#3f4147] bg-[#1e1f22] p-1 shadow-[0_16px_48px_rgba(0,0,0,0.65)] ring-1 ring-black/60">
        <span className="pointer-events-none absolute left-1 top-1 z-20 h-3 w-3 border-l-2 border-t-2 border-[#00f2ff]/70" />
        <span className="pointer-events-none absolute right-1 top-1 z-20 h-3 w-3 border-r-2 border-t-2 border-[#00f2ff]/70" />
        <span className="pointer-events-none absolute bottom-1 left-1 z-20 h-3 w-3 border-b-2 border-l-2 border-[#00f2ff]/70" />
        <span className="pointer-events-none absolute bottom-1 right-1 z-20 h-3 w-3 border-b-2 border-r-2 border-[#00f2ff]/70" />
        <div className="relative overflow-hidden rounded-lg bg-[#0b0c0f] ring-1 ring-[#202225]">{children}</div>
      </div>
    </div>
  );
}

export function HudPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'rounded-lg border border-[#3f4147] bg-[#1e1f22]/95 px-3 py-2 shadow-inner shadow-black/40 backdrop-blur-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export function GamePrimaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={[
        'rounded-lg bg-[#248046] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_#1a5c35] transition hover:bg-[#2a9650] active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:shadow-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

export function GameSecondaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={[
        'rounded-lg border border-[#3f4147] bg-[#2b2d31] px-4 py-2.5 text-sm font-semibold text-[#f2f3f5] transition hover:border-[#00f2ff]/45 hover:text-[#00f2ff] disabled:opacity-40',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
