import type { VisualFilter } from "@/lib/post-studio-filters";

const MAX_LAYOUT_DIMENSION = 1080;
const COMPRESSION_QUALITY_RATIO = 0.82;

export async function compressImageWithFilter(file: File, filter: VisualFilter): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > MAX_LAYOUT_DIMENSION || height > MAX_LAYOUT_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_LAYOUT_DIMENSION) / width);
            width = MAX_LAYOUT_DIMENSION;
          } else {
            width = Math.round((width * MAX_LAYOUT_DIMENSION) / height);
            height = MAX_LAYOUT_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to resolve 2D execution context"));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        if (filter.cssFilter && filter.cssFilter !== "none") {
          ctx.filter = filter.cssFilter;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas compression failed"));
          },
          "image/jpeg",
          COMPRESSION_QUALITY_RATIO,
        );
      };
      img.onerror = () => reject(new Error("Image decode failed"));
    };
    reader.onerror = (err) => reject(err);
  });
}

export function blobToUploadFile(blob: Blob, originalName: string, mime = "image/jpeg"): File {
  const base = originalName.replace(/\.[^.]+$/, "") || "upload";
  return new File([blob], `${base}.jpg`, { type: mime });
}
