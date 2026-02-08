"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, BarChart3, Users, Zap, Play, Pause, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client"; 
import HubBackground from "@/components/HubBackground";
import Header from "@/components/Header";

export default function StreamerHub() {
  const supabase = createClient();
  const [isLive, setIsLive] = useState(false);
  const [userData, setUserData] = useState({
    username: "SYNCING...",
    profilePic: null,
    loading: true
  });

  useEffect(() => {
    fetchLiveIdentity();
  }, []);

  const fetchLiveIdentity = async () => {
    let fetchedName = null;
    let fetchedPic = null;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();

        fetchedName = profile?.username || authUser.user_metadata?.username;
        const rawPicPath = profile?.avatar_url || authUser.user_metadata?.avatar_url;

        if (rawPicPath && !rawPicPath.includes('kirk')) {
          if (rawPicPath.startsWith('http')) {
            fetchedPic = rawPicPath;
          } else {
            const { data } = supabase.storage.from('avatars').getPublicUrl(rawPicPath);
            fetchedPic = `${data.publicUrl}?t=${Date.now()}`;
          }
        }
      }
    } catch (err) {
      // This will now be caught by your patchConsole utility if active
      console.error("Identity Handshake Error:", err);
    } finally {
      setUserData({
        username: (fetchedName || "kym the ceo").toLowerCase(),
        profilePic: fetchedPic,
        loading: false 
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-40"><HubBackground /></div>
      <Header />
      <main className="relative z-10 pt-32 px-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 pb-20">
        <div className="col-span-12 lg:col-span-6 lg:col-start-4 flex flex-col items-center">
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full flex justify-between items-center mb-6 bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#00f2ff]/50 overflow-hidden bg-black flex items-center justify-center">
                {userData.loading ? <span className="animate-spin text-[#00f2ff]">⌛</span> : userData.profilePic ? <img src={userData.profilePic} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-[10px] text-[#00f2ff]">👤</span>}
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black italic uppercase tracking-[2px] text-white">{userData.loading ? "SYNCING..." : userData.username}</span>
                <span className="text-[8px] font-bold text-[#00f2ff] uppercase tracking-[1px]">Premium Creator • Authorized</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl flex items-center gap-2 cursor-pointer hover:border-[#00f2ff]/50 transition-all">
              <span className="text-[8px] font-black uppercase tracking-[2px] text-gray-400">Settings</span>
              <ChevronDown size={10} className="text-gray-500" />
            </div>
          </motion.div>
          <div className="relative w-full aspect-video rounded-[3rem] border border-[#00f2ff]/20 bg-black overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.1)]">
             <div className="w-full h-full flex items-center justify-center opacity-20"><Zap size={120} className="text-[#00f2ff] animate-pulse" /></div>
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
              <button onClick={() => setIsLive(!isLive)} className="bg-[#00f2ff] text-black px-12 py-4 rounded-2xl font-black uppercase tracking-[6px] text-xs">
                {isLive ? "Cease Stream" : "Initiate Manifest"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}