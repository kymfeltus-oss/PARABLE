 "use client";

import { useState } from "react";
import { BookOpenText, Brain, Languages, Sparkles, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import AppLogo from "@/components/AppLogo";

type ScholarTab = "theory" | "decoder" | "debate" | "sermon";

const SAMPLE_PASSAGE = {
  reference: "John 1:1–5 (ESV)",
  text: [
    "In the beginning was the Word, and the Word was with God, and the Word was God.",
    "He was in the beginning with God.",
    "All things were made through him, and without him was not any thing made that was made.",
    "In him was life, and the life was the light of men.",
    "The light shines in the darkness, and the darkness has not overcome it.",
  ],
};

export default function SanctuaryReaderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ScholarTab>("theory");

  return (
    <div className="min-h-screen bg-[#020107] text-white relative overflow-hidden">
      {/* Soft halo background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.06),transparent_65%),radial-gradient(circle_at_bottom,rgba(180,83,9,0.16),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.15] mix-blend-soft-light" />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-full flex-col gap-5 px-4 py-5 sm:gap-6 sm:py-7 sm:px-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/my-sanctuary")}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 hover:border-[var(--color-cyber)]/60 transition"
          >
            <AppLogo size="md" showLabel />
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[9px] font-mono uppercase tracking-[3px] text-[var(--color-cyber)]/70">
                Sanctuary // Reader
              </span>
              <span className="text-xs text-white/70">
                The Intelligence Behind the Word
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/table")}
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[2px] text-white/70 hover:border-[var(--color-cyber)]/60"
            >
              <UsersIcon />
              Groups
            </button>
            <button
              onClick={() => router.push("/lab")}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-cyber)] px-4 py-2 text-[11px] font-black uppercase tracking-[2px] text-black shadow-[0_0_20px_rgba(0,242,255,0.75)] hover:bg-[#4df7ff]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open Lab
            </button>
          </div>
        </header>

        {/* Tagline row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 text-white/60">
            <span className="inline-flex h-1.5 w-10 rounded-full bg-gradient-to-r from-[var(--color-cyber)] via-sky-400 to-emerald-400 shadow-[0_0_16px_rgba(56,189,248,0.8)]" />
            <span className="font-mono uppercase tracking-[2.5px]">
              Deep Study // AI Scholar
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Scholar mode online</span>
          </div>
        </div>

        {/* Main 2-column layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 sm:gap-6">
          {/* Left: Reader */}
          <section className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-black/70 via-black/60 to-black/80 shadow-[0_0_60px_rgba(0,0,0,0.7)] overflow-hidden">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.26),transparent_65%)] opacity-40" />

            <div className="relative flex flex-col h-full">
              {/* Reader header */}
              <div className="flex items-center justify-between px-4 sm:px-5 pt-3 pb-2 border-b border-white/10 bg-black/50 backdrop-blur">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-cyber)]/10 border border-[var(--color-cyber)]/40">
                    <BookOpenText className="w-4 h-4 text-[var(--color-cyber)]" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-semibold">The Sanctuary Reader</span>
                    <span className="text-[10px] text-white/45">
                      Clean text. Instant context.
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/55">
                  <span className="rounded-full bg-white/5 border border-white/15 px-2 py-0.5">
                    ESV
                  </span>
                  <span className="rounded-full bg-white/5 border border-white/15 px-2 py-0.5">
                    Greek / Hebrew
                  </span>
                </div>
              </div>

              {/* Verse selector row (static placeholder for now) */}
              <div className="px-4 sm:px-5 py-3 border-b border-white/10 flex flex-wrap gap-2 items-center justify-between bg-black/40">
                <div className="flex flex-wrap gap-2 items-center text-[11px]">
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                    John
                  </span>
                  <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                    Chapter 1
                  </span>
                  <span className="rounded-full bg-white/0 border border-dashed border-white/15 px-3 py-1 text-white/60">
                    Passage: 1–5
                  </span>
                </div>
                <button className="mt-1 sm:mt-0 text-[11px] text-[var(--color-cyber)] hover:underline">
                  Change passage
                </button>
              </div>

              {/* Scrollable text */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-5 pt-4 space-y-3 text-sm leading-relaxed scrollbar-hide">
                <p className="text-[11px] font-mono uppercase tracking-[3px] text-white/45">
                  {SAMPLE_PASSAGE.reference}
                </p>
                {SAMPLE_PASSAGE.text.map((line, idx) => (
                  <p key={idx} className="text-[15px] sm:text-base text-white/90">
                    <span className="mr-2 text-[11px] align-top text-white/35">
                      {idx + 1}
                    </span>
                    {line}
                  </p>
                ))}

                <div className="mt-4 inline-flex flex-wrap gap-2 text-[11px]">
                  <button className="rounded-full bg-white/5 border border-white/15 px-3 py-1 text-white/70 hover:border-[var(--color-cyber)]/60">
                    Highlight
                  </button>
                  <button className="rounded-full bg-white/5 border border-white/15 px-3 py-1 text-white/70 hover:border-[var(--color-cyber)]/60">
                    Add note
                  </button>
                  <button className="rounded-full bg-white/5 border border-white/15 px-3 py-1 text-white/70 hover:border-[var(--color-cyber)]/60">
                    Ask Scholar
                  </button>
                </div>

                <p className="mt-5 text-[11px] text-white/45">
                  Tip: In a later version, tapping any word will open its Greek/Hebrew root,
                  Strong&apos;s data, and contextual usage on the right.
                </p>
              </div>
            </div>
          </section>

          {/* Right: AI Scholar */}
          <aside className="relative rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 pt-3 pb-2 border-b border-white/10 bg-gradient-to-r from-black via-black to-[#050b11]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-cyber)]/10 border border-[var(--color-cyber)]/40">
                  <Brain className="w-4 h-4 text-[var(--color-cyber)]" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold">AI Scholar</span>
                  <span className="text-[10px] text-white/45">
                    Synthesizes scripture, history, and voices.
                  </span>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 px-2 py-0.5 text-[10px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Study mode
              </span>
            </div>

            {/* Tabs */}
            <div className="px-3.5 sm:px-4 pt-3 pb-2 border-b border-white/10">
              <div className="inline-flex rounded-full bg-white/[0.03] border border-white/10 p-0.5 text-[11px]">
                <ScholarTabButton
                  id="theory"
                  label="Theory Solver"
                  active={activeTab === "theory"}
                  onClick={() => setActiveTab("theory")}
                />
                <ScholarTabButton
                  id="decoder"
                  label="De-coder"
                  active={activeTab === "decoder"}
                  onClick={() => setActiveTab("decoder")}
                />
                <ScholarTabButton
                  id="debate"
                  label="Steel Man"
                  active={activeTab === "debate"}
                  onClick={() => setActiveTab("debate")}
                />
                <ScholarTabButton
                  id="sermon"
                  label="Sermon Prep"
                  active={activeTab === "sermon"}
                  onClick={() => setActiveTab("sermon")}
                />
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 text-sm space-y-3 scrollbar-hide">
              {activeTab === "theory" && (
                <TheorySolverPanel
                  passageContext={`${SAMPLE_PASSAGE.reference}\n\n${SAMPLE_PASSAGE.text.join(" ")}`}
                />
              )}
              {activeTab === "decoder" && (
                <DecoderPanel
                  verseRef={SAMPLE_PASSAGE.reference}
                  passageContext={`${SAMPLE_PASSAGE.reference}\n\n${SAMPLE_PASSAGE.text.join(" ")}`}
                />
              )}
              {activeTab === "debate" && (
                <DebatePanel
                  verseRef={SAMPLE_PASSAGE.reference}
                  passageContext={`${SAMPLE_PASSAGE.reference}\n\n${SAMPLE_PASSAGE.text.join(" ")}`}
                />
              )}
              {activeTab === "sermon" && <SermonPrepPlaceholder />}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ScholarTabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all",
        active
          ? "bg-[var(--color-cyber)] text-black shadow-[0_0_18px_rgba(0,242,255,0.7)]"
          : "text-white/60 hover:text-white",
      ].join(" ")}
      aria-pressed={active}
      aria-label={label}
      data-tab-id={id}
    >
      {active && (
        <span className="absolute inset-0 rounded-full bg-white/40 mix-blend-soft-light pointer-events-none" />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function TheorySolverPanel({ passageContext }: { passageContext: string }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/scholar/theory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, passageContext: passageContext || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }
      setAnswer(data.answer ?? null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3.5 space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[2.5px] text-white/50">
          Ask the Scholar
        </p>
        <p className="text-xs text-white/70 mb-2">
          Ask about this passage—mysteries, archaeology, or theology. The AI grounds answers in
          scripture and multiple scholarly views.
        </p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit())}
          placeholder="e.g. What did “Logos” mean in John’s world?"
          rows={2}
          className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-[var(--color-cyber)]/60 resize-none"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !question.trim()}
          className="w-full rounded-lg bg-[var(--color-cyber)] py-2 text-[11px] font-bold uppercase tracking-[2px] text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4df7ff] transition"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>
      {error && (
        <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
          {error}
        </div>
      )}
      {answer && (
        <div className="rounded-xl border border-[var(--color-cyber)]/20 bg-[var(--color-cyber)]/5 p-3.5 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[2.5px] text-[var(--color-cyber)]/80">
            Scholar
          </p>
          <div className="text-xs text-white/90 whitespace-pre-wrap leading-relaxed">
            {answer}
          </div>
        </div>
      )}
      <p className="text-[11px] text-white/50">
        Example: “Who were the Nephilim?” · “Summarize debates about John 1:1.”
      </p>
    </div>
  );
}

