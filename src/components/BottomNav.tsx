"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Radio, 
  LayoutGrid, 
  MessageSquare, 
  Gamepad2, 
  User 
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // Updated order: Home, Streamers, My Sanctuary, Testify, Gamers, Profile
  const NAV_ITEMS = [
    { label: "Home", href: "/", icon: Home },
    { label: "Streamers", href: "/streamers", icon: Radio },
    { label: "My Sanctuary", href: "/my-sanctuary", icon: LayoutGrid },
    { label: "Testify", href: "/testify", icon: MessageSquare },
    { label: "Gamers", href: "/gamers", icon: Gamepad2 },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-fit">
      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative px-4 py-2 group">
              <div className="flex flex-col items-center gap-1">
                <Icon 
                  size={18} 
                  className={`transition-all duration-300 ${
                    isActive 
                      ? "text-[#00f2ff] drop-shadow-[0_0_8px_#00f2ff]" 
                      : "text-gray-500 group-hover:text-white"
                  }`} 
                />
                <span className={`text-[7px] font-black uppercase tracking-[1px] transition-all duration-300 ${
                  isActive ? "text-[#00f2ff]" : "text-gray-500 group-hover:text-white"
                }`}>
                  {item.label}
                </span>
              </div>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00f2ff] rounded-full shadow-[0_0_10px_#00f2ff]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}