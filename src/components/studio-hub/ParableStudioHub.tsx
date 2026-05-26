"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GripVertical, Loader2, Video, Wand2, ImageIcon, LayoutGrid } from "lucide-react";

const STUDIO_SCRIPT_KEY = "parable:studio-hub:script:v1";

type Shot = { id: string; caption: string; note: string };

const MOCK_CASTING = [
  {
    id: "c1",
    title: "Lead — drama pilot",
    meta: "Self-tape · closes Feb 28",
    submitUrl: "https://example.com/casting/lead-drama",
  },
  {
    id: "c2",
    title: "Supporting — family series",
    meta: "Remote reads · rolling",
    submitUrl: "https://example.com/casting/supporting",
  },
  {
    id: "c3",
    title: "Voice match — narrator",
    meta: "60s sample · one role",
    submitUrl: "https://example.com/casting/voice",
  },
] as const;

function loadScript(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STUDIO_SCRIPT_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveScript(s: string) {
  try {
    localStorage.setItem(STUDIO_SCRIPT_KEY, s);
  } catch {
    /* quota */
  }
}

export default function ParableStudioHub() {
  const [script, setScript] = useState("");
  const [collabLoading, setCollabLoading] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false);
  const [castingTab, setCastingTab] = useState<"ai" | "real">("ai");
  const [conceptPrompt, setConceptPrompt] = useState("");
  const [shots, setShots] = useState<Shot[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    setScript(loadScript());
  }, []);

  const onScriptChange = useCallback((v: string) => {
    setScript(v);
    saveScript(v);
  }, []);

  const collaborate = async () => {
    setErr(null);
    setCollabLoading(true);
    try {
      const res = await fetch("/api/studio/collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const data = (await res.json()) as { suggestion?: string; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Collaborate failed.");
        return;
      }
      if (data.suggestion) {
        const next = script.trimEnd() + "\n\n" + data.suggestion.trim() + "\n";
        onScriptChange(next);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
      }
    } catch {
      setErr("Network error.");
    } finally {
      setCollabLoading(false);
    }
  };

  const generateBoard = async () => {
    setErr(null);
    setBoardLoading(true);
    try {
      const res = await fetch("/api/studio/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const data = (await res.json()) as { shots?: Shot[]; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Storyboard failed.");
        return;
      }
      if (data.shots?.length) {
        setShots(data.shots);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
      }
    } catch {
      setErr("Network error.");
    } finally {
      setBoardLoading(false);
    }
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (to: number) => {
    if (dragIdx === null || dragIdx === to) {
      setDragIdx(null);
      return;
    }
    setShots((prev) => {
      const next = [...prev];
      const [m] = next.splice(dragIdx, 1);
      next.splice(to, 0, m);
      return next;
    });
    setDragIdx(null);
  };

  const moduleShell = (n: string, title: string, subtitle: string, children: React.ReactNode) => (
    <section className="rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-black/50 p-5 shadow-[0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-[11px] font-black text-amber-200/90">
          {n}
        </span>
        <div>
          <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">{title}</h2>
          <p className="mt-1 text-sm text-white/50">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );

  const castingList = useMemo(
    () => (
      <ul className="space-y-3">
        {MOCK_CASTING.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-bold text-white">{c.title}</p>
              <p className="text-[11px] uppercase tracking-widest text-white/40">{c.meta}</p>
            </div>
            <a
              href={c.submitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl border border-[#00f2ff]/30 bg-[#00f2ff]/10 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-[#00f2ff] hover:bg-[#00f2ff]/20"
            >
              Submit clip URL
            </a>
          </li>
        ))}
      </ul>
    ),
    []
  );

  return (
    <div className="space-y-8 pb-8">
      <header className="relative overflow-hidden rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 p-6 shadow-[0_0_80px_rgba(251,191,36,0.08)]">
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-32 w-64 rounded-full bg-[#00f2ff]/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-200/70">Premium production</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Creator Studio</h1>
            <p className="mt-2 max-w-md text-sm text-white/55">
              Script collaboration, casting workflow, and storyboard beats — tuned for fast iteration. Nothing heavy is stored except your draft text on this device.
            </p>
          </div>
          <Link
            href="/writers-hub"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white/10"
          >
            Deep writer tools
          </Link>
        </div>
      </header>

      {err && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100/90">{err}</div>
      )}

      {moduleShell(
        "01",
        "AI Script Architect",
        "Minimal screenplay surface. Collaborate adds the next line from the model.",
        <>
          <div className="rounded-2xl border border-white/10 bg-black/55 font-mono text-sm leading-relaxed shadow-inner">
            <textarea
              value={script}
              onChange={(e) => onScriptChange(e.target.value)}
              placeholder={"INT. STUDIO - DAY\n\nWriter adjusts a beat card.\n\nWRITER\nWe open cold.\n"}
              className="min-h-[220px] w-full resize-y bg-transparent px-4 py-4 text-[13px] text-white/90 outline-none placeholder:text-white/25"
              spellCheck={false}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={collabLoading || script.trim().length < 4}
              onClick={collaborate}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00f2ff] to-cyan-600 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-[0_0_28px_rgba(0,242,255,0.25)] disabled:opacity-40"
            >
              {collabLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              Collaborate
            </button>
            <span className="text-[11px] text-white/40">Uses your full draft as context. Edits save locally.</span>
          </div>
        </>
      )}

      {moduleShell(
        "02",
        "Hybrid Casting Room",
        "Switch between concept exploration and live casting call listings.",
        <>
          <div className="flex rounded-2xl border border-white/10 bg-black/40 p-1">
            <button
              type="button"
              onClick={() => setCastingTab("ai")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest transition ${
                castingTab === "ai"
                  ? "bg-gradient-to-r from-violet-600/40 to-fuchsia-600/30 text-white shadow-lg"
                  : "text-white/45 hover:text-white/75"
              }`}
            >
              <ImageIcon size={16} /> AI characters
            </button>
            <button
              type="button"
              onClick={() => setCastingTab("real")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest transition ${
                castingTab === "real"
                  ? "bg-gradient-to-r from-emerald-600/35 to-teal-600/25 text-white shadow-lg"
                  : "text-white/45 hover:text-white/75"
              }`}
            >
              <Video size={16} /> Real actors
            </button>
          </div>

          {castingTab === "ai" ? (
            <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-950/20 p-5">
              <p className="text-sm font-semibold text-white/90">Concept art pipeline</p>
              <p className="mt-2 text-sm text-white/50">
                Text-to-image hooks stay off-device: paste a model endpoint later and store only remote URLs. No large binaries in the app bundle.
              </p>
              <input
                value={conceptPrompt}
                onChange={(e) => setConceptPrompt(e.target.value)}
                placeholder="Describe look, wardrobe, lighting (reference for future URL pipeline)"
                className="mt-4 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-3 text-sm outline-none focus:border-violet-400/50"
              />
              <button
                type="button"
                disabled
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-[11px] font-black uppercase tracking-widest text-white/35"
              >
                Generate preview (connect provider)
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-white/35">
                Casting calls · external links only
              </p>
              {castingList}
            </div>
          )}
        </>
      )}

      {moduleShell(
        "03",
        "Visual Storyboarder",
        "Low-detail frames from your script. Drag tiles to reorder beats.",
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={boardLoading || script.trim().length < 20}
              onClick={generateBoard}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-amber-100 hover:bg-amber-500/20 disabled:opacity-40"
            >
              {boardLoading ? <Loader2 className="animate-spin" size={18} /> : <LayoutGrid size={18} />}
              Generate frames
            </button>
            <span className="text-[11px] text-white/40">Uses the same script as Module 01.</span>
          </div>

          {shots.length === 0 ? (
            <div className="mt-6 flex min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/30 text-sm text-white/35">
              No frames yet — generate from script.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shots.map((s, i) => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(i)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-800/80 to-black p-3 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-1 text-white/35">
                    <GripVertical size={14} className="shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Shot {i + 1}</span>
                  </div>
                  <div
                    className="mt-3 aspect-video w-full rounded-lg bg-gradient-to-br from-zinc-700/50 to-black/80"
                    style={{ minHeight: "72px" }}
                  />
                  <p className="mt-2 text-[11px] leading-snug text-white/85">{s.caption}</p>
                  {s.note ? <p className="mt-1 text-[10px] text-amber-200/70">{s.note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
