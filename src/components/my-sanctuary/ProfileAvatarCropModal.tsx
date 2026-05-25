"use client";

import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { X } from "lucide-react";
import { getCroppedImageDataUrl } from "@/lib/crop-image";

type Props = {
  imageUrl: string;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
};

export default function ProfileAvatarCropModal({ imageUrl, onCancel, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const croppedAreaPixelsRef = useRef<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    croppedAreaPixelsRef.current = croppedAreaPixels;
  }, []);

  const handleConfirm = async () => {
    const pixels = croppedAreaPixelsRef.current;
    if (!pixels) {
      setError("Drag and zoom to position your photo first.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const dataUrl = await getCroppedImageDataUrl(imageUrl, pixels, {
        maxDimension: 512,
        quality: 0.88,
      });
      onConfirm(dataUrl);
    } catch {
      setError("Could not crop this image. Try a different photo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="studio-overlay profile-avatar-crop-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Adjust profile photo"
    >
      <div className="studio-overlay-backdrop" onClick={onCancel} aria-hidden="true" />
      <div className="studio-shell profile-avatar-crop-shell">
        <header className="studio-header">
          <div>
            <h2 className="studio-title">Adjust profile photo</h2>
            <p className="profile-avatar-crop-hint">Drag to reposition · use the slider to zoom</p>
          </div>
          <button type="button" className="studio-close" onClick={onCancel} aria-label="Close">
            <X size={22} strokeWidth={1.75} />
          </button>
        </header>

        <div className="profile-avatar-crop-stage">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{ containerStyle: { backgroundColor: "#18181b" } }}
          />
        </div>

        <div className="profile-avatar-crop-controls">
          <label className="profile-avatar-crop-zoom-label" htmlFor="profile-avatar-zoom">
            Zoom
          </label>
          <input
            id="profile-avatar-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="profile-avatar-crop-zoom"
          />
        </div>

        {error ? <p className="studio-error profile-avatar-crop-error">{error}</p> : null}

        <div className="studio-actions profile-avatar-crop-actions">
          <button type="button" className="studio-btn studio-btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="studio-btn studio-btn--primary"
            onClick={() => void handleConfirm()}
            disabled={busy}
          >
            {busy ? "Saving…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
