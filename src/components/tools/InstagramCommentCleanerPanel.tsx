"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Copy, ExternalLink } from "lucide-react";
import {
  INSTAGRAM_COMMENT_DELETION_SCRIPT,
  INSTAGRAM_COMMENT_DELETION_STEPS,
  INSTAGRAM_COMMENTS_ACTIVITY_URL,
} from "@/lib/tools/instagram-comment-deletion";

/** Isolated helper UI — script runs on instagram.com via DevTools, not in PARABLE. */
export default function InstagramCommentCleanerPanel() {
  const [copied, setCopied] = useState(false);

  const copyScript = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTAGRAM_COMMENT_DELETION_SCRIPT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this script:", INSTAGRAM_COMMENT_DELETION_SCRIPT);
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-white md:px-6">
      <Link href="/settings" className="text-sm text-gray-400 transition hover:text-cyan-400">
        ← Back to settings
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-cyan-400">
          Instagram comment cleaner
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
          External utility for batch-deleting your own Instagram comments. This does not modify PARABLE
          comments, reels, or sanctuary data.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          Important
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-amber-100/90">
          <li>The script runs on <strong>instagram.com</strong> in your browser console — not inside PARABLE.</li>
          <li>It depends on Instagram&apos;s current page layout and may break after UI updates.</li>
          <li>Deletion is permanent. Review the script before running it.</li>
        </ul>
      </section>

      <section className="mb-6 rounded-xl border border-[#2f3136] bg-[#18191c] p-6">
        <h2 className="mb-4 text-lg font-bold">How to use</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-300">
          {INSTAGRAM_COMMENT_DELETION_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void copyScript()}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy script"}
          </button>

          <a
            href={INSTAGRAM_COMMENTS_ACTIVITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#2f3136] px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-cyan-500/40 hover:text-cyan-300"
          >
            Open Instagram comments page
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="rounded-xl border border-[#2f3136] bg-[#0f1011] p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Console script</h2>
          <span className="text-xs text-gray-500">Read-only preview</span>
        </div>
        <pre className="max-h-[420px] overflow-auto rounded-lg bg-black/60 p-4 text-xs leading-relaxed text-gray-300 [scrollbar-width:thin]">
          <code>{INSTAGRAM_COMMENT_DELETION_SCRIPT}</code>
        </pre>
      </section>
    </div>
  );
}
