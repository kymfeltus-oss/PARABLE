"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

type ProfileLite = {
  full_name: string | null;
  avatar_url: string | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  profile_id: string;
  content: string;
  created_at: string;
  profiles?: ProfileLite | ProfileLite[] | null;
};

type PostRow = {
  id: string;
  profile_id: string;
  content: string | null;
  media_url: string | null;
  media_type: "image" | "video" | null;
  is_praise_break: boolean | null;
  created_at: string;
  profiles?: ProfileLite | ProfileLite[] | null;
};

function fmtTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month: "short", day: "numeric" });
}

export default function TestifyPostPage() {
  const supabase = createClient();
  const params = useParams();
  const postId = String((params as any)?.postId ?? "");

  const [post, setPost] = useState<PostRow | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const prof = useMemo(() => {
    if (!post) return null;
    const p = post.profiles as any;
    return Array.isArray(p) ? p[0] : p;
  }, [post]);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const { data: p, error: pErr } = await supabase
        .from("posts")
        .select("id, profile_id, content, media_url, media_type, is_praise_break, created_at, profiles(full_name, avatar_url)")
        .eq("id", postId)
        .single();

      if (pErr) throw pErr;
      setPost(p as any);

      const { data: c, error: cErr } = await supabase
        .from("comments")
        .select("id, post_id, profile_id, content, created_at, profiles(full_name, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (cErr) throw cErr;
      setComments((c ?? []) as any);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load post.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!postId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function addComment() {
    setErr(null);
    if (!content.trim()) return;

    setSending(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {
        setErr("Please log in to comment.");
        return;
      }

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        profile_id: u.user.id,
        content: content.trim(),
      });

      if (error) throw error;

      setContent("");
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to comment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-[-30%] opacity-[0.18] blur-[90px] animate-[ocean_16s_ease-in-out_infinite] bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,254,0.35),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(circle_at_40%_80%,rgba(0,242,254,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.10] [background:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:84px_84px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.74)_58%,rgba(0,0,0,0.96)_100%)]" />
      </div>

      <div className="mx-auto max-w-[900px] px-4 pb-24 pt-8">
        <div className="text-[11px] font-black uppercase tracking-[4px] text-white/60">
          Testify
        </div>

        <div className="mt-5 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_0_110px_rgba(0,242,254,0.08)]">
          <div className="p-6 sm:p-7">
            {loading ? (
              <div className="text-white/60 text-sm">Loading…</div>
            ) : post ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-black/45 relative">
                    {prof?.avatar_url ? (
                      <Image src={prof.avatar_url} alt={prof.full_name ?? "Profile"} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-white/45 text-xs font-black">
                        PP
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[12px] font-black tracking-tight text-white/90">
                      {prof?.full_name ?? "Creator"}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[3px] text-white/45">
                      {fmtTime(post.created_at)}
                    </div>
                  </div>
                  {post.is_praise_break ? (
                    <div className="ml-auto rounded-full border border-[#00f2fe]/25 bg-[#00f2fe]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[3px] text-[#00f2fe]">
                      Praise Break
                    </div>
                  ) : null}
                </div>

                {post.content ? (
                  <div className="mt-4 text-[14px] leading-relaxed text-white/80 whitespace-pre-wrap">
                    {post.content}
                  </div>
                ) : null}

                {post.media_url ? (
                  <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-black/60">
                    {post.media_type === "video" ? (
                      <video src={post.media_url} controls className="w-full max-h-[520px] object-contain bg-black" />
                    ) : (
                      <img src={post.media_url} alt="Post media" className="w-full max-h-[520px] object-cover" />
                    )}
                  </div>
                ) : null}

                <div className="mt-8">
                  <div className="text-[11px] font-black uppercase tracking-[4px] text-white/60">
                    Comments
                  </div>

                  <div className="mt-4 space-y-3">
                    {comments.map((c) => {
                      const cp = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
                      return (
                        <div
                          key={c.id}
                          className="rounded-[26px] border border-white/10 bg-black/55 px-5 py-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 overflow-hidden rounded-2xl border border-white/10 bg-black/45 relative">
                              {cp?.avatar_url ? (
                                <Image src={cp.avatar_url} alt={cp.full_name ?? "Profile"} fill className="object-cover" />
                              ) : (
                                <div className="absolute inset-0 grid place-items-center text-white/45 text-[10px] font-black">
                                  PP
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-[11px] font-black text-white/90">
                                {cp?.full_name ?? "Member"}
                              </div>
                              <div className="text-[10px] font-black uppercase tracking-[3px] text-white/45">
                                {fmtTime(c.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap">
                            {c.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-[28px] border border-white/10 bg-black/70 p-5">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write a comment…"
                      className="min-h-[90px] w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-white/25"
                    />
                    <div className="mt-4 flex items-center justify-end">
                      <motion.button
                        onClick={addComment}
                        disabled={sending}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        transition={{ type: "spring", stiffness: 320, damping: 22 }}
                        className="group relative overflow-hidden rounded-[26px] bg-[#00f2fe] px-6 py-3 font-black text-black disabled:opacity-60"
                      >
                        <span className="relative z-10">{sending ? "Sending…" : "Send"}</span>
                        <span className="pointer-events-none absolute -left-48 top-0 h-full w-80 rotate-12 bg-gradient-to-r from-transparent via-white/65 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {err && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mt-4 rounded-[20px] border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
                        >
                          {err}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-white/60 text-sm">Post not found.</div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ocean {
          0%,
          100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(2%, -2%, 0) rotate(6deg); }
        }
      `}</style>
    </div>
  );
}
