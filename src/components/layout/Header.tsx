'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const Header = ({ title }: { title?: string }) => {
  const router = useRouter();
  const { userProfile, avatarUrl } = useAuth();

  return (
    <header className="flex items-center justify-between px-10 py-12 bg-[#010101] border-b border-[#00f2ff]/20 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <button onClick={() => router.push('/')} className="w-10 h-10 border border-[#00f2ff]/40 rounded-full flex items-center justify-center text-[#00f2ff] font-black active:scale-90 transition-all">✕</button>
        <h1 className="text-[#00f2ff] text-2xl font-black italic uppercase tracking-[-0.08em]">{title || "MY SANCTUARY"}</h1>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 group cursor-pointer" onClick={() => router.push('/')}>
        {/* B. Radiant Spark Bursts (Spec logic applied near logo) */}
        <div className="absolute -inset-12 bg-[#00f2ff] rounded-full blur-3xl opacity-10 animate-pulse" />
        <Image src="/logo.svg" alt="PARABLE" width={220} height={220} priority style={{ width: '220px', height: 'auto' }} className="relative drop-shadow-[0_0_115px_#00f2ff]" />
      </div>

      <div className="flex items-center gap-5 cursor-pointer" onClick={() => router.push('/my-sanctuary')}>
        <div className="text-right">
          <p className="text-[#00f2ff] text-lg font-black italic uppercase tracking-[-0.08em]">{userProfile?.username || "KYM THE CEO"}</p>
          <p className="text-[10px] tracking-[10px] text-white/40 uppercase mt-1 mr-[-10px]">ONLINE</p>
        </div>
        <div className="w-14 h-14 rounded-full border-2 border-[#00f2ff] p-1 bg-black"><img src={avatarUrl || '/logo.svg'} className="w-full h-full rounded-full object-cover" alt="CEO" /></div>
      </div>
    </header>
  );
};
