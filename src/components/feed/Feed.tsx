import React from 'react';
import { FeedItem } from './FeedItem';

const Feed: React.FC = () => {
    const items = [/* Feed items data */];

    return (
        <div className="feed">
            {items.map(item => (
                <FeedItem key={item.id} {...item} />
            ))}
        </div>
    );
};

export default Feed;