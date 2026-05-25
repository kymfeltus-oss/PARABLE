/** Extract a JPEG thumbnail from a local video file via Canvas API. */
export function extractVideoThumbnail(file: File, seekSec = 1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(seekSec, Math.max(0, video.duration - 0.1));
      } catch {
        capture();
      }
    };

    video.onseeked = capture;

    video.onerror = () => {
      cleanup();
      reject(new Error("Could not load video for thumbnail extraction."));
    };

    function capture() {
      const canvas = document.createElement("canvas");
      const width = video.videoWidth || 720;
      const height = video.videoHeight || 1280;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        cleanup();
        reject(new Error("Canvas unavailable."));
        return;
      }
      ctx.drawImage(video, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (!blob) {
            reject(new Error("Thumbnail export failed."));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.85,
      );
    }

    video.src = url;
  });
}
