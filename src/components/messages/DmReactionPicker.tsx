"use client";

const EMOJIS = ["❤️", "😂", "😮", "😢", "🙏", "🔥"] as const;

type Props = {
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

export default function DmReactionPicker({ onSelect, onClose }: Props) {
  return (
    <div className="absolute -top-11 left-0 z-30 flex items-center gap-1 rounded-full border border-[#06111E] bg-[#020712] px-2 py-1 shadow-lg">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="text-lg leading-none transition hover:scale-110"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
      <button type="button" className="ml-1 text-[10px] text-[#64748B]" onClick={onClose}>
            ✕
      </button>
    </div>
  );
}
