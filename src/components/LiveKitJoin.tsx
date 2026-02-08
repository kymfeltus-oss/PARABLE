'use client'; // This must be a client component

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LiveKitJoin() {
  const [token, setToken] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleJoin = async () => {
    // 1. Get the JWT from your Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert("Please log in first!");
      return;
    }

    try {
      // 2. Call your fixed API route
      const resp = await fetch("/api/livekit/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ room: "parable-live" }),
      });

      if (!resp.ok) throw new Error("Failed to get token");

      const data = await resp.json();
      console.log("Token received:", data.token);
      setToken(data.token);
      
      // Now you can pass this token to <LiveKitRoom />
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleJoin} className="p-4 bg-blue-600 text-white rounded">
      {token ? "Token Ready!" : "Get LiveKit Token"}
    </button>
  );
}
