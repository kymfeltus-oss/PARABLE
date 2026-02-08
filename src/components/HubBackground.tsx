"use client";

import { useEffect, useState } from "react";

export default function HubBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-[#050505]" />;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505]">
      {/* Static Cyan Glows - No infinite loops */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00f2ff]/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grid Overlay with Radial Mask 
          The 'maskImage' ensures the techy grid fades out toward the edges.
      */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: `linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
        }} 
      />
    </div>
  );
}