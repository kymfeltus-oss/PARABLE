"use client";

import { useCallback, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Grid3X3,
  Heart,
  ImageIcon,
  Laptop,
  MessageCircle,
  Send,
  Smartphone,
  Tablet,
  Type,
} from "lucide-react";
import {
  IG_BOTTOM_DANGER_PERCENT,
  IG_CENTER_SAFE_PERCENT,
  IG_DEFAULT_SAMPLE_IMAGE,
  IG_PROFILE_OBJECT_POSITION_Y,
  IG_SIDE_MARGIN_PERCENT,
  IG_TOP_DANGER_PERCENT,
  type DeviceView,
} from "@/lib/tools/instagram-canvas-spec";
import "@/styles/instagram-safe-zone.css";

type CanvasProps = {
  imageUrl: string;
  overlayText: string;
  showGuidelines: boolean;
  className?: string;
  imageClassName?: string;
  imageObjectPosition?: string;
  /** Extra overlay layers (e.g. mobile UI mock). */
  children?: React.ReactNode;
};

/** Master 4:5 canvas — 1080×1350 logical model, scales fluidly via aspect-ratio. */
function InstagramCanvasCore({
  imageUrl,
  overlayText,
  showGuidelines,
  className = "",
  imageClassName = "",
  imageObjectPosition = "center",
  children,
}: CanvasProps) {
  const labelId = useId();

  return (
    <div
      className={`ig-safe-canvas relative aspect-[4/5] w-full overflow-hidden bg-[#0a0a0a] ${className}`}
      role="img"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="sr-only">
        Instagram 4:5 portrait canvas with safe zone layout
      </span>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover ${imageClassName}`}
        style={{ objectPosition: imageObjectPosition }}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = IG_DEFAULT_SAMPLE_IMAGE;
        }}
      />

      {/* Center safe zone sample copy */}
      {overlayText ? (
        <div
          className="pointer-events-none absolute z-10 flex flex-col items-center justify-center px-[var(--ig-side)] text-center text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
          style={{
            top: `${IG_TOP_DANGER_PERCENT}%`,
            height: `${IG_CENTER_SAFE_PERCENT}%`,
            left: `${IG_SIDE_MARGIN_PERCENT}%`,
            right: `${IG_SIDE_MARGIN_PERCENT}%`,
            ["--ig-side" as string]: `${IG_SIDE_MARGIN_PERCENT}%`,
          }}
        >
          <p className="ig-safe-canvas__headline font-black uppercase tracking-wide">{overlayText}</p>
          <p className="ig-safe-canvas__body mt-[2cqw] max-w-[90%] font-medium text-white/90">
            Primary content lives in this 1:1 safe square — readable on mobile, desktop, and profile grid.
          </p>
        </div>
      ) : null}

      {showGuidelines ? (
        <>
          {/* Top danger */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 border-b border-dashed border-[#F87171]/90 bg-[#F87171]/15"
            style={{ height: `${IG_TOP_DANGER_PERCENT}%` }}
          >
            <span className="ig-safe-zone-label absolute left-1 top-1 font-bold uppercase text-[#FCA5A5]">
              Desktop Header Buffer · {IG_TOP_DANGER_PERCENT.toFixed(1)}%
            </span>
          </div>

          {/* Center safe */}
          <div
            className="pointer-events-none absolute inset-x-0 z-20 border border-dashed border-[#00F2FE]/90 bg-[#00F2FE]/8"
            style={{
              top: `${IG_TOP_DANGER_PERCENT}%`,
              height: `${IG_CENTER_SAFE_PERCENT}%`,
            }}
          >
            <span className="ig-safe-zone-label absolute left-1 top-1 max-w-[95%] font-bold uppercase text-[#00F2FE]">
              Primary Content Safe Zone (All Text/CTAs Here)
            </span>
            {/* Side margin guides */}
            <div
              className="ig-safe-dotted absolute bottom-0 top-0 w-px opacity-80"
              style={{ left: `${IG_SIDE_MARGIN_PERCENT}%` }}
            />
            <div
              className="ig-safe-dotted absolute bottom-0 top-0 w-px opacity-80"
              style={{ right: `${IG_SIDE_MARGIN_PERCENT}%` }}
            />
            <div
              className="ig-safe-dotted-v absolute left-0 right-0 h-px opacity-60"
              style={{ top: "50%" }}
            />
          </div>

          {/* Bottom danger */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 border-t border-dashed border-[#FBBF24]/90 bg-[#FBBF24]/12"
            style={{ height: `${IG_BOTTOM_DANGER_PERCENT}%` }}
          >
            <span className="ig-safe-zone-label absolute bottom-1 left-1 font-bold uppercase text-[#FDE68A]">
              Mobile Caption UI Overlay Zone · {IG_BOTTOM_DANGER_PERCENT.toFixed(1)}%
            </span>
          </div>
        </>
      ) : null}

      {children}
    </div>
  );
}

function MobileUiOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/70 to-transparent px-3 pb-3 pt-10"
      style={{ height: `${IG_BOTTOM_DANGER_PERCENT}%` }}
      aria-hidden
    >
      <div className="mb-2 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5" strokeWidth={2} />
          <MessageCircle className="h-5 w-5" strokeWidth={2} />
          <Send className="h-5 w-5 -rotate-12" strokeWidth={2} />
        </div>
      </div>
      <p className="text-[11px] font-semibold text-white">@parable.creator</p>
      <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-white/85">
        Caption and hashtags render here — keep key copy above this band.
      </p>
    </div>
  );
}

function MobileDeviceFrame(props: Omit<CanvasProps, "children">) {
  return (
    <div className="mx-auto w-full max-w-[390px]">
      <div className="overflow-hidden rounded-[2rem] border-2 border-[#334155] bg-[#01040A] p-2 shadow-2xl shadow-black/50">
        <div className="mb-1 flex justify-center">
          <div className="h-1 w-16 rounded-full bg-[#334155]" aria-hidden />
        </div>
        <div className="overflow-hidden rounded-[1.25rem] bg-black">
          <InstagramCanvasCore {...props}>
            <MobileUiOverlay />
          </InstagramCanvasCore>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-[#64748B]">
        Mobile · 100% width (~390px) · bottom {IG_BOTTOM_DANGER_PERCENT.toFixed(1)}% UI overlay
      </p>
    </div>
  );
}

function TabletDeviceFrame(props: Omit<CanvasProps, "children">) {
  return (
    <div className="mx-auto w-full max-w-[768px]">
      <div className="overflow-hidden rounded-2xl border-2 border-[#334155] bg-[#01040A] p-3 shadow-xl">
        <div className="mb-2 flex justify-center">
          <div className="h-1 w-12 rounded-full bg-[#334155]" aria-hidden />
        </div>
        <div className="mx-auto max-w-[480px] overflow-hidden rounded-xl bg-black">
          <InstagramCanvasCore {...props}>
            <MobileUiOverlay />
          </InstagramCanvasCore>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-[#64748B]">
        Tablet · ~768px workspace · feed column ~480px · same bottom UI band
      </p>
    </div>
  );
}

function DesktopDeviceFrame(props: Omit<CanvasProps, "children" | "className">) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex overflow-hidden rounded-xl border border-[#334155] bg-white shadow-2xl">
        <div className="flex max-h-[650px] shrink-0 items-stretch bg-black">
          <div className="aspect-[4/5] h-[650px] max-h-[70vh] w-auto max-w-full">
            <InstagramCanvasCore {...props} className="h-full w-full" />
          </div>
        </div>
        <aside className="flex min-h-[650px] max-h-[650px] w-full min-w-0 max-w-md flex-1 flex-col border-l border-[#efefef] bg-white">
          <header className="flex items-center gap-2 border-b border-[#efefef] px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#00F2FE] to-[#7C3AED]" />
            <span className="text-sm font-semibold text-[#262626]">parable.creator</span>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
            <p className="text-sm text-[#262626]">
              <span className="font-semibold">parable.creator</span>{" "}
              Sample caption — sidebar scrolls independently on desktop while canvas stays pinned left.
            </p>
            <ul className="mt-4 space-y-3">
              {["Beautiful safe zone demo!", "Love this 4:5 layout", "Center square is key"].map((c) => (
                <li key={c} className="flex gap-2 text-xs text-[#262626]">
                  <span className="font-semibold">member</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-[#efefef] px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-[#8e8e8e]">Add a comment…</p>
          </div>
        </aside>
      </div>
      <p className="mt-3 text-center text-[11px] text-[#64748B]">
        Desktop · canvas max-height 650px · proportional width lock (4:5)
      </p>
    </div>
  );
}

function ProfileGridFrame({
  imageUrl,
  showGuidelines,
}: Pick<CanvasProps, "imageUrl" | "showGuidelines">) {
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-[#334155] bg-[#020712] p-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`relative aspect-square w-24 overflow-hidden bg-[#06111E] sm:w-28 ${i === 0 ? "ring-2 ring-[#00F2FE]" : ""}`}
          >
            {i === 0 ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: `center ${IG_PROFILE_OBJECT_POSITION_Y}%` }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = IG_DEFAULT_SAMPLE_IMAGE;
                  }}
                />
                {showGuidelines ? (
                  <div className="pointer-events-none absolute inset-1 border border-dashed border-[#00F2FE]/70" />
                ) : null}
              </>
            ) : (
              <div className="h-full w-full bg-[#0f172a]" />
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 max-w-xs text-center text-[11px] text-[#64748B]">
        Profile grid · 1:1 crop · top {IG_TOP_DANGER_PERCENT.toFixed(1)}% + bottom{" "}
        {IG_BOTTOM_DANGER_PERCENT.toFixed(1)}% zones clipped — highlighted tile uses center-safe crop
      </p>
    </div>
  );
}

