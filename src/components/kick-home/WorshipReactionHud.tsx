"use client";

import { useEffect } from "react";
import { WORSHIP_HUD_BUTTONS, type WorshipReactionKind } from "@/lib/worship-reactions";
import { debugSessionLog } from "@/lib/debug-session-log";

export type WorshipReactionHudLayout = "overlay" | "mobile-rail" | "mobile-drawer";

type Props = {
  onReaction: (kind: WorshipReactionKind) => void;
  disabled?: boolean;
  layout?: WorshipReactionHudLayout;
};

const BTN_CLASS =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition hover:scale-105 hover:border-[#00f2fe]/40 hover:bg-[#00f2fe]/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

const OVERLAY_BTN_CLASS =
  "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl transition hover:scale-105 hover:border-[#00f2fe]/40 hover:bg-[#00f2fe]/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12 sm:text-2xl";

/**
 * Watch-player worship reaction toolbar — Black church emoji set.
 */
export default function WorshipReactionHud({
  onReaction,
  disabled,
  layout = "overlay",
}: Props) {
  // #region agent log
  useEffect(() => {
    debugSessionLog({
      runId: "post-fix",
      hypothesisId: "H4",
      location: "WorshipReactionHud.tsx:mount",
      message: "HUD mounted",
      data: { layout, disabled: Boolean(disabled), buttonCount: WORSHIP_HUD_BUTTONS.length },
    });
  }, [layout, disabled]);
  // #endregion

  const wrapClass =
    layout === "mobile-rail"
      ? "pointer-events-auto absolute bottom-16 right-4 z-50 flex flex-col gap-2"
      : layout === "mobile-drawer"
        ? "pointer-events-auto mb-2 flex max-w-full flex-wrap items-center justify-start gap-1.5 rounded-xl border border-slate-700 bg-slate-900/95 px-2 py-2"
        : "pointer-events-auto absolute bottom-4 left-1/2 z-50 flex max-w-[96vw] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#00f2fe]/25 bg-[#020406]/90 px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md sm:gap-2.5 sm:px-4";

  return (
    <div
      className={wrapClass}
      data-testid="worship-reaction-hud"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {WORSHIP_HUD_BUTTONS.map((btn) => (
        <button
          key={btn.kind}
          type="button"
          disabled={disabled}
          title={btn.title}
          aria-label={btn.title}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            // #region agent log
            debugSessionLog({
              runId: "post-fix",
              hypothesisId: "H3",
              location: "WorshipReactionHud.tsx:click",
              message: "emoji button click",
              data: {
                kind: btn.kind,
                disabled: Boolean(disabled),
                layout,
              },
            });
            // #endregion
            if (!disabled) onReaction(btn.kind);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={layout === "overlay" ? OVERLAY_BTN_CLASS : BTN_CLASS}
        >
          <span aria-hidden>{btn.emoji}</span>
        </button>
      ))}
    </div>
  );
}
