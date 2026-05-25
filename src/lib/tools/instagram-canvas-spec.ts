/** 2026 Instagram portrait feed standard — 1080 × 1350 (4:5). */
export const IG_CANVAS_WIDTH = 1080;
export const IG_CANVAS_HEIGHT = 1350;
export const IG_ASPECT_RATIO = 4 / 5;

/** Top danger zone — desktop header buffer (100px of 1350). */
export const IG_TOP_DANGER_PX = 100;
export const IG_TOP_DANGER_PERCENT = (IG_TOP_DANGER_PX / IG_CANVAS_HEIGHT) * 100;

/** Bottom danger zone — mobile caption / action overlay (170px of 1350). */
export const IG_BOTTOM_DANGER_PX = 170;
export const IG_BOTTOM_DANGER_PERCENT = (IG_BOTTOM_DANGER_PX / IG_CANVAS_HEIGHT) * 100;

/** Center safe zone — full-width 1:1 square (1080 × 1080). */
export const IG_CENTER_SAFE_PX = 1080;
export const IG_CENTER_SAFE_PERCENT = (IG_CENTER_SAFE_PX / IG_CANVAS_HEIGHT) * 100;

/** Horizontal safe inset (50px of 1080). */
export const IG_SIDE_MARGIN_PX = 50;
export const IG_SIDE_MARGIN_PERCENT = (IG_SIDE_MARGIN_PX / IG_CANVAS_WIDTH) * 100;

/** Profile grid crop — show center safe square only (crop top 100px + bottom 170px). */
export const IG_PROFILE_OBJECT_POSITION_Y =
  ((IG_TOP_DANGER_PX + IG_CENTER_SAFE_PX / 2) / IG_CANVAS_HEIGHT) * 100;

export const IG_DEFAULT_SAMPLE_IMAGE =
  "https://picsum.photos/seed/parable-ig-safe/1080/1350";

export type DeviceView = "mobile" | "tablet" | "desktop" | "profile" | "all";
