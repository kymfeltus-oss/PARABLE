"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Settings2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  fetchStreamCategories,
  formatCategoryLabel,
  updateProfileStreamCategory,
  type StreamCategoryRow,
} from "@/lib/categories";

type Props = {
  broadcasterProfileId: string;
  currentCategoryId?: string | null;
  currentCategoryName?: string | null;
  onCategoryChange?: (name: string, categoryId: string) => void;
};

export default function AdminCategoryOverrideHud({
  broadcasterProfileId,
  currentCategoryId,
  currentCategoryName,
  onCategoryChange,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<StreamCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(currentCategoryId ?? "");

  useEffect(() => {
    setSelectedId(currentCategoryId ?? "");
  }, [currentCategoryId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const rows = await fetchStreamCategories(supabase);
      if (!cancelled) {
        setCategories(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const applyCategory = useCallback(async () => {
    const cat = categories.find((c) => c.id === selectedId);
    if (!cat) return;
    setSaving(true);
    setError(null);
    const { error: saveErr } = await updateProfileStreamCategory(
      supabase,
      broadcasterProfileId,
      cat.id,
      cat.name,
    );
    setSaving(false);
    if (saveErr) {
      setError(saveErr.message);
      return;
    }
    onCategoryChange?.(cat.name, cat.id);
    setOpen(false);
  }, [broadcasterProfileId, categories, onCategoryChange, selectedId, supabase]);

  return (
    <div className="pointer-events-none absolute right-3 top-3 z-[60]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 bg-[#0b0e11]/90 text-amber-400 shadow-lg backdrop-blur-md transition hover:border-amber-400 hover:text-amber-300"
        aria-label="Admin category override"
        title="Admin: override stream category"
      >
        <Settings2 size={18} />
      </button>

      {open ? (
        <div className="pointer-events-auto absolute right-0 top-12 w-[min(92vw,18rem)] rounded-lg border border-amber-500/30 bg-[#0b0e11]/98 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Admin category
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-white"
              aria-label="Close panel"
            >
              <X size={14} />
            </button>
          </div>
          <p className="mb-2 text-xs text-slate-400">
            Current: <span className="font-semibold text-white">{currentCategoryName || "—"}</span>
          </p>
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mb-2 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-white"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {formatCategoryLabel(cat)}
                </option>
              ))}
            </select>
          )}
          {error ? <p className="mb-2 text-xs text-red-300">{error}</p> : null}
          <button
            type="button"
            disabled={saving || !selectedId}
            onClick={() => void applyCategory()}
            className="w-full rounded-md bg-amber-500 px-3 py-2 text-xs font-black uppercase text-black disabled:opacity-50"
          >
            {saving ? "Applying…" : "Apply to live channel"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
