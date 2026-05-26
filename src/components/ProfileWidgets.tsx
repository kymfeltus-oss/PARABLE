"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Flame, Star, Coffee, Users } from "lucide-react";

type ProfileLite = {
  status_text?: string | null;
} | null;

function ParableWidgetFrame({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/45 shadow-[0_0_40px_rgba(0,242,255,0.06)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(0,242,255,0.12),transparent_55%)]" />
      <div className="relative border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-[#00f2ff]/85">{title}</h3>
      </div>
      <div className="relative p-4">{children}</div>
    </div>
  );
}

const Badge = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <div className="group relative flex items-center gap-1.5 rounded-lg border border-[#00f2ff]/20 bg-[#00f2ff]/[0.06] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/90 transition hover:border-[#00f2ff]/45 hover:bg-[#00f2ff]/10">
    {icon}
    <span>{label}</span>
    <span className="pointer-events-none absolute -top-8 left-0 z-10 hidden whitespace-nowrap rounded-md border border-white/10 bg-black/95 px-2 py-1 text-[9px] font-semibold normal-case tracking-normal text-white shadow-lg group-hover:block">
      {label}
    </span>
  </div>
);

const GroupItem = ({ name, members, href }: { name: string; members: string; href: string }) => (
  <li>
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-transparent p-2.5 transition hover:border-[#00f2ff]/25 hover:bg-[#00f2ff]/[0.04]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#00f2ff]/30 to-fuchsia-600/25 text-xs font-black text-white shadow-[0_0_20px_rgba(0,242,255,0.15)]">
          {name[0]}
        </div>
        <span className="truncate text-sm font-semibold text-white">{name}</span>
      </div>
      <span className="shrink-0 text-[10px] font-mono text-[#00f2ff]/70">{members}</span>
    </Link>
  </li>
);

const ProfileWidgets = ({ profile }: { profile: ProfileLite }) => {
  return (
    <div className="flex w-full flex-col gap-4 md:w-80">
      <ParableWidgetFrame title="Presence">
        <p className="text-sm leading-relaxed text-white/65">
          {profile?.status_text || "No status set yet — add one in Settings to show your heart for the community."}
        </p>
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Member since</p>
          <p className="mt-1.5 text-sm font-semibold text-white/90">Sanctuary era · 2026</p>
        </div>
      </ParableWidgetFrame>

      <ParableWidgetFrame title="Kingdom badges">
        <div className="flex flex-wrap gap-2">
          <Badge icon={<ShieldCheck className="h-4 w-4 text-[#00f2ff]" />} label="Founder" />
          <Badge icon={<Flame className="h-4 w-4 text-orange-400" />} label="Top streamer" />
          <Badge icon={<Star className="h-4 w-4 text-amber-300" />} label="MVP" />
          <Badge icon={<Coffee className="h-4 w-4 text-amber-700/90" />} label="Supporter" />
        </div>
      </ParableWidgetFrame>

      <ParableWidgetFrame title="Circles">
        <div className="mb-2 flex items-center gap-2 text-[10px] text-white/40">
          <Users className="h-3.5 w-3.5 text-[#00f2ff]/70" aria-hidden />
          Tap to visit a hub
        </div>
        <ul className="space-y-1">
          <GroupItem name="The Sanctuary" members="1.2k" href="/sanctuary" />
          <GroupItem name="Writers Hub" members="842" href="/writers-hub" />
        </ul>
      </ParableWidgetFrame>
    </div>
  );
};

export default ProfileWidgets;
