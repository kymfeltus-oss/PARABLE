"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { fetchFollowListForProfile } from "@/lib/follows-queries";

type FollowProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type Props = {
  open: boolean;
  mode: "followers" | "following";
  profileUserId: string;
  onClose: () => void;
};

function displayName(p: FollowProfile): string {
  return p.username?.trim() || p.full_name?.trim() || "Member";
}

function avatarFallback(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=88&background=dbdbdb&color=262626`;
}

export default function ProfileFollowListModal({ open, mode, profileUserId, onClose }: Props) {
  const [rows, setRows] = useState<FollowProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!profileUserId) return;
    setLoading(true);
    const supabase = createClient();

    try {
      const profiles = await fetchFollowListForProfile(supabase, profileUserId, mode);
      setRows(profiles);
    } catch (error) {
      console.error(
        "ProfileFollowListModal:",
        error instanceof Error ? error.message : error,
      );
      setRows([]);
    }
    setLoading(false);
  }, [mode, profileUserId]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title = mode === "followers" ? "Followers" : "Following";

  return (
    <div className="profile-follow-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="profile-follow-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="profile-follow-modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn profile-follow-modal-close" onClick={onClose} aria-label="Close">
            <X size={22} strokeWidth={1.75} />
          </button>
        </header>
        <div className="profile-follow-modal-body">
          {loading ? (
            <div className="profile-follow-modal-loading">
              <Loader2 className="h-6 w-6 animate-spin text-[#8e8e8e]" />
            </div>
          ) : rows.length === 0 ? (
            <p className="profile-follow-modal-empty">No {mode} yet.</p>
          ) : (
            <ul className="profile-follow-modal-list">
              {rows.map((person) => {
                const name = displayName(person);
                return (
                  <li key={person.id}>
                    <Link href={`/profile/${person.id}`} className="profile-follow-modal-row" onClick={onClose}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={person.avatar_url?.trim() || avatarFallback(name)}
                        alt=""
                        className="profile-follow-modal-avatar"
                      />
                      <div className="min-w-0">
                        <p className="profile-follow-modal-handle">{person.username || name}</p>
                        {person.full_name ? (
                          <p className="profile-follow-modal-name">{person.full_name}</p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
