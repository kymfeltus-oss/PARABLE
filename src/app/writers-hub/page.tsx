"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Copy,
  Download,
  Feather,
  Loader2,
  PenLine,
  Sparkles,
  Trash2,
  Users,
  Wand2,
  AlertCircle,
} from "lucide-react";

const STORAGE_KEY = "parable:writers-studio:v1";

type ScriptMode = "outline" | "beats" | "scene" | "dialogue" | "rewrite";
type CharMode = "sheet" | "voice" | "arc" | "ensemble";
type Tab = "script" | "character";

type Draft = {
  v: 1;
  tab: Tab;
  script: {
    mode: ScriptMode;
    premise: string;
    genre: string;
    tone: string;
    length: string;
    notes: string;
    existingScript: string;
    output: string;
  };
  character: {
    mode: CharMode;
    seed: string;
    name: string;
    role: string;
    ageRange: string;
    traits: string;
    conflict: string;
    world: string;
    foilName: string;
    notes: string;
    output: string;
  };
};

const defaultDraft = (): Draft => ({
  v: 1,
  tab: "script",
  script: {
    mode: "outline",
    premise: "",
    genre: "",
    tone: "",
    length: "medium",
    notes: "",
    existingScript: "",
    output: "",
  },
  character: {
    mode: "sheet",
    seed: "",
    name: "",
    role: "",
    ageRange: "",
    traits: "",
    conflict: "",
    world: "",
    foilName: "",
    notes: "",
    output: "",
  },
});

function loadDraft(): Draft {
  if (typeof window === "undefined") return defaultDraft();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDraft();
    const p = JSON.parse(raw) as Draft;
    if (p.v !== 1) return defaultDraft();
    return { ...defaultDraft(), ...p, script: { ...defaultDraft().script, ...p.script }, character: { ...defaultDraft().character, ...p.character } };
  } catch {
    return defaultDraft();
  }
}

