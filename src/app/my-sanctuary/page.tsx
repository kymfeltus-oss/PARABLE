'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { ParableSparkleSystem } from '@/components/effects/ParableSparkleSystem';

export default function MySanctuaryPage() {
  const router = useRouter();
  const { userProfile, avatarUrl, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#010101]" />;

  return (
    <main className="min-h-screen bg-[#010101] text-white relative">
      
      {/* 1. SPARKLES */}
      <ParableSparkleSystem />

      <div className="relative z-10 pb-40">
        <Header title="MY SANCTUARY" />

        {/* HUD CARDS */}
        <section className="max-w-7xl mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'TOTAL_REVENUE', value: '$24,580.00', route: '/wallet' },
            { label: 'GLOBAL_RANK', value: 'TOP 12', route: '/leaderboard' },
            { label: 'MULTIPLIER', value: '2.5X', route: '/perks' },
            { label: 'SYNC_STATUS', value: 'ONLINE', route: '/settings' }
          ].map((stat, i) => (
            <div key={i} className="flip-card h-36 cursor-pointer group" onClick={() => router.push(stat.route)}>
              <div className="relative w-full h-full flip-card-inner">
                <div className="flip-card-front border-2 border-[#00f2ff]/20 bg-black/90 flex flex-col justify-center px-8 backdrop-blur-xl rounded-[2rem]">
                  <p className="parable-sublabel text-[8px] mb-2">{stat.label}</p>
                  <p className="parable-header text-3xl text-white">{stat.value}</p>
                </div>
                <div className="flip-card-back bg-[#00f2ff] flex flex-col justify-center items-center rounded-[2rem] shadow-[0_0_30px_#00f2ff]">
                  <p className="text-[#010101] font-black italic uppercase text-xl">VIEW_INTEL</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* FEED CONTENT */}
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <aside className="lg:col-span-3">
            <div className="border border-[#00f2ff]/30 bg-black/60 rounded-[3.5rem] p-10 text-center backdrop-blur-2xl">
              <div className="relative w-44 h-44 mx-auto mb-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#00f2ff] animate-ping opacity-10"></div>
                <img src={avatarUrl || '/logo.svg'} className="w-40 h-40 rounded-full border-2 border-[#00f2ff]/50 object-cover bg-black" alt="CEO" />
              </div>
              <h2 className="parable-header text-2xl">{userProfile?.username || "KYM THE CEO"}</h2>
            </div>
          </aside>

          <section className="lg:col-span-9 space-y-12">
            <div className="flex items-center justify-between border-b border-[#00f2ff]/20 pb-8">
              <div className="flex gap-10">
                <button onClick={() => router.push('/my-sanctuary')} className="text-[#00f2ff] text-2xl font-black italic uppercase tracking-[-0.08em] border-b-4 border-[#00f2ff] pb-2">
                  TIMELINE
                </button>
                <button onClick={() => router.push('/replays')} className="text-white/30 text-2xl font-black italic uppercase tracking-[-0.08em] hover:text-[#00f2ff] transition-all">
                  REPLAYS
                </button>
              </div>
              <button onClick={() => router.push('/testify')} className="bg-[#00f2ff] text-[#010101] px-14 py-4 rounded-full font-black italic uppercase tracking-tighter shadow-[0_0_30px_#00f2ff]/50 hover:scale-105 active:scale-95 transition-all">
                TESTIFY +
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] border border-[#00f2ff]/10 bg-zinc-900/40 rounded-[3rem] flex items-center justify-center group hover:border-[#00f2ff]/40 transition-all cursor-pointer">
                   <span className="text-[10px] uppercase tracking-[12px] text-white/5 group-hover:text-[#00f2ff]/40 transition-all">DATA_STREAM</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}