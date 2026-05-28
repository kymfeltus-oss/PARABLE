"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  fetchStreamCategories,
  formatCategoryLabel,
  updateProfileStreamCategory,
  type StreamCategoryRow,
} from "@/lib/categories";

type Props = {
  userId: string | null;
  initialCategoryId?: string | null;
  disabled?: boolean;
};

export default function StreamCategorySelector({
  userId,
  initialCategoryId,
  disabled,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [categories, setCategories] = useState<StreamCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialCategoryId ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(initialCategoryId ?? null);
  }, [initialCategoryId]);

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

  const selected = useMemo(
    () => categories.find((c) => c.id === selectedId) ?? null,
    [categories, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const label = formatCategoryLabel(c).toLowerCase();
      return label.includes(q) || c.slug.includes(q);
    });
  }, [categories, query]);

  const persistSelection = useCallback(
    async (cat: StreamCategoryRow) => {
      if (!userId || disabled) return;
      setSaving(true);
      setError(null);
      const { error: saveErr } = await updateProfileStreamCategory(
        supabase,
        userId,
        cat.id,
        cat.name,
      );
      setSaving(false);
      if (saveErr) {
        setError(saveErr.message);
        return;
      }
      setSelectedId(cat.id);
      setOpen(false);
      setQuery("");
    },
    [disabled, supabase, userId],
  );

  return (
    <div className="relative mb-3 rounded-sm border border-[#00f2fe]/18 bg-black/50 p-3">
      <p className="mb-2 text-[9px] font-black uppercase tracking-[5px] text-white/45">
        Stream category
      </p>

      <button
        type="button"
        disabled={disabled || loading || !userId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-sm border border-white/10 bg-black/70 px-3 py-2.5 text-left text-sm font-semibold text-white transition hover:border-[#00f2fe]/35 disabled:opacity-50"
      >
        <span className="truncate">
          {loading ? "Loading categories…" : selected ? formatCategoryLabel(selected) : "Select a category"}
        </span>
        {saving ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#00f2fe]" />
        ) : (
          <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open ? (
        <div className="absolute left-3 right-3 z-50 mt-1 overflow-hidden rounded-sm border border-[#24272c] bg-[#0b0e11] shadow-xl">
          <label className="flex items-center gap-2 border-b border-[#24272c] px-3 py-2">
            <Search size={14} className="shrink-0 text-[#64748b]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#64748b]"
              autoFocus
            />
          </label>
          <ul className="max-h-48 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-xs text-[#64748b]">No matches</li>
            ) : (
              filtered.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => void persistSelection(cat)}
                    className={`w-full px-3 py-2.5 text-left text-sm transition hover:bg-[#191b1f] ${
                      cat.id === selectedId ? "bg-[#00f2fe]/10 text-[#00f2fe]" : "text-white/90"
                    }`}
                  >
                    {formatCategoryLabel(cat)}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      {!userId ? (
        <p className="mt-2 text-[10px] text-[#64748b]">Sign in to save your stream category.</p>
      ) : null}
    </div>
  );
}
