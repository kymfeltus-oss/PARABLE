'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useAuth = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  // Default to your logo SVG to prevent the "Invalid URL" crash
  const [avatarUrl, setAvatarUrl] = useState<string>('/logo.svg'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setUserProfile(data);
          
          // If they have a pic, get the full Public URL from Supabase storage
          if (data.avatar_url) {
            const { data: urlData } = supabase.storage
              .from('avatars') 
              .getPublicUrl(data.avatar_url);
            
            // Set the full URL (e.g., https://xyz.supabase.co...)
            setAvatarUrl(urlData.publicUrl);
          }
        }
      }
      setLoading(false);
    };
    getUser();
  }, []);

  return { userProfile, avatarUrl, loading };
};
