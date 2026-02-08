"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Church, Radio, Activity, Settings, ChevronRight } from "lucide-react";
import SparkleOverlay from "@/components/SparkleOverlay";
import { PROFILE_STYLE } from "@/lib/constants";

export default function MySanctuaryDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#010101] text-white p-6 md:p-12 relative overflow-hidden font-sans">
      {/* 1. ATMOSPHERE */}
      <SparkleOverlay />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      {/* 2. HUD HEADER */}
      <header className="relative z-20 flex justify-between items-center mb-16">
        <div className="flex flex-col">
          <span className="text-[8px] font-mono tracking-[4px] text-[#00f2ff] uppercase mb-2">Location // Inner_Court</span>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-[-2px] text-[#00f2ff]">My Sanctuary</h1>
        </div>
        <button className="p-3 bg-white/5 rounded-full hover:bg-[#00f2ff]/20 transition-all border border-white/5">
          <Settings className="w-5 h-5 text-[#00f2ff]" />
        </button>
      </header>

      {/* 3. PRIMARY PORTAL ACTION */}
      <section className="relative z-20 mb-12">
        <div className="group relative max-w-md">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00f2ff] to-[#8b5cf6] rounded-sm blur opacity-20 group-hover:opacity-50 transition duration-1000" />
          <button 
            onClick={() => router.push("/sanctuary/me")}
            className="relative w-full py-8 bg-black border border-[#00f2ff]/30 flex items-center justify-between px-8 hover:border-[#00f2ff] transition-all overflow-hidden"
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-[#00f2ff]/10 rounded-full border border-[#00f2ff]/20">
                <Church className="w-7 h-7 text-[#00f2ff]" />
              </div>
              <div className="text-left">
                <span className="block text-[9px] font-black uppercase tracking-[4px] text-white/40 mb-1">Enter_Portal</span>
                <span className="text-2xl font-black italic uppercase tracking-[1px]">Access Sanctuary</span>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-[#00f2ff] group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* 4. TELEMETRY / STATS GRID */}
      <section className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-sm flex items-center justify-between hover:border-[#00f2ff]/30 transition-all">
          <div>
            <p className="text-[9px] uppercase tracking-[2px] text-white/30 mb-1">Live_Status</p>
            <p className="text-xl font-bold uppercase tracking-[1px]">Sanctuary_Active</p>
          </div>
          <Activity className="text-[#00f2ff] w-5 h-5 animate-pulse" />
        </div>

        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-sm flex items-center justify-between hover:border-emerald-500/30 transition-all">
          <div>
            <p className="text-[9px] uppercase tracking-[2px] text-white/30 mb-1">Broadcasting</p>
            <p className="text-xl font-bold uppercase tracking-[1px]">Start_Stream</p>
          </div>
          <Radio className="text-emerald-400 w-5 h-5" />
        </div>
      </section>

      {/* 5. FOOTER DECOR */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <p className="text-[8px] font-black tracking-[4px] text-gray-600 uppercase">Legacy Protocol V.1</p>
        <div className="w-12 h-[1px] bg-[#00f2ff]/30 mt-2" />
      </div>
    </div>
  );
}