"use client";

import { useState } from "react";
import Link from "next/link";

const CAPTION_CLAMP = 120;

type Props = {
  username: string;
  profileHref: string;
  caption: string;
};

export default function SanctuaryIgCaption({ username, profileHref, caption }: Props) {
  const [expanded, setExpanded] = useState(false);
  const needsMore = caption.length > CAPTION_CLAMP;
  const visible = expanded || !needsMore ? caption : `${caption.slice(0, CAPTION_CLAMP).trim()}…`;

  return (
    <p className="px-3 pb-3 text-[13px] leading-snug text-[#CBD5E1]">
      <Link href={profileHref} className="mr-1.5 font-semibold text-[#F8FAFC] hover:text-[#00F2FE]">
        {username}
      </Link>
      <span>{visible}</span>
      {needsMore ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ml-1 text-[#94A3B8] hover:text-[#CBD5E1]"
        >
          {expanded ? "less" : "more"}
        </button>
      ) : null}
    </p>
  );
}
