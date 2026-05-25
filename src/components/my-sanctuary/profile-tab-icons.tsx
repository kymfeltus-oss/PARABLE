type TabIconProps = {
  className?: string;
};

export function PostsTabIcon({ className = "h-3 w-3" }: TabIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
      />
    </svg>
  );
}

export function ReelsTabIcon({ className = "h-3 w-3" }: TabIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M7 4l12 6-12 6V4z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M4 6v12"
      />
    </svg>
  );
}

export function TaggedTabIcon({ className = "h-3 w-3" }: TabIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M7 7h10v10H7V7z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3"
      />
    </svg>
  );
}

export function formatProfileMetric(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}K`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}