export default function WritersHubPage() {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<Draft>(defaultDraft);
  const [tab, setTab] = useState<Tab>("script");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [charLoading, setCharLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback((next: Draft) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* quota */
      }
    }, 450);
  }, []);

  useEffect(() => {
    setMounted(true);
    const d = loadDraft();
    setDraft(d);
    setTab(d.tab);
  }, []);

  const updateScript = useCallback((patch: Partial<Draft["script"]>) => {
    setDraft((prev) => {
      const next = { ...prev, script: { ...prev.script, ...patch }, tab: "script" as const };
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  const updateCharacter = useCallback((patch: Partial<Draft["character"]>) => {
    setDraft((prev) => {
      const next = { ...prev, character: { ...prev.character, ...patch }, tab: "character" as const };
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  const setTabSafe = useCallback(
    (t: Tab) => {
      setTab(t);
      setDraft((prev) => {
        const next = { ...prev, tab: t };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const runScript = async () => {
    setErr(null);
    setScriptLoading(true);
    try {
      const res = await fetch("/api/writers/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: draft.script.mode,
          premise: draft.script.premise,
          genre: draft.script.genre || undefined,
          tone: draft.script.tone || undefined,
          length: draft.script.length,
          notes: draft.script.notes || undefined,
          existingScript: draft.script.existingScript || undefined,
        }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok) {
        setErr(data.error || "Could not generate script.");
        return;
      }
      if (data.content) {
        updateScript({ output: data.content });
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
      }
    } catch {
      setErr("Network error. Check your connection and try again.");
    } finally {
      setScriptLoading(false);
    }
  };

  const runCharacter = async () => {
    setErr(null);
    setCharLoading(true);
    try {
      const res = await fetch("/api/writers/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: draft.character.mode,
          seed: draft.character.seed,
          name: draft.character.name || undefined,
          role: draft.character.role || undefined,
          ageRange: draft.character.ageRange || undefined,
          traits: draft.character.traits || undefined,
          conflict: draft.character.conflict || undefined,
          world: draft.character.world || undefined,
          foilName: draft.character.foilName || undefined,
          notes: draft.character.notes || undefined,
        }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok) {
        setErr(data.error || "Could not generate character.");
        return;
      }
      if (data.content) {
        updateCharacter({ output: data.content });
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
      }
    } catch {
      setErr("Network error. Check your connection and try again.");
    } finally {
      setCharLoading(false);
    }
  };

  const copyOut = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
    } catch {
      setErr("Could not copy to clipboard.");
    }
  };

  const downloadTxt = (name: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (!window.confirm("Clear saved draft from this device?")) return;
    localStorage.removeItem(STORAGE_KEY);
    const fresh = defaultDraft();
    setDraft(fresh);
    setTab("script");
    setErr(null);
  };

  const scriptModes = useMemo(
    () =>
      [
        { id: "outline" as const, label: "Outline", hint: "Acts & turning points" },
        { id: "beats" as const, label: "Beats", hint: "Numbered scene list" },
        { id: "scene" as const, label: "Scene", hint: "Full scene draft" },
        { id: "dialogue" as const, label: "Dialogue", hint: "Voices & subtext" },
        { id: "rewrite" as const, label: "Rewrite", hint: "Elevate a draft" },
      ],
    []
  );

  const charModes = useMemo(
    () =>
      [
        { id: "sheet" as const, label: "Character bible", hint: "Full sheet" },
        { id: "voice" as const, label: "Voice", hint: "Lines & patterns" },
        { id: "arc" as const, label: "Arc", hint: "Season arc" },
        { id: "ensemble" as const, label: "Ensemble", hint: "Two-hander dynamic" },
      ],
    []
  );

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] bg-[#030306] pb-parable-bottom pt-parable-header flex items-center justify-center text-white/40 text-sm">
        Loading Writer Studio…
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#030306] pb-parable-bottom pt-parable-header text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-[-20%] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,242,255,0.22),transparent_55%),radial-gradient(circle_at_90%_60%,rgba(196,165,116,0.12),transparent_45%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/parables"
              className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00f2ff]/70 hover:text-[#00f2ff]"
            >
              ← Parables
            </Link>
            <h1 className="mt-3 flex flex-wrap items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#00f2ff]/25 bg-[#00f2ff]/10 shadow-[0_0_28px_rgba(0,242,255,0.15)]">
                <Feather className="text-[#00f2ff]" size={20} />
              </span>
              Writer Studio
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
              AI-assisted scripts and character work — built for Parable storytellers. Drafts autosave on this device.
            </p>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-red-500/30 hover:text-red-200"
          >
            <Trash2 size={14} /> Clear draft
          </button>
        </div>

        {err && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
            <AlertCircle className="mt-0.5 shrink-0 text-amber-400" size={18} />
            <p>{err}</p>
          </div>
        )}

        <div className="mb-8 flex rounded-2xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
          {(
            [
              { id: "script" as const, label: "Script", icon: PenLine },
              { id: "character" as const, label: "Characters", icon: Users },
            ] as const
          ).map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setTabSafe(x.id)}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest transition",
                tab === x.id
                  ? "bg-[#00f2ff]/15 text-[#00f2ff] shadow-[0_0_24px_rgba(0,242,255,0.12)]"
                  : "text-white/45 hover:text-white/75",
              ].join(" ")}
            >
              <x.icon size={16} />
              {x.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "script" ? (
            <motion.div
              key="script"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Mode</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {scriptModes.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updateScript({ mode: m.id })}
                      className={[
                        "rounded-2xl border px-3 py-3 text-left transition",
                        draft.script.mode === m.id
                          ? "border-[#00f2ff]/40 bg-[#00f2ff]/10 shadow-[0_0_20px_rgba(0,242,255,0.1)]"
                          : "border-white/10 bg-black/30 hover:border-white/20",
                      ].join(" ")}
                    >
                      <span className="block text-[11px] font-black uppercase tracking-wide text-white">{m.label}</span>
                      <span className="mt-1 block text-[10px] text-white/45">{m.hint}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <label className="block sm:col-span-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Genre</span>
                    <input
                      value={draft.script.genre}
                      onChange={(e) => updateScript({ genre: e.target.value })}
                      placeholder="e.g. Redemption drama"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm outline-none ring-0 focus:border-[#00f2ff]/40"
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Tone</span>
                    <input
                      value={draft.script.tone}
                      onChange={(e) => updateScript({ tone: e.target.value })}
                      placeholder="e.g. Hopeful, tense"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm outline-none focus:border-[#00f2ff]/40"
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Length</span>
                    <select
                      value={draft.script.length}
                      onChange={(e) => updateScript({ length: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm outline-none focus:border-[#00f2ff]/40"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </label>
                </div>

                <label className="mt-6 block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Premise / logline <span className="text-[#00f2ff]">*</span>
                  </span>
                  <textarea
                    value={draft.script.premise}
                    onChange={(e) => updateScript({ premise: e.target.value })}
                    rows={4}
                    placeholder="What happens, who it’s about, and why it matters…"
                    className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm leading-relaxed outline-none focus:border-[#00f2ff]/40"
                  />
                </label>

                {draft.script.mode === "rewrite" && (
                  <label className="mt-4 block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Existing draft <span className="text-[#00f2ff]">*</span>
                    </span>
                    <textarea
                      value={draft.script.existingScript}
                      onChange={(e) => updateScript({ existingScript: e.target.value })}
                      rows={8}
                      placeholder="Paste the scene or script to rewrite…"
                      className="mt-2 w-full resize-y rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 font-mono text-xs leading-relaxed outline-none focus:border-amber-500/40"
                    />
                  </label>
                )}

                <label className="mt-4 block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Notes (optional)</span>
                  <textarea
                    value={draft.script.notes}
                    onChange={(e) => updateScript({ notes: e.target.value })}
                    rows={2}
                    placeholder="Audience, setting, must-haves, what to avoid…"
                    className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#00f2ff]/40"
                  />
                </label>

                <button
                  type="button"
                  disabled={scriptLoading}
                  onClick={runScript}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00f2ff] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-[0_0_32px_rgba(0,242,255,0.25)] transition hover:brightness-110 disabled:opacity-60"
                >
                  {scriptLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                  Generate script
                </button>
              </div>

              <OutputPanel
                title="Script output"
                content={draft.script.output}
                onCopy={() => copyOut(draft.script.output)}
                onDownload={() => downloadTxt("parable-script", draft.script.output)}
                disabled={!draft.script.output.trim()}
              />
            </motion.div>
          ) : (
            <motion.div
              key="character"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Mode</p>
                <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {charModes.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updateCharacter({ mode: m.id })}
                      className={[
                        "rounded-2xl border px-3 py-3 text-left transition",
                        draft.character.mode === m.id
                          ? "border-[#c4a574]/50 bg-[#c4a574]/10 shadow-[0_0_20px_rgba(196,165,116,0.12)]"
                          : "border-white/10 bg-black/30 hover:border-white/20",
                      ].join(" ")}
                    >
                      <span className="block text-[11px] font-black uppercase tracking-wide text-white">{m.label}</span>
                      <span className="mt-1 block text-[10px] text-white/45">{m.hint}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Name (optional)</span>
                    <input
                      value={draft.character.name}
                      onChange={(e) => updateCharacter({ name: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm outline-none focus:border-[#c4a574]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Role / function</span>
                    <input
                      value={draft.character.role}
                      onChange={(e) => updateCharacter({ role: e.target.value })}
                      placeholder="e.g. Reluctant worship leader"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm outline-none focus:border-[#c4a574]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Age range</span>
                    <input
                      value={draft.character.ageRange}
                      onChange={(e) => updateCharacter({ ageRange: e.target.value })}
                      placeholder="e.g. late 20s"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm outline-none focus:border-[#c4a574]/40"
                    />
                  </label>
                  {draft.character.mode === "ensemble" && (
                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Foil / other character</span>
                      <input
                        value={draft.character.foilName}
                        onChange={(e) => updateCharacter({ foilName: e.target.value })}
                        placeholder="Name or short description"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm outline-none focus:border-[#c4a574]/40"
                      />
                    </label>
                  )}
                </div>

                <label className="mt-4 block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Character seed <span className="text-[#c4a574]">*</span>
                  </span>
                  <textarea
                    value={draft.character.seed}
                    onChange={(e) => updateCharacter({ seed: e.target.value })}
                    rows={4}
                    placeholder="Who they are, what they want, what scares them — even rough bullets."
                    className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm leading-relaxed outline-none focus:border-[#c4a574]/40"
                  />
                </label>

                <label className="mt-4 block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Traits & texture</span>
                  <textarea
                    value={draft.character.traits}
                    onChange={(e) => updateCharacter({ traits: e.target.value })}
                    rows={2}
                    placeholder="Habits, style, humor, tells…"
                    className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#c4a574]/40"
                  />
                </label>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Central conflict</span>
                    <textarea
                      value={draft.character.conflict}
                      onChange={(e) => updateCharacter({ conflict: e.target.value })}
                      rows={3}
                      placeholder="Internal / external pressure"
                      className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#c4a574]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Story world</span>
                    <textarea
                      value={draft.character.world}
                      onChange={(e) => updateCharacter({ world: e.target.value })}
                      rows={3}
                      placeholder="Church, city, family business…"
                      className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#c4a574]/40"
                    />
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Extra notes</span>
                  <textarea
                    value={draft.character.notes}
                    onChange={(e) => updateCharacter({ notes: e.target.value })}
                    rows={2}
                    className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#c4a574]/40"
                  />
                </label>

                <button
                  type="button"
                  disabled={charLoading}
                  onClick={runCharacter}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c4a574]/35 bg-[#c4a574]/15 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#f5e6c8] shadow-[0_0_28px_rgba(196,165,116,0.15)] transition hover:bg-[#c4a574]/25 disabled:opacity-60"
                >
                  {charLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Generate character
                </button>
              </div>

              <OutputPanel
                title="Character output"
                content={draft.character.output}
                onCopy={() => copyOut(draft.character.output)}
                onDownload={() => downloadTxt("parable-character", draft.character.output)}
                disabled={!draft.character.output.trim()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-10 text-center text-[10px] leading-relaxed text-white/35">
          AI output is a draft — you own the rewrite. Configure <code className="text-white/50">OPENAI_API_KEY</code> for
          production.
        </p>
      </div>
    </div>
  );
}

function OutputPanel({
  title,
  content,
  onCopy,
  onDownload,
  disabled,
}: {
  title: string;
  content: string;
  onCopy: () => void;
  onDownload: () => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/50 p-5 backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          <BookOpen size={14} className="text-[#00f2ff]/70" />
          {title}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/70 transition hover:bg-white/10 disabled:opacity-40"
          >
            <Copy size={14} /> Copy
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#00f2ff]/25 bg-[#00f2ff]/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#00f2ff] transition hover:bg-[#00f2ff]/18 disabled:opacity-40"
          >
            <Download size={14} /> .txt
          </button>
        </div>
      </div>
      <div className="mt-4 max-h-[min(520px,55vh)] overflow-y-auto rounded-2xl border border-white/5 bg-black/60 p-4">
        {content.trim() ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/85">{content}</pre>
        ) : (
          <p className="text-sm text-white/35">Output appears here after you generate.</p>
        )}
      </div>
    </div>
  );
}
