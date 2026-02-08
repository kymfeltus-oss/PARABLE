import React, { useState } from 'react';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import 'tailwindcss/tailwind.css';

const PostCard = () => {
    const [liked, setLiked] = useState(false);

    const handleLike = () => {
        setLiked(prevLiked => !prevLiked);
    };

    return (
        <div className="bg-black text-cyan-500 rounded-lg shadow-lg p-4 flex flex-col">
            <h2 className="text-xl font-bold mb-2">Post Title</h2>
            <p className="mb-4">This is an example of a post content that describes the main topic. </p>
            <div className="flex justify-between items-center">
                <button onClick={handleLike} className="flex items-center text-lg">
                    <Heart className={`mr-1 ${liked ? 'text-red-500' : 'text-gray-500'}`} />
                    {liked ? 'Liked' : 'Like'}
                </button>
                <button className="flex items-center text-lg">
                    <MessageSquare className="mr-1 text-gray-500" />
                    Comment
                </button>
                <button className="flex items-center text-lg">
                    <Share2 className="mr-1 text-gray-500" />
                    Share
                </button>
            </div>
        </div>
    );
};

export default PostCard;
