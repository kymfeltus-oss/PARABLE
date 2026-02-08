"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function PastorStevensonPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <Navbar />

      {/* HERO */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src="/steven-furtick-banner.jpg"
          alt="Pastor Stevenson Banner"
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]" />
      </div>

      {/* PROFILE */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10 flex items-end gap-6">
        <Image
          src="/steven-furtick.jpg"
          alt="Pastor Stevenson"
          width={150}
          height={150}
          className="rounded-full border-4 border-[#0a0a0a] shadow-2xl object-cover"
        />
        <div className="pb-4">
          <h1 className="text-4xl font-bold">Pastor Stevenson</h1>
          <p className="text-gray-300 mt-1">Prophet • Teacher • Revivalist</p>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4">About Pastor Stevenson</h2>
            <p className="text-gray-300 leading-relaxed">
              Pastor Stevenson is known for powerful prophetic ministry, insightful
              teaching, and global revival leadership.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Featured</h2>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Image
                src="/steven-furtick-banner.jpg"
                alt="Pastor Stevenson Featured"
                width={1200}
                height={600}
                className="rounded-xl object-cover"
              />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-violet-900/40 to-black p-6 rounded-2xl border border-violet-600/30">
            <h3 className="text-lg font-bold mb-2">Partner With Pastor Stevenson</h3>
            <p className="text-sm text-gray-300 mb-4">
              Support prophetic ministry, prayer movement, and global revival.
            </p>
            <button className="w-full py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition">
              Support Ministry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
