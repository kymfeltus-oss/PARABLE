'use client';

import React from 'react';
import { Heart } from 'lucide-react';

const PostCard = () => {
  return (
    <div className="border border-[#00f2ff]/15 bg-black/60 rounded-[2rem] p-6 backdrop-blur-xl">
      <p className="text-white/80">Sample Post</p>

      <div className="mt-4 flex items-center gap-2 text-white/60 hover:text-[#00f2ff] transition-colors cursor-pointer">
        <Heart className="w-4 h-4" />
        <span className="text-xs">Like</span>
      </div>
    </div>
  );
};

export default PostCard;