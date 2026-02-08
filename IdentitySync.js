import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; 

const IdentitySync = () => {
  const [user, setUser] = useState({
    username: "",
    profilePic: null,
    loading: true
  });

  useEffect(() => {
    fetchIdentity();
  }, []);

  const fetchIdentity = async () => {
    try {
      // 1. Get the authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (authUser) {
        // 2. Query 'profiles' table for 'username' and 'avatar_url'
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', authUser.id)
          .single();

        // 3. Mapping Logic: Prioritize the 'username' column ("kym the ceo")
        const activeUsername = profile?.username || authUser.user_metadata?.username || "Authorized User";

        // 4. Image Logic: Resolve Supabase URL and bypass local 'kirk' file errors
        let finalPicUrl = null;
        const avatarPath = profile?.avatar_url || authUser.user_metadata?.avatar_url;

        if (avatarPath) {
          if (avatarPath.includes('kirk')) {
            finalPicUrl = null; // Protection against the localhost error
          } else if (avatarPath.startsWith('http')) {
            finalPicUrl = avatarPath;
          } else {
            const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
            finalPicUrl = `${data.publicUrl}?t=${Date.now()}`;
          }
        }

        setUser({
          username: activeUsername,
          profilePic: finalPicUrl,
          loading: false
        });
      }
    } catch (err) {
      console.error("Identity Sync Error:", err.message);
      setUser(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#00f2ff', letterSpacing: '8px', fontSize: '2.5rem', margin: '0', fontWeight: '900' }}>IDENTITY_SYNC</h1>
        <p style={{ color: '#444', fontSize: '0.7rem', letterSpacing: '4px', marginTop: '10px', fontWeight: 'bold' }}>ACCESSING SANCTUARY PROTOCOL</p>
      </div>

      {/* Profile Image Zone */}
      <div style={{ position: 'relative', width: '180px', height: '180px', border: '2px solid #00f2ff', borderRadius: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', overflow: 'hidden', background: '#050505', boxShadow: '0 0 20px rgba(0, 242, 255, 0.2)' }}>
        {user.loading ? (
            <div style={{ color: '#00f2ff', fontSize: '10px', letterSpacing: '2px' }}>SYNCING...</div>
        ) : user.profilePic ? (
          <img 
            src={user.profilePic} 
            alt="Profile" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ fontSize: '50px', color: '#00f2ff', opacity: '0.3' }}>👤</div>
        )}
      </div>

      {/* Username Display Only */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#555', fontSize: '0.6rem', letterSpacing: '3px', marginBottom: '8px', fontWeight: 'black' }}>VERIFIED_ID</p>
        <h2 style={{ color: '#00f2ff', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '2px', margin: '0', textTransform: 'lowercase' }}>
          {user.loading ? "..." : user.username}
        </h2>
      </div>

      <div style={{ marginTop: '50px', opacity: '0.2', width: '200px', height: '1px', background: 'linear-gradient(to right, transparent, #00f2ff, transparent)' }}></div>
    </div>
  );
};

export default IdentitySync;