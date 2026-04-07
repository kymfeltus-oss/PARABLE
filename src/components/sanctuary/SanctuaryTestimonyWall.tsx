'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ShieldCheck } from 'lucide-react';

type Post = {
  id: number;
  user: string;
  tag: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | null;
  mediaName?: string;
  createdAt: number;
  stats: {
    amens: number;
    comments: number;
    shares: number;
    praiseBreaks: number;
    claps: number;
    dances: number;
    shouts: number;
  };
  reactions?: Record<string, number>;
};

type Props = {
  posts: Post[];
  formatRelativeTime: (t: number) => string;
};

function MediaThumb({ post }: { post: Post }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!post.mediaUrl) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-b from-white/[0.06] to-black/80">
        <p className="line-clamp-6 px-3 text-center text-[11px] leading-relaxed text-white/45">{post.text}</p>
      </div>
    );
  }

  if (post.mediaType === 'video') {
    return (
      <div
        className="group relative aspect-[4/5] w-full overflow-hidden bg-black"
        onMouseEnter={() => {
          const el = videoRef.current;
          if (!el) return;
          el.muted = true;
          void el.play().catch(() => {});
        }}
        onMouseLeave={() => {
          const el = videoRef.current;
          if (!el) return;
          el.pause();
          el.currentTime = 0;
        }}
      >
        <video ref={videoRef} src={post.mediaUrl} className="h-full w-full object-cover" muted playsInline loop preload="metadata" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 opacity-100 transition-opacity duration-300 group-hover:opacity-0">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#00f2ff]/40 bg-black/60 text-[#00f2ff] shadow-[0_0_24px_rgba(0,242,255,0.25)]">
            <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

export default function SanctuaryTestimonyWall({ posts, formatRelativeTime }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#00f2ff]/55">Testimony wall</p>
          <h2 className="mt-1 text-lg font-black text-white">Archive</h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-white/35">{posts.length} pieces</span>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#00f2ff]/30 bg-[#00f2ff]/[0.04] p-8 text-center">
          <p className="text-sm text-white/55">No posts yet. Your Testify uploads appear here as a cinematic grid.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {posts.map((post) => {
            const impact = post.id % 4 === 0;
            return (
              <article
                key={post.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-[0_0_40px_rgba(0,0,0,0.45)]"
              >
                {impact && (
                  <div className="absolute right-2 top-2 z-20 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-black/75 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-200">
                    <ShieldCheck className="h-3 w-3" />
                    Impact verified
                  </div>
                )}
                <div className="group relative">
                  <MediaThumb post={post} />
                </div>
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 text-[11px] leading-snug text-white/80">{post.text}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold uppercase tracking-wide text-white/35">
                    <span>{formatRelativeTime(post.createdAt)}</span>
                    <span className="text-[#00f2ff]/70">{post.tag}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-white/50">
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5">🙏 {post.stats.amens} amens</span>
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5">✨ {post.stats.praiseBreaks} praise reports</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
