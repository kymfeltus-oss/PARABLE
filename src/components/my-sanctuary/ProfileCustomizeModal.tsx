"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  updateSanctuaryProfile,
  type SanctuaryProfileUpdate,
} from "@/app/my-sanctuary/actions";

export type SavedProfileFields = SanctuaryProfileUpdate;

type Props = {
  open: boolean;
  profileId: string;
  /** Public handle shown on the profile header (profiles.username) */
  displayHandle: string;
  /** Legal / ministry name (profiles.full_name) */
  fullName: string;
  bio: string;
  onClose: () => void;
  onSaved: (saved: SavedProfileFields) => void;
};

export default function ProfileCustomizeModal({
  open,
  profileId,
  displayHandle,
  fullName,
  bio,
  onClose,
  onSaved,
}: Props) {
  // "Username" in this screen = full_name; "Display name" = public handle (username column).
  const [formFullName, setFormFullName] = useState(fullName);
  const [formDisplayHandle, setFormDisplayHandle] = useState(displayHandle);
  const [formBio, setFormBio] = useState(bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFormFullName(fullName);
    setFormDisplayHandle(displayHandle);
    setFormBio(bio);
    setError(null);
  }, [open, displayHandle, fullName, bio]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: SanctuaryProfileUpdate = {
        full_name: formFullName.trim() || null,
        username: formDisplayHandle.trim() || null,
        bio: formBio.trim() || null,
      };

      const result = await updateSanctuaryProfile(profileId, payload);
      if (!result.ok) {
        if (/bio/i.test(result.error) && /column|schema|does not exist/i.test(result.error)) {
          setError(
            "Bio could not be saved — the profiles.bio column is missing. Run supabase/profiles-add-bio.sql in the Supabase SQL Editor, then try again.",
          );
          return;
        }
        setError(result.error);
        return;
      }

      onSaved(result.saved);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="studio-overlay" role="dialog" aria-modal="true" aria-label="Customize profile">
      <div className="studio-overlay-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="studio-shell studio-shell--narrow">
        <header className="studio-header">
          <h2 className="studio-title">Customize profile</h2>
          <button type="button" className="studio-close" onClick={onClose} aria-label="Close">
            <X size={22} strokeWidth={1.75} />
          </button>
        </header>
        <form className="studio-customize-form" onSubmit={(e) => void handleSubmit(e)}>
          <label className="studio-field">
            <span>Username</span>
            <input type="text" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} required />
          </label>
          <label className="studio-field">
            <span>Display name</span>
            <input type="text" value={formDisplayHandle} onChange={(e) => setFormDisplayHandle(e.target.value)} />
          </label>
          <label className="studio-field">
            <span>Bio</span>
            <textarea rows={3} value={formBio} onChange={(e) => setFormBio(e.target.value)} />
          </label>
          {error ? <p className="studio-error">{error}</p> : null}
          <div className="studio-actions">
            <button type="button" className="studio-btn studio-btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="studio-btn studio-btn--primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
