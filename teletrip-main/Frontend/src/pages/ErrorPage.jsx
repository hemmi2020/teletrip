import React from 'react';
import { Helmet } from 'react-helmet-async';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

const ErrorPage = ({ error, resetError }) => {
  return (
    <>
      <Helmet><title>Something went wrong | Telitrip</title></Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#0f172a' }}>
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #ef4444, transparent)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', filter: 'blur(80px)' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 text-center px-6 max-w-lg">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle className="w-9 h-9 sm:w-11 sm:h-11 text-red-400" style={{ strokeWidth: 1.5 }} />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'rgba(239,68,68,0.2)' }} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>
            Something went wrong
          </h1>
          <p className="text-white/40 text-[14px] sm:text-[15px] mb-3 leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred. Don't worry — your data is safe.
          </p>

          {/* Error detail (collapsed) */}
          {error && (
            <details className="mb-6 text-left max-w-sm mx-auto">
              <summary className="text-white/25 text-[12px] cursor-pointer hover:text-white/40 transition-colors text-center">
                Technical details
              </summary>
              <pre className="mt-2 p-3 rounded-xl text-[11px] text-red-300/60 overflow-x-auto" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.1)' }}>
                {error?.message || error?.toString() || 'Unknown error'}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (resetError) resetError();
                else window.location.reload();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[13px] font-semibold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 20px rgba(239,68,68,0.3)', minHeight: 'unset' }}
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={() => window.location.href = '/home'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[13px] font-semibold text-white/60 hover:text-white transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 'unset' }}
            >
              <Home className="w-4 h-4" /> Go Home
            </button>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="absolute bottom-6 sm:bottom-8 text-white/15 text-[11px] font-medium tracking-widest uppercase">
          TELITRIP
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
