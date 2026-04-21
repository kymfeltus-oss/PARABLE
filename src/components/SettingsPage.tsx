"use client";

import React, { useCallback, useEffect, useState } from "react";
import { User, Lock, Camera, Trash2, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type ProfileForm = {
  username: string;
  avatar_url: string;
};

const emptyProfile: ProfileForm = {
  username: "",
  avatar_url: "",
};

type SettingsTab = "profile" | "security";

function tabButtonClass(active: boolean) {
  return [
    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors",
    active
      ? "bg-[#2b2d31] text-white"
      : "text-gray-400 hover:bg-[#202225] hover:text-gray-200",
  ].join(" ");
}

/**
 * Account settings — Discord-style split shell (`#0f1011` / `#18191c`).
 */
export default function SettingsPage() {
  const { refreshProfile } = useAuth();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProfile(emptyProfile);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("SettingsPage load profile:", error.message);
      return;
    }
    if (!data) {
      setProfile(emptyProfile);
      return;
    }
    setProfile({
      username: data.username ?? "",
      avatar_url: data.avatar_url ?? "",
    });
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.alert("Not signed in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username.trim() || null,
        avatar_url: profile.avatar_url.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      window.alert(error.message);
    } else {
      window.alert("Profile updated successfully!");
      refreshProfile();
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = newPassword.trim();
    if (!next) return;
    if (next.length < 6) {
      window.alert("Password must be at least 6 characters.");
      return;
    }
    setPasswordLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) {
      window.alert(error.message);
    } else {
      window.alert("Password updated successfully!");
      setNewPassword("");
    }
    setPasswordLoading(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const supabase = createClient();

    const { error: rpcError } = await supabase.rpc("delete_user_data");

    if (rpcError) {
      window.alert("Error wiping data: " + rpcError.message);
      setDeleteLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setShowDeleteConfirm(false);
    setDeleteLoading(false);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#0f1011] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:flex-row md:gap-8 md:p-8">
        {/* Sidebar — tabs (desktop left column; mobile stacked on top) */}
        <aside
          className="shrink-0 md:w-56"
          aria-label="Settings sections"
        >
          <h1 className="mb-4 text-xl font-black uppercase tracking-tight text-cyan-400 md:mb-6 md:text-2xl">
            User Settings
          </h1>
          <nav className="flex flex-row gap-2 md:flex-col md:gap-1" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "profile"}
              className={tabButtonClass(tab === "profile")}
              onClick={() => setTab("profile")}
            >
              <User size={18} className="shrink-0 opacity-90" aria-hidden />
              My Profile
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "security"}
              className={tabButtonClass(tab === "security")}
              onClick={() => setTab("security")}
            >
              <Lock size={18} className="shrink-0 opacity-90" aria-hidden />
              Security
            </button>
          </nav>
        </aside>

        {/* Main panel */}
        <main className="min-w-0 flex-1">
          {tab === "profile" ? (
            <form
              onSubmit={(ev) => void handleUpdateProfile(ev)}
              className="rounded-xl border border-[#2f3136] bg-[#18191c] p-6 shadow-lg"
            >
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Camera size={20} className="text-cyan-400" aria-hidden />
                Public identity
              </h2>
              <p className="mb-6 text-sm text-gray-400">
                These fields are stored in your <code className="text-gray-300">profiles</code> row.
              </p>
              <div className="space-y-4">
                <div>
                  <label
                    className="text-xs font-bold uppercase tracking-wide text-gray-500"
                    htmlFor="settings-username"
                  >
                    Username
                  </label>
                  <input
                    id="settings-username"
                    className="mt-1.5 w-full rounded-lg border border-[#2f3136] bg-[#0f1011] px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-bold uppercase tracking-wide text-gray-500"
                    htmlFor="settings-avatar"
                  >
                    Avatar URL
                  </label>
                  <input
                    id="settings-avatar"
                    className="mt-1.5 w-full rounded-lg border border-[#2f3136] bg-[#0f1011] px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(ev) => void handleUpdatePassword(ev)}
              className="rounded-xl border border-[#2f3136] bg-[#18191c] p-6 shadow-lg"
            >
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Lock size={20} className="text-red-400" aria-hidden />
                Security
              </h2>
              <p className="mb-6 text-sm text-gray-400">
                Update your password via Supabase Auth. Leave the field empty to keep your current password.
              </p>
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-wide text-gray-500"
                  htmlFor="settings-password"
                >
                  New password
                </label>
                <input
                  id="settings-password"
                  type="password"
                  className="mt-1.5 w-full rounded-lg border border-[#2f3136] bg-[#0f1011] px-3 py-2.5 text-sm outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="mt-6 w-full rounded-lg border border-red-500/60 py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                {passwordLoading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </main>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-10 md:px-8">
        <section
          className="mt-12 rounded-xl border-2 border-red-800/60 bg-[#18191c] p-6 shadow-lg ring-1 ring-red-900/25"
          aria-labelledby="danger-zone-heading"
        >
          <h2
            id="danger-zone-heading"
            className="mb-2 flex items-center gap-2 text-lg font-bold text-red-400"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-950/50 text-red-400 ring-1 ring-red-800/40">
              <AlertTriangle size={18} strokeWidth={2.25} aria-hidden />
            </span>
            Danger Zone
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-gray-400">
            Deleting your account is permanent. All your praises, posts, and sanctuary data will be wiped from
            the portal.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
          >
            Delete my account
          </button>
        </section>
      </div>

      {showDeleteConfirm ? (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="danger-zone-title"
        >
          <div className="max-w-sm rounded-2xl border border-[#2f3136] border-t-red-900/40 bg-[#18191c] p-8 text-center shadow-2xl ring-1 ring-red-950/30">
            <Trash2 size={48} className="mx-auto mb-4 text-red-500" aria-hidden />
            <h3 id="danger-zone-title" className="mb-2 text-xl font-bold text-white">
              Are you absolutely sure?
            </h3>
            <p className="mb-6 text-sm text-gray-400">
              This action cannot be undone. All your Parable data will be lost forever.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 rounded-lg border border-[#2f3136] bg-[#0f1011] px-3 py-3 text-sm font-bold text-gray-300 transition hover:bg-[#2b2d31] hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleteLoading}
                className="flex-1 rounded-lg bg-red-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
