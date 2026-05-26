/**
 * PARABLE BRAND CONSTANTS
 * Separation of Concerns: Look & Presentation Layer
 */

// 1. Core Design System
export const PARABLE_THEME = {
  colors: {
    cyan: "#00f2ff",
    sanctuaryBlack: "#010101",
    violet: "#8b5cf6",
    glass: "rgba(255, 255, 255, 0.03)",
  }
};

// 2. Flash Page Styles (The Root Entrance)
export const FLASH_STYLE = {
  vortexBg: "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.08)_0%,transparent_70%)]",
  orbitalRing: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#00f2ff]/10 rounded-full border-dashed",
  statusLabel: "text-[8px] tracking-[3px] font-black uppercase",
  vortexButton: "relative w-72 py-6 bg-black border border-[#00f2ff]/30 text-white transition-all flex flex-col items-center justify-center gap-2 hover:border-[#00f2ff] overflow-hidden",
  tagline: "text-[#00f2ff] font-black italic tracking-[10px] text-[10px] uppercase opacity-40",
  cornerDecor: "text-[8px] font-black tracking-[4px] text-gray-600 uppercase"
};

// 3. Flash Animation Logic
export const FLASH_ANIMATIONS = {
  hud: {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: "easeOut" } }
  },
  logoThrob: {
    filter: [
      "drop-shadow(0 0 20px rgba(0,242,255,0.3))",
      "drop-shadow(0 0 50px rgba(0,242,255,0.6))",
      "drop-shadow(0 0 20px rgba(0,242,255,0.3))"
    ]
  },
  scannerLine: {
    animate: { y: [-40, 100] },
    transition: { duration: 2, repeat: Infinity, ease: "linear" }
  },
  orbitalRotate: {
    animate: { rotate: 360 },
    transition: { duration: 60, repeat: Infinity, ease: "linear" }
  }
};

// 4. Welcome Page Styles (The Command Center)
export const WELCOME_STYLE = {
  header: "relative z-20 flex justify-between items-start",
  statusBadge: "bg-[#00f2ff] text-black text-[8px] px-3 py-1 font-black uppercase tracking-[3px]",
  card: "group relative p-10 bg-white/[0.02] border-l-4 transition-all text-left overflow-hidden",
  cardTitle: "text-2xl font-black italic tracking-[2px] uppercase leading-none",
  cardSub: "text-[9px] text-white/30 tracking-[3px] uppercase mt-3",
  footerHud: "relative z-20 flex justify-between items-end border-t border-white/5 pt-8"
};

export const WELCOME_ANIMATIONS = {
  logFade: {
    initial: { opacity: 0, x: -10 },
    animate: (i: number) => ({ opacity: 1 - (i * 0.2), x: 0 }),
  }
};

// 5. Influencer Profile Styles (My Sanctuary - TD Jakes)
export const PROFILE_STYLE = {
  container: "min-h-screen bg-[#0a0a0a] text-white pb-20",
  bannerWrapper: "relative h-80 w-full overflow-hidden",
  avatar: "rounded-full border-4 border-[#0a0a0a] shadow-2xl object-cover -mt-20 relative z-10",
  bodyGrid: "max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10",
  supportCard: "bg-gradient-to-br from-violet-900/40 to-black p-6 rounded-2xl border border-violet-600/30",
  supportButton: "w-full py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
};

// 6. Data Assets
export const PREACHERS = [
  { 
    id: "td-jakes", 
    name: "Bishop T.D. Jakes", 
    role: "Pastor • Author • Influencer",
    avatar: "/td_avatar.png",
    banner: "/td_banner.png"
  }
]; 

export const ARTISTS = [];