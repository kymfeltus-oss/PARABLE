/** Discovery thumbnails — Black church / Christian event photography + SVG fallback. */

import {
  categoryCoverPhoto,
  streamThumbnailPhoto,
} from "@/lib/black-church-demo-media";

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Warm gospel palette when remote photos are blocked. */
function svgDataUri(seed: string, width: number, height: number): string {
  const h = hashSeed(seed);
  const hue = 38 + (h % 28);
  const hue2 = (hue + 22) % 60;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue},55%,32%)"/>
      <stop offset="50%" stop-color="hsl(${hue2},42%,18%)"/>
      <stop offset="100%" stop-color="#0b0e11"/>
    </linearGradient>
    <radialGradient id="r" cx="30%" cy="18%" r="70%">
      <stop offset="0%" stop-color="rgba(212,175,55,0.28)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#r)"/>
  <text x="50%" y="88%" text-anchor="middle" fill="rgba(0,242,254,0.35)" font-size="11" font-family="system-ui,sans-serif" letter-spacing="0.2em">LIVE</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function categoryCoverFallback(categoryId: string): string {
  return svgDataUri(`parable-cat-${categoryId}`, 480, 640);
}

export function streamThumbnailFallback(streamId: string): string {
  return svgDataUri(`parable-live-${streamId}`, 640, 360);
}

export function categoryCoverImage(categoryId: string): string {
  return categoryCoverPhoto(categoryId);
}

export function streamThumbnailImage(streamId: string): string {
  return streamThumbnailPhoto(streamId);
}
