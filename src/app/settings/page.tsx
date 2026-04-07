'use client';

import Link from 'next/link';
import { ArrowLeft, Bell, LogOut, User, Video } from 'lucide-react';
import Header from '@/components/Header';
import HubBackground from '@/components/HubBackground';

export default function SettingsPage() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HubBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black" />
      </div>
      <Header />
      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-16 pt-parable-header">
        <Link
          href="/streamers"
          className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-[#00f2ff] mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Streamers hub
        </Link>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-2 text-sm text-white/50">Account and stream preferences.</p>
        <ul className="mt-8 space-y-2">
          <li>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 hover:border-[#00f2ff]/35 transition-colors"
            >
              <User className="text-[#00f2ff]" size={18} />
              <span className="text-sm font-medium">Profile &amp; bio</span>
            </Link>
          </li>
          <li>
            <Link
              href="/live-studio"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 hover:border-[#00f2ff]/35 transition-colors"
            >
              <Video className="text-[#00f2ff]" size={18} />
              <span className="text-sm font-medium">Live Studio</span>
            </Link>
          </li>
          <li>
            <span className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white/40">
              <Bell size={18} />
              <span className="text-sm">Notifications (coming soon)</span>
            </span>
          </li>
          <li>
            <Link
              href="/logout"
              className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 hover:border-red-500/40 transition-colors text-red-200"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Log out</span>
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
