"use client";

export default function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
      {/* Stars (visible) */}
      <div
        className="absolute inset-[-40%] opacity-[0.55] mix-blend-screen"
        style={{
          backgroundSize: "520px 520px",
          backgroundImage: `
            radial-gradient(1px 1px at 30px 40px, rgba(255,255,255,0.95), transparent 60%),
            radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.70), transparent 60%),
            radial-gradient(1px 1px at 260px 260px, rgba(255,255,255,0.85), transparent 60%),
            radial-gradient(1px 1px at 420px 80px, rgba(255,255,255,0.65), transparent 60%),
            radial-gradient(1px 1px at 480px 420px, rgba(0,242,255,0.55), transparent 60%)
          `,
          animation: "sparkleDrift 40s linear infinite",
          filter: "drop-shadow(0 0 10px rgba(0,242,255,0.10))",
        }}
      />

      {/* Secondary tiny dust */}
      <div
        className="absolute inset-[-40%] opacity-[0.22] mix-blend-screen"
        style={{
          backgroundSize: "760px 760px",
          backgroundImage: `
            radial-gradient(1px 1px at 120px 220px, rgba(255,255,255,0.55), transparent 60%),
            radial-gradient(1px 1px at 520px 160px, rgba(255,255,255,0.45), transparent 60%),
            radial-gradient(1px 1px at 360px 620px, rgba(0,242,255,0.40), transparent 60%)
          `,
          animation: "sparkleDrift 62s linear infinite reverse",
        }}
      />

      {/* Soft moving haze (adds fluidity) */}
      <div
        className="absolute inset-[-30%] opacity-[0.18] mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(0,242,255,0.22), transparent 55%), radial-gradient(circle at 70% 65%, rgba(255,255,255,0.10), transparent 60%)",
          filter: "blur(55px)",
          animation: "hazeFloat 18s ease-in-out infinite",
        }}
      />

      <style jsx global>{`
        @keyframes sparkleDrift {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(0, -220px, 0); }
        }
        @keyframes hazeFloat {
          0%,100% { transform: translate3d(-1%, 0, 0) rotate(0deg); }
          50% { transform: translate3d(2%, -2%, 0) rotate(6deg); }
        }
      `}</style>
    </div>
  );
}
