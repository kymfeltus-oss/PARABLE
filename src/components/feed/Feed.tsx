import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../utils/supabaseClient'; // Adjust the import as needed

const Feed = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const loader = useRef(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts') // Replace with your table name
        .select('*')
        .order('created_at', { ascending: false })
        .range(cursor ? cursor : 0, cursor ? cursor + 9 : 9);

      if (data) {
        setItems((prevItems) => [...prevItems, ...data]);
        setCursor(data[data.length - 1]?.id); // Assuming 'id' is the cursor
      }
      if (error) {
        console.error('Error fetching items:', error);
      }
      setLoading(false);
    };
    
    fetchItems();
    
    const subscription = supabase
      .from('posts') // Replace with your table name
      .on('INSERT', (payload) => {
        setItems((prevItems) => [...prevItems, payload.new]);
      })
      .subscribe();

    return () => {
        // Cleanup subscription on unmount
        supabase.removeSubscription(subscription);
    };
  }, [cursor]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setCursor(cursor); // Trigger fetch more items
        }
      },
      { threshold: 1 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [loading]);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.content}</p>
        </div>
      ))}
      {loading && <p>Loading...</p>}
      <div ref={loader} />
    </div>
  );
};

export default Feed;