const VIEW_TABS: { id: DeviceView; label: string; icon: typeof Smartphone }[] = [
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "desktop", label: "Desktop", icon: Laptop },
  { id: "profile", label: "Profile grid", icon: Grid3X3 },
  { id: "all", label: "All devices", icon: Grid3X3 },
];

export default function InstagramSafeZoneSimulator() {
  const [activeView, setActiveView] = useState<DeviceView>("all");
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [imageUrl, setImageUrl] = useState(IG_DEFAULT_SAMPLE_IMAGE);
  const [imageDraft, setImageDraft] = useState(IG_DEFAULT_SAMPLE_IMAGE);
  const [overlayText, setOverlayText] = useState("Your Headline Here");

  const canvasProps = useMemo(
    () => ({
      imageUrl,
      overlayText: overlayText.trim(),
      showGuidelines,
    }),
    [imageUrl, overlayText, showGuidelines],
  );

  const applyImageUrl = useCallback(() => {
    const trimmed = imageDraft.trim();
    if (trimmed) setImageUrl(trimmed);
  }, [imageDraft]);

  return (
    <div className="relative min-h-screen bg-[#01040A] pb-24 text-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Link href="/settings" className="text-sm text-[#64748B] transition hover:text-[#00F2FE]">
          ← Back to settings
        </Link>

        <header className="mt-4 mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#00F2FE]">
            Instagram 4:5 Safe Zone Lab
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#94A3B8]">
            Interactive canvas model (1080×1350) with top header buffer, center 1:1 safe square, and bottom
            mobile UI band — scaled across mobile, desktop, and profile grid previews.
          </p>
        </header>

        {/* Asset injector */}
        <section className="mb-8 grid gap-4 rounded-xl border border-[#06111E] bg-[#020712] p-4 md:grid-cols-2">
          <div>
            <label htmlFor="ig-image-url" className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              <ImageIcon className="h-3.5 w-3.5" aria-hidden />
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                id="ig-image-url"
                type="url"
                value={imageDraft}
                onChange={(e) => setImageDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyImageUrl();
                }}
                placeholder="https://…"
                className="min-w-0 flex-1 rounded-lg border border-[#06111E] bg-[#01040A] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#00F2FE]/50"
              />
              <button
                type="button"
                onClick={applyImageUrl}
                className="shrink-0 rounded-lg bg-[#00F2FE]/15 px-4 py-2 text-sm font-bold text-[#00F2FE] transition hover:bg-[#00F2FE]/25"
              >
                Apply
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="ig-overlay-text" className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
              <Type className="h-3.5 w-3.5" aria-hidden />
              Safe-zone headline
            </label>
            <input
              id="ig-overlay-text"
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              maxLength={80}
              className="w-full rounded-lg border border-[#06111E] bg-[#01040A] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#00F2FE]/50"
            />
          </div>
        </section>

        {/* View tabs */}
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Device preview mode"
        >
          {VIEW_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeView === id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activeView === id
                  ? "bg-[#00F2FE] text-[#01040A]"
                  : "border border-[#334155] text-[#94A3B8] hover:border-[#00F2FE]/40 hover:text-[#F8FAFC]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {/* Previews */}
        <div className="space-y-12">
          {(activeView === "mobile" || activeView === "all") && (
            <section aria-label="Mobile preview">
              {activeView === "all" ? (
                <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#64748B]">Mobile</h2>
              ) : null}
              <MobileDeviceFrame {...canvasProps} />
            </section>
          )}

          {(activeView === "tablet" || activeView === "all") && (
            <section aria-label="Tablet preview">
              {activeView === "all" ? (
                <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#64748B]">Tablet</h2>
              ) : null}
              <TabletDeviceFrame {...canvasProps} />
            </section>
          )}

          {(activeView === "desktop" || activeView === "all") && (
            <section aria-label="Desktop preview">
              {activeView === "all" ? (
                <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#64748B]">Desktop</h2>
              ) : null}
              <DesktopDeviceFrame {...canvasProps} />
            </section>
          )}

          {(activeView === "profile" || activeView === "all") && (
            <section aria-label="Profile grid preview">
              {activeView === "all" ? (
                <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#64748B]">
                  Profile grid
                </h2>
              ) : null}
              <ProfileGridFrame imageUrl={imageUrl} showGuidelines={showGuidelines} />
            </section>
          )}
        </div>

        {/* Spec legend */}
        <aside className="mt-12 rounded-xl border border-[#06111E] bg-[#020712]/80 p-4 text-xs text-[#94A3B8]">
          <p className="font-bold uppercase tracking-wider text-[#64748B]">Canvas spec</p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            <li>Base: 1080 × 1350 px (4:5)</li>
            <li>Top buffer: 100px ({IG_TOP_DANGER_PERCENT.toFixed(1)}%)</li>
            <li>Center safe: 1080 × 1080 px ({IG_CENTER_SAFE_PERCENT.toFixed(1)}% height)</li>
            <li>Bottom UI band: 170px ({IG_BOTTOM_DANGER_PERCENT.toFixed(1)}%)</li>
            <li>Side inset: 50px ({IG_SIDE_MARGIN_PERCENT.toFixed(1)}% each)</li>
          </ul>
        </aside>
      </div>

      {/* Floating guidelines toggle */}
      <button
        type="button"
        onClick={() => setShowGuidelines((v) => !v)}
        aria-pressed={showGuidelines}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-[#00F2FE]/40 bg-[#020712]/95 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#00F2FE] shadow-lg shadow-[#00F2FE]/10 backdrop-blur-md transition hover:bg-[#06111E] active:scale-[0.98]"
      >
        <Grid3X3 className="h-4 w-4" aria-hidden />
        {showGuidelines ? "Hide grid guidelines" : "Toggle grid guidelines"}
      </button>
    </div>
  );
}
