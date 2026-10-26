import React, { useState, useEffect } from 'react';
import { useSiteAccess } from '../../context/SiteAccessContext';
import logo from '../../images/Telitrip-Logo.png';
import Footer from '../Footer';
import { Lock, ArrowRight, ShieldCheck, Hotel, Car, Globe, CheckCircle2 } from 'lucide-react';

export default function ComingSoonGate() {
  const { verifyPasscode, error: contextError } = useSiteAccess();
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const heroImages = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=1080&fit=crop&q=80",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setLocalError('Please enter the preview passcode');
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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-blue-600/10 selection:text-blue-700">
      {/* ── Signature Floating Header Pill ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4 sm:pt-6 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-4 py-2.5 px-6 rounded-full bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.08)] transition-all"
        >
          <div className="flex items-center gap-3">
            <img src={logo} alt="Telitrip" className="h-8 sm:h-9 w-auto object-contain" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Private Preview
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
            <a
              href="mailto:support@telitrip.com"
              className="hidden md:inline-block hover:text-blue-600 transition-colors"
            >
              support@telitrip.com
            </a>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200/80 text-gray-700 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Team Access</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Section with Telitrip Slider Background ── */}
      <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 bg-gray-950 overflow-hidden">
        {/* Background slideshow */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${
                i === bgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {/* Deep Telitrip gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/75 via-gray-950/45 to-gray-950/80" />
        </div>

        {/* Hero Card Container */}
        <div className="relative z-10 w-full max-w-lg mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Official Launch Arriving Soon
          </div>

          {/* Main Card Styled like Telitrip Search Cards */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/60 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Travel Smarter.
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  We are putting the final touches on our live booking engine.
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {/* Passcode Unlock Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Preview Passcode
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter team passcode..."
                    autoFocus
                    disabled={isSubmitting}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {(localError || contextError) && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <span className="font-semibold">Error:</span>
                  <span>{localError || contextError}</span>
                </div>
              )}

              {/* Submit CTA Button in Telitrip Brand Blue */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Live Preview</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-click Tip */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>Direct Link Support:</span>
              <code className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                ?preview=telitrip2026
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights Styled like Telitrip Destination Cards ── */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 relative z-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              What's Coming in Telitrip
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              A comprehensive travel booking platform built with transparency, speed, and real-time live inventory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-4">
                <Hotel className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">300,000+ Hotel Suites</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Direct connections to verified Hotelbeds properties, live real-time rate comparison, and room-level transparent fees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-4">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Executive Transfers</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Seamless airport pick-ups, luxury private sedans, and point-to-point transfers with instant driver details.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">Live mTLS Confirmation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Encrypted bank-grade mutual TLS integration ensuring guaranteed room confirmations and zero booking friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Official Telitrip Footer Component ── */}
      <Footer />
    </div>
  );
}
