import React, { useEffect, useState, useRef } from "react";
import HotelSearchForm from "./HotelSearchForm";

const Slider = () => {
  const [tick, setTick] = useState(0);

  // Subtle tick for gradient animation (CSS handles the actual animation)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="sticky top-0 w-full z-0 overflow-hidden"
      style={{ height: '100vh', minHeight: 600 }}
    >
      {/* ── Animated 3D gradient background ── */}
      <div className="absolute inset-0" style={{ background: '#050a14' }}>
        {/* Animated orbs */}
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="gradient-orb orb-4" />
        {/* Noise texture overlay for depth */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }} />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: 'linear-gradient(to bottom, transparent, #050a14)' }} />
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl w-full mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 sm:mb-8" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/60" style={{ letterSpacing: '0.12em' }}>250,000+ Hotels Worldwide</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 sm:mb-6"
            style={{ letterSpacing: '-0.04em', lineHeight: 1.0 }}
          >
            Travel smarter,<br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 40%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              stay better.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-lg mx-auto mb-10 sm:mb-12 font-normal" style={{ letterSpacing: '-0.01em', lineHeight: 1.65 }}>
            Compare hotels, transfers and experiences across the globe. Best rates, guaranteed.
          </p>
        </div>

        {/* Search form */}
        <div className="max-w-5xl w-full mx-auto px-0 sm:px-4 search-form-section">
          <HotelSearchForm />
        </div>
      </div>

      {/* Gradient animation styles */}
      <style>{`
        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        .orb-1 {
          width: 60vw; height: 60vw; max-width: 700px; max-height: 700px;
          background: radial-gradient(circle, #2563eb 0%, #1e40af 60%, transparent 100%);
          top: -20%; left: -15%;
          animation: orbFloat1 12s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 50vw; height: 50vw; max-width: 600px; max-height: 600px;
          background: radial-gradient(circle, #7c3aed 0%, #4c1d95 60%, transparent 100%);
          top: -10%; right: -10%;
          animation: orbFloat2 15s ease-in-out infinite alternate;
        }
        .orb-3 {
          width: 40vw; height: 40vw; max-width: 500px; max-height: 500px;
          background: radial-gradient(circle, #059669 0%, #065f46 60%, transparent 100%);
          bottom: 5%; left: 20%;
          animation: orbFloat3 18s ease-in-out infinite alternate;
        }
        .orb-4 {
          width: 30vw; height: 30vw; max-width: 400px; max-height: 400px;
          background: radial-gradient(circle, #0891b2 0%, #164e63 60%, transparent 100%);
          bottom: 10%; right: 15%;
          animation: orbFloat4 10s ease-in-out infinite alternate;
        }
        @keyframes orbFloat1 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(8%, 12%) scale(1.15); }
        }
        @keyframes orbFloat2 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-10%, 8%) scale(1.1); }
        }
        @keyframes orbFloat3 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(6%, -10%) scale(1.2); }
        }
        @keyframes orbFloat4 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-8%, -6%) scale(1.1); }
        }
      `}</style>
    </section>
  );
};

export default Slider;
