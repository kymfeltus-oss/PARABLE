import type { Area } from "react-easy-crop";

type CropOptions = {
  maxDimension?: number;
  quality?: number;
};

/** Crop a region from an image and return a JPEG data URL. */
export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area,
  options?: CropOptions,
): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  let outWidth = pixelCrop.width;
  let outHeight = pixelCrop.height;

  const maxDimension = options?.maxDimension;
  if (maxDimension && maxDimension > 0) {
    const scale = Math.min(1, maxDimension / Math.max(outWidth, outHeight));
    outWidth = Math.max(1, Math.round(outWidth * scale));
    outHeight = Math.max(1, Math.round(outHeight * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outWidth,
    outHeight,
  );

  return canvas.toDataURL("image/jpeg", options?.quality ?? 0.9);
}
