"use client";

import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";

type Props = {
  title: string;
  step: number;
  totalSteps: number;
  stepLabel: string;
  backHref?: string;
  onBack?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
};

/** Full-screen create flow chrome with step progress. */
export default function CreateFlowShell({
  title,
  step,
  totalSteps,
  stepLabel,
  backHref = "/my-sanctuary",
  onBack,
  onClose,
  children,
}: Props) {
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#01040A] font-sans text-[#F8FAFC]">
      <header className="shrink-0 border-b border-[#06111E] bg-[#02040A]/95 px-3 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button type="button" onClick={onBack} className="text-[#94A3B8] hover:text-[#00F2FE]" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <Link href={backHref} className="text-[#94A3B8] hover:text-[#00F2FE]" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold">{title}</h1>
            <p className="text-[11px] text-[#64748B]">
              Step {step} of {totalSteps} · {stepLabel}
            </p>
          </div>
          {onClose ? (
            <button type="button" onClick={onClose} className="text-[#94A3B8] hover:text-[#F8FAFC]" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          ) : (
            <Link href={backHref} className="text-[#94A3B8] hover:text-[#F8FAFC]" aria-label="Close">
              <X className="h-5 w-5" />
            </Link>
          )}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#06111E]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  );
}
