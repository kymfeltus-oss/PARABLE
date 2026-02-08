"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// URL matches your actual folder structure: /streamers
const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Streamers", href: "/streamers" },
  { name: "My Sanctuary", href: "/my-sanctuary" }
];

export default function Header() {
  const pathname = usePathname();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("AUTHORIZED");

  useEffect(() => {
    getIdentity();
  }, []);

  const getIdentity = async () => {
    try {
      // Use getSession for fast client-side syncing
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;

      if (authUser) {
        // Query the 'profiles' table for the username
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', authUser.id)
          .maybeSingle();

        // Source of truth: database username, fallback to metadata
        const name = profile?.username || authUser.user_metadata?.username || "LEGEND";
        setDisplayName(name.toUpperCase());
      }
    } catch (err) {
      console.error("Header Handshake Failure:", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[150] bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO LINK */}
        <Link href="/" className="relative w-32 h-8">
          <img src="/logo.svg" alt="Parable" className="object-contain" />
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-8 text-white">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[10px] font-black uppercase tracking-[3px] transition-all ${
                pathname === link.href 
                  ? "text-[#00f2ff] drop-shadow-[0_0_8px_#00f2ff]" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* DYNAMIC USER BADGE */}
        <div className="px-4 py-1.5 border border-[#00f2ff]/30 rounded-full bg-[#00f2ff]/5 shadow-[0_0_10px_#00f2ff1a]">
          <span className="text-[9px] font-black text-[#00f2ff] tracking-[2px] uppercase">
            {displayName}
          </span>
        </div>
      </div>
    </nav>
  );
}