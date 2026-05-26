"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import DmTypingIndicator from "@/components/messages/DmTypingIndicator";

type Props = {
  disabled?: boolean;
  typingLabel?: string | null;
  onSend: (text: string) => void;
  onDraftChange: (text: string, hasText: boolean) => void;
};

export default function DmComposer({ disabled = false, typingLabel, onSend, onDraftChange }: Props) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stopTypingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stopTypingTimerRef.current) window.clearTimeout(stopTypingTimerRef.current);
    };
  }, []);

  const handleChange = (value: string) => {
    setDraft(value);
    const hasText = value.trim().length > 0;
    onDraftChange(value, hasText);

    if (stopTypingTimerRef.current) window.clearTimeout(stopTypingTimerRef.current);
    if (hasText) {
      stopTypingTimerRef.current = window.setTimeout(() => onDraftChange("", false), 2500);
    }
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || disabled) return;
    setDraft("");
    onDraftChange("", false);
    onSend(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className="relative border-t border-[#06111E] bg-[#020712]/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      {typingLabel ? <DmTypingIndicator label={typingLabel} /> : null}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder="Message…"
          className="max-h-24 min-h-[42px] flex-1 resize-none rounded-2xl bg-[#06111E] px-3 py-2.5 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] disabled:opacity-50"
          maxLength={4000}
        />
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] text-[#01040A] disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
