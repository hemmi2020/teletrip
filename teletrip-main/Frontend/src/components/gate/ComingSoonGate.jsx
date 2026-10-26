import React, { useState } from 'react';
import { useSiteAccess } from '../../context/SiteAccessContext';

export default function ComingSoonGate() {
  const { verifyPasscode, error: contextError } = useSiteAccess();
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setLocalError('Please enter a passcode');
      return;
    }

    setLocalError('');
    setIsSubmitting(true);
    const result = await verifyPasscode(passcode.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setLocalError(result.message || 'Incorrect passcode. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-emerald-600/15 via-teal-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-cyan-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-slate-950 text-xl tracking-tight">
            T
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">TeleTrip</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Private Beta
            </span>
          </div>
        </div>

        {/* Discreet Team Access Trigger */}
        <button
          onClick={() => { setShowModal(true); setLocalError(''); }}
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-sm"
        >
          <svg className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Team Preview</span>
        </button>
      </header>

      {/* Main Teaser Hero */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 sm:py-20 flex-1 flex flex-col justify-center text-center">
        {/* Launching Soon Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-xl backdrop-blur-md mx-auto mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium tracking-wider text-slate-300 uppercase">
            Official Public Launch Arriving Soon
          </span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
          The Next Generation of <br />
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent">
            Global Luxury Travel
          </span>
        </h1>

        {/* Narrative Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-12 font-normal leading-relaxed">
          We are conducting final end-to-end integration tests on our live booking engine. 
          Soon, you will experience seamless hotel reservations, private transfers, and bespoke travel experiences worldwide.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto w-full text-left">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Global Hotel Suites</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Direct connection to 300,000+ luxury resorts, villas, and boutique stays worldwide.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Executive Transfers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Chauffeured airport pick-ups and point-to-point luxury fleets with instant tracking.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Instant Direct Booking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Encrypted mTLS bank-grade verification and instant hotel confirmation codes.</p>
          </div>
        </div>

        {/* Contact Concierge Link */}
        <div className="mt-12 text-xs text-slate-500">
          For corporate partnerships or inquiries, contact us at{' '}
          <a href="mailto:info@telitrip.com" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
            info@telitrip.com
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          &copy; {new Date().getFullYear()} TeleTrip Group LLC. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live Engine Active
          </span>
          <button
            onClick={() => { setShowModal(true); setLocalError(''); }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Staff Passcode
          </button>
        </div>
      </footer>

      {/* Team Access Passcode Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-7 shadow-2xl shadow-black/80">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Team Preview Access</h3>
                <p className="text-xs text-slate-400">Enter your passcode to unlock the live platform</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Preview Passcode
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter preview passcode..."
                    autoFocus
                    disabled={isSubmitting}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {(localError || contextError) && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{localError || contextError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Platform</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">
                Tip: You can also visit via 1-click link <code className="text-emerald-400/80 bg-slate-950 px-1 py-0.5 rounded">?preview=passcode</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
