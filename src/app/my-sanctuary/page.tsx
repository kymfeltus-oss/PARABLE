// Import necessary dependencies
import React, { useEffect, useState } from 'react';

const PAGE_SIZE = 10; // Number of items per page

const MySanctuaryPage = () => {
    const [items, setItems] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchItems = async (cursor) => {
        setLoading(true);
        const response = await fetch(`/api/items?cursor=${cursor}&limit=${PAGE_SIZE}`);
        const data = await response.json();
        setItems(prevItems => [...prevItems, ...data.items]);
        setCursor(data.nextCursor);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems(cursor);
    }, [cursor]);

    const handleLoadMore = () => {
        fetchItems(cursor);
    };

    return (
        <div>
            <h1>My Sanctuary</h1>
            <ul>
                {items.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
            {loading && <p>Loading...</p>}
            {cursor && !loading && <button onClick={handleLoadMore}>Load More</button>}
        </div>
    );
};

export default MySanctuaryPage;