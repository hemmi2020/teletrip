import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft, Search, MapPin } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <>
      <Helmet><title>404 — Page Not Found | Telitrip</title></Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#0f172a' }}>
        {/* Animated gradient blobs that follow mouse */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 transition-all duration-[2000ms] ease-out"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(100px)', left: `${mousePos.x - 15}%`, top: `${mousePos.y - 20}%` }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 transition-all duration-[2500ms] ease-out"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(80px)', left: `${mousePos.x + 10}%`, top: `${mousePos.y + 10}%` }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 text-center px-6 max-w-lg">
          {/* Large 404 */}
          <div className="relative mb-6">
            <h1 className="text-[120px] sm:text-[160px] font-black text-transparent leading-none select-none" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.08)', letterSpacing: '-0.05em' }}>
              404
            </h1>
            {/* Floating pin icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <MapPin className="w-7 h-7 sm:w-9 sm:h-9 text-blue-400" style={{ strokeWidth: 1.5 }} />
              </div>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>
            Lost in transit
          </h2>
          <p className="text-white/40 text-[14px] sm:text-[15px] mb-8 leading-relaxed max-w-sm mx-auto">
            This page doesn't exist or has been moved. Let's get you back on track.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/home')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[13px] font-semibold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 20px rgba(37,99,235,0.35)', minHeight: 'unset' }}
            >
              <Home className="w-4 h-4" /> Go Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[13px] font-semibold text-white/60 hover:text-white transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 'unset' }}
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </div>

        {/* Bottom subtle branding */}
        <div className="absolute bottom-6 sm:bottom-8 text-white/15 text-[11px] font-medium tracking-widest uppercase">
          TELITRIP
        </div>
      </div>
    </>
  );
};

export default NotFound;
