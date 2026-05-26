"use client";

type Props = {
  label: string;
};

export default function DmTypingIndicator({ label }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(100%+6px)] z-10 flex justify-start px-3">
      <div className="flex items-center gap-2 rounded-full border border-[#06111E] bg-[#020712]/95 px-3 py-1.5 text-[11px] text-[#94A3B8] shadow-lg backdrop-blur-sm">
        <span className="flex gap-0.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#64748B]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
        {label}
      </div>
    </div>
  );
}
