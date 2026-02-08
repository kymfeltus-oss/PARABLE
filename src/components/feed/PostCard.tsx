"use client";

import { useState } from "react";
import { Heart, MessageSquare, Share2, Bookmark } from "lucide-react";

interface PostCardProps {
  id: string;
  content: string;
  media_url?: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
}

export default function PostCard({
  id,
  content,
  media_url,
  author,
  created_at,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Call supabase to toggle like in post_likes table
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // TODO: Call supabase to toggle bookmark in bookmarks table
  };

  const handleComment = () => {
    // TODO: Open comment modal or expand comment section
  };

  const handleShare = () => {
    // TODO: Show share modal or copy link
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm hover:bg-white/10 transition">
      <div className="flex items-center gap-3 mb-3">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover border border-[#00f2ff]/20"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-700" />
        )}
        <div>
          <p className="font-semibold text-white">{author.name}</p>
          <p className="text-xs text-gray-400">
            {new Date(created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <p className="text-gray-200 mb-4">{content}</p>

      {media_url && (
        media_url.endsWith(".mp4") || media_url.endsWith(".webm") ? (
          <video
            controls
            className="rounded-lg mb-4 max-h-96 w-full object-cover"
          >
            <source src={media_url} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={media_url}
            alt="Post media"
            className="rounded-lg mb-4 max-h-96 w-full object-cover"
          />
        )
      )}

      <div className="flex items-center gap-6 text-gray-400">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 hover:text-red-400 transition"
        >
          <Heart
            className={`w-5 h-5 ${
              liked ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>

        <button
          onClick={handleComment}
          className="flex items-center gap-1 hover:text-blue-400 transition"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 hover:text-green-400 transition"
        >
          <Share2 className="w-5 h-5" />
        </button>

        <button
          onClick={handleBookmark}
          className="flex items-center gap-1 hover:text-yellow-400 transition ml-auto"
        >
          <Bookmark
            className={`w-5 h-5 ${
              bookmarked ? "fill-yellow-500 text-yellow-500" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}