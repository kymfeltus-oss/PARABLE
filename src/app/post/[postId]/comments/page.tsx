"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SanctuaryCommentSheet from "@/components/sanctuary-home/SanctuaryCommentSheet";
import { getDemoHomePostById, isDemoHomePostId } from "@/lib/demo-personas";

/** Dedicated post comments view with auto-focused composer. */
export default function PostCommentsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = String((params as { postId?: string }).postId ?? "");
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(true);

  const demoPost = useMemo(() => getDemoHomePostById(postId), [postId]);
  const username = userProfile?.username?.trim() || userProfile?.full_name?.trim() || "You";

  useEffect(() => {
    setOpen(true);
  }, [postId]);

  const handleClose = () => {
    setOpen(false);
    if (isDemoHomePostId(postId) || demoPost) {
      router.push("/my-sanctuary");
      return;
    }
    router.push(`/post/${postId}`);
  };

  return (
    <div className="flex min-h-full flex-col bg-[#01040A]">
      <header className="flex items-center gap-3 border-b border-[#06111E] px-4 py-3">
        <Link href="/my-sanctuary" className="text-[#94A3B8] hover:text-[#00F2FE]" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-[#F8FAFC]">Comments</h1>
          {demoPost ? (
            <p className="truncate text-[11px] text-[#64748B]">@{demoPost.username}</p>
          ) : null}
        </div>
      </header>

      <SanctuaryCommentSheet
        open={open}
        postId={postId}
        currentUsername={username}
        currentUserAvatar={userProfile?.avatar_url ?? null}
        autoFocusInput
        onClose={handleClose}
      />
    </div>
  );
}
