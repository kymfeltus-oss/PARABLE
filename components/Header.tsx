'use client';
import { useProfile } from '@/hooks/useProfile';
import Link from 'next/link';

export default function Header() {
  const { data: profile, isLoading } = useProfile();

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#00f2ff]/10 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* PARABLE LOGO */}
        <Link href="/" className="flex flex-col group cursor-pointer">
          <h1 className="text-xl font-black tracking-[8px] text-[#00f2ff] uppercase italic group-hover:drop-shadow-[0_0_8px_#00f2ff] transition-all">
            PARABLE
          </h1>
          <span className="text-[8px] tracking-[4px] text-white/30 font-mono uppercase">
            Neural Link Active
          </span>
        </Link>
        
        {/* USER IDENTITY */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-white tracking-widest uppercase">
              {isLoading ? 'SYNCING...' : profile?.username || 'GUEST'}
            </p>
            <p className="text-[8px] text-[#00f2ff]/50 font-mono">
              STATUS: ONLINE
            </p>
          </div>
          
          <div className="h-10 w-10 rounded-full border border-[#00f2ff] p-0.5 shadow-[0_0_10px_rgba(0,242,255,0.2)]">
            <img 
              src={profile?.avatar_url || "https://api.dicebear.com"} 
              alt="Profile" 
              className="h-full w-full rounded-full object-cover bg-gray-900" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
