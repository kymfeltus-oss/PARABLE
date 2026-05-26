"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { mockSermonOutlineFromScripture } from "@/lib/mock-sermon-outline";

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Discord-style side drawer — sermon concept in, mock outline out.
 */
export function AiArchitectOutlinePanel({ open, onClose }: Props) {
  const [concept, setConcept] = useState("");
  const [outline, setOutline] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = useCallback(async () => {
    setBusy(true);
    setOutline("");
    await new Promise((r) => window.setTimeout(r, 650));
    setOutline(mockSermonOutlineFromScripture(concept));
    setBusy(false);
  }, [concept]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[180]">
          <motion.button
            type="button"
            aria-label="Close panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020202]/85 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-architect-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 z-[190] flex h-full w-full max-w-[420px] flex-col border-l border-[#1f2127] bg-[#2b2d31] shadow-[-12px_0_48px_rgba(0,0,0,0.55)]"
          >
            <div className="flex min-h-[52px] shrink-0 items-center justify-between border-b border-[#1f2127] bg-[#313338] px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e1f22] text-[#00f2ff]">
                  <Wand2 className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <p id="ai-architect-title" className="text-[15px] font-semibold leading-tight text-[#f2f3f5]">
                    AI Architect
                  </p>
                  <p className="text-[11px] text-[#b5bac1]">Sermon tools · Sanctuary</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-[#b5bac1] transition hover:bg-[#1e1f22] hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 scrollbar-hide">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-[#949ba4]">Sermon concept</label>
                <textarea
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Reference, passage, or theme you’re preaching toward…"
                  rows={6}
                  className="mt-2 w-full resize-none rounded-lg border border-[#1f2127] bg-[#1e1f22] px-3 py-3 text-sm leading-relaxed text-[#dbdee1] shadow-inner placeholder:text-[#6d737a] outline-none focus:border-[#00f2ff]/50 focus:ring-1 focus:ring-[#00f2ff]/25"
                />
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => void generate()}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#00f2ff] px-4 text-sm font-semibold text-[#060607] shadow-[0_0_24px_rgba(0,242,255,0.25)] transition hover:brightness-110 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate with AI
              </button>

              {outline ? (
                <div className="rounded-lg border border-[#202225] bg-[#1e1f22] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#949ba4]">Outline</p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-[#dcddde]">
                    {outline}
                  </pre>
                </div>
              ) : (
                <p className="text-[12px] leading-relaxed text-[#949ba4]">
                  Describe your concept above, then generate a structured outline. (Mock response until backend is wired.)
                </p>
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
