"use client";

import Image from "next/image";

const IS_STUDY_AI = process.env.NEXT_PUBLIC_APP_VARIANT === "parable-study-ai";

type AppLogoProps = {
  className?: string;
  imageClassName?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
};

export default function AppLogo({ className = "", imageClassName = "", size = "md", showLabel = true }: AppLogoProps) {
  const isSm = size === "sm";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative ${isSm ? "h-5 w-16 sm:h-6 sm:w-20" : "h-6 w-20 sm:h-7 sm:w-28"}`}>
        <Image
          src="/fonts/parable-logo.svg"
          alt={IS_STUDY_AI ? "PARABLE Study AI" : "Parable"}
          fill
          className={`object-contain drop-shadow-[0_0_14px_rgba(0,242,255,0.85)] ${imageClassName}`}
          priority
        />
      </div>
      {showLabel && IS_STUDY_AI && (
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap text-[var(--color-cyber)]">
          Study AI
        </span>
      )}
    </div>
  );
}
