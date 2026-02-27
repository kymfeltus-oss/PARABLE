'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';

/**
 * TESTIFY PAGE - THE CONTROLLER
 * Layer: The Page
 * Purpose: Displays the modular social feed for PARABLE.
 */
export default function TestifyPage() {
  // Fixes Hydration Error by ensuring the client matches the server
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // While the server is thinking, show the "Sanctuary Black" background only
  if (!isMounted) {
    return <div className="min-h-screen bg-[#010101]" />;
  }

  return (
    <main className="min-h-screen bg-[#010101] text-white selection:bg-[#00f2ff]/30">
      {/* 1. Global Header with Logo and Profile */}
      <Header title="TESTIFY" />

      <div className="p-6 max-w-2xl mx-auto space-y-12">
        
        {/* 2. Sub-label with 10px tracking rule */}
        <section>
          <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-[10px] mb-6">
            LATEST TESTIMONIES
          </p>

          {/* 3. Feed Placeholder - Bold Italic -0.08em Tracking */}
          <div className="space-y-8">
            <div className="group border border-[#00f2ff]/10 bg-gradient-to-b from-[#00f2ff]/5 to-transparent rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] transition-all hover:border-[#00f2ff]/30">
              <h2 className="text-[#00f2ff] text-3xl font-black italic uppercase tracking-[-0.08em] opacity-40 group-hover:opacity-100 transition-opacity">
                Awaiting Connection
              </h2>
              <p className="text-[10px] text-[#00f2ff]/40 uppercase tracking-[10px] mt-4 text-center leading-loose">
                REFRESHING THE RIVER
              </p>
            </div>
          </div>
        </section>

      </div>
      
      {/* Visual Identity: Floating Action Button for "Go Live" */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#00f2ff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:scale-110 active:scale-95 transition-all z-50">
        <span className="text-[#010101] font-black italic text-xl tracking-tighter">+</span>
      </button>
    </main>
  );
}
