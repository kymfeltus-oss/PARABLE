"use client";

import { useState } from "react";
import { Heart, MessageSquare, Share2, Bookmark } from "lucide-react";

interface Author {
  id: string;
  name: string;
  avatar_url?: string;
}

interface PostCardProps {
  id: string;
  content: string;
  media_url?: string;
  author: Author;
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

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm hover:bg-white/10 transition">
      {/* Header with author info */}
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

      {/* Content */}
      <p className="text-gray-200 mb-4">{content}</p>

      {/* Media (Image or Video) */}
      {media_url && (
        <div className="mb-4 rounded-lg overflow-hidden">
          {media_url.endsWith(".mp4") || media_url.includes("video") ? (
            <video
              controls
              className="w-full max-h-96 object-cover bg-black"
            >
              <source src={media_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={media_url}
              alt="Post media"
              className="w-full max-h-96 object-cover"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-400 pt-2 border-t border-white/5">
        <button
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-2 hover:text-red-400 transition group"
        >
          <Heart
            className={`w-5 h-5 ${
              liked ? "fill-red-500 text-red-500" : "group-hover:text-red-400"
            }`}
          />
          <span className="text-xs">{liked ? "Liked" : "Like"}</span>
        </button>

        <button className="flex items-center gap-2 hover:text-blue-400 transition group">
          <MessageSquare className="w-5 h-5 group-hover:text-blue-400" />
          <span className="text-xs">Comment</span>
        </button>

        <button className="flex items-center gap-2 hover:text-green-400 transition group">
          <Share2 className="w-5 h-5 group-hover:text-green-400" />
          <span className="text-xs">Share</span>
        </button>

        <button
          onClick={() => setBookmarked(!bookmarked)}
          className="flex items-center gap-2 hover:text-yellow-400 transition group ml-auto"
        >
          <Bookmark
            className={`w-5 h-5 ${
              bookmarked
                ? "fill-yellow-500 text-yellow-500"
                : "group-hover:text-yellow-400"
            }`}
          />
          <span className="text-xs">{bookmarked ? "Saved" : "Save"}</span>
        </button>
      </div>
    </div>
  );
}