type DecoderResult = {
  original: string;
  transliteration: string;
  gloss: string;
  strongs: string | null;
  usages: string[];
};

function DecoderPanel({
  verseRef,
  passageContext,
}: {
  verseRef: string;
  passageContext: string;
}) {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecoderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = async () => {
    const w = word.trim();
    if (!w || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/scholar/decoder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: w,
          verseRef,
          verseText: passageContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }
      setResult({
        original: data.original ?? "",
        transliteration: data.transliteration ?? "",
        gloss: data.gloss ?? "",
        strongs: data.strongs ?? null,
        usages: Array.isArray(data.usages) ? data.usages : [],
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-[var(--color-cyber)]" />
          <p className="text-xs font-semibold">Multilingual De-Coder</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3.5 space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-[2.5px] text-white/50">
          Word from passage
        </p>
        <p className="text-xs text-white/70 mb-2">
          Enter a word (e.g. Word, light, beginning) to see its Greek/Hebrew root and usage.
        </p>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleDecode())}
          placeholder="e.g. Word or light"
          className="w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-[var(--color-cyber)]/60"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleDecode}
          disabled={loading || !word.trim()}
          className="w-full rounded-lg bg-[var(--color-cyber)] py-2 text-[11px] font-bold uppercase tracking-[2px] text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4df7ff] transition"
        >
          {loading ? "Decoding…" : "Decode"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3.5 space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-[2.5px] text-white/50">
              Word breakdown
            </p>
            <div className="flex items-baseline justify-between gap-2">
              <div className="space-y-0.5">
                {result.original && (
                  <p className="text-base font-semibold text-white/95">{result.original}</p>
                )}
                <p className="text-xs text-white/70 italic">{result.transliteration || "—"}</p>
              </div>
              {result.strongs && (
                <span className="text-[10px] text-white/55 shrink-0">{result.strongs}</span>
              )}
            </div>
            <p className="text-xs text-white/75">{result.gloss || "—"}</p>
          </div>
          {result.usages.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-white/55">Contextual usage</p>
              <ul className="space-y-1.5 text-[11px] text-white/78">
                {result.usages.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type SteelManResult = {
  sharedGround: string;
  viewA: { name: string; summary: string };
  viewB: { name: string; summary: string };
};

function DebatePanel({
  verseRef,
  passageContext,
}: {
  verseRef: string;
  passageContext: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SteelManResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/scholar/steelman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseRef, verseText: passageContext }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }
      setResult({
        sharedGround: data.sharedGround ?? "",
        viewA: data.viewA ?? { name: "View A", summary: "" },
        viewB: data.viewB ?? { name: "View B", summary: "" },
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-[var(--color-cyber)]" />
          <p className="text-xs font-semibold">Steel Man Debater</p>
        </div>
      </div>

      <p className="text-[11px] text-white/70">
        Get the strongest, charitable versions of two theological views on this passage — no
        strawmen.
      </p>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full rounded-lg bg-[var(--color-cyber)] py-2 text-[11px] font-bold uppercase tracking-[2px] text-black disabled:opacity-50 hover:bg-[#4df7ff] transition"
      >
        {loading ? "Generating…" : "Generate two views"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {result.sharedGround && (
            <div className="rounded-lg border border-white/15 bg-white/[0.04] p-2.5">
              <p className="text-[11px] text-white/55 mb-1">Shared ground</p>
              <p className="text-[11px] text-white/85">{result.sharedGround}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg border border-emerald-400/35 bg-emerald-500/5 p-2.5 space-y-1.5">
              <p className="font-semibold text-emerald-200 text-[11px] uppercase tracking-[2px]">
                {result.viewA.name}
              </p>
              <p className="text-white/80">{result.viewA.summary}</p>
            </div>
            <div className="rounded-lg border border-sky-400/35 bg-sky-500/5 p-2.5 space-y-1.5">
              <p className="font-semibold text-sky-200 text-[11px] uppercase tracking-[2px]">
                {result.viewB.name}
              </p>
              <p className="text-white/80">{result.viewB.summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SermonPrepPlaceholder() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-cyber)]" />
          <p className="text-xs font-semibold">Sermon Prep Illustrator</p>
        </div>
        <span className="text-[10px] text-white/45">Preview · Concept to analogies</span>
      </div>

      <p className="text-[11px] text-white/70">
        This tool will turn a theological theme (like “grace” or “repentance”) into a
        three-lens illustration set you can drop directly into a sermon or small group.
      </p>

      <div className="grid gap-2 text-[11px]">
        <div className="rounded-lg border border-cyan-400/40 bg-cyan-500/5 p-2.5 space-y-1">
          <p className="font-semibold text-cyan-200 uppercase tracking-[2px]">
            Tech // Software update
          </p>
          <p className="text-white/80">
            Grace as a deep system update that fixes corrupted files you couldn&apos;t repair
            yourself — not just a cosmetic patch.
          </p>
        </div>
        <div className="rounded-lg border border-fuchsia-400/40 bg-fuchsia-500/5 p-2.5 space-y-1">
          <p className="font-semibold text-fuchsia-200 uppercase tracking-[2px]">
            Culture // Movie arc
          </p>
          <p className="text-white/80">
            Grace as the turning point where a character is forgiven and given a new identity
            they didn&apos;t earn.
          </p>
        </div>
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/5 p-2.5 space-y-1">
          <p className="font-semibold text-amber-200 uppercase tracking-[2px]">
            Nature // Growth cycle
          </p>
          <p className="text-white/80">
            Grace as sunlight on a withered plant — a steady, undeserved source that revives
            and grows what looked dead.
          </p>
        </div>
      </div>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-[var(--color-cyber)]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 11a4 4 0 1 0-8 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 21a7 7 0 0 1 18 